import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import PrinterStatus from '../components/PrinterStatus';
import './PengaturanAkun.css';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const PengaturanAkun = () => {
  const [akunList, setAkunList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id_akun: '', username: '', password: '', role: 'Admin' });
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};

  useEffect(() => {
    fetchAkun();
  }, []);

  const fetchAkun = async () => {
    try {
      const response = await axios.get(`${API_URL}/akun`);
      setAkunList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data akun:", error);
    }
  };

  const handleOpenModal = (akun = null) => {
    if (akun) {
      setFormData({ id_akun: akun.id_akun, username: akun.username, password: '', role: akun.role });
      setIsEditing(true);
    } else {
      setFormData({ id_akun: '', username: '', password: '', role: 'Kasir' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ id_akun: '', username: '', password: '', role: 'Kasir' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/akun/${formData.id_akun}`, {
          username: formData.username,
          password: formData.password, // backend will ignore if empty
          role: formData.role
        });
        alert('Akun berhasil diupdate!');
      } else {
        await axios.post(`${API_URL}/akun`, {
          username: formData.username,
          password: formData.password,
          role: formData.role
        });
        alert('Akun baru berhasil ditambahkan!');
      }
      handleCloseModal();
      fetchAkun();
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      alert(`Gagal menyimpan akun: ${msg}`);
    }
  };

  const handleDelete = async (id, username) => {
    if (id === currentUser.id_akun) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }

    if (window.confirm(`Yakin ingin menghapus akun ${username}?`)) {
      try {
        await axios.delete(`${API_URL}/akun/${id}`);
        alert('Akun berhasil dihapus');
        fetchAkun();
      } catch (error) {
        alert('Gagal menghapus akun: ' + error.message);
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pengaturan Akun</h1>
        <div className="header-actions">
          <PrinterStatus />
        </div>
      </div>

      <div className="page-body">
        <div className="data-table-container">
          <div className="table-toolbar">
            <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Tambah Akun Baru
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>USERNAME</th>
                <th>ROLE</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {akunList.map((akun, index) => (
                <tr key={akun.id_akun}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500, color: '#1e293b' }}>{akun.username}</td>
                  <td style={{ color: '#64748b' }}>{akun.role}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleOpenModal(akun)} title="Edit">
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(akun.id_akun, akun.username)} title="Hapus" style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {akunList.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data akun.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <div className="pagination-info">
              Sudah Menampilkan Semua Data
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Akun' : 'Tambah Akun'}</h2>
              <button className="btn-close" onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="akun-form">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="">Pilih Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Kasir">Kasir</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Masukkan Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{isEditing ? 'Ganti Password' : 'Password'}</label>
                  <input
                    type="password"
                    placeholder={isEditing ? 'Biarkan kosong jika tidak ingin ganti password' : 'Masukkan password baru'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditing}
                  />
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px' }}>
                    Simpan
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal} style={{ padding: '12px 24px' }}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PengaturanAkun;
