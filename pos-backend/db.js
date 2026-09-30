const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_keliat_motor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
  }
  if (connection) {
    console.log('Connected to MySQL database db_keliat_motor');

    // Initialize Database Tables
    const initDb = async () => {
      try {
        const promisePool = pool.promise();

        // Buat tabel akun
        await promisePool.query(`
          CREATE TABLE IF NOT EXISTS akun (
              id_akun INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(50) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              role VARCHAR(100) NOT NULL
          );
        `);

        // Seed default users if empty
        const [rows] = await promisePool.query('SELECT COUNT(*) as count FROM akun');
        if (rows[0].count === 0) {
          console.log('Seeding default akun...');
          const adminHash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin', 12);
          const kasirHash = await bcrypt.hash(process.env.DEFAULT_KASIR_PASSWORD || 'kasir', 12);
          await promisePool.query(
            'INSERT INTO akun (username, password, role) VALUES (?, ?, ?), (?, ?, ?)',
            ['admin', adminHash, 'Admin', 'kasir', kasirHash, 'Kasir']
          );
        }
        // Migrate: Add 'user', 'catatan', 'biaya_jasa' columns to transaksi table
        try {
          await promisePool.query(`ALTER TABLE transaksi ADD COLUMN user VARCHAR(50) DEFAULT NULL`);
          console.log('Column transaksi.user added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') console.error('transaksi.user:', e.message);
        }
        try {
          await promisePool.query(`ALTER TABLE transaksi ADD COLUMN catatan TEXT DEFAULT NULL`);
          console.log('Column transaksi.catatan added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') console.error('transaksi.catatan:', e.message);
        }
        try {
          await promisePool.query(`ALTER TABLE transaksi ADD COLUMN biaya_jasa DECIMAL(15,2) DEFAULT 0`);
          console.log('Column transaksi.biaya_jasa added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') console.error('transaksi.biaya_jasa:', e.message);
        }
        try {
          await promisePool.query(`ALTER TABLE transaksi ADD COLUMN jenis_transaksi VARCHAR(50) DEFAULT NULL`);
          console.log('Column transaksi.jenis_transaksi added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') console.error('transaksi.jenis_transaksi:', e.message);
        }
        try {
          await promisePool.query(`ALTER TABLE suku_cadang ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0`);
          console.log('Column suku_cadang.is_deleted added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') console.error('suku_cadang.is_deleted:', e.message);
        }

      } catch (err) {
        console.error('Error initializing database:', err);
      }
    };

    initDb();

    connection.release();
  }
  return;
});

module.exports = pool.promise();
