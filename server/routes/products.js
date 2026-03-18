const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sajakkopi',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan!'));
    }
  }
});

// GET /api/products — semua produk, opsional filter ?category=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
  }
});

// GET /api/products/:id — detail satu produk
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
  }
});

// POST /api/products — tambah produk baru (butuh auth)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };
    // If request contains a file, construct the imageUrl
    if (req.file) {
      productData.imageUrl = req.file.path; // Cloudinary URL
    }
    
    // Convert price string to number if needed (from form-data)
    if (productData.price) productData.price = Number(productData.price);

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Gagal menambah produk.', error: err.message });
  }
});

// PUT /api/products/:id — update produk (butuh auth)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // If request contains a new file, update imageUrl and delete old
    if (req.file) {
      productData.imageUrl = req.file.path; // Cloudinary URL

      // Optional: Delete old image file if it's a local upload
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.imageUrl && oldProduct.imageUrl.includes('/uploads/')) {
        const oldFileName = oldProduct.imageUrl.split('/').pop();
        const oldPath = path.join(__dirname, '../public/uploads', oldFileName);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } else if (oldProduct && oldProduct.imageUrl && oldProduct.imageUrl.includes('cloudinary')) {
        const publicId = oldProduct.imageUrl.split('/').pop().split('.')[0];
        try { await cloudinary.uploader.destroy(`sajakkopi/${publicId}`); } catch(e) {}
      }
    }

    // Convert price string to number if needed
    if (productData.price) productData.price = Number(productData.price);

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Gagal mengupdate produk.', error: err.message });
  }
});

// DELETE /api/products/:id — hapus produk (butuh auth)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    
    // Cleanup local uploaded image
    if (product.imageUrl && product.imageUrl.includes('/uploads/')) {
      const fileName = product.imageUrl.split('/').pop();
      const filePath = path.join(__dirname, '../public/uploads', fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else if (product.imageUrl && product.imageUrl.includes('cloudinary')) {
      const publicId = product.imageUrl.split('/').pop().split('.')[0];
      try { await cloudinary.uploader.destroy(`sajakkopi/${publicId}`); } catch(e) {}
    }

    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus produk.', error: err.message });
  }
});

module.exports = router;
