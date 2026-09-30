import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import PrinterStatus from '../components/PrinterStatus';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const StokBarang = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua Stok');
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/suku-cadang`);
      setData(response.data);
      const resKategori = await axios.get(`${API_URL}/kategori`);
      setCategories(resKategori.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const filteredData = data.filter(item => {
    const matchSearch = item.nama_suku_cadang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'Semua Stok' || item.tipe === categoryFilter;
    return matchSearch && matchCategory;
  });

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatRupiah = (number) => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Stok Barang</h1>
        <div className="header-actions">
          <PrinterStatus />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="table-actions">
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="Semua Stok">Semua Stok</option>
                {categories.map(cat => (
                  <option key={cat.id_kategori} value={cat.nama_kategori}>{cat.nama_kategori}</option>
                ))}
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
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id_suku_cadang}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>{item.kode_item}</td>
                  <td style={{ fontWeight: 500 }}>{item.nama_suku_cadang}</td>
                  <td style={{ color: '#64748b' }}>{item.tipe}</td>
                  <td style={{ fontWeight: 'bold', color: item.stok <= item.stok_minimal ? '#ef4444' : '#1e293b' }}>
                    {item.stok}
                  </td>
                  <td>
                    {item.gambar_barang ? (
                      <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt={item.nama_suku_cadang} className="item-img" />
                    ) : (
                      <div className="item-img" style={{ backgroundColor: '#f1f5f9' }}></div>
                    )}
                  </td>
                  <td style={{ color: '#64748b' }}>{formatRupiah(item.harga_jual)}</td>
                  <td style={{ color: '#64748b' }}>{item.stok_minimal}</td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>Tidak ada data stok barang.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <div className="pagination-info">
              Menampilkan {currentData.length} dari {filteredData.length} data
            </div>
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Sebelumnya
              </button>

              {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage * itemsPerPage >= filteredData.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StokBarang;
