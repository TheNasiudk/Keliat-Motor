import React, { useState, useEffect } from 'react';
import { Calendar, Search, Trash2, Printer, X } from 'lucide-react';
import axios from 'axios';
import PrinterStatus from '../components/PrinterStatus';
import BuktiPembayaranModal from '../components/modals/BuktiPembayaranModal';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const Kasir = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const [barcode, setBarcode] = useState(() => localStorage.getItem('kasir_barcode') || '');
  const [qty, setQty] = useState(() => localStorage.getItem('kasir_qty') || '');
  const [metodePembayaran, setMetodePembayaran] = useState(() => {
    const savedMethod = localStorage.getItem('kasir_metodePembayaran');
    return savedMethod === 'QRIS / Transfer' ? 'QRIS' : savedMethod || 'Tunai';
  });
  const [tunai, setTunai] = useState(() => localStorage.getItem('kasir_tunai') || '');
  const [biayaJasa, setBiayaJasa] = useState(() => localStorage.getItem('kasir_biayaJasa') || '');
  const [catatan, setCatatan] = useState(() => localStorage.getItem('kasir_catatan') || '');
  const [jenisTransaksi, setJenisTransaksi] = useState(() => localStorage.getItem('kasir_jenisTransaksi') || '');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kasir_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [showBuktiModal, setShowBuktiModal] = useState(false);
  const [buktiFile, setBuktiFile] = useState(null);
  const [buktiPreview, setBuktiPreview] = useState(null);

  useEffect(() => { localStorage.setItem('kasir_barcode', barcode); }, [barcode]);
  useEffect(() => { localStorage.setItem('kasir_qty', qty); }, [qty]);
  useEffect(() => { localStorage.setItem('kasir_metodePembayaran', metodePembayaran); }, [metodePembayaran]);
  useEffect(() => { localStorage.setItem('kasir_tunai', tunai); }, [tunai]);
  useEffect(() => { localStorage.setItem('kasir_biayaJasa', biayaJasa); }, [biayaJasa]);
  useEffect(() => { localStorage.setItem('kasir_catatan', catatan); }, [catatan]);
  useEffect(() => { localStorage.setItem('kasir_jenisTransaksi', jenisTransaksi); }, [jenisTransaksi]);
  useEffect(() => { localStorage.setItem('kasir_cart', JSON.stringify(cart)); }, [cart]);
  const [printItem, setPrintItem] = useState(null);

  const [sukuCadangList, setSukuCadangList] = useState([]);
  const [invoicePreview, setInvoicePreview] = useState('INV-00000000-0000');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate preview invoice
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    setInvoicePreview(`INV-${dateStr}-XXXX`);

    // Fetch all items for easy lookup
    axios.get(`${API_URL}/suku-cadang`)
      .then(res => setSukuCadangList(res.data))
      .catch(err => console.error(err));
  }, []);

  const tambahKeKeranjang = () => {
    if (barcode) {
      const item = sukuCadangList.find(i => i.kode_item === barcode);
      if (item) {
        if (item.stok <= 0) {
          alert('Stok barang habis!');
          return;
        }

        const quantityToAdd = qty ? parseInt(qty) : 1;
        const existingIndex = cart.findIndex(c => c.id_suku_cadang === item.id_suku_cadang);

        if (existingIndex >= 0) {
          const newCart = [...cart];
          if (newCart[existingIndex].qty + quantityToAdd > item.stok) {
            alert('Jumlah melebihi stok yang tersedia!');
            return;
          }
          newCart[existingIndex].qty += quantityToAdd;
          setCart(newCart);
        } else {
          if (quantityToAdd > item.stok) {
            alert('Jumlah melebihi stok yang tersedia!');
            return;
          }
          setCart([...cart, { ...item, qty: quantityToAdd }]);
        }
        setBarcode('');
        setQty('');
      } else {
        alert('Barang tidak ditemukan!');
      }
    }
  };

  const handleBarcodeEnter = (e) => {
    if (e.key === 'Enter') {
      tambahKeKeranjang();
    }
  };

  const totalBarang = cart.reduce((sum, item) => sum + (parseFloat(item.harga_jual) * item.qty), 0);
  const parsedBiayaJasa = parseInt(biayaJasa.replace(/\D/g, '') || 0);
  const total = totalBarang + parsedBiayaJasa;
  const kembalian = tunai ? parseInt(tunai.replace(/\D/g, '') || 0) - total : 0;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleProsesBayar = async () => {
    if (!jenisTransaksi) {
      alert('Silakan pilih jenis transaksi terlebih dahulu!');
      return;
    }

    if (jenisTransaksi === 'jasa only') {
      if (parsedBiayaJasa <= 0) {
        alert('Biaya jasa wajib diisi untuk transaksi jasa only!');
        return;
      }
    } else {
      if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
      }
    }

    if (total <= 0) {
      alert('Total pembayaran tidak boleh 0!');
      return;
    }

    const isTunai = metodePembayaran === 'Tunai';

    if (!isTunai && !buktiFile) {
      alert('Bukti pembayaran wajib diunggah untuk metode QRIS atau Transfer!');
      return;
    }

    const nominal_bayar = isTunai ? parseInt(tunai.replace(/\D/g, '') || 0) : total;

    if (isTunai && nominal_bayar < total) {
      alert('Uang tunai kurang!');
      return;
    }

    const formData = new FormData();
    formData.append('metode_pembayaran', metodePembayaran);
    formData.append('total_item', cart.reduce((sum, item) => sum + item.qty, 0));
    formData.append('total_pembayaran', total);
    formData.append('nominal_bayar', nominal_bayar);
    formData.append('kembalian', isTunai ? kembalian : 0);
    formData.append('cart', JSON.stringify(cart.map(c => ({ id_suku_cadang: c.id_suku_cadang, qty: c.qty, harga_jual: c.harga_jual }))));
    formData.append('user', currentUser.username || '');
    formData.append('catatan', catatan);
    formData.append('biaya_jasa', parsedBiayaJasa);
    formData.append('jenis_transaksi', jenisTransaksi);

    if (buktiFile) {
      formData.append('bukti_transaksi', buktiFile);
    }

    try {
      const response = await axios.post(`${API_URL}/transaksi`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(`Transaksi Berhasil! No Invoice: ${response.data.no_invoice}`);

      // Print Struk Otomatis
      try {
        await axios.post('http://localhost:3001/print', {
          type: 'STRUK',
          data: {
            no_invoice: response.data.no_invoice,
            cart: cart,
            total_pembayaran: total,
            nominal_bayar: nominal_bayar,
            kembalian: isTunai ? kembalian : 0,
            metode_pembayaran: metodePembayaran,
            user: currentUser.username || '',
            catatan: catatan,
            biaya_jasa: parsedBiayaJasa,
            jenis_transaksi: jenisTransaksi
          }
        });
      } catch (printErr) {
        console.error("Gagal cetak otomatis:", printErr);
        alert('Struk tidak dapat diprint karena printer sedang offline atau bermasalah. Anda bisa mencetak ulang struk ini di lain waktu pada halaman Riwayat Transaksi.');
      }

      // Reset Kasir
      setCart([]);
      setTunai('');
      setBarcode('');
      setQty('');
      setBiayaJasa('');
      setCatatan('');
      setJenisTransaksi('');
      setBuktiFile(null);
      setBuktiPreview(null);

      // Refresh stok
      axios.get(`${API_URL}/suku-cadang`).then(res => setSukuCadangList(res.data));
    } catch (error) {
      alert('Gagal memproses transaksi: ' + error.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Yakin ingin mereset keranjang?')) {
      setCart([]);
      setTunai('');
      setBarcode('');
      setQty('');
      setBiayaJasa('');
      setCatatan('');
      setJenisTransaksi('');
      setBuktiFile(null);
      setBuktiPreview(null);
    }
  };

  const removeFromCart = (indexToRemove) => {
    const newCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(newCart);
  };

  const handlePrintSubmit = async (codeType) => {
    try {
      const response = await axios.post('http://localhost:3001/print', {
        type: 'LABEL',
        text: printItem.nama_suku_cadang,
        codeData: printItem.kode_item,
        codeType: codeType
      });
      alert(response.data.message);
      setPrintItem(null);
    } catch (error) {
      alert('Gagal cetak: ' + error.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Kasir</h1>
        <div className="header-actions">
          <PrinterStatus />
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Left Inputs */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Barcode/QR Code</label>
              <input
                type="text"
                className="form-control"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                placeholder="Scan atau ketik kode barang lalu tekan Enter"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Qty.</label>
                <input type="number" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Default 1" />
              </div>
              <button className="btn-primary" onClick={tambahKeKeranjang} style={{ padding: '8px 16px', height: '42px' }}>Tambah</button>
            </div>
          </div>

          {/* Right Summary */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{invoicePreview}</div>
              <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentTime.toLocaleDateString('id-ID')} <Calendar size={14} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentTime.toLocaleTimeString('id-ID')} <span style={{ fontSize: '16px' }}>⏱</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Grand Total</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>{formatRupiah(total)}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-container" style={{ marginBottom: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>KODE BARANG</th>
                <th>NAMA BARANG</th>
                <th>TIPE</th>
                <th>GAMBAR</th>
                <th>HARGA</th>
                <th>QTY</th>
                <th>SUBTOTAL</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>{item.kode_item}</td>
                  <td>{item.nama_suku_cadang}</td>
                  <td style={{ color: '#64748b' }}>{item.tipe}</td>
                  <td>
                    {item.gambar_barang ? (
                      <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt={item.nama_suku_cadang} className="item-img" />
                    ) : (
                      <div className="item-img" style={{ backgroundColor: '#f1f5f9' }}></div>
                    )}
                  </td>
                  <td style={{ color: '#64748b' }}>{formatRupiah(item.harga_jual)}</td>
                  <td>{item.qty}</td>
                  <td style={{ color: '#64748b' }}>{formatRupiah(item.harga_jual * item.qty)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-delete" onClick={() => removeFromCart(index)} title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Keranjang kosong</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr) 180px', gap: '24px', alignItems: 'flex-end' }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Metode Pembayaran</label>
              <select className="form-control" value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)}>
                <option value="Tunai">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            {metodePembayaran === 'Tunai' ? (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Tunai</label>
                  <input type="text" className="form-control" value={tunai} onChange={(e) => setTunai(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Kembalian</label>
                  <input type="text" className="form-control" value={kembalian > 0 ? formatRupiah(kembalian) : (tunai && kembalian === 0 ? 'Rp 0' : '')} readOnly style={{ backgroundColor: '#fff' }} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Bukti Pembayaran</label>
                  <button
                    type="button"
                    className="form-control"
                    style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setShowBuktiModal(true)}
                  >
                    <span style={{ color: buktiFile ? '#1e293b' : '#94a3b8' }}>
                      {buktiFile ? (buktiFile.name || 'Gambar diambil') : 'Upload Gambar'}
                    </span>
                    <span style={{ fontSize: '20px', lineHeight: '1', color: '#1e293b' }}>+</span>
                  </button>
                  {buktiPreview && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={buktiPreview} alt="Preview Bukti" style={{ maxWidth: '100px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Jenis Transaksi</label>
                  <select className="form-control" value={jenisTransaksi} onChange={(e) => setJenisTransaksi(e.target.value)}>
                    <option value="">Pilih Jenis Transaksi</option>
                    <option value="sparepart + jasa">sparepart + jasa</option>
                    <option value="sparepart only">sparepart only</option>
                    <option value="jasa only">jasa only</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Biaya Jasa</label>
              <input type="text" className="form-control" value={biayaJasa} onChange={(e) => setBiayaJasa(e.target.value)} placeholder="Masukan nominal" />
              {parsedBiayaJasa > 0 && (
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                  Biaya jasa: {formatRupiah(parsedBiayaJasa)}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Catatan</label>
              <input
                type="text"
                className="form-control"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Opsional"
              />
            </div>

            {metodePembayaran === 'Tunai' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>Jenis Transaksi</label>
                <select className="form-control" value={jenisTransaksi} onChange={(e) => setJenisTransaksi(e.target.value)}>
                  <option value="">Pilih Jenis Transaksi</option>
                  <option value="sparepart + jasa">sparepart + jasa</option>
                  <option value="sparepart only">sparepart only</option>
                  <option value="jasa only">jasa only</option>
                </select>
              </div>
            )}
          </div>

          {/* Column 3 - Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn-submit"
              onClick={handleProsesBayar}
              style={{ width: '100%', padding: '12px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', backgroundColor: '#1d4ed8', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              Proses Bayar
            </button>
            <button
              className="btn-secondary"
              onClick={handleReset}
              style={{ width: '100%', padding: '12px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', backgroundColor: '#fff', border: '1px solid #1e293b', color: '#1e293b', cursor: 'pointer' }}
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>

      {printItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Pilih Tipe Cetak</h2>
              <button className="btn-close" onClick={() => setPrintItem(null)}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>Cetak label untuk <strong>{printItem.nama_suku_cadang}</strong> ({printItem.kode_item})</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn-submit" onClick={() => handlePrintSubmit('QR')} style={{ flex: 1 }}>Cetak QR Code</button>
                <button className="btn-secondary" onClick={() => handlePrintSubmit('BARCODE')} style={{ flex: 1 }}>Cetak Barcode</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BuktiPembayaranModal
        isOpen={showBuktiModal}
        onClose={() => setShowBuktiModal(false)}
        onFileSelect={(file, preview) => {
          setBuktiFile(file);
          setBuktiPreview(preview);
        }}
      />
    </>
  );
};

export default Kasir;
