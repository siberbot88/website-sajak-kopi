const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Minuman', 'Makanan', 'Cemilan']
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  imageUrl: {
    type: String,
    default: 'https://placehold.co/600x400/D9C5B3/4A3B2C'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
