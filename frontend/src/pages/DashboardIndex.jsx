import React, { useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaHeart, FaBoxOpen, FaUserCog, FaCamera, FaStore, 
  FaShoppingCart, FaChartLine
} from 'react-icons/fa';

// komponen dashboard buyer
const BuyerDashboard = () => {
  const { user, token, updateUserContext } = useContext(AuthContext);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const backendUrl = 'http://localhost:3000';

  const profileImageUrl = profilePreview 
    ? profilePreview 
    : (user?.profilePicture ? `${backendUrl}${user.profilePicture}` : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'user'}`);
  
  const bannerImageUrl = bannerPreview
    ? bannerPreview
    : (user?.bannerPicture ? `${backendUrl}${user.bannerPicture}` : 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop');

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    const endpoint = type === 'profile' ? 'profile-picture' : 'banner-picture';
    const formKey = type === 'profile' ? 'profilePicture' : 'bannerPicture';
    formData.append(formKey, file);

    try {
      const response = await fetch(`${backendUrl}/api/user/${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Gambar berhasil diupdate!');
        updateUserContext(data.token);
        if (type === 'profile') setProfilePreview(null);
        if (type === 'banner') setBannerPreview(null);
      } else {
        throw new Error(data.message || 'Gagal mengupload gambar.');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      if (type === 'profile') setProfilePreview(null);
      if (type === 'banner') setBannerPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      handleImageUpload(file, 'profile');
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPreview(URL.createObjectURL(file));
      handleImageUpload(file, 'banner');
    }
  };

  const handleProfileClick = () => profileInputRef.current.click();
  const handleBannerClick = () => bannerInputRef.current.click();

  return (
    <div className={`flex-1 transition-opacity ${isUploading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {isUploading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 p-4 rounded-lg font-bold z-20">
          Mengupload...
        </div>
      )}
      <div className="relative mb-8">
        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerImageChange} disabled={isUploading} />
        <div className="h-48 bg-cover bg-center rounded-lg shadow-md" style={{ backgroundImage: `url(${bannerImageUrl})` }}>
          <button onClick={handleBannerClick} disabled={isUploading} className="absolute top-4 right-4 bg-white/70 hover:bg-white p-2 rounded-full transition-colors">
            <FaCamera className="text-gray-700" />
          </button>
        </div>
        <div className="flex items-end -mt-16 ml-8">
          <div className="relative">
            <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageChange} disabled={isUploading} />
            <img src={profileImageUrl} alt="Foto Profil" className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 object-cover" />
            <button onClick={handleProfileClick} disabled={isUploading} className="absolute bottom-2 right-2 bg-white/70 hover:bg-white p-2 rounded-full transition-colors">
              <FaCamera className="text-gray-700" />
            </button>
          </div>
          <div className="ml-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
            <p className="text-sm text-gray-600">Selamat datang kembali!</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/cart" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <FaHeart className="text-3xl text-red-500 mb-2" />
          <h3 className="text-xl font-semibold">Produk Disimpan</h3>
          <p className="text-gray-500">Lihat Keranjang Anda</p>
        </Link>
        
        <Link to="/dashboard/my-orders" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <FaBoxOpen className="text-3xl text-blue-500 mb-2" />
          <h3 className="text-xl font-semibold">Pesanan Saya</h3>
          <p className="text-gray-500">Lihat riwayat pesanan</p>
        </Link>
        
        <Link to="/dashboard/settings" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <FaUserCog className="text-3xl text-green-500 mb-2" />
          <h3 className="text-xl font-semibold">Pengaturan Akun</h3>
          <p className="text-gray-500">Kelola akun Anda</p>
        </Link>
      </div>
    </div>
  );
};

// komponen dashboard seller
const SellerDashboard = () => {
    const { user, token, updateUserContext } = useContext(AuthContext);
  
    const [profilePreview, setProfilePreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const profileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const backendUrl = 'http://localhost:3000';
  
    const profileImageUrl = profilePreview 
      ? profilePreview 
      : (user?.profilePicture ? `${backendUrl}${user.profilePicture}` : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'user'}`);
    
    const bannerImageUrl = bannerPreview
      ? bannerPreview
      : (user?.bannerPicture ? `${backendUrl}${user.bannerPicture}` : 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop');
  
    const handleImageUpload = async (file, type) => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        const endpoint = type === 'profile' ? 'profile-picture' : 'banner-picture';
        const formKey = type === 'profile' ? 'profilePicture' : 'bannerPicture';
        formData.append(formKey, file);
    
        try {
          const response = await fetch(`${backendUrl}/api/user/${endpoint}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          const data = await response.json();
          if (response.ok) {
            alert('Gambar berhasil diupdate!');
            updateUserContext(data.token);
            if (type === 'profile') setProfilePreview(null);
            if (type === 'banner') setBannerPreview(null);
          } else {
            throw new Error(data.message || 'Gagal mengupload gambar.');
          }
        } catch (error) {
          alert(`Error: ${error.message}`);
          if (type === 'profile') setProfilePreview(null);
          if (type === 'banner') setBannerPreview(null);
        } finally {
          setIsUploading(false);
        }
    };
  
    const handleProfileImageChange = (e) => {
      const file = e.target.files[0];
      if (file) { 
        setProfilePreview(URL.createObjectURL(file));
        handleImageUpload(file, 'profile');
      }
    };
  
    const handleBannerImageChange = (e) => {
      const file = e.target.files[0];
      if (file) { 
        setBannerPreview(URL.createObjectURL(file));
        handleImageUpload(file, 'banner');
      }
    };
    
    const handleProfileClick = () => profileInputRef.current.click();
    const handleBannerClick = () => bannerInputRef.current.click();
  
    return (
      <div className={`flex-1 transition-opacity ${isUploading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {isUploading && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 p-4 rounded-lg font-bold z-20">
            Mengupload...
          </div>
        )}
        <div className="relative mb-8">
          <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerImageChange} disabled={isUploading} />
          <div className="h-48 bg-cover bg-center rounded-lg shadow-md" style={{ backgroundImage: `url(${bannerImageUrl})` }}>
            <button onClick={handleBannerClick} disabled={isUploading} className="absolute top-4 right-4 bg-white/70 hover:bg-white p-2 rounded-full transition-colors">
              <FaCamera className="text-gray-700" />
            </button>
          </div>
          <div className="flex items-end -mt-16 ml-8">
            <div className="relative">
              <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageChange} disabled={isUploading} />
              <img src={profileImageUrl} alt="Foto Profil" className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 object-cover" />
              <button onClick={handleProfileClick} disabled={isUploading} className="absolute bottom-2 right-2 bg-white/70 hover:bg-white p-2 rounded-full transition-colors">
                <FaCamera className="text-gray-700" />
              </button>
            </div>
            <div className="ml-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
              <p className="text-sm text-gray-600">Mode Penjual</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
            <FaStore className="text-3xl text-blue-500 mb-2" />
            <h3 className="text-xl font-semibold">Produk Saya</h3>
            <p className="text-gray-500">0 Produk Aktif</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
            <FaShoppingCart className="text-3xl text-green-500 mb-2" />
            <h3 className="text-xl font-semibold">Pesanan Masuk</h3>
            <p className="text-gray-500">0 Pesanan Baru</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
            <FaChartLine className="text-3xl text-purple-500 mb-2" />
            <h3 className="text-xl font-semibold">Total Pendapatan</h3>
            <p className="text-gray-500">Rp 0</p>
          </div>
        </div>
      </div>
    );
};

function DashboardIndex() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <p>Memuat...</p>; 
    }

    return user.activeRole === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />;
}

export default DashboardIndex;
