import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

function EditProductPage() {
  const { productId } = useParams(); // Mengambil ID produk dari URL
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // ambil data produk saat ini dari server saat halaman dibuka
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const data = await response.json();
        if (response.ok) {
          setName(data.name);
          setDescription(data.description);
          setPrice(data.price);
          setThumbnailUrl(data.thumbnailUrl);
        } else {
          throw new Error(data.message || 'Gagal mengambil data produk.');
        }
      } catch (error) {
        alert(error.message);
        navigate('/dashboard/my-products'); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [productId, navigate]);

  // kirim data yg update ke server
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price: Number(price), thumbnailUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Produk berhasil diupdate!');
        navigate('/dashboard/my-products'); 
      } else {
        throw new Error(data.message || 'Gagal mengupdate produk.');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Memuat data produk...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Produk</h2>
        <form onSubmit={handleSubmit}>
          {/* isi form */}
           <div className="mb-4">
             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Produk</label>
             <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
           </div>
           <div className="mb-4">
             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Deskripsi</label>
             <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"></textarea>
           </div>
           <div className="mb-6">
             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Harga (Rp)</label>
             <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
           </div>
          <div className="flex items-center justify-center">
            <button type="submit" disabled={isUpdating} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductPage;
