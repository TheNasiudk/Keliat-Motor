import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import axios from 'axios';
import './Modal.css';

const TambahBarangModal = ({ onClose }) => {
  const [kategoriList, setKategoriList] = useState([]);
  const [filteredKategori, setFilteredKategori] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    nama_suku_cadang: '',
    kode_item: '',
    nama_kategori: '',
    harga_jual: '',
    harga_beli: '',
    stok_minimal: '',
    stok: '',
    gambar_barang: null
  });

  useEffect(() => {
    // Generate random code
    const randomKode = 'BRG-' + Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, kode_item: randomKode }));

    // Fetch categories
    axios.get('http://localhost:3001/api/kategori')
      .then(res => setKategoriList(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    let newKodeItem = formData.kode_item;
    
    const exactMatch = kategoriList.find(k => k.nama_kategori.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      if (!newKodeItem.startsWith(exactMatch.id_kategori + '-')) {
        newKodeItem = `${exactMatch.id_kategori}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else if (value === '' && !newKodeItem.startsWith('BRG-')) {
      newKodeItem = `BRG-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    setFormData({ ...formData, nama_kategori: value, kode_item: newKodeItem });
    
    if (value.length > 0) {
      const filtered = kategoriList.filter(k => k.nama_kategori.toLowerCase().includes(value.toLowerCase()));
      setFilteredKategori(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCategory = (name) => {
    const selectedKat = kategoriList.find(k => k.nama_kategori === name);
    const prefix = selectedKat ? selectedKat.id_kategori : 'BRG';
    const newKodeItem = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    setFormData({ 
      ...formData, 
      nama_kategori: name,
      kode_item: newKodeItem
    });
    setShowSuggestions(false);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, gambar_barang: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nama_suku_cadang', formData.nama_suku_cadang);
    data.append('kode_item', formData.kode_item);
    data.append('nama_kategori', formData.nama_kategori);
    data.append('harga_jual', formData.harga_jual);
    data.append('harga_beli', formData.harga_beli);
    data.append('stok_minimal', formData.stok_minimal);
    data.append('stok', formData.stok);
    if (formData.gambar_barang) {
      data.append('gambar_barang', formData.gambar_barang);
    }

    try {
      await axios.post('http://localhost:3001/api/suku-cadang', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Barang berhasil ditambahkan');
      onClose();
    } catch (error) {
      alert('Gagal menambahkan barang: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah Barang</h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nama Barang</label>
              <input type="text" className="form-control" name="nama_suku_cadang" value={formData.nama_suku_cadang} onChange={handleChange} placeholder="Masukkan nama barang" required />
            </div>
            
            <div className="form-group">
              <label>Kode Barang</label>
              <input type="text" className="form-control" name="kode_item" value={formData.kode_item} onChange={handleChange} placeholder="Masukkan kode barang" required />
            </div>

          <div className="barcode-preview-container">
            <div className="qr-box">
              <QRCodeCanvas value={formData.kode_item || ' '} size={100} />
              <span style={{fontSize: '12px', fontWeight: 'bold'}}>QR Code</span>
            </div>
            <div className="barcode-box">
              <Barcode value={formData.kode_item || ' '} width={1.5} height={50} displayValue={false} />
              <span style={{fontSize: '12px', fontWeight: 'bold'}}>Barcode</span>
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Jenis Barang / Kategori</label>
            <input 
              type="text" 
              className="form-control" 
              name="nama_kategori" 
              value={formData.nama_kategori} 
              onChange={handleCategoryChange} 
              onFocus={() => { if(formData.nama_kategori) setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ketik untuk mencari atau menambah baru" 
              required
            />
            {showSuggestions && filteredKategori.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', zIndex: 10, listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
                {filteredKategori.map(k => (
                  <li key={k.id_kategori} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onMouseDown={() => selectCategory(k.nama_kategori)}>
                    {k.nama_kategori}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Gambar Barang</label>
            <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
          </div>

            <div className="form-group">
              <label>Harga Jual</label>
              <input type="number" className="form-control" name="harga_jual" value={formData.harga_jual} onChange={handleChange} placeholder="Rp." required />
            </div>

            <div className="form-group">
              <label>Harga Beli <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '12px' }}>(opsional - isi jika barang baru dibeli)</span></label>
              <input type="number" className="form-control" name="harga_beli" value={formData.harga_beli} onChange={handleChange} placeholder="Kosongkan jika barang sudah ada di gudang" />
              {formData.harga_beli && (
                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠ Barang ini akan dicatat sebagai barang masuk baru di riwayat barang masuk
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Stok Minimal</label>
              <input type="number" className="form-control" name="stok_minimal" value={formData.stok_minimal} onChange={handleChange} placeholder="Masukkan jumlah stok minimal" required />
            </div>

            <div className="form-group">
              <label>Stok Awal</label>
              <input type="number" className="form-control" name="stok" value={formData.stok} onChange={handleChange} placeholder="Masukkan jumlah stok awal" required />
            </div>
          </div>
          
          <div className="modal-footer" style={{ display: 'flex' }}>
            <button type="submit" className="btn-submit">Simpan</button>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 'none', width: '150px' }}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahBarangModal;
