import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaShoppingCart,
  FaHeadset,
  FaBars,
  FaUserCircle,
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { formatRupiah } from '../utils/format.js';
import HeroBanner from '../components/HeroBanner';

function HomePage() {
  const { user, logout } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const backendUrl = 'http://localhost:3000';

  const profileImageUrl = user?.profilePicture
    ? `${backendUrl}${user.profilePicture}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'user'}`;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/products`);
        const data = await response.json();
        console.log('Respon dari server:', response);
        console.log('Data dari server:', data);
        if (response.ok) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data produk:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Kiri: Logo & Hamburger */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 hidden sm:block">
                Digiku
              </span>
              <img src="/Digiku.png" alt="Logo Digiku" className="h-7 w-7" />
            </Link>
            <button className="ml-8 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors transform -translate-x-2">
              <FaBars size={22} />
            </button>
          </div>

          {/* Tengah: Search Bar */}
          <div className="flex-1 max-w-4xl px-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Cari produk digital, template, atau e-book..."
                className="w-full border border-gray-300 bg-gray-50 rounded-lg py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Kanan: Aksi User & Auth */}
          <div className="flex items-center space-x-4 flex-shrink-0 relative">
            <Link 
              to="/cart" 
              className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors transform translate-x-1"
            >
              <FaShoppingCart size={22} />
            </Link>
            <button className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors transform -translate-x-1">
              <FaHeadset size={22} />
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <nav className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <div className="relative ml-2.5" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="block w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  >
                    <img
                      src={profileImageUrl}
                      alt="Profil"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-20">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Produk Terbaru</h2>
        {loading ? (
          <p>Memuat produk...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((p) => (
              <Link
                to={`/products/${p._id}`}
                key={p._id}
                className="flex flex-col group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative w-full h-48">
                  <img
                    src={`${backendUrl}${p.thumbnailUrl}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://placehold.co/600x400/EEE/31343C?text=Gambar+Error';
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3
                    className="text-base font-semibold text-gray-800 truncate mb-1"
                    title={p.name}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <FaUserCircle className="mr-1.5" />
                    <span>{p.seller?.username || 'Penjual'}</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-bold text-blue-600">
                      {formatRupiah(p.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
