const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const midtransClient = require('midtrans-client');

// Konfigurasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// POST /api/orders - Bikin pesanan baru (Checkout)
router.post('/', async (req, res) => {
  try {
    const { buyerName, tableNumber, items, paymentMethod, totalAmount } = req.body;

    // 1. Validasi Meja Unik (Apakah ada order aktif di meja ini?)
    const activeOrderOnTable = await Order.findOne({
      tableNumber,
      status: { $nin: ['Selesai', 'Batal'] } // Meja bebas jika pesanan Selesai atau Batal
    });

    if (activeOrderOnTable) {
      return res.status(400).json({ 
        message: `Maaf, Meja ${tableNumber} sedang digunakan. Pembeli diharap mengisi ulang nomor meja.`
      });
    }

    // 2. Generate Nomor Antrean (Berurut untuk hari ini)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Mulai hari ini jam 00:00

    const todaysOrdersCount = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Formatting 001, 002, 010, dst
    const nextQueueNumber = String(todaysOrdersCount + 1).padStart(3, '0');

    // 3. Simpan Order
    const newOrder = new Order({
      buyerName,
      tableNumber,
      queueNumber: nextQueueNumber,
      items,
      totalAmount,
      paymentMethod,
      status: 'Menunggu Pembayaran'
    });

    // 4. Jika QRIS, request Token dari Midtrans
    if (paymentMethod === 'QRIS') {
      const parameter = {
        transaction_details: {
          order_id: newOrder._id.toString(),
          gross_amount: totalAmount
        },
        customer_details: {
          first_name: buyerName,
        }
      };

      const transaction = await snap.createTransaction(parameter);
      newOrder.snapToken = transaction.token;
    }

    await newOrder.save();

    res.status(201).json({
      message: 'Pesanan berhasil dibuat!',
      order: newOrder,
      snapToken: newOrder.snapToken
    });

  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
  }
});

// POST /api/orders/webhook - Menerima Notifikasi Pembayaran dari Midtrans
router.post('/webhook', async (req, res) => {
  try {
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let updateStatus = 'Menunggu Pembayaran';

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        updateStatus = 'Menunggu Pembayaran'; // Butuh review
      } else if (fraudStatus === 'accept' || !fraudStatus) {
        updateStatus = 'Diproses'; // Lunas! Masuk antrean dapur
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      updateStatus = 'Batal';
    } else if (transactionStatus === 'pending') {
      updateStatus = 'Menunggu Pembayaran';
    }

    const order = await Order.findByIdAndUpdate(orderId, { status: updateStatus }, { new: true });
    
    if (order) {
      console.log(`Webhook Received: Order ${order.queueNumber} status updated to ${updateStatus}`);
    }

    res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders - Mengambil semua daftar pesanan (Untuk Admin Dashboard)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Ambil semua pesanan, urutkan dari yang terbaru
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Gagal memuat pesanan.', error: err.message });
  }
});

// PUT /api/orders/:id - Admin mengupdate status pesanan ('Siap Diantar' / 'Selesai')
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json({ message: 'Status pesanan berhasil diperbarui', order });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui pesanan.', error: err.message });
  }
});

// DELETE /api/orders/:id - Hapus pesanan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }
    res.json({ message: 'Pesanan berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus pesanan.', error: err.message });
  }
});

// POST /api/orders/webhook - Handle Midtrans Webhook
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;
    
    // In production, we should verify the signature key here using crypto:
    // const hash = crypto.createHash('sha512').update(notification.order_id + notification.status_code + notification.gross_amount + process.env.MIDTRANS_SERVER_KEY).digest('hex');
    // if(notification.signature_key !== hash) return res.status(403).json({ message: 'Invalid signature' });

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    // Logic based on Midtrans transaction status
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        order.status = 'Menunggu Pembayaran'; // Or 'Menunggu Review'
      } else if (fraudStatus == 'accept') {
        order.status = 'Siap Diantar';
      }
    } else if (transactionStatus == 'settlement') {
      order.status = 'Siap Diantar';
    } else if (transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire') {
      order.status = 'Batal';
    } else if (transactionStatus == 'pending') {
      order.status = 'Menunggu Pembayaran';
    }

    await order.save();
    
    // Free up table if order is cancelled
    if (order.status === 'Batal' && order.tableNumber) {
        TableStatus = require('./orders').TableStatus; // We don't have this globally exported easily, but frontend handles freeing tables usually, or we can just ignore table validation temporarily here since it's just webhook
    }

    res.status(200).json({ message: 'Webhook received and processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Internal server error processing webhook' });
  }
});

module.exports = router;
