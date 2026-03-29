// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua rute di sini butuh LOGIN (authMiddleware)
router.use(authMiddleware);

router.post('/', cartController.addToCart);       // Tambah item
router.get('/', cartController.getMyCart);        // Lihat keranjang
router.delete('/:id', cartController.removeFromCart); // Hapus item

module.exports = router;