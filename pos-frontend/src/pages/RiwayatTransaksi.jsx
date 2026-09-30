import React, { useState, useEffect } from 'react';
import { Search, Calendar, Printer } from 'lucide-react';
import axios from 'axios';
import { Eye } from 'lucide-react';
import PrinterStatus from '../components/PrinterStatus';
import DetailTransaksiModal from '../components/modals/DetailTransaksiModal';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const RiwayatTransaksi = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
  const [data, setData] = useState([]);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Metrik hari ini
  const totalTransaksiHariIni = data.filter(d => new Date(d.tanggal_transaksi).toDateString() === new Date().toDateString()).length;
  const totalPenjualanHariIni = data.filter(d => new Date(d.tanggal_transaksi).toDateString() === new Date().toDateString()).reduce((sum, item) => sum + parseFloat(item.total_pembayaran), 0);

  // Note: Laba kotor yang akurat memerlukan data dari endpoint dashboard, ini hanya estimasi UI
  const [labaKotorHariIni, setLabaKotorHariIni] = useState(0);

  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        const params = {};
        if (currentUser.role === 'Kasir' && currentUser.username) {
          params.user = currentUser.username;
          params.role = 'Kasir';
        }
        const response = await axios.get(`${API_URL}/transaksi`, { params });
        setData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data transaksi:", error);
      }
    };

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/laporan/dashboard`);
        setLabaKotorHariIni(res.data.metrik.laba_kotor_hari_ini || 0);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTransaksi();
    fetchDashboard();
  }, []);

  const handlePrintStruk = async (transaksi) => {
    try {
      const resDetail = await axios.get(`${API_URL}/transaksi/${transaksi.id_transaksi}`);
      const payload = {
        type: 'STRUK',
        data: {
          no_invoice: transaksi.no_invoice,
          cart: resDetail.data.detail,
          total_pembayaran: transaksi.total_pembayaran,
          nominal_bayar: transaksi.nominal_bayar,
          kembalian: transaksi.kembalian,
          metode_pembayaran: transaksi.metode_pembayaran,
          user: transaksi.user,
          catatan: transaksi.catatan,
          biaya_jasa: transaksi.biaya_jasa,
          jenis_transaksi: transaksi.jenis_transaksi
        }
      };
      const printRes = await axios.post('http://localhost:3001/print', payload);
      alert(printRes.data.message);
    } catch (err) {
      alert('Gagal cetak struk: ' + err.message);
    }
  };
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Riwayat Transaksi</h1>
        <div className="header-actions">
          <PrinterStatus />
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>🛒</span>
            </div>
            <div>
              <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total transaksi hari ini</div>
              <div style={{ color: '#a855f7', fontSize: '24px', fontWeight: '700' }}>{totalTransaksiHariIni}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>💵</span>
            </div>
            <div>
              <div style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total penjualan hari ini</div>
              <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '700' }}>Rp {totalPenjualanHariIni.toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>💳</span>
            </div>
            <div>
              <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total laba kotor hari ini</div>
              <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>Rp {parseFloat(labaKotorHariIni).toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div className="data-table-container">
          <div className="table-toolbar" style={{ display: 'flex', gap: '16px' }}>
            <div className="search-input" style={{ flex: 1 }}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Cari berdasarkan nama atau kode barang..." />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>KODE TRANSAKSI</th>
                <th>TANGGAL & WAKTU</th>
                <th>KASIR</th>
                <th>JENIS TRANSAKSI</th>
                <th>METODE PEMBAYARAN</th>
                <th>TOTAL ITEM</th>
                <th>TOTAL PEMBAYARAN</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id_transaksi}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>{item.no_invoice}</td>
                  <td style={{ color: '#64748b' }}>{new Date(item.tanggal_transaksi).toLocaleString('id-ID')}</td>
                  <td style={{ color: '#64748b' }}>{item.user || '-'}</td>
                  <td style={{ color: '#0f172a', fontWeight: 500, textTransform: 'capitalize' }}>{item.jenis_transaksi || '-'}</td>
                  <td style={{ color: '#64748b' }}>{item.metode_pembayaran}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.total_item}</td>
                  <td style={{ color: '#64748b' }}>Rp {parseFloat(item.total_pembayaran).toLocaleString('id-ID')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" style={{ backgroundColor: '#10b981' }} title="Print Struk" onClick={() => handlePrintStruk(item)}>
                        <Printer size={14} />
                      </button>
                      <button className="btn-edit" onClick={() => setSelectedTransaksiId(item.id_transaksi)}>Detail</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center' }}>Tidak ada data transaksi.</td></tr>
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <div className="pagination-info">
              Menampilkan {currentData.length} dari {data.length} data
            </div>
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Sebelumnya
              </button>

              {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage * itemsPerPage >= data.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      <DetailTransaksiModal
        transaksiId={selectedTransaksiId}
        onClose={() => setSelectedTransaksiId(null)}
      />
    </>
  );
};

export default RiwayatTransaksi;
