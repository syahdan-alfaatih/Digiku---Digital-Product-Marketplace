// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../lib/upload'); // <--- PENTING: Panggil Multer

// Semua rute user butuh login
router.use(authMiddleware);

// 1. Rute Update Profil (Foto & Background)
router.put('/update', 
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 }
  ]), 
  userController.updateProfile
);

router.put('/apply-seller', userController.applySeller);
router.put('/switch-role', userController.switchRole);

module.exports = router;