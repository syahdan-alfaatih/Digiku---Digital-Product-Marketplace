import React, { useState, useEffect } from 'react';
// --- 1. IMPORT useNavigate ---
import { useParams, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../utils/format.js';
import {
  FaShoppingCart,
  FaStore,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaHeart,
  FaShareAlt,
} from 'react-icons/fa';

function ProductDetailPage() {
  const { productId } = useParams();
  // --- SIAPKAN FUNGSI navigate ---
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const backendUrl = 'http://localhost:3000';

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setIsDescriptionExpanded(false);

      try {
        const response = await fetch(`${backendUrl}/api/products/${productId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Produk tidak ditemukan');

        setProduct(data);

        if (data.thumbnailUrl) {
          setSelectedImage(`${backendUrl}${data.thumbnailUrl}`);
        }
      } catch (error) {
        console.error('Gagal mengambil data produk:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [productId]);

  // --- 2. BUAT FUNGSI handleAddToCart ---
  const handleAddToCart = async () => {
    // Cek dulu token login dari local storage
    const token = localStorage.getItem('token');

    // Kalo gak ada token, kasih peringatan dan arahin ke halaman login
    if (!token) {
      alert('Kamu harus login dulu untuk menambahkan produk ke keranjang!');
      navigate('/login');
      return; // Hentikan eksekusi fungsi
    }

    // Kalo ada token, kita coba kirim data ke backend
    try {
      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Kirim token buat otentikasi
        },
        body: JSON.stringify({ productId: productId }) // Kirim ID produknya
      });

      const data = await response.json();

      if (!response.ok) {
        // Kalo ada error dari backend (misal: produk sudah ada), tampilkan pesannya
        throw new Error(data.message || 'Gagal menambahkan produk.');
      }

      // Kalo berhasil, kasih notifikasi sukses!
      alert('Produk berhasil ditambahkan ke keranjang! 🎉');
      
    } catch (error) {
      // Kalo ada error lain, tampilkan juga pesannya
      console.error('Error:', error);
      alert(error.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Sedang memuat...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Produk tidak ditemukan.</p>
      </div>
    );
  }

  const galleryImages = [
    product.thumbnailUrl,
    ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
  ].filter(Boolean);

  const sellerProfilePic = product.seller?.profilePicture
    ? `${backendUrl}${product.seller.profilePicture}`
    : `https://api.dicebear.com/8.x/initials/svg?seed=${product.seller?.username || 'S'}`;

  const handleNavigateImage = (direction) => {
    const currentIndex = galleryImages.findIndex((imgUrl) =>
      selectedImage.endsWith(imgUrl)
    );
    let nextIndex;

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % galleryImages.length;
    } else {
      nextIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    }

    setSelectedImage(`${backendUrl}${galleryImages[nextIndex]}`);
  };

  const DESCRIPTION_LIMIT = 250;
  const isLongDescription = product.description.length > DESCRIPTION_LIMIT;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6">
        {/* --- KARTU UTAMA PRODUK --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Galeri Gambar */}
            <div className="lg:col-span-5">
              <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Gambar Produk Utama"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto mt-4 pb-2">
                {galleryImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage.endsWith(imgUrl)
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedImage(`${backendUrl}${imgUrl}`)}
                  >
                    <img
                      src={`${backendUrl}${imgUrl}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Share:</span>
                  <FaShareAlt className="cursor-pointer hover:text-blue-500" />
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <button className="flex items-center space-x-2 hover:text-red-500">
                  <FaHeart />
                  <span>Favorit (1.2rb)</span>
                </button>
              </div>
            </div>

            {/* Info Produk */}
            <div className="lg:col-span-7">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 my-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-yellow-500">4.9</span>
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <span>66,6RB Penilaian</span>
                <div className="h-4 w-px bg-gray-300"></div>
                <span>10RB+ Terjual</span>
              </div>

              <div className="my-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-4xl font-extrabold text-blue-600">
                  {formatRupiah(product.price)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {/* --- 3. PASANG FUNGSI KE TOMBOL --- */}
                <button 
                  onClick={handleAddToCart}
                  className="w-full border-2 border-blue-500 hover:bg-blue-50 text-blue-500 font-bold py-3 rounded-lg text-base transition-colors flex items-center justify-center space-x-2">
                  <FaShoppingCart />
                  <span>Masukkan Keranjang</span>
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-base transition-colors">
                  Beli Sekarang
                </button>
              </div>

              {/* Deskripsi Produk */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Deskripsi Produk
                </h3>
                <div
                  className={`relative overflow-hidden transition-all duration-500 ease-in-out ${
                    isDescriptionExpanded ? 'max-h-[2000px]' : 'max-h-24'
                  }`}
                >
                  <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                    {product.description}
                  </p>
                  {!isDescriptionExpanded && isLongDescription && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                {isLongDescription && (
                  <div className="text-center mt-8 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-blue-600 font-semibold text-sm hover:underline"
                    >
                      {isDescriptionExpanded
                        ? 'Lihat Lebih Sedikit'
                        : 'Lihat Selengkapnya'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Penjual */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={sellerProfilePic}
                alt="Foto Penjual"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="ml-4">
                <p className="font-bold text-gray-900">{product.seller.username}</p>
                <p className="text-xs text-gray-500">Aktif 2 Menit Lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="border border-blue-500 hover:bg-blue-50 text-blue-500 font-semibold py-2 px-6 rounded-lg text-sm transition-colors">
                Kunjungi Toko
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;