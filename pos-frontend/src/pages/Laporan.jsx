import { useState, useEffect } from 'react';
import { Calendar, Printer, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from 'axios';
import PrinterStatus from '../components/PrinterStatus';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const getPeriodOptions = () => {
  const options = [];
  const current = new Date();
  for (let offset = 0; offset < 24; offset += 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - offset, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
};

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('Pendapatan');
  const [period, setPeriod] = useState(() => {
    const current = new Date();
    return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
  });
  const [metrik, setMetrik] = useState({
    total_transaksi: 0,
    total_pendapatan: 0,
    total_pengeluaran: 0,
    laba_kotor: 0
  });
  const [lineData, setLineData] = useState({ Pendapatan: [], Pengeluaran: [] });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [topBarang, setTopBarang] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/laporan/dashboard`, { params: { period } })
      .then(res => {
        setMetrik({
          total_transaksi: res.data.metrik.total_transaksi || 0,
          total_pendapatan: res.data.metrik.total_pendapatan || 0,
          total_pengeluaran: res.data.metrik.total_pengeluaran || 0,
          laba_kotor: res.data.metrik.laba_kotor || 0
        });

        const formatDailyData = (data) => data.map(d => ({
          name: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          value: parseFloat(d.total) || 0
        }));
        setLineData({
          Pendapatan: formatDailyData(res.data.lineData),
          Pengeluaran: formatDailyData(res.data.expenseLineData)
        });

        // Format Pie Data
        const totalTransaksi = res.data.pieData.reduce((sum, item) => sum + item.jumlah, 0);
        const formattedPie = res.data.pieData.map((d, i) => ({
          name: d.metode_pembayaran,
          value: Math.round((d.jumlah / totalTransaksi) * 100), // Persentase
          raw: d.jumlah,
          color: COLORS[i % COLORS.length]
        }));
        setPieData(formattedPie);

        // Format Bar Data
        const formattedBar = res.data.barData.map(d => ({
          name: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          Pendapatan: parseFloat(d.Pendapatan),
          Pengeluaran: parseFloat(d.Pengeluaran)
        }));
        setBarData(formattedBar);
        setTopBarang(res.data.topBarang || []);
      })
      .catch(err => console.error(err));
  }, [period]);

  const periodOptions = getPeriodOptions();
  const currentLineData = lineData[activeTab] || [];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Laporan & Analitik</h1>
        <div className="header-actions">
          <PrinterStatus />
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} />
            <select className="filter-select" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Pilih periode laporan">
              {periodOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>🛒</span>
            </div>
            <div>
              <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total transaksi</div>
              <div style={{ color: '#a855f7', fontSize: '20px', fontWeight: '700' }}>{metrik.total_transaksi}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>💵</span>
            </div>
            <div>
              <div style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total pendapatan</div>
              <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700' }}>Rp {parseFloat(metrik.total_pendapatan).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>💸</span>
            </div>
            <div>
              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Total pengeluaran</div>
              <div style={{ color: '#ef4444', fontSize: '20px', fontWeight: '700' }}>Rp {parseFloat(metrik.total_pengeluaran).toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>💳</span>
            </div>
            <div>
              <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Laba kotor</div>
              <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: '700' }}>Rp {parseFloat(metrik.laba_kotor).toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['Pendapatan', 'Pengeluaran'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: activeTab === tab ? '#1e40af' : '#e2e8f0',
                backgroundColor: activeTab === tab ? '#1e40af' : 'white',
                color: activeTab === tab ? 'white' : '#64748b',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>{activeTab} Harian</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => val.toLocaleString('id-ID')} />
                <RechartsTooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Line type="monotone" dataKey="value" stroke={activeTab === 'Pendapatan' ? '#3b82f6' : '#ef4444'} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Metode Pembayaran</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '150px', height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, paddingLeft: '20px' }}>
                {pieData.map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                      <span style={{ color: '#64748b' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>{item.raw} ({item.value}%)</span>
                  </div>
                ))}
                {pieData.length === 0 && <span style={{ color: '#64748b', fontSize: '14px' }}>Belum ada data</span>}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Pendapatan vs Pengeluaran</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => val.toLocaleString('id-ID')} />
                  <RechartsTooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Bar dataKey="Pendapatan" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Top 10 Barang Terlaris</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', width: '56px' }}>No.</th>
                  <th style={{ padding: '12px 8px' }}>Kode Barang</th>
                  <th style={{ padding: '12px 8px' }}>Nama Barang</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Terjual</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {topBarang.map((barang, index) => (
                  <tr key={`${barang.kode_item}-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '12px 8px' }}>{barang.kode_item}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{barang.nama_suku_cadang}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>{Number(barang.total_qty).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>Rp {Number(barang.total_penjualan).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {topBarang.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px 8px', textAlign: 'center', color: '#64748b' }}>
                      Belum ada data penjualan pada periode ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default Laporan;
