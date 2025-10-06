import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../utils/format.js';
import { FaTrashAlt, FaShoppingBag } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext.jsx'; 

function CartPage() {
  const { user } = useContext(AuthContext); 
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = 'http://localhost:3000';

  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data keranjang.');
      }

      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveItem = async (productId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Yakin ingin menghapus produk ini dari keranjang?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus produk.');
      }

      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!confirm('Ini adalah simulasi pembayaran. Lanjutkan untuk menyelesaikan pesanan?')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${backendUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses pesanan.');
      }

      if (user && user.activeRole === 'seller') {
        alert('Pembayaran berhasil! Beralihlah ke mode Pembeli untuk melihat pesanan Anda.');
        navigate('/dashboard'); 
      } else {
        alert('Pembayaran berhasil! Anda akan diarahkan ke halaman pesanan.');
        navigate('/dashboard/my-orders'); 
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return <div className="text-center p-10">Memuat keranjang...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Keranjang Saya</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-md">
            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Keranjang belanjamu kosong</h2>
            <p className="text-gray-500 mt-2 mb-6">Yuk, isi dengan produk-produk digital impianmu!</p>
            <Link to="/" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daftar Produk di Keranjang */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                  <img 
                    src={`${backendUrl}${item.thumbnailUrl}`} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">Oleh: {item.seller.username}</p>
                    <p className="font-semibold text-blue-600 mt-2">{formatRupiah(item.price)}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"
                    title="Hapus dari keranjang"
                  >
                    <FaTrashAlt size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Ringkasan Belanja */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-semibold border-b pb-4 mb-4">Ringkasan Belanja</h2>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal ({cartItems.length} produk)</span>
                  <span className="font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg mt-6 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Memproses...' : 'Lanjut ke Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;