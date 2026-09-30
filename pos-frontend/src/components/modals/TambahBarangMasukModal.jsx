import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

const TambahBarangMasukModal = ({ onClose, preselectedBarangId = '' }) => {
  const [sukuCadangList, setSukuCadangList] = useState([]);
  const [formData, setFormData] = useState({
    id_suku_cadang: preselectedBarangId,
    harga_beli: '',
    qty_masuk: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3001/api/suku-cadang')
      .then(res => setSukuCadangList(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/barang-masuk', formData);
      alert('Barang masuk berhasil dicatat!');
      onClose();
    } catch (error) {
      alert('Gagal menambah barang masuk: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah Barang Masuk</h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Pilih Barang</label>
              <select className="form-control" name="id_suku_cadang" value={formData.id_suku_cadang} onChange={handleChange} required>
                <option value="">Masukkan kode atau nama barang</option>
                {sukuCadangList.map(item => (
                  <option key={item.id_suku_cadang} value={item.id_suku_cadang}>
                    {item.kode_item} - {item.nama_suku_cadang}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Harga Beli Satuan</label>
              <input type="number" className="form-control" name="harga_beli" value={formData.harga_beli} onChange={handleChange} placeholder="Rp." required />
            </div>

            <div className="form-group">
              <label>Kuantitas (Qty) Masuk</label>
              <input type="number" className="form-control" name="qty_masuk" value={formData.qty_masuk} onChange={handleChange} placeholder="Masukkan jumlah stok masuk" required />
            </div>
          </div>
          
          <div className="modal-footer" style={{ display: 'flex' }}>
            <button type="submit" className="btn-submit">Simpan</button>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 'none', width: '150px' }}>Batalkan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahBarangMasukModal;
