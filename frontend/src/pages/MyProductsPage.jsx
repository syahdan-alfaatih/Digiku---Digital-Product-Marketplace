import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { formatRupiah } from '../utils/format';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function MyProductsPage() {
  const [myProducts, setMyProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const backendUrl = 'http://localhost:3000';

  useEffect(() => {
    const fetchMyProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/products/my-products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMyProducts(data);
        } else {
          throw new Error(data.message || 'Gagal mengambil data produk.');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchMyProducts();
    }
  }, [token]);

  // fungsi menghapus produk
  const handleDelete = async (productId) => {
    // konfirmasi hapus
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini secara permanen? Aksi ini tidak bisa dibatalkan.')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // update tampilan dan menghapus produk di state
        setMyProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
      } else {
        throw new Error(data.message || 'Gagal menghapus produk.');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Produk Saya</h2>
        <Link 
          to="/add-product" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" />
          Tambah Produk Baru
        </Link>
      </div>
      
      {isLoading ? (
        <p>Memuat produk Anda...</p>
      ) : myProducts.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">Anda belum memiliki produk.</p>
          <p className="text-gray-400 text-sm mt-2">Klik tombol "Tambah Produk Baru" untuk memulai.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">Thumbnail</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">Nama Produk</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">Harga</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myProducts.map(product => (
                <tr key={product._id}>
                  <td className="py-4 px-4 align-middle">
                    <img 
                        src={`${backendUrl}${product.thumbnailUrl}`} 
                        alt={product.name} 
                        className="h-12 w-16 object-cover rounded-md" 
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x75/EEE/31343C?text=Error' }}
                    />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium align-middle">{product.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 align-middle">{formatRupiah(product.price)}</td>
                  <td className="py-4 px-4 text-sm flex items-center space-x-2 align-middle">
                    <Link 
                      to={`/edit-product/${product._id}`}
                      className="inline-block text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                      title="Edit Produk"
                    >
                      <FaEdit />
                    </Link>
                    
                    <button 
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Hapus Produk"
                    >
                        <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyProductsPage;