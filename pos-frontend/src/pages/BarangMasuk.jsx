import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrinterStatus from '../components/PrinterStatus';
import TambahBarangMasukModal from '../components/modals/TambahBarangMasukModal';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const BarangMasuk = () => {
  const [data, setData] = useState([]);
  const [isTambahMasukOpen, setIsTambahMasukOpen] = useState(false);
  const [preselectedId, setPreselectedId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/barang-masuk`);
      setData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openModal && location.state?.selectedBarangId) {
      setIsTambahMasukOpen(true);
      setPreselectedId(location.state.selectedBarangId);
      // Clear state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleOpenModal = () => {
    setPreselectedId('');
    setIsTambahMasukOpen(true);
  };

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Riwayat Barang Masuk</h1>
        <div className="header-actions">
          <PrinterStatus />
          <button className="btn-primary" onClick={handleOpenModal}>+ Tambah Barang Masuk</button>
        </div>
      </div>

      <div className="page-body">
        <div className="data-table-container">
          <div className="table-toolbar">
            <div className="search-input" style={{ flex: 0.5 }}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Cari berdasarkan nama atau kode barang..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
              <span>DARI</span>
              <div className="search-input" style={{ width: '140px', padding: '6px 10px' }}>
                <input type="text" placeholder="dd/mm/yy" />
                <Calendar size={16} />
              </div>
              <span>KE</span>
              <div className="search-input" style={{ width: '140px', padding: '6px 10px' }}>
                <input type="text" placeholder="dd/mm/yy" />
                <Calendar size={16} />
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>KODE BARANG</th>
                <th>NAMA BARANG</th>
                <th>TIPE</th>
                <th>QTY MASUK</th>
                <th>GAMBAR</th>
                <th>HARGA BELI</th>
                <th>SUBTOTAL</th>
                <th>TANGGAL & WAKTU</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id_barang_masuk}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>{item.kode_item}</td>
                  <td>{item.nama_suku_cadang}</td>
                  <td style={{ color: '#64748b' }}>{item.tipe}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.qty_masuk}</td>
                  <td>
                    {item.gambar_barang ? (
                      <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt={item.nama_suku_cadang} className="item-img" />
                    ) : (
                      <div className="item-img" style={{ backgroundColor: '#f1f5f9' }}></div>
                    )}
                  </td>
                  <td style={{ color: '#64748b' }}>Rp {parseFloat(item.harga_beli).toLocaleString('id-ID')}</td>
                  <td style={{ color: '#64748b' }}>Rp {(parseFloat(item.harga_beli) * item.qty_masuk).toLocaleString('id-ID')}</td>
                  <td style={{ color: '#64748b' }}>{new Date(item.tanggal_masuk).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Belum ada data barang masuk.</td>
                </tr>
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

      {isTambahMasukOpen && <TambahBarangMasukModal preselectedBarangId={preselectedId} onClose={() => { setIsTambahMasukOpen(false); fetchData(); setPreselectedId(''); }} />}
    </>
  );
};

export default BarangMasuk;
