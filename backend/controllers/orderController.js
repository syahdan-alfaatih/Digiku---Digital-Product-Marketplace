// backend/controllers/orderController.js
const prisma = require('../lib/prisma');

// 1. CHECKOUT (Ubah Keranjang jadi Order)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // A. Ambil semua barang di keranjang user ini
    const cartItems = await prisma.cart.findMany({
      where: { user_id: userId },
      include: { product: true } // Kita butuh data harga produk
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Keranjang kamu kosong!' });
    }

    // B. Hitung Total Belanja
    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.product.price;
    }, 0);

    // C. TRANSAKSI DATABASE (Semua harus sukses, atau batal semua)
    const result = await prisma.$transaction(async (prisma) => {
      
      // C-1. Buat Data Order Baru
      const newOrder = await prisma.order.create({
        data: {
          buyer_id: userId,
          total_price: totalPrice,
          status: 'Pending', // Status awal
          items: {
            create: cartItems.map(item => ({
              product_id: item.product_id,
              price: item.product.price // Simpan harga saat beli (histori)
            }))
          }
        },
        include: { items: true } // Biar kita bisa lihat item yang baru dibuat
      });

      // C-2. Kosongkan Keranjang User
      await prisma.cart.deleteMany({
        where: { user_id: userId }
      });

      return newOrder;
    });

    res.status(201).json({ 
      message: 'Order berhasil dibuat!', 
      order: result 
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: 'Gagal membuat pesanan.', error: error.message });
  }
};

// 2. RIWAYAT PESANAN (History)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { buyer_id: userId },
      include: {
        items: {
          include: {
            product: {
              // PERBAIKAN DI SINI:
              // Kita minta data yang LENGKAP (termasuk file_path dan seller)
              select: { 
                name: true, 
                thumbnail_url: true, 
                file_path: true, // <--- INI KUNCINYA! Biar tombol download muncul
                seller: {        // <--- Tambahan biar nama penjual muncul (bukan cuma 'Penjual')
                  select: { username: true }
                }
              } 
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat pesanan.', error: error.message });
  }
};