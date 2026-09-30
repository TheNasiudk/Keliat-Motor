import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import Webcam from 'react-webcam';

const BuktiPembayaranModal = ({ isOpen, onClose, onFileSelect }) => {
  const [mode, setMode] = useState(null); // 'camera' or 'file'
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `bukti_pembayaran_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onFileSelect(file, imageSrc); // pass file and preview
          onClose();
          setMode(null);
        });
    }
  }, [webcamRef, onFileSelect, onClose]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      onFileSelect(file, preview);
      onClose();
      setMode(null);
    }
  };

  const handleClose = () => {
    onClose();
    setMode(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: mode === 'camera' ? '600px' : '450px' }}>
        <div className="modal-header">
          <h2>{mode === 'camera' ? 'Ambil Gambar' : 'Tambah Bukti Pembayaran'}</h2>
          <button className="btn-close" onClick={handleClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '32px 24px', textAlign: 'center' }}>
          {!mode ? (
            <>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
                  onClick={() => setMode('camera')}
                >
                  <Camera size={24} />
                  Buka Kamera
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} />
                  Pilih File
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </>
          ) : mode === 'camera' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                onUserMediaError={(err) => alert("Kamera tidak dapat diakses. Pastikan kamera tidak sedang digunakan oleh aplikasi lain.")}
                style={{ borderRadius: '8px', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                <button className="btn-primary" onClick={handleCapture} style={{ flex: 1, padding: '12px' }}>Ambil Foto</button>
                <button className="btn-secondary" onClick={() => setMode(null)} style={{ flex: 1, padding: '12px' }}>Batal</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BuktiPembayaranModal;
