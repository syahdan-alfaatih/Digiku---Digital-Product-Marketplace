import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FaCamera, FaUser, FaHeart, FaBoxOpen, FaUserCog,
  FaStore, FaClipboardList
} from 'react-icons/fa';

function DashboardIndex() {
  const { user, token, updateUserContext } = useContext(AuthContext);

  // State untuk Preview Gambar
  const [profilePreview, setProfilePreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cek apakah user sedang dalam mode Seller
  const isSeller = user?.activeRole === 'seller';

  useEffect(() => {
    if (user) {
      const picUrl = user.profile_pic || user.profile_picture;
      const bgUrl = user.banner_pic || user.background_image;

      if (picUrl) setProfilePreview(`http://localhost:5000${picUrl}`);
      if (bgUrl) setBgPreview(`http://localhost:5000${bgUrl}`);
    }
  }, [user]);

  // --- FUNGSI UPLOAD OTOMATIS ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Ganti Preview Langsung
    const objectUrl = URL.createObjectURL(file);
    if (type === 'profilePicture') setProfilePreview(objectUrl);
    if (type === 'backgroundImage') setBgPreview(objectUrl);

    // 2. Siapkan Data
    const formData = new FormData();
    formData.append(type, file);

    setIsUploading(true);

    try {
      const response = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Gagal upload gambar');

      const data = await response.json();

      // 3. Update Data di Context & LocalStorage
      if (updateUserContext) {
        updateUserContext(data.user, data.token);
      }

      console.log('Upload sukses:', data);

    } catch (error) {
      alert(`Gagal Upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[500px]">

      {/* --- AREA HEADER & BACKGROUND --- */}
      <div className="relative h-48 bg-blue-600 group">
        {bgPreview && (
          <img src={bgPreview} alt="Cover" className="w-full h-full object-cover" />
        )}
        <label className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer transition-colors">
          <FaCamera size={18} />
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgroundImage')} disabled={isUploading} />
        </label>
      </div>

      {/* --- AREA PROFILE PICTURE & INFO --- */}
      <div className="px-8 flex flex-col md:flex-row items-center md:items-end -mt-16 mb-8 relative z-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center">
            {profilePreview ? (
              <img src={profilePreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-4xl text-gray-400" />
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <FaCamera size={24} />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePicture')} disabled={isUploading} />
          </label>
        </div>

        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left mb-1">
          {/* --- PERBAIKAN BADGE DISINI --- */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <h2 className="text-3xl font-bold text-gray-800">{user?.username || 'User'}</h2>

            {isSeller ? (
              // Badge Seller (Hijau) + mt-1 biar sejajar visual
              <span className="mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold border border-green-200 tracking-wider">
                SELLER
              </span>
            ) : (
              // Badge Buyer (Biru) + mt-1 biar sejajar visual
              <span className="mt-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold border border-blue-200 tracking-wider">
                BUYER
              </span>
            )}
          </div>

          <p className="text-gray-500 font-medium mt-1">
            {isSeller ? 'Kelola toko dan produkmu disini.' : 'Selamat datang kembali, selamat berbelanja!'}
          </p>
          {isUploading && <p className="text-xs text-blue-500 animate-pulse mt-1">Mengupload...</p>}
        </div>
      </div>

      {/* --- MENU KARTU (DINAMIS SESUAI ROLE) --- */}
      <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">

        {isSeller ? (
          // === TAMPILAN MENU SELLER ===
          <>
            <Link to="/dashboard/my-products" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaStore className="text-blue-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Produk Saya</h3>
              </div>
              <p className="text-sm text-gray-400">Kelola dagangan Anda</p>
            </Link>

            <Link to="#" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaClipboardList className="text-orange-500 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Pesanan Masuk</h3>
              </div>
              <p className="text-sm text-gray-400">Cek penjualan baru</p>
            </Link>

            <Link to="/dashboard/settings" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaUserCog className="text-gray-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Pengaturan Akun</h3>
              </div>
              <p className="text-sm text-gray-400">Ganti mode / edit profil</p>
            </Link>
          </>
        ) : (
          // === TAMPILAN MENU BUYER ===
          <>
            <Link to="/cart" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaHeart className="text-red-500 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Produk Disimpan</h3>
              </div>
              <p className="text-sm text-gray-400">Lihat Keranjang Anda</p>
            </Link>

            <Link to="/dashboard/my-orders" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaBoxOpen className="text-blue-500 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Pesanan Saya</h3>
              </div>
              <p className="text-sm text-gray-400">Lihat riwayat pesanan</p>
            </Link>

            <Link to="/dashboard/settings" className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-32 group">
              <div>
                <FaUserCog className="text-green-500 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-700">Pengaturan Akun</h3>
              </div>
              <p className="text-sm text-gray-400">Kelola akun Anda</p>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}

export default DashboardIndex;