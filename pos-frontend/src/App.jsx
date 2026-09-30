import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import KelolaBarang from './pages/KelolaBarang';
import BarangMasuk from './pages/BarangMasuk';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import Kasir from './pages/Kasir';
import Laporan from './pages/Laporan';
import Login from './pages/Login';
import StokBarang from './pages/StokBarang';
import PengaturanAkun from './pages/PengaturanAkun';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default page if not authorized
    return <Navigate to={user.role === 'Kasir' ? '/kasir' : '/kelola-barang'} replace />;
  }

  return children;
};

const DefaultRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'Kasir' ? '/kasir' : '/kelola-barang'} replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(() => !sessionStorage.getItem('token'));

  useEffect(() => {
    // Hapus sesi lama dari implementasi yang belum memvalidasi token.
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    const token = sessionStorage.getItem('token');
    if (!token) return;

    axios.get(`${API_URL}/api/auth/me`)
      .then(({ data }) => {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'Kasir' ? '/kasir' : '/kelola-barang'} replace /> : <Login onLogin={setUser} />} />

        <Route path="/" element={<ProtectedRoute user={user}><Layout /></ProtectedRoute>}>
          <Route index element={<DefaultRedirect user={user} />} />

          {/* Admin Only Routes */}
          <Route path="kelola-barang" element={<ProtectedRoute user={user} allowedRoles={['Admin']}><KelolaBarang /></ProtectedRoute>} />
          <Route path="barang-masuk" element={<ProtectedRoute user={user} allowedRoles={['Admin']}><BarangMasuk /></ProtectedRoute>} />
          <Route path="laporan" element={<ProtectedRoute user={user} allowedRoles={['Admin']}><Laporan /></ProtectedRoute>} />
          <Route path="pengaturan-akun" element={<ProtectedRoute user={user} allowedRoles={['Admin']}><PengaturanAkun /></ProtectedRoute>} />

          {/* Kasir Only Routes */}
          <Route path="kasir" element={<ProtectedRoute user={user} allowedRoles={['Admin', 'Kasir']}><Kasir /></ProtectedRoute>} />
          <Route path="stok-barang" element={<ProtectedRoute user={user} allowedRoles={['Kasir']}><StokBarang /></ProtectedRoute>} />

          {/* Shared Routes */}
          <Route path="riwayat-transaksi" element={<ProtectedRoute user={user} allowedRoles={['Admin', 'Kasir']}><RiwayatTransaksi /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;