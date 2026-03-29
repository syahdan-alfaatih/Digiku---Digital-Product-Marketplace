// backend/controllers/cartController.js
const prisma = require('../lib/prisma');

// 1. TAMBAH KE KERANJANG
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body; // ID Produk yang mau dibeli
    const userId = req.user.id;     // ID User yang lagi login

    // Cek: Apakah produk ini sudah ada di keranjang dia?
    // Produk digital biasanya cuma butuh 1 copy, jadi kita cegah duplikat.
    const existingItem = await prisma.cart.findFirst({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Produk sudah ada di keranjang kamu!' });
    }

    // Kalau belum ada, simpan!
    const newItem = await prisma.cart.create({
      data: {
        user_id: userId,
        product_id: productId
      }
    });

    res.status(201).json({ message: 'Berhasil masuk keranjang!', item: newItem });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan ke keranjang.', error: error.message });
  }
};

// 2. LIHAT ISI KERANJANG
exports.getMyCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cart.findMany({
      where: { user_id: userId },
      include: {
        product: { // Kita "joinkan" biar dapet Nama, Harga, & Gambar Produk
          select: {
            id: true,
            name: true,
            price: true,
            thumbnail_url: true,
            seller: {
              select: { username: true } // Biar tau ini lapak siapa
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(cartItems);

  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data keranjang.', error: error.message });
  }
};

// 3. HAPUS DARI KERANJANG
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // Ini ID CART-nya ya, bukan ID Produk

    await prisma.cart.delete({
      where: { id: id }
    });

    res.status(200).json({ message: 'Produk dihapus dari keranjang.' });

  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus item.', error: error.message });
  }
};