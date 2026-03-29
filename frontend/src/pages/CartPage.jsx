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
  
  const backendUrl = 'http://localhost:5000';

  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal mengambil data keranjang.');

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

  const handleRemoveItem = async (cartItemId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal menghapus produk.');

      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!confirm('Lanjutkan pembayaran?')) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal checkout.');

      alert('Pembayaran berhasil! 🎉');
      navigate(user?.activeRole === 'seller' ? '/dashboard' : '/dashboard/my-orders');

    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + Number(price);
  }, 0);

  if (loading) return <div className="text-center p-10">Memuat keranjang...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Keranjang Saya</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-md">
            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Keranjang kosong</h2>
            <Link to="/" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 mt-4 inline-block">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null; 

                return (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                    
                    {/* 1. Link pada Gambar */}
                    <Link to={`/products/${product.id}`} className="shrink-0">
                      <img 
                        src={`${backendUrl}${product.thumbnail_url}`} 
                        alt={product.name} 
                        className="w-24 h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100?text=No+Image' }}
                      />
                    </Link>

                    <div className="flex-grow">
                      {/* 2. Link pada Nama Produk */}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-500">Oleh: {product.seller?.username || 'Penjual'}</p>
                      <p className="font-semibold text-blue-600 mt-2">{formatRupiah(product.price)}</p>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.id)} 
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"
                    >
                      <FaTrashAlt size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-semibold border-b pb-4 mb-4">Ringkasan</h2>
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Total</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  {isProcessing ? 'Memproses...' : 'Checkout Sekarang'}
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