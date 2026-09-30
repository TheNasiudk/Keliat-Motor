import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

const DetailTransaksiModal = ({ transaksiId, onClose }) => {
  const [transaksi, setTransaksi] = useState(null);
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaksiId) {
      setLoading(true);
      axios.get(`http://localhost:3001/api/transaksi/${transaksiId}`)
        .then(res => {
          setTransaksi(res.data.transaksi);
          setDetail(res.data.detail);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [transaksiId]);

  const handlePrint = async () => {
    try {
      const response = await axios.post('http://localhost:3001/print', {
        type: 'STRUK',
        data: {
          no_invoice: transaksi.no_invoice,
          cart: detail,
          total_pembayaran: transaksi.total_pembayaran,
          nominal_bayar: transaksi.nominal_bayar,
          kembalian: transaksi.kembalian,
          metode_pembayaran: transaksi.metode_pembayaran,
          user: transaksi.user,
          catatan: transaksi.catatan,
          biaya_jasa: transaksi.biaya_jasa,
          jenis_transaksi: transaksi.jenis_transaksi
        }
      });
      alert(response.data.message);
    } catch (error) {
      alert('Gagal mencetak struk: ' + error.message);
    }
  };

  if (!transaksiId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Detail Transaksi</h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>Memuat...</div>
          ) : transaksi ? (
            <>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>No. Transaksi</div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{transaksi.no_invoice}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tanggal/Jam</div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{new Date(transaksi.tanggal_transaksi).toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {transaksi.user && (
                  <div style={{ padding: '6px 12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '13px', color: '#1e40af' }}>
                    <strong>Kasir:</strong> {transaksi.user}
                  </div>
                )}
                {transaksi.jenis_transaksi && (
                  <div style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '13px', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <strong>Jenis Transaksi:</strong> <span style={{ textTransform: 'capitalize' }}>{transaksi.jenis_transaksi}</span>
                  </div>
                )}
              </div>

              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>Item Transaksi</div>
              
              {detail.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detail.map(item => (
                    <div key={item.id_detail} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{item.nama_suku_cadang}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Rp {parseFloat(item.harga_jual_historis).toLocaleString('id-ID')} x {item.qty}</div>
                      </div>
                      <div style={{ fontWeight: '600', color: '#2563eb' }}>Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>Tidak ada sparepart (Jasa Only)</div>
              )}

              {transaksi.biaya_jasa && parseFloat(transaksi.biaya_jasa) > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#166534' }}>Biaya Jasa</div>
                  <div style={{ fontWeight: '600', color: '#166534' }}>Rp {parseFloat(transaksi.biaya_jasa).toLocaleString('id-ID')}</div>
                </div>
              )}

              {transaksi.catatan && (
                <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>Catatan Jasa</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>{transaksi.catatan}</div>
                </div>
              )}

              <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', margin: '20px 0', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Total pembayaran</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d4ed8' }}>Rp {parseFloat(transaksi.total_pembayaran).toLocaleString('id-ID')}</div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Pembayaran</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>{transaksi.metode_pembayaran}</span>
                  <span style={{ color: '#0f172a' }}>Rp {parseFloat(transaksi.nominal_bayar).toLocaleString('id-ID')}</span>
                </div>
                {transaksi.metode_pembayaran === 'Tunai' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#10b981' }}>Kembalian</span>
                    <span style={{ color: '#10b981' }}>Rp {parseFloat(transaksi.kembalian).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {transaksi.bukti_transaksi && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Bukti Pembayaran</div>
                  <img 
                    src={`http://localhost:3001/bukti-pembayaran/${transaksi.bukti_transaksi}`} 
                    alt="Bukti Pembayaran" 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '300px', objectFit: 'contain' }} 
                  />
                </div>
              )}
            </>
          ) : (
            <div>Data tidak ditemukan.</div>
          )}
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Tutup</button>
          <button className="btn-submit" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Printer size={18} />
            Cetak ulang
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailTransaksiModal;
