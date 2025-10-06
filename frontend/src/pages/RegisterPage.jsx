import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        setError(data.message || 'Registrasi gagal, coba lagi.');
      }
    } catch (error) {
      setError('Terjadi masalah koneksi ke server.');
    }
  };

  return (
   <div 
    className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
    style={{ backgroundImage: "url('/bgfixed.jpg')" }} 
  >
      {/* kotak form */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Buat Akun Baru</h2>
        
        <form onSubmit={handleRegister}>
          {/* username */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="username"
              type="text" 
              placeholder="Masukkan username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          
          {/* email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="email"
              type="email" 
              placeholder="Masukkan email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
              id="password"
              type="password" 
              placeholder="Masukkan Password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* pesan error */}
          {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">{error}</p>}

          {/* tombol daftar */}
          <div className="flex items-center justify-between">
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Daftar
            </button>
          </div>
          
          {/* link ke login */}
          <p className="mt-6 text-center text-sm">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-blue-500 hover:text-blue-800">
              Login di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;