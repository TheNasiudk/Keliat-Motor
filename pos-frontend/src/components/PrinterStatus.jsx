import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Printer } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const PrinterStatus = () => {
  const [printers, setPrinters] = useState([]);
  const [activePrinter, setActivePrinter] = useState('EP58M');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/printers`);
      setPrinters(res.data.printers || []);
      setActivePrinter(res.data.activePrinter);
    } catch (err) {
      console.error('Failed to fetch printers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changePrinter = async (name) => {
    try {
      const res = await axios.post(`${API_URL}/printers`, { printerName: name });
      setActivePrinter(name);
      setIsOpen(false);
    } catch (err) {
      alert('Gagal mengubah printer: ' + err.message);
    }
  };

  const activePrinterObj = printers.find(p => p.name === activePrinter);
  const isOffline = activePrinterObj ? activePrinterObj.offline : false;

  return (
    <div className="printer-status-container" style={{ position: 'relative' }} ref={dropdownRef}>
      <div 
        className="printer-status" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isOffline ? '#fef2f2' : '#f1f5f9', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${isOffline ? '#fca5a5' : '#cbd5e1'}`, fontWeight: 'bold', color: isOffline ? '#ef4444' : '#334155' }}
      >
        <Printer size={18} />
        {activePrinter ? (isOffline ? `Offline | ${activePrinter}` : `Terkoneksi | ${activePrinter}`) : 'Printer Tidak Ditemukan'}
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0', minWidth: '250px', zIndex: 50, padding: '8px' }}>
          <div style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pilih Printer Aktif</span>
            <button onClick={fetchPrinters} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px' }}>{loading ? 'Memuat...' : 'Refresh'}</button>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {printers.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '14px', color: '#94a3b8' }}>Tidak ada printer terdeteksi</div>
            ) : (
              printers.map(p => (
                <div 
                  key={p.name}
                  onClick={() => changePrinter(p.name)}
                  style={{ padding: '10px 12px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px', backgroundColor: activePrinter === p.name ? '#eff6ff' : 'transparent', color: activePrinter === p.name ? '#2563eb' : (p.offline ? '#94a3b8' : '#334155'), fontWeight: activePrinter === p.name ? 'bold' : 'normal', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between' }}
                  onMouseEnter={(e) => { if (activePrinter !== p.name) e.target.style.backgroundColor = '#f8fafc' }}
                  onMouseLeave={(e) => { if (activePrinter !== p.name) e.target.style.backgroundColor = 'transparent' }}
                >
                  <span>{p.name}</span>
                  {p.offline && <span style={{ color: '#ef4444', fontSize: '12px' }}>(Offline)</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterStatus;
