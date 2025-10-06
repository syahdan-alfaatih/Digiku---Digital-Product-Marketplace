// ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useContext(AuthContext); 
  const location = useLocation();

  // context masih dalam proses loading, tampilkan pesan loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export default ProtectedRoute;