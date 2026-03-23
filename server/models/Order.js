const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerName: {
    type: String,
    required: [true, 'Nama pembeli harus diisi']
  },
  tableNumber: {
    type: Number,
    required: [true, 'Nomor meja harus diisi']
  },
  queueNumber: {
    type: String, // Misal: "001"
    required: true
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Kasir', 'QRIS'],
    required: true
  },
  status: {
    type: String,
    enum: ['Menunggu Pembayaran', 'Diproses', 'Siap Diantar', 'Selesai', 'Batal'],
    default: 'Diproses' // Asumsi: Kalo Kasir/QRIS dummy, langsung masuk antrean pemrosesan
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
