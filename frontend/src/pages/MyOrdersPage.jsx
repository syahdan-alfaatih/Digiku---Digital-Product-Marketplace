import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../utils/format.js';
import { FaDownload, FaBoxOpen } from 'react-icons/fa';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const backendUrl = 'http://localhost:5000';

  // --- FUNGSI PEMBERSIH URL ---
  const cleanUrl = (path) => {
    if (!path) return '#'; 
    
    // Hapus backslash ganda atau aneh-aneh dari Windows path
    let cleaned = path.replace(/\\/g, '/'); 
    
    // Cek apakah path sudah mengandung http (link eksternal)
    if (cleaned.startsWith('http')) return cleaned;

    // Pastikan diawali slash
    if (!cleaned.startsWith('/')) {
      cleaned = '/' + cleaned;
    }

    return `${backendUrl}${cleaned}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Gagal mengambil data pesanan.');

        const rawData = await response.json();
        // console.log("DATA MENTAH:", rawData); // Debugging

        const legacyFormatOrders = [];
        if (Array.isArray(rawData)) {
          rawData.forEach(transaction => {
            const items = transaction.order_items || transaction.items || [];
            
            items.forEach(item => {
              if (!item.product) return;

              // --- PERBAIKAN DI SINI (KAMUS PENCARI LINK) ---
              // Sekarang kita tambahkan 'file_path' ke dalam pencarian!
              const rawFileUrl = item.product.file_path || // <--- INI DIA YANG KETINGGALAN!
                                 item.product.productFileUrl || 
                                 item.product.product_file_url || 
                                 item.product.fileUrl || 
                                 item.product.file_url ||
                                 ""; 

              const rawThumbnail = item.product.thumbnail_url || 
                                   item.product.thumbnailUrl || 
                                   item.product.image || 
                                   "";

              legacyFormatOrders.push({
                _id: item.id,
                createdAt: transaction.created_at || transaction.createdAt,
                priceAtPurchase: item.price,
                product: {
                  name: item.product.name,
                  thumbnailUrl: rawThumbnail,
                  productFileUrl: rawFileUrl // Sekarang pasti ketemu!
                },
                seller: {
                  username: item.product.seller?.username || 'Penjual'
                }
              });
            });
          });
        }
        setOrders(legacyFormatOrders);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center p-10">Memuat riwayat pesanan...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-md">
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Kamu belum punya pesanan</h2>
            <Link to="/" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors mt-4 inline-block">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // Siapkan URL Final
              const finalFileUrl = cleanUrl(order.product.productFileUrl);
              // Cek validitas link (bukan '#' dan bukan string kosong)
              const isLinkValid = finalFileUrl && finalFileUrl !== '#' && finalFileUrl !== `${backendUrl}/`;

              return (
                <div key={order._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <img 
                    src={cleanUrl(order.product.thumbnailUrl)}
                    alt={order.product.name} 
                    className="w-full sm:w-28 h-auto sm:h-28 object-cover rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100?text=No+Image' }}
                  />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-800">{order.product.name}</h3>
                    <p className="text-sm text-gray-500">Oleh: {order.seller.username}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tanggal: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-blue-600 mt-2">{formatRupiah(order.priceAtPurchase)}</p>
                  </div>
                  
                  {isLinkValid ? (
                    <a 
                      href={finalFileUrl} 
                      download 
                      className="w-full sm:w-auto flex items-center justify-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                      title="Unduh file produk"
                    >
                      <FaDownload className="mr-2" />
                      Unduh File
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="w-full sm:w-auto flex items-center justify-center bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                      title="File tidak tersedia di server"
                    >
                      <FaDownload className="mr-2" />
                      File Tidak Ada
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;