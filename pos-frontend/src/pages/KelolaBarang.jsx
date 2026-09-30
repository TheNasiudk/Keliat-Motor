import React, { useState, useEffect } from 'react';
import { Search, Printer, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TambahBarangModal from '../components/modals/TambahBarangModal';
import EditBarangModal from '../components/modals/EditBarangModal';
import TambahBarangMasukModal from '../components/modals/TambahBarangMasukModal';
import PrinterStatus from '../components/PrinterStatus';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const KelolaBarang = () => {
  const [data, setData] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [sortType, setSortType] = useState('Semua Stok');
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTambahMasukOpen, setIsTambahMasukOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const [showWarning, setShowWarning] = useState(true);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/suku-cadang`);
      setData(response.data);
      const resKategori = await axios.get(`${API_URL}/kategori`);
      setKategoriList(resKategori.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      try {
        await axios.delete(`${API_URL}/suku-cadang/${id}`);
        alert('Barang berhasil dihapus');
        fetchData();
      } catch (error) {
        const message = error.response?.data?.error || error.message;
        alert('Gagal menghapus barang: ' + message);
      }
    }
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

  let displayedData = data.filter(item => {
    const matchesSearch = item.nama_suku_cadang.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.kode_item.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = selectedKategori === 'Semua Kategori' || item.tipe === selectedKategori;
    return matchesSearch && matchesCategory;
  });

  if (sortType === 'Stok terbanyak') {
    displayedData.sort((a, b) => b.stok - a.stok);
  } else if (sortType === 'Stok terendah') {
    displayedData.sort((a, b) => a.stok - b.stok);
  } else if (sortType === 'Harga tertinggi') {
    displayedData.sort((a, b) => b.harga_jual - a.harga_jual);
  } else if (sortType === 'Harga terendah') {
    displayedData.sort((a, b) => a.harga_jual - b.harga_jual);
  }

  const currentData = displayedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const emptyStockItems = data.filter(item => item.stok === 0);
  const lowStockItems = data.filter(item => item.stok > 0 && item.stok <= item.stok_minimal);

  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'Admin';

  const shouldShowWarning = isAdmin && showWarning && (emptyStockItems.length > 0 || lowStockItems.length > 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Kelola Data Barang</h1>
        <div className="header-actions">
          <PrinterStatus />
          <button className="btn-primary" onClick={() => setIsTambahOpen(true)}>+ Tambah Barang Baru</button>
        </div>
      </div>

      <div className="page-body">
        <div className="data-table-container">
          <div className="table-toolbar">
            <div className="search-input" style={{ flex: 0.5 }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau kode barang..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="filter-select" value={selectedKategori} onChange={(e) => setSelectedKategori(e.target.value)}>
                <option value="Semua Kategori">Semua Kategori</option>
                {kategoriList.map(k => (
                  <option key={k.id_kategori} value={k.nama_kategori}>{k.nama_kategori}</option>
                ))}
              </select>
              <select className="filter-select" value={sortType} onChange={(e) => setSortType(e.target.value)}>
                <option value="Semua Stok">Semua Stok</option>
                <option value="Stok terbanyak">Stok terbanyak</option>
                <option value="Stok terendah">Stok terendah</option>
                <option value="Harga tertinggi">Harga tertinggi</option>
                <option value="Harga terendah">Harga terendah</option>
              </select>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>KODE BARANG</th>
                <th>NAMA BARANG</th>
                <th>TIPE</th>
                <th>STOK</th>
                <th>GAMBAR</th>
                <th>HARGA JUAL</th>
                <th>STOK MINIMAL</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id_suku_cadang}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>{item.kode_item}</td>
                  <td>{item.nama_suku_cadang}</td>
                  <td style={{ color: '#64748b' }}>{item.tipe}</td>
                  <td style={{ color: item.stok === 0 ? '#ef4444' : (item.stok <= item.stok_minimal ? '#f97316' : '#1e293b'), fontWeight: 'bold' }}>
                    {item.stok}
                  </td>
                  <td>
                    {item.gambar_barang ? (
                      <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt={item.nama_suku_cadang} className="item-img" />
                    ) : (
                      <div className="item-img" style={{ backgroundColor: '#f1f5f9' }}></div>
                    )}
                  </td>
                  <td>Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>
                  <td>{item.stok_minimal}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setPrintItem(item)} title="Print Barcode">
                        <Printer size={14} />
                      </button>
                      <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id_suku_cadang)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Tidak ada data barang.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <div className="pagination-info">
              Menampilkan {currentData.length} dari {displayedData.length} data
            </div>
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Sebelumnya
              </button>

              {Array.from({ length: Math.ceil(displayedData.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage * itemsPerPage >= displayedData.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {isTambahOpen && <TambahBarangModal onClose={() => { setIsTambahOpen(false); fetchData(); }} />}
      {isEditOpen && <EditBarangModal item={selectedItem} onClose={() => { setIsEditOpen(false); fetchData(); }} />}
      {isTambahMasukOpen && (
        <TambahBarangMasukModal onClose={() => setIsTambahMasukOpen(false)} onRefresh={fetchData} dataBarang={data} />
      )}

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

      {shouldShowWarning && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Peringatan Stok</h2>
              <button className="btn-close" onClick={() => setShowWarning(false)}><X size={32} /></button>
            </div>
            <div className="modal-body">
              {lowStockItems.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Stok Menipis</h3>
                  <table className="data-table" style={{ width: '100%', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                      <tr>
                        <th style={{ color: '#64748b' }}>NO</th>
                        <th style={{ color: '#64748b' }}>KODE BARANG</th>
                        <th style={{ color: '#64748b' }}>NAMA BARANG</th>
                        <th style={{ color: '#64748b' }}>TIPE</th>
                        <th style={{ color: '#64748b' }}>GAMBAR</th>
                        <th style={{ color: '#64748b' }}>HARGA</th>
                        <th style={{ color: '#64748b' }}>STOK</th>
                        <th style={{ color: '#64748b' }}>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item, idx) => (
                        <tr key={item.id_suku_cadang} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                          <td>{idx + 1}</td>
                          <td style={{ color: '#2563eb', fontWeight: '500' }}>{item.kode_item}</td>
                          <td>{item.nama_suku_cadang}</td>
                          <td>{item.tipe}</td>
                          <td>
                            {item.gambar_barang ? (
                              <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt="gambar" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0' }}></div>
                            )}
                          </td>
                          <td style={{ color: '#64748b' }}>Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>
                          <td style={{ color: '#f97316', fontWeight: 'bold' }}>{item.stok}</td>
                          <td>
                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#1e3a8a' }} onClick={() => navigate('/barang-masuk', { state: { openModal: true, selectedBarangId: item.id_suku_cadang } })}>Update Stok</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {emptyStockItems.length > 0 && (
                <>
                  {lowStockItems.length > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '20px 0' }}></div>}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Stok Habis</h3>
                    <table className="data-table" style={{ width: '100%', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                      <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                          <th style={{ color: '#64748b' }}>NO</th>
                          <th style={{ color: '#64748b' }}>KODE BARANG</th>
                          <th style={{ color: '#64748b' }}>NAMA BARANG</th>
                          <th style={{ color: '#64748b' }}>TIPE</th>
                          <th style={{ color: '#64748b' }}>GAMBAR</th>
                          <th style={{ color: '#64748b' }}>HARGA</th>
                          <th style={{ color: '#64748b' }}>STOK</th>
                          <th style={{ color: '#64748b' }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emptyStockItems.map((item, idx) => (
                          <tr key={item.id_suku_cadang} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                            <td>{idx + 1}</td>
                            <td style={{ color: '#2563eb', fontWeight: '500' }}>{item.kode_item}</td>
                            <td>{item.nama_suku_cadang}</td>
                            <td>{item.tipe}</td>
                            <td>
                              {item.gambar_barang ? (
                                <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt="gambar" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                              ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0' }}></div>
                              )}
                            </td>
                            <td style={{ color: '#64748b' }}>Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>
                            <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.stok}</td>
                            <td>
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#1e3a8a' }} onClick={() => navigate('/barang-masuk', { state: { openModal: true, selectedBarangId: item.id_suku_cadang } })}>Update Stok</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', backgroundColor: '#1e3a8a', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowWarning(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KelolaBarang;
