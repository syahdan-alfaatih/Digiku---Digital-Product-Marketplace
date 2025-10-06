const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'URL gambar thumbnail wajib diisi.'],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    productFileUrl: {
      type: String,
      required: [true, 'File produk digital wajib diupload.'],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
