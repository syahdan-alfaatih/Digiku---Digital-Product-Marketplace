const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, 
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String], 
    enum: ['buyer', 'seller'], 
    default: ['buyer'],
  },
  activeRole: {
    type: String,
    default: 'buyer'
  },
  profilePicture: {
    type: String,
    default: '' 
  },
  bannerPicture: {
    type: String,
    default: '' 
  },
  cart: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Product' 
  }]
}, {
  timestamps: true, 
});

const User = mongoose.model('User', userSchema);

module.exports = User;