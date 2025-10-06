import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext.jsx'; 
import {
  FaHeart, FaBoxOpen, FaUserCog, FaQuestionCircle, FaSignOutAlt,
  FaTachometerAlt, FaStore, FaShoppingCart, FaStar, FaChartLine, FaWrench,
  FaHome
} from 'react-icons/fa';

function DashboardPage() {
  const { user, logout } = useContext(AuthContext);

  const buyerMenus = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { name: 'Kembali ke Beranda', icon: <FaHome />, path: '/' },
    { name: 'Produk Disimpan', icon: <FaHeart />, path: '/cart' },
    { name: 'Pesanan Saya', icon: <FaBoxOpen />, path: '/dashboard/my-orders' },
    { name: 'Pengaturan Akun', icon: <FaUserCog />, path: '/dashboard/settings' },
    { name: 'Pusat Bantuan', icon: <FaQuestionCircle />, path: '#' },
  ];

  const sellerMenus = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { name: 'Kembali ke Beranda', icon: <FaHome />, path: '/' },
    { name: 'Produk Saya', icon: <FaStore />, path: '/dashboard/my-products' },
    { name: 'Pesanan', icon: <FaShoppingCart />, path: '#' }, 
    { name: 'Ulasan Produk', icon: <FaStar />, path: '#' },
    { name: 'Analitik', icon: <FaChartLine />, path: '#' },
    { name: 'Pengaturan Toko', icon: <FaWrench />, path: '#' },
    { name: 'Pengaturan Akun', icon: <FaUserCog />, path: '/dashboard/settings' },
  ];
  
  const isSellerMode = user?.activeRole === 'seller';
  const activeMenus = isSellerMode ? sellerMenus : buyerMenus;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6 flex items-center space-x-2">
            <img src="/Digiku.png" alt="Logo Digiku" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-blue-600">Digiku</h1>
        </div>
        <nav className="mt-6">
          {activeMenus.map(menu => (
            <Link 
              to={menu.path} 
              key={menu.name} 
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-colors"
            >
              <span className="mr-3">{menu.icon}</span>
              {menu.name}
            </Link>
          ))}
            <a href="#" onClick={logout} className="flex items-center px-6 py-3 text-red-500 hover:bg-red-100 hover:font-semibold transition-colors">
              <span className="mr-3"><FaSignOutAlt /></span>
              Logout
            </a>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardPage;