import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user_data'); 
    
    setToken(tokenFromStorage);

    if (tokenFromStorage) {
      try {
        const decoded = jwtDecode(tokenFromStorage);
        if (decoded.exp * 1000 < Date.now()) {
          logout(); 
        } else {
          // Prioritaskan data lengkap dari storage jika ada
          if (userFromStorage) {
            setUser(JSON.parse(userFromStorage));
          } else {
            setUser(decoded);
          }
        }
      } catch (err) {
        console.error("Token tidak valid:", err);
        logout();
      }
    }
    setIsLoading(false);
  }, []); 

  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    try {
      const decoded = jwtDecode(newToken);
      const finalUser = userData ? { ...decoded, ...userData } : decoded;
      setUser(finalUser);
      localStorage.setItem('user_data', JSON.stringify(finalUser));
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  // --- PERBAIKAN LOGIKA DISINI ---
  const updateUserContext = (newUserData, newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }

    if (newUserData) {
      // Kasus 1: Update Profil (Ada data user baru lengkap)
      setUser((prevUser) => {
        const updated = { ...prevUser, ...newUserData };
        localStorage.setItem('user_data', JSON.stringify(updated));
        return updated;
      });
    } else if (newToken) {
        // Kasus 2: Ganti Role (Cuma token yang berubah)
        // JANGAN TIMPA TOTAL! Gabungkan dengan data lama biar gambar gak hilang.
        try {
          const decoded = jwtDecode(newToken);
          setUser((prevUser) => {
            // Data lama + Data baru dari token (misal: activeRole baru)
            const updated = { ...prevUser, ...decoded };
            localStorage.setItem('user_data', JSON.stringify(updated));
            return updated;
          });
        } catch (e) {
          console.error("Gagal decode token update:", e);
        }
    }
  };
  
  const switchRole = (newToken) => updateUserContext(null, newToken);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchRole, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};