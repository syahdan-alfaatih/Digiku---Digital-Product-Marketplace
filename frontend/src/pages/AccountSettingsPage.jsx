import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function AccountSettingsPage() {
  const { user, token, switchRole } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchRole = async (newRole) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/user/switch-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        switchRole(data.token); 
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySeller = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengajukan akun menjadi seller?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/user/apply-seller', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        // switch role
        switchRole(data.token); 
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan Akun</h2>
      
      {/* ganti mode */}
      {user?.roles.includes('seller') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Mode Akun</h3>
          <p className="text-gray-600 mb-4">Saat ini Anda berada dalam mode '{user.activeRole}'.</p>
          
          {user.activeRole === 'buyer' && (
            <button
              onClick={() => handleSwitchRole('seller')}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Ganti ke Mode Penjual'}
            </button>
          )}

          {user.activeRole === 'seller' && (
            <button
              onClick={() => handleSwitchRole('buyer')}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Ganti ke Mode Pembeli'}
            </button>
          )}
        </div>
      )}

      {/* upgrade akun */}
      {user?.roles.length === 1 && user.roles.includes('buyer') && (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700">Upgrade Akun</h3>
            <p className="text-gray-600 mb-4">Ingin mulai menjual produk digitalmu sendiri? Jadilah penjual sekarang!</p>
            
            <button 
              onClick={handleApplySeller}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Ajukan Akun Jadi Seller'}
            </button>
        </div>
      )}
    </div>
  );
}

export default AccountSettingsPage;