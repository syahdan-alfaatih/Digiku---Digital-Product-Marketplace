// backend/controllers/productController.js
const prisma = require('../lib/prisma');

exports.createProduct = async (req, res) => {
  try {
    // 1. Ambil data text dari body
    // Ingat: kalau pakai form-data, angka itu dikirim sebagai string, jadi harus di-convert (parseFloat)
    const { name, description, price } = req.body;
    
    // 2. Ambil data file dari Multer
    // Kita pakai upload.fields, jadi req.files bentuknya object
    const files = req.files;

    if (!files || !files.thumbnail || !files.productFile) {
      return res.status(400).json({ message: 'Thumbnail dan File Produk wajib diupload!' });
    }

    const thumbnailPath = `/uploads/${files.thumbnail[0].filename}`;
    const productFilePath = `/uploads/${files.productFile[0].filename}`;

    // 3. Simpan ke Database Prisma
    const newProduct = await prisma.product.create({
      data: {
        name: name,
        description: description,
        price: parseFloat(price), // Convert string ke angka
        thumbnail_url: thumbnailPath,
        file_path: productFilePath,
        seller_id: req.user.id // ID user diambil dari Token (AuthMiddleware)
      }
    });

    res.status(201).json({
      message: 'Produk berhasil diupload!',
      product: newProduct
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Gagal upload produk.', error: error.message });
  }
};

// ... kode createProduct yang tadi di atas ...

// 2. AMBIL SEMUA PRODUK (Untuk Halaman Depan)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true }, // Cuma tampilkan yang aktif
      include: {
        seller: { // Kita "joinkan" dengan tabel User biar tahu siapa penjualnya
          select: { username: true, email: true } 
        }
      },
      orderBy: { created_at: 'desc' } // Urutkan dari yang terbaru
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data produk.', error: error.message });
  }
};

// 3. AMBIL DETAIL PRODUK (Untuk Halaman Detail)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        seller: {
          select: { username: true, email: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan!' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id; // Diambil dari Token Login

    const products = await prisma.product.findMany({
      where: { seller_id: sellerId },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil produk Anda.', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const sellerId = req.user.id;

    // A. Cek dulu: Produknya ada gak? Punya dia bukan?
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan!' });
    }

    if (product.seller_id !== sellerId) {
      return res.status(403).json({ message: 'Akses ditolak! Ini bukan produk Anda.' });
    }

    // B. Lakukan Update
    // (Kita belum handle update file/gambar dulu ya biar simpel, fokus ke data teks)
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name: name || product.name, // Kalau kosong, pakai data lama
        description: description || product.description,
        price: price ? parseFloat(price) : product.price
      }
    });

    res.status(200).json({ message: 'Produk berhasil diupdate!', product: updatedProduct });

  } catch (error) {
    res.status(500).json({ message: 'Gagal update produk.', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    // A. Cek Validasi Kepemilikan
    const product = await prisma.product.findUnique({ where: { id: id } });

    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan!' });
    if (product.seller_id !== sellerId) return res.status(403).json({ message: 'Bukan milik Anda!' });

    // B. SOFT DELETE (Update status jadi tidak aktif)
    // Kita tidak pakai prisma.product.delete() karena akan error jika barang sudah pernah dibeli.
    await prisma.product.update({
      where: { id: id },
      data: { is_active: false } 
    });

    res.status(200).json({ message: 'Produk berhasil dihapus (disembunyikan dari toko).' });

  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus produk.', error: error.message });
  }
};