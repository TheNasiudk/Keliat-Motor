const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const QRCode = require('qrcode');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const db = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET belum diatur di file .env backend');
}

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/bukti-pembayaran', express.static(path.join(__dirname, 'public/bukti-pembayaran')));

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Konfigurasi Multer untuk upload bukti pembayaran
const buktiStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/bukti-pembayaran/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'bukti-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const buktiUpload = multer({ storage: buktiStorage });

const authenticateToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: 'Token autentikasi diperlukan' });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa' });
    }
};

app.use('/api', (req, res, next) => {
    if (req.path === '/login') return next();
    return authenticateToken(req, res, next);
});
app.use('/print', authenticateToken);

// ==========================================
// API KATEGORI
// ==========================================
app.get('/api/kategori', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM kategori');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// API SUKU CADANG (KELOLA BARANG)
// ==========================================
app.get('/api/suku-cadang', async (req, res) => {
    try {
        const query = `
      SELECT sc.*, k.nama_kategori as tipe
      FROM suku_cadang sc
      JOIN kategori k ON sc.id_kategori = k.id_kategori
    WHERE sc.is_deleted = 0
      ORDER BY sc.created_at DESC
    `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suku-cadang', upload.single('gambar_barang'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { kode_item, nama_kategori, nama_suku_cadang, harga_jual, stok, stok_minimal, harga_beli } = req.body;
        let gambar_barang = null;
        if (req.file) {
            gambar_barang = req.file.filename;
        }

        // Cari atau buat kategori
        let kategoriId;
        const [kategoriRows] = await connection.query('SELECT id_kategori FROM kategori WHERE nama_kategori = ?', [nama_kategori]);
        if (kategoriRows.length > 0) {
            kategoriId = kategoriRows[0].id_kategori;
        } else {
            const [insertKategori] = await connection.query('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama_kategori]);
            kategoriId = insertKategori.insertId;
        }

        const query = `
      INSERT INTO suku_cadang (kode_item, id_kategori, nama_suku_cadang, harga_jual, stok, stok_minimal, gambar_barang)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        // Konversi nilai jika ada yang string
        const harga = parseFloat(harga_jual);
        const qty = parseInt(stok) || 0;
        const minStok = parseInt(stok_minimal) || 5;

        const [result] = await connection.query(query, [kode_item, kategoriId, nama_suku_cadang, harga, qty, minStok, gambar_barang]);
        const newId = result.insertId;

        // Jika harga_beli diisi, catat juga sebagai barang masuk (pengeluaran)
        const parsedHargaBeli = parseFloat(harga_beli);
        if (parsedHargaBeli > 0 && qty > 0) {
            const queryBarangMasuk = `INSERT INTO barang_masuk (id_suku_cadang, qty_masuk, harga_beli) VALUES (?, ?, ?)`;
            await connection.query(queryBarangMasuk, [newId, qty, parsedHargaBeli]);
        }

        await connection.commit();
        res.json({ message: 'Barang berhasil ditambahkan', id: newId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.put('/api/suku-cadang/:id', upload.single('gambar_barang'), async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_item, nama_kategori, nama_suku_cadang, harga_jual, stok_minimal } = req.body;

        // Cari atau buat kategori
        let kategoriId;
        const [kategoriRows] = await db.query('SELECT id_kategori FROM kategori WHERE nama_kategori = ?', [nama_kategori]);
        if (kategoriRows.length > 0) {
            kategoriId = kategoriRows[0].id_kategori;
        } else {
            const [insertKategori] = await db.query('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama_kategori]);
            kategoriId = insertKategori.insertId;
        }

        let query = `UPDATE suku_cadang SET kode_item=?, id_kategori=?, nama_suku_cadang=?, harga_jual=?, stok_minimal=?`;
        let params = [kode_item, kategoriId, nama_suku_cadang, parseFloat(harga_jual), parseInt(stok_minimal)];

        if (req.file) {
            query += `, gambar_barang=?`;
            params.push(req.file.filename);
        }

        query += ` WHERE id_suku_cadang=?`;
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Barang berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/suku-cadang/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();
        const [result] = await connection.query(
            'UPDATE suku_cadang SET is_deleted = 1 WHERE id_suku_cadang = ? AND is_deleted = 0',
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Barang tidak ditemukan' });
        }

        await connection.commit();
    res.json({ message: 'Barang berhasil dihapus' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// ==========================================
// API BARANG MASUK
// ==========================================
app.get('/api/barang-masuk', async (req, res) => {
    try {
        const query = `
      SELECT bm.*, sc.kode_item, sc.nama_suku_cadang, sc.gambar_barang, k.nama_kategori as tipe
      FROM barang_masuk bm
      JOIN suku_cadang sc ON bm.id_suku_cadang = sc.id_suku_cadang
      JOIN kategori k ON sc.id_kategori = k.id_kategori
      ORDER BY bm.tanggal_masuk DESC
    `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/barang-masuk', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id_suku_cadang, qty_masuk, harga_beli } = req.body;

        // 1. Insert ke barang_masuk
        const queryInsert = `INSERT INTO barang_masuk (id_suku_cadang, qty_masuk, harga_beli) VALUES (?, ?, ?)`;
        await connection.query(queryInsert, [id_suku_cadang, qty_masuk, harga_beli]);

        // 2. Update stok di suku_cadang
        const queryUpdate = `UPDATE suku_cadang SET stok = stok + ? WHERE id_suku_cadang = ?`;
        await connection.query(queryUpdate, [qty_masuk, id_suku_cadang]);

        await connection.commit();
        res.json({ message: 'Barang masuk berhasil dicatat dan stok bertambah' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// ==========================================
// API TRANSAKSI
// ==========================================
app.get('/api/transaksi', async (req, res) => {
    try {
        const { user, role } = req.query;
        let query = 'SELECT * FROM transaksi';
        let params = [];

        // Kasir hanya bisa melihat transaksi miliknya sendiri
        if (role === 'Kasir' && user) {
            query += ' WHERE user = ?';
            params.push(user);
        }

        query += ' ORDER BY tanggal_transaksi DESC';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/transaksi/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [transaksi] = await db.query('SELECT * FROM transaksi WHERE id_transaksi = ?', [id]);
        const [detail] = await db.query(`
      SELECT dt.*, sc.nama_suku_cadang 
      FROM detail_transaksi dt
      JOIN suku_cadang sc ON dt.id_suku_cadang = sc.id_suku_cadang
      WHERE dt.id_transaksi = ?
    `, [id]);
        res.json({ transaksi: transaksi[0], detail });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transaksi', buktiUpload.single('bukti_transaksi'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        let { metode_pembayaran, total_item, total_pembayaran, nominal_bayar, kembalian, cart, user, catatan, biaya_jasa, jenis_transaksi } = req.body;

        // Parse cart if it is a string (which it will be when sent as FormData)
        if (typeof cart === 'string') {
            cart = JSON.parse(cart);
        }

        let bukti_transaksi = null;
        if (req.file) {
            bukti_transaksi = req.file.filename;
        }

        // Parse biaya_jasa
        const parsedBiayaJasa = parseFloat(biaya_jasa) || 0;

        // Generate Invoice Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const no_invoice = `INV-${dateStr}-${randomStr}`;

        // 1. Insert ke tabel transaksi (termasuk user, catatan, biaya_jasa, jenis_transaksi)
        const queryTrans = `
      INSERT INTO transaksi (no_invoice, metode_pembayaran, total_item, total_pembayaran, nominal_bayar, kembalian, bukti_transaksi, user, catatan, biaya_jasa, jenis_transaksi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const [transResult] = await connection.query(queryTrans, [no_invoice, metode_pembayaran, total_item, total_pembayaran, nominal_bayar, kembalian, bukti_transaksi, user || null, catatan || null, parsedBiayaJasa, jenis_transaksi || null]);
        const id_transaksi = transResult.insertId;

        // 2. Insert detail & Update Stok
        for (let item of cart) {
            // Ambil harga beli terakhir (HPP sederhana dari barang_masuk) atau asumsikan 0 jika tidak ada
            const [bmRows] = await connection.query(`SELECT harga_beli FROM barang_masuk WHERE id_suku_cadang = ? ORDER BY tanggal_masuk DESC LIMIT 1`, [item.id_suku_cadang]);
            let harga_beli_historis = bmRows.length > 0 ? bmRows[0].harga_beli : 0;

            const subtotal = item.qty * item.harga_jual;

            const queryDetail = `
        INSERT INTO detail_transaksi (id_transaksi, id_suku_cadang, qty, harga_beli_historis, harga_jual_historis, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
            await connection.query(queryDetail, [id_transaksi, item.id_suku_cadang, item.qty, harga_beli_historis, item.harga_jual, subtotal]);

            // Update stok
            const queryStok = `UPDATE suku_cadang SET stok = stok - ? WHERE id_suku_cadang = ?`;
            await connection.query(queryStok, [item.qty, item.id_suku_cadang]);
        }

        await connection.commit();
        res.json({ message: 'Transaksi berhasil diselesaikan', no_invoice });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// ==========================================
// API LAPORAN / DASHBOARD
// ==========================================
app.get('/api/laporan/dashboard', async (req, res) => {
    try {
        const period = req.query.period || new Date().toISOString().slice(0, 7);
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
            return res.status(400).json({ error: 'Format periode harus YYYY-MM' });
        }

        const periodStart = `${period}-01`;
        const [year, month] = period.split('-').map(Number);
        const nextPeriodStart = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

        // 1. Metrik Utama
        const [metrikRows] = await db.query(`
      SELECT 
        COUNT(id_transaksi) as total_transaksi,
        SUM(total_pembayaran) as total_pendapatan
            FROM transaksi
            WHERE tanggal_transaksi >= ? AND tanggal_transaksi < ?
        `, [periodStart, nextPeriodStart]);

        const [pengeluaranRows] = await db.query(`
            SELECT SUM(qty_masuk * harga_beli) as total_pengeluaran
            FROM barang_masuk
            WHERE tanggal_masuk >= ? AND tanggal_masuk < ?
        `, [periodStart, nextPeriodStart]);

        // Laba Kotor (Pendapatan - Harga Beli dari Detail Transaksi)
        const [labaRows] = await db.query(`
      SELECT SUM(subtotal - (qty * harga_beli_historis)) as laba_kotor
      FROM detail_transaksi dt
      JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
            WHERE t.tanggal_transaksi >= ? AND t.tanggal_transaksi < ?
        `, [periodStart, nextPeriodStart]);

                const [labaHariIniRows] = await db.query(`
                        SELECT COALESCE(SUM(dt.subtotal - (dt.qty * dt.harga_beli_historis)), 0) as laba_kotor_hari_ini
                        FROM detail_transaksi dt
                        JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                        WHERE t.tanggal_transaksi >= CURDATE()
                            AND t.tanggal_transaksi < CURDATE() + INTERVAL 1 DAY
                `);

        const [topBarangRows] = await db.query(`
            SELECT
                sc.kode_item,
                sc.nama_suku_cadang,
                SUM(dt.qty) as total_qty,
                SUM(dt.subtotal) as total_penjualan
            FROM detail_transaksi dt
            JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
            JOIN suku_cadang sc ON dt.id_suku_cadang = sc.id_suku_cadang
            WHERE t.tanggal_transaksi >= ? AND t.tanggal_transaksi < ?
            GROUP BY sc.id_suku_cadang, sc.kode_item, sc.nama_suku_cadang
            ORDER BY total_qty DESC, total_penjualan DESC
            LIMIT 10
        `, [periodStart, nextPeriodStart]);

        const metrik = {
            total_transaksi: metrikRows[0].total_transaksi || 0,
            total_pendapatan: metrikRows[0].total_pendapatan || 0,
            total_pengeluaran: pengeluaranRows[0].total_pengeluaran || 0,
            laba_kotor: labaRows[0].laba_kotor || 0,
            laba_kotor_hari_ini: labaHariIniRows[0].laba_kotor_hari_ini
        };

        // 2. Data grafik harian, termasuk tanggal yang hanya memiliki pengeluaran.
        const [dailyRows] = await db.query(`
            SELECT tanggal, SUM(pendapatan) as Pendapatan, SUM(pengeluaran) as Pengeluaran
            FROM (
                SELECT DATE(tanggal_transaksi) as tanggal, SUM(total_pembayaran) as pendapatan, 0 as pengeluaran
                FROM transaksi
                WHERE tanggal_transaksi >= ? AND tanggal_transaksi < ?
                GROUP BY DATE(tanggal_transaksi)
                UNION ALL
                SELECT DATE(tanggal_masuk) as tanggal, 0 as pendapatan, SUM(qty_masuk * harga_beli) as pengeluaran
                FROM barang_masuk
                WHERE tanggal_masuk >= ? AND tanggal_masuk < ?
                GROUP BY DATE(tanggal_masuk)
            ) daily
            GROUP BY tanggal
            ORDER BY tanggal ASC
        `, [periodStart, nextPeriodStart, periodStart, nextPeriodStart]);

        const lineRows = dailyRows.map(row => ({ tanggal: row.tanggal, total: row.Pendapatan }));
        const expenseLineRows = dailyRows.map(row => ({ tanggal: row.tanggal, total: row.Pengeluaran }));

        // 3. Data Grafik Pie (Metode Pembayaran)
        const [pieRows] = await db.query(`
      SELECT metode_pembayaran, COUNT(*) as jumlah
      FROM transaksi
            WHERE tanggal_transaksi >= ? AND tanggal_transaksi < ?
      GROUP BY metode_pembayaran
        `, [periodStart, nextPeriodStart]);

        res.json({
            metrik,
            lineData: lineRows,
            expenseLineData: expenseLineRows,
            pieData: pieRows,
            barData: dailyRows,
            topBarang: topBarangRows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// PRINTER API (RETAINED)
// ==========================================
function checkPrinterOffline(printerName) {
    return new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        exec('powershell "Get-WmiObject -Class Win32_Printer | Select-Object Name, WorkOffline | ConvertTo-Json"', (err, stdout) => {
            if (err) return resolve(false);
            try {
                let printers = JSON.parse(stdout);
                if (!Array.isArray(printers)) printers = [printers];
                const p = printers.find(x => x.Name === printerName);
                resolve(p ? p.WorkOffline : false);
            } catch (e) {
                resolve(false);
            }
        });
    });
}

app.get('/api/printers', (req, res) => {
    const { exec } = require('child_process');
    exec('powershell "Get-WmiObject -Class Win32_Printer | Select-Object Name, WorkOffline | ConvertTo-Json"', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        try {
            let printersList = JSON.parse(stdout);
            if (!Array.isArray(printersList)) printersList = [printersList];

            const formattedPrinters = printersList.filter(p => p.Name).map(p => ({
                name: p.Name,
                offline: p.WorkOffline
            }));

            res.json({ printers: formattedPrinters, activePrinter: global.activePrinterName || 'EP58M' });
        } catch (parseErr) {
            res.status(500).json({ error: 'Gagal membaca data printer' });
        }
    });
});

app.post('/api/printers', (req, res) => {
    const { printerName } = req.body;
    global.activePrinterName = printerName;
    res.json({ message: "Printer aktif diubah ke " + printerName });
});

app.post('/print', async (req, res) => {
    const { type, text, codeData, codeType, data } = req.body;
    console.log("Menerima request cetak tipe:", type);

    const activePrinter = global.activePrinterName || 'EP58M';
    const isOffline = await checkPrinterOffline(activePrinter);
    if (isOffline) {
        return res.status(400).json({ message: `Printer ${activePrinter} sedang offline atau tidak terhubung!` });
    }

    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'tcp://127.0.0.1:9100',
        characterSet: 'PC437_USA',
        width: 32,
        removeSpecialCharacters: false
    });

    try {
        printer.alignCenter();

        if (type === 'LABEL') {
            if (codeData) {
                if (codeType === 'QR') {
                    const qrImageBuffer = await QRCode.toBuffer(codeData, {
                        type: 'png',
                        scale: 12,
                        margin: 1,
                        errorCorrectionLevel: 'H',
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    await printer.printImageBuffer(qrImageBuffer);
                } else if (codeType === 'BARCODE') {
                    printer.printBarcode(codeData, 73, { width: 3, height: 80, position: 0 });
                    printer.newLine();
                }
            }
            printer.println(codeData);
            printer.println(text);
        } else if (type === 'STRUK') {
            // Print Logo
            try {
                const logoPath = path.join(__dirname, 'public', 'logo_small.png');
                if (fs.existsSync(logoPath)) {
                    await printer.printImage(logoPath);
                }
            } catch (err) {
                console.error("Logo not printed", err);
            }

            printer.bold(true);
            printer.println("KELIAT MOTOR");
            printer.bold(false);
            printer.println("081289657291");
            printer.println("Jl. Letda Natsir No.63");
            printer.println("Bojong Kulur, Kab. Bogor");
            printer.drawLine();

            printer.alignLeft();
            printer.println(`No: ${data.no_invoice}`);
            printer.println(`Tgl: ${new Date().toLocaleString('id-ID')}`);
            if (data.user) {
                printer.println(`Kasir: ${data.user}`);
            }
            if (data.jenis_transaksi) {
                printer.println(`Jenis: ${data.jenis_transaksi}`);
            }
            printer.drawLine();

            let total = 0;
            if (data.cart && data.cart.length > 0) {
                data.cart.forEach(item => {
                    printer.println(`${item.nama_suku_cadang}`);
                    const hargaJual = item.harga_jual || item.harga_jual_historis || 0;
                    const sub = item.qty * hargaJual;
                    printer.println(`  ${item.qty} x ${Number(hargaJual).toLocaleString('id-ID')} = ${Number(sub).toLocaleString('id-ID')}`);
                    total += sub;
                });
            }

            // Print biaya jasa jika ada
            if (data.biaya_jasa && parseFloat(data.biaya_jasa) > 0) {
                printer.println(`Biaya Jasa`);
                printer.println(`  ${Number(data.biaya_jasa).toLocaleString('id-ID')}`);
            }

            // Print catatan jasa jika ada
            if (data.catatan) {
                printer.drawLine();
                printer.println(`Catatan: ${data.catatan}`);
            }
            printer.drawLine();

            printer.alignRight();
            if (data.metode_pembayaran) {
                printer.println(`METODE BAYAR: ${data.metode_pembayaran}`);
            }
            printer.println(`TOTAL: Rp ${Number(data.total_pembayaran || total).toLocaleString('id-ID')}`);
            printer.println(`BAYAR: Rp ${Number(data.nominal_bayar).toLocaleString('id-ID')}`);
            printer.println(`KEMBALI: Rp ${Number(data.kembalian).toLocaleString('id-ID')}`);
            printer.newLine();
            printer.alignCenter();
            printer.println("Terima Kasih Atas Kunjungan Anda");

        }

        printer.newLine();
        printer.newLine();
        printer.cut();

        const buffer = printer.getBuffer();
        const activePrinter = global.activePrinterName || 'EP58M';
        const printerPath = `\\\\localhost\\${activePrinter}`;

        fs.writeFile(printerPath, buffer, (err) => {
            if (err) {
                console.error("GAGAL KIRIM KE USB:", err);
                return res.status(500).json({ error: "Gagal kirim ke USB: " + err.message });
            }
            printer.clear();
            res.json({ message: "Berhasil dicetak!" });
        });
    } catch (error) {
        console.error("GAGAL FORMAT:", error);
        res.status(500).json({ error: error.toString() });
    }
});

// ==========================================
// AKUN & AUTHENTICATION API
// ==========================================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query('SELECT * FROM akun WHERE username = ?', [username]);
        if (rows.length > 0) {
            const user = rows[0];
            const isHash = user.password.startsWith('$2');
            const passwordValid = isHash
                ? await bcrypt.compare(password, user.password)
                : user.password === password;

            if (!passwordValid) {
                return res.status(401).json({ error: 'Username atau password salah' });
            }

            if (!isHash) {
                const passwordHash = await bcrypt.hash(password, 12);
                await db.query('UPDATE akun SET password = ? WHERE id_akun = ?', [passwordHash, user.id_akun]);
            }

            const safeUser = { id_akun: user.id_akun, username: user.username, role: user.role };
            const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '8h' });
            res.json({ message: 'Login berhasil', token, user: safeUser });
        } else {
            res.status(401).json({ error: 'Username atau password salah' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.user });
});

// Get all accounts
app.get('/api/akun', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_akun, username, role FROM akun');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create account
app.post('/api/akun', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        // Cek username duplikat
        const [existing] = await db.query('SELECT * FROM akun WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await db.query('INSERT INTO akun (username, password, role) VALUES (?, ?, ?)', [username, passwordHash, role]);
        res.status(201).json({ message: 'Akun berhasil dibuat' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update account
app.put('/api/akun/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { username, password, role } = req.body;
        // Cek username duplikat selain id ini
        const [existing] = await db.query('SELECT * FROM akun WHERE username = ? AND id_akun != ?', [username, id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 12);
            await db.query('UPDATE akun SET username = ?, password = ?, role = ? WHERE id_akun = ?', [username, passwordHash, role, id]);
        } else {
            await db.query('UPDATE akun SET username = ?, role = ? WHERE id_akun = ?', [username, role, id]);
        }
        res.json({ message: 'Akun berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete account
app.delete('/api/akun/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.query('DELETE FROM akun WHERE id_akun = ?', [id]);
        res.json({ message: 'Akun berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => {
    console.log('Server berjalan di http://localhost:3001');
});