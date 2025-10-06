import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../utils/format.js';
import { FaDownload, FaBoxOpen } from 'react-icons/fa';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = 'http://localhost:3000';

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data pesanan.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Memuat riwayat pesanan...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-md">
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Kamu belum punya pesanan</h2>
            <p className="text-gray-500 mt-2 mb-6">Semua produk yang kamu beli akan muncul di sini.</p>
            <Link to="/" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <img 
                  src={`${backendUrl}${order.product.thumbnailUrl}`} 
                  alt={order.product.name} 
                  className="w-full sm:w-28 h-auto sm:h-28 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-gray-800">{order.product.name}</h3>
                  <p className="text-sm text-gray-500">Oleh: {order.seller.username}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tanggal Beli: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-semibold text-blue-600 mt-2">{formatRupiah(order.priceAtPurchase)}</p>
                </div>
                {/* tombol download */}
                <a 
                  href={`${backendUrl}${order.product.productFileUrl}`} 
                  download 
                  className="w-full sm:w-auto flex items-center justify-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  title="Unduh file produk"
                >
                  <FaDownload className="mr-2" />
                  Unduh File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;