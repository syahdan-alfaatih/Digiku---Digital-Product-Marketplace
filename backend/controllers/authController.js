// backend/controllers/authController.js
const { json } = require('node:stream/consumers');
const prisma = require('../lib/prisma'); // Jembatan database kita
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validasi Input Dasar
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }

    // 2. Cek apakah Email atau Username sudah dipakai
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email atau Username sudah terdaftar.' });
    }

    // 3. Enkripsi Password (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke PostgreSQL
    // PENTING: Kita pakai 'roles' (array) biar support Switch Role
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword, // Sesuai schema kamu
        roles: ['buyer'],             // Default: Punya akses Buyer
        active_role: 'buyer'          // Default: Mode aktif Buyer
      }
    });

    // 5. Kirim Respon Sukses
    res.status(201).json({
      message: 'Registrasi berhasil! Silakan login.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
        activeRole: newUser.active_role
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cek User ada atau tidak
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah!' });
    }

    // 2. Cek Password (Bandingkan input user dengan hash di DB)
    // Kita pakai user.password_hash sesuai schema kamu
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah!' });
    }

    // 3. Buat Token JWT (Kunci akses)
    // PENTING: Payload harus lengkap biar Frontend tidak 'Blank'
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,        // <--- Wajib Array (['buyer', 'seller'])
      activeRole: user.active_role, // <--- Wajib ada ('buyer' atau 'seller')
      profile_pic: user.profile_pic, // <--- Biar masuk ke token
      banner_pic: user.banner_pic
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '7d' // Token berlaku 7 hari (biar gak sering login ulang)
    });

    // 4. Kirim Respon
    res.status(200).json({
      message: 'Login berhasil!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        activeRole: user.active_role,
        profile_pic: user.profile_pic, // <--- Tambahin ini
        banner_pic: user.banner_pic
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};