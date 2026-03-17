const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Ensure dir exists
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
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
      const baseUrl = req.protocol + '://' + req.get('host');
      productData.imageUrl = baseUrl + '/uploads/' + req.file.filename;
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
      const baseUrl = req.protocol + '://' + req.get('host');
      productData.imageUrl = baseUrl + '/uploads/' + req.file.filename;

      // Optional: Delete old image file if it's a local upload
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.imageUrl && oldProduct.imageUrl.includes('/uploads/')) {
        const oldFileName = oldProduct.imageUrl.split('/').pop();
        const oldPath = path.join(__dirname, '../public/uploads', oldFileName);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
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
    }

    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus produk.', error: err.message });
  }
});

module.exports = router;
