// backend/controllers/userController.js
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate token baru (dipakai setelah upgrade role)
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      roles: user.roles,
      activeRole: user.active_role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. UPGRADE JADI SELLER
exports.applySeller = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cek user sekarang
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Kalau sudah jadi seller, jangan upgrade lagi
    if (user.roles.includes('seller')) {
      return res.status(400).json({ message: 'Anda sudah menjadi Seller!' });
    }

    // Update Role: Tambahkan 'seller' ke array roles
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: [...user.roles, 'seller'], // Tambah 'seller'
        active_role: 'seller' // Langsung aktifkan mode seller
      }
    });

    // Buat token baru yang isinya sudah ada role 'seller'
    const newToken = generateToken(updatedUser);

    res.status(200).json({ 
      message: 'Selamat! Akun Anda berhasil diupgrade menjadi Seller.', 
      token: newToken 
    });

  } catch (error) {
    res.status(500).json({ message: 'Gagal upgrade akun.', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;
    const files = req.files || {}; 

    // A. Cek User Lama
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    // B. Siapkan Data Update
    let updateData = {
      username: username || user.username, 
      email: email || user.email
    };

    // C. Cek Upload Foto Profil
    if (files.profilePicture) {
      // PERBAIKAN: Ubah 'profile_picture' jadi 'profile_pic' (sesuai schema)
      updateData.profile_pic = `/uploads/${files.profilePicture[0].filename}`;
    }

    // D. Cek Upload Background
    if (files.backgroundImage) {
      // PERBAIKAN: Ubah 'background_image' jadi 'banner_pic' (sesuai schema)
      updateData.banner_pic = `/uploads/${files.backgroundImage[0].filename}`;
    }

    // E. Simpan ke Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // F. Update Token
    const newToken = generateToken(updatedUser);

    res.status(200).json({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
      token: newToken
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: 'Gagal update profil.', error: error.message });
  }
};

// 2. GANTI MODE (Buyer <-> Seller)
exports.switchRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newRole } = req.body; // 'buyer' atau 'seller'

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Validasi: User harus punya role yang diminta
    if (!user.roles.includes(newRole)) {
      return res.status(403).json({ message: `Anda tidak memiliki akses sebagai ${newRole}` });
    }

    // Update active_role di database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active_role: newRole }
    });

    // Buat token baru dengan active_role yang baru
    const newToken = generateToken(updatedUser);

    res.status(200).json({ 
      message: `Berhasil berganti ke mode ${newRole}`, 
      token: newToken 
    });

  } catch (error) {
    res.status(500).json({ message: 'Gagal ganti mode.', error: error.message });
  }
};
