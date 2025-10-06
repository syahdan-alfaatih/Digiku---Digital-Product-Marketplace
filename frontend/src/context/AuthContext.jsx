// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    setToken(tokenFromStorage);

    if (tokenFromStorage) {
      try {
        const decoded = jwtDecode(tokenFromStorage);
        // cek token
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // expired
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("Token tidak valid:", err);
        logout();
      }
    }
    setIsLoading(false);
  }, []); 

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded);
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserContext = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded);
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  };
  
  const switchRole = updateUserContext;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, switchRole, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};