const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = 3000;

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(express.json());

// --- STATIC FOLDER FOR UPLOADS ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// --- MULTER CONFIG FOR FILE UPLOADS ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {

    if (file.fieldname === 'thumbnail' || file.fieldname === 'galleryImages') {
 
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Thumbnail dan Galeri hanya boleh gambar!'), false);
      }
    } else if (file.fieldname === 'productFile') {

      const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipe file produk tidak valid! Harap upload .zip, .rar, atau .pdf'), false);
      }
    } else {

      cb(null, false);
    }
  },
});

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ berhasil terhubung ke MongoDB Atlas'))
  .catch((error) => console.log('❌ gagal konek DB:', error.message));

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.send('Hello World! Backend berjalan 🚀');
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email sudah digunakan!' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles: ['buyer'],
      activeRole: 'buyer',
    });
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Registrasi berhasil!', userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email atau password salah!' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email atau password salah!' });
    const payload = {
      id: user._id,
      username: user.username,
      roles: user.roles,
      activeRole: user.activeRole,
      profilePicture: user.profilePicture,
      bannerPicture: user.bannerPicture,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: payload,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- USER PROFILE ROUTES ---
app.put('/api/user/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { profilePicture: filePath }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User tidak ditemukan.' });
    const payload = { id: updatedUser._id, username: updatedUser.username, roles: updatedUser.roles, activeRole: updatedUser.activeRole, profilePicture: updatedUser.profilePicture, bannerPicture: updatedUser.bannerPicture };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Foto profil berhasil diupdate!', user: payload, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.put('/api/user/banner-picture', authMiddleware, upload.single('bannerPicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { bannerPicture: filePath }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User tidak ditemukan.' });
    const payload = { id: updatedUser._id, username: updatedUser.username, roles: updatedUser.roles, activeRole: updatedUser.activeRole, profilePicture: updatedUser.profilePicture, bannerPicture: updatedUser.bannerPicture };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Gambar banner berhasil diupdate!', user: payload, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.put('/api/user/apply-seller', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    if (user.roles.includes('seller')) {
      return res.status(400).json({ message: 'Anda sudah memiliki role seller.' });
    }
    user.roles.push('seller');
    await user.save();
    const payload = { id: user._id, username: user.username, roles: user.roles, activeRole: user.activeRole, profilePicture: user.profilePicture, bannerPicture: user.bannerPicture };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Pengajuan akun seller berhasil!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.put('/api/user/switch-role', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { newRole } = req.body;
    if (!['buyer', 'seller'].includes(newRole)) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    if (!user.roles.includes(newRole)) {
      return res.status(403).json({ message: `Anda belum memiliki akses sebagai ${newRole}.` });
    }
    user.activeRole = newRole;
    await user.save();
    const payload = { id: user._id, username: user.username, roles: user.roles, activeRole: user.activeRole, profilePicture: user.profilePicture, bannerPicture: user.bannerPicture };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: `Berhasil ganti role ke ${newRole}.`, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- PRODUCT ROUTES (CRUD) ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).populate('seller', 'username');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.get('/api/products/my-products', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Product.find({ seller: sellerId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'username profilePicture');
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.post('/api/products', authMiddleware, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'galleryImages', maxCount: 8 },
  { name: 'productFile', maxCount: 1 } 
]), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const sellerId = req.user.id;
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
    const galleryFiles = req.files.galleryImages || [];
    const productFile = req.files.productFile ? req.files.productFile[0] : null;

    if (!thumbnailFile || !productFile) {
      return res.status(400).json({ message: 'Gambar thumbnail wajib diupload.' });
    }
    if (req.user.activeRole !== 'seller') {
      return res.status(403).json({ message: 'Akses ditolak, hanya untuk penjual aktif.' });
    }
    const thumbnailUrl = `/uploads/${thumbnailFile.filename}`;
    const imageUrls = galleryFiles.map(file => `/uploads/${file.filename}`);
    const productFileUrl = `/uploads/${productFile.filename}`; 
    const newProduct = new Product({
      name,
      description,
      price,
      thumbnailUrl,
      imageUrls,
      productFileUrl,
      seller: sellerId
    });
    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Produk berhasil ditambahkan!', product: savedProduct });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { name, description, price, thumbnailUrl, imageUrls } = req.body;
    const sellerId = req.user.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda bukan pemilik produk ini.' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, thumbnailUrl, imageUrls },
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: 'Produk berhasil diupdate!', product: updatedProduct });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const sellerId = req.user.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda bukan pemilik produk ini.' });
    }
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- CART ROUTES ---
app.post('/api/cart/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (user.cart.includes(productId)) {
      return res.status(400).json({ message: 'Produk sudah ada di keranjang.' });
    }
    user.cart.push(productId);
    await user.save();
    res.status(200).json({ message: 'Produk berhasil ditambahkan ke keranjang.', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'cart', 
      select: 'name price thumbnailUrl seller', 
      populate: {
        path: 'seller', 
        select: 'username' 
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// DELETE 
app.delete('/api/cart/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { cart: productId } 
    });

    res.status(200).json({ message: 'Produk berhasil dihapus dari keranjang.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

app.post('/api/orders/create', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'cart',
      select: 'name price seller'
    });

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: 'Keranjang Anda kosong.' });
    }

    const newOrders = user.cart.map(item => ({
      product: item._id,
      buyer: userId,
      seller: item.seller,
      priceAtPurchase: item.price,
    }));
    
    await Order.insertMany(newOrders);
    
    user.cart = [];
    await user.save();
    
    res.status(201).json({ message: 'Pembayaran berhasil! Pesanan Anda sedang diproses.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error saat membuat pesanan.', error: error.message });
  }
});


// GET
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const orders = await Order.find({ buyer: buyerId })
      .sort({ createdAt: -1 }) 
      .populate({
        path: 'product',
        select: 'name thumbnailUrl productFileUrl' 
      })
      .populate({
        path: 'seller',
        select: 'username' 
      });
      
    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: 'Server error saat mengambil pesanan.', error: error.message });
  }
});

// --- SERVER START ---
app.listen(port, () => {
  console.log(`🚀 server berjalan di http://localhost:${port}`);
});
