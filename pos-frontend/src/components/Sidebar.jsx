import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user')) || {};

  const adminMenu = [
    { name: 'Kelola Barang', path: '/kelola-barang' },
    { name: 'Barang Masuk', path: '/barang-masuk' },
    { name: 'Riwayat Transaksi', path: '/riwayat-transaksi' },
    { name: 'Transaksi Kasir', path: '/kasir' },
    { name: 'Laporan', path: '/laporan' },
    { name: 'Pengaturan Akun', path: '/pengaturan-akun' }
  ];

  const kasirMenu = [
    { name: 'Stok Barang', path: '/stok-barang' },
    { name: 'Riwayat Transaksi', path: '/riwayat-transaksi' },
    { name: 'Transaksi', path: '/kasir' }
  ];

  const menuItems = user.role === 'Admin' ? adminMenu : kasirMenu;

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle">
          <span>K</span>
          <span>M</span>
        </div>
        <h2>Keliat Motor</h2>
      </div>

      <div className="sidebar-profile">
        <div className="profile-icon">
          <User size={24} color="#1e293b" />
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.username}</div>
          <div className="profile-role">{user.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
