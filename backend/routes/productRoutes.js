const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../lib/upload');

// --- RUTE PUBLIC ---
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// --- RUTE PRIVATE ---
router.post('/', 
  authMiddleware, 
  // PERBAIKAN: Tambahkan 'galleryImages' ke daftar upload
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'productFile', maxCount: 1 },
    { name: 'galleryImages', maxCount: 8 } // <-- TAMBAH INI
  ]), 
  productController.createProduct
);

router.get('/seller/me', authMiddleware, productController.getMyProducts); 
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;