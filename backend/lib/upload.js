// backend/lib/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Atur Penyimpanan (Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Simpan di folder 'backend/uploads'
  },
  filename: (req, file, cb) => {
    // Format nama file: USERID-TIMESTAMP-NAMAASLI
    // Contoh: user123-172345678-buku.pdf
    // Biar gak bentrok kalau ada nama file yang sama
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Kita pakai user ID di nama file (ambil dari req.user nanti)
    // Kalau belum login (req.user kosong), pakai 'guest'
    const userId = req.user ? req.user.id : 'guest'; 
    cb(null, `${userId}-${uniqueSuffix}${ext}`);
  }
});

// 3. Filter File (Keamanan)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    // Kalau Thumbnail wajib gambar
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File thumbnail harus berupa gambar!'), false);
    }
  } else if (file.fieldname === 'productFile') {
    // Kalau Produk Digital, boleh PDF, ZIP, RAR
    const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File produk harus PDF, ZIP, atau RAR!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Maksimal 50MB
});

module.exports = upload;