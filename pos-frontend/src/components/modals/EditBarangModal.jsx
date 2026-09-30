import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import axios from 'axios';
import './Modal.css';

const EditBarangModal = ({ item, onClose }) => {
  const [kategoriList, setKategoriList] = useState([]);
  const [filteredKategori, setFilteredKategori] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    nama_suku_cadang: item?.nama_suku_cadang || '',
    kode_item: item?.kode_item || '',
    nama_kategori: item?.tipe || '',
    harga_jual: item?.harga_jual || '',
    stok_minimal: item?.stok_minimal || '',
    gambar_barang: null
  });

  useEffect(() => {
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
    setFormData({ ...formData, nama_kategori: value });
    if (value.length > 0) {
      const filtered = kategoriList.filter(k => k.nama_kategori.toLowerCase().includes(value.toLowerCase()));
      setFilteredKategori(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCategory = (name) => {
    setFormData({ ...formData, nama_kategori: name });
    setShowSuggestions(false);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, gambar_barang: e.target.files[0] });
  };

  const handlePrint = async (codeType) => {
    try {
      const response = await axios.post('http://localhost:3001/print', {
        type: 'LABEL',
        text: formData.nama_suku_cadang,
        codeData: formData.kode_item,
        codeType: codeType
      });
      alert(response.data.message);
    } catch (error) {
      alert('Gagal cetak: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('nama_suku_cadang', formData.nama_suku_cadang);
    data.append('kode_item', formData.kode_item);
    data.append('nama_kategori', formData.nama_kategori);
    data.append('harga_jual', formData.harga_jual);
    data.append('stok_minimal', formData.stok_minimal);
    if (formData.gambar_barang) {
      data.append('gambar_barang', formData.gambar_barang);
    }

    try {
      await axios.put(`http://localhost:3001/api/suku-cadang/${item.id_suku_cadang}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Barang berhasil diupdate');
      onClose();
    } catch (error) {
      alert('Gagal update barang: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Barang</h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ width: '100px', height: '100px', marginBottom: '10px' }}>
              {item?.gambar_barang ? (
                <img src={`http://localhost:3001/uploads/${item.gambar_barang}`} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9' }}></div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Nama Barang</label>
            <input type="text" className="form-control" name="nama_suku_cadang" value={formData.nama_suku_cadang} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>Kode Barang</label>
            <input type="text" className="form-control" name="kode_item" value={formData.kode_item} onChange={handleChange} />
          </div>

          <div className="barcode-preview-container">
            <div className="qr-box">
              <QRCodeCanvas value={formData.kode_item || ' '} size={100} />
              <button className="print-btn" onClick={() => handlePrint('QR')}>Print QR Code</button>
            </div>
            <div className="barcode-box">
              <Barcode value={formData.kode_item || ' '} width={1.5} height={50} displayValue={false} />
              <button className="print-btn" onClick={() => handlePrint('BARCODE')}>Print Barcode</button>
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
            <label>Ganti Gambar Barang (Opsional)</label>
            <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
          </div>

          <div className="form-group">
            <label>Harga Jual</label>
            <input type="number" className="form-control" name="harga_jual" value={formData.harga_jual} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Stok Minimal</label>
            <input type="number" className="form-control" name="stok_minimal" value={formData.stok_minimal} onChange={handleChange} />
          </div>
        </div>
        
        <div className="modal-footer" style={{ display: 'flex' }}>
          <button className="btn-submit" onClick={handleSubmit}>Simpan</button>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 'none', width: '150px' }}>Reset Form</button>
        </div>
      </div>
    </div>
  );
};

export default EditBarangModal;
