// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Wajib Login

router.post('/', orderController.createOrder); // Checkout
router.get('/', orderController.getMyOrders);  // Lihat History

module.exports = router;