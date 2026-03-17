const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sajakkopi';

const products = [
  // ===================== MINUMAN - KOPI =====================
  {
    name: 'Espresso Klasik',
    category: 'Minuman',
    description: 'Tegukan pahit yang membangunkan jiwa — murni, tegas, dan tanpa basa-basi.',
    price: 12000,
    imageUrl: 'https://placehold.co/600x400/4A3B2C/F5F0E8?text=Espresso'
  },
  {
    name: 'Americano Dingin',
    category: 'Minuman',
    description: 'Kesederhanaan yang menyegarkan. Seperti kalimat pendek yang langsung mengena.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/5C3A1E/F5F0E8?text=Americano'
  },
  {
    name: 'Kopi Pahit Kenangan',
    category: 'Minuman',
    description: 'Tegukan pertama membawa pulang memori lama. Espresso yang menghidupkan percakapan sunyi.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/8B5A2B/F5F0E8?text=Kopi+Pahit'
  },
  {
    name: 'Cappuccino Sajak',
    category: 'Minuman',
    description: 'Busa lembut di atas kopi kuat — seperti kata-kata halus yang menyimpan makna besar.',
    price: 22000,
    imageUrl: 'https://placehold.co/600x400/7A5C3E/F5F0E8?text=Cappuccino'
  },
  {
    name: 'Cafe Latte Hangat',
    category: 'Minuman',
    description: 'Susu dan kopi berdansa pelan. Lembut mengalir seperti prosa di sore hari.',
    price: 23000,
    imageUrl: 'https://placehold.co/600x400/A0764A/F5F0E8?text=Cafe+Latte'
  },
  {
    name: 'Kopi Susu Kayu Manis',
    category: 'Minuman',
    description: 'Hangat seperti pelukan lama. Perpaduan susu lembut dan kayu manis yang membungkus sore hari.',
    price: 22000,
    imageUrl: 'https://placehold.co/600x400/8B6F47/F5F0E8?text=Kopi+Susu+Kayu+Manis'
  },
  {
    name: 'Flat White Perpustakaan',
    category: 'Minuman',
    description: 'Mulus, kuat, tanpa drama — seperti buku bagus yang tidak perlu sinopsis panjang.',
    price: 25000,
    imageUrl: 'https://placehold.co/600x400/6B4E2E/F5F0E8?text=Flat+White'
  },
  {
    name: 'Es Kopi Sajak',
    category: 'Minuman',
    description: 'Dinginnya menyegarkan, manisnya pas — seperti menemukan kata yang tepat untuk perasaan yang rumit.',
    price: 24000,
    imageUrl: 'https://placehold.co/600x400/7A5C3E/F5F0E8?text=Es+Kopi+Sajak'
  },
  {
    name: 'Hazelnut Coffee Latte',
    category: 'Minuman',
    description: 'Aroma hazelnut berpadu dengan kopi — seperti dua kalimat yang saling melengkapi.',
    price: 24000,
    imageUrl: 'https://placehold.co/600x400/8B6914/F5F0E8?text=Hazelnut+Latte'
  },
  {
    name: 'Vanilla Coffee Latte',
    category: 'Minuman',
    description: 'Manis vanilla yang menenangkan, bersanding dengan kopi yang membumi.',
    price: 24000,
    imageUrl: 'https://placehold.co/600x400/9B7B4E/F5F0E8?text=Vanilla+Latte'
  },
  {
    name: 'Baileys Coffee Latte',
    category: 'Minuman',
    description: 'Sentuhan premium yang memanjakan — kopi dengan kelembutan krim yang tak terlupakan.',
    price: 25000,
    imageUrl: 'https://placehold.co/600x400/5C4033/F5F0E8?text=Baileys+Latte'
  },

  // ===================== MINUMAN - NON-KOPI =====================
  {
    name: 'Teh Puisi Melati',
    category: 'Minuman',
    description: 'Seperti membaca sajak pendek di pagi hari — ringan, harum, dan menyisakan ketenangan.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/6B8E5A/F5F0E8?text=Teh+Melati'
  },
  {
    name: 'Cokelat Hangat Peraduan',
    category: 'Minuman',
    description: 'Minuman yang menyimpan cerita-cerita lama dalam kehangatannya. Cocok untuk malam yang butuh teman diam.',
    price: 25000,
    imageUrl: 'https://placehold.co/600x400/3E2723/F5F0E8?text=Cokelat+Hangat'
  },
  {
    name: 'Lemon Tea Segar',
    category: 'Minuman',
    description: 'Asam segar yang membersihkan pikiran — seperti angin pagi yang meniup kabut.',
    price: 13000,
    imageUrl: 'https://placehold.co/600x400/C5A900/4A3B2C?text=Lemon+Tea'
  },
  {
    name: 'Honey Lemon',
    category: 'Minuman',
    description: 'Perpaduan madu dan lemon yang jujur — manis dan asam, seperti hidup itu sendiri.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/DAA520/4A3B2C?text=Honey+Lemon'
  },
  {
    name: 'Brown Sugar Milktea',
    category: 'Minuman',
    description: 'Gula aren yang karamel bertemu teh susu lembut — nostalgia dalam satu tegukan.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/8B4513/F5F0E8?text=Brown+Sugar+Milktea'
  },
  {
    name: 'Matcha Latte',
    category: 'Minuman',
    description: 'Hijau yang menenangkan, earthy dan lembut — seperti duduk di taman Jepang saat hujan.',
    price: 22000,
    imageUrl: 'https://placehold.co/600x400/556B2F/F5F0E8?text=Matcha+Latte'
  },

  // ===================== MAKANAN =====================
  {
    name: 'Nasi Goreng Kampung Halaman',
    category: 'Makanan',
    description: 'Sepiring nostalgia dari dapur ibu. Sederhana tapi penuh cerita, dengan bumbu yang memeluk rindu.',
    price: 28000,
    imageUrl: 'https://placehold.co/600x400/D9C5B3/4A3B2C?text=Nasi+Goreng'
  },
  {
    name: 'Roti Bakar Mentega Sajak',
    category: 'Makanan',
    description: 'Hangat, renyah, dan jujur. Seperti percakapan pagi yang tidak perlu banyak kata tapi bermakna.',
    price: 20000,
    imageUrl: 'https://placehold.co/600x400/C4A882/4A3B2C?text=Roti+Bakar'
  },
  {
    name: 'Indomie Puisi Malam',
    category: 'Makanan',
    description: 'Karena ada hal-hal sederhana yang justru paling menyelamatkan. Disajikan dengan telur dan cinta.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/BFA77A/4A3B2C?text=Indomie+Sajak'
  },
  {
    name: 'Sandwich Senja',
    category: 'Makanan',
    description: 'Dua lembar roti yang memeluk isi dengan erat. Seperti senja yang memeluk hari sebelum ia pergi.',
    price: 25000,
    imageUrl: 'https://placehold.co/600x400/D4B896/4A3B2C?text=Sandwich+Senja'
  },
  {
    name: 'Mie Goreng Cerita Rakyat',
    category: 'Makanan',
    description: 'Bumbu yang kaya dan mie yang kenyal — seperti cerita rakyat yang selalu punya lapisan makna.',
    price: 20000,
    imageUrl: 'https://placehold.co/600x400/C8A96E/4A3B2C?text=Mie+Goreng'
  },
  {
    name: 'Mie Ayam Bait Pendek',
    category: 'Makanan',
    description: 'Sederhana, utuh, dan selalu dirindukan. Semangkuk mie ayam yang tidak pernah mengecewakan.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/B8976A/4A3B2C?text=Mie+Ayam'
  },
  {
    name: 'Bihun Goreng Pagi',
    category: 'Makanan',
    description: 'Ringan dan gurih, seperti sketsa pagi yang belum selesai tapi sudah terasa indah.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/D4C4A8/4A3B2C?text=Bihun+Goreng'
  },
  {
    name: 'Sate Ayam Sepuluh Bait',
    category: 'Makanan',
    description: 'Sepuluh tusuk kebahagiaan. Bumbu kacang yang memeluk ayam panggang sempurna.',
    price: 30000,
    imageUrl: 'https://placehold.co/600x400/B8860B/4A3B2C?text=Sate+Ayam'
  },
  {
    name: 'Ayam Bakar Halaman Belakang',
    category: 'Makanan',
    description: 'Arang dan rempah bercerita bersama. Ayam bakar yang membawa ingatan ke halaman rumah masa kecil.',
    price: 30000,
    imageUrl: 'https://placehold.co/600x400/A0522D/F5F0E8?text=Ayam+Bakar'
  },

  // ===================== CEMILAN =====================
  {
    name: 'Pisang Goreng Renyah',
    category: 'Cemilan',
    description: 'Camilan pendek dengan aksen gurih. Satu gigitan, dan kamu tahu sore ini akan baik-baik saja.',
    price: 12000,
    imageUrl: 'https://placehold.co/600x400/6B8E5A/F5F0E8?text=Pisgor+Renyah'
  },
  {
    name: 'Kentang Goreng Sudut Rak',
    category: 'Cemilan',
    description: 'Garing di luar, lembut di dalam — seperti orang-orang yang diam-diam punya kisah yang dalam.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/7A9A5C/F5F0E8?text=Kentang+Goreng'
  },
  {
    name: 'Dimsum Bisikan',
    category: 'Cemilan',
    description: 'Kecil, hangat, dan penuh rasa — seperti bisikan yang menghangatkan ketika dunia terlalu berisik.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/5A7A4A/F5F0E8?text=Dimsum+Bisikan'
  },
  {
    name: 'Tahu Crispy Perenungan',
    category: 'Cemilan',
    description: 'Renyah di setiap gigitan, menemani pikiran yang sedang berkelana jauh.',
    price: 10000,
    imageUrl: 'https://placehold.co/600x400/8BA87A/F5F0E8?text=Tahu+Crispy'
  },
  {
    name: 'Cireng Gurih Kata',
    category: 'Cemilan',
    description: 'Kenyal dan gurih, cocok untuk menemani obrolan panjang yang tak ingin berakhir.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/6B8040/F5F0E8?text=Cireng'
  },
  {
    name: 'Jamur Krispi Refleksi',
    category: 'Cemilan',
    description: 'Renyah dan earthy — seperti berjalan di hutan pagi, menemukan keindahan di hal kecil.',
    price: 15000,
    imageUrl: 'https://placehold.co/600x400/4A6A3A/F5F0E8?text=Jamur+Krispi'
  },
  {
    name: 'Wonton Goreng Chili Oil',
    category: 'Cemilan',
    description: 'Renyah dengan sentuhan pedas — seperti plot twist dalam cerita yang sudah kamu kira biasa saja.',
    price: 18000,
    imageUrl: 'https://placehold.co/600x400/8B4513/F5F0E8?text=Wonton+Goreng'
  },
  {
    name: 'Fruit Salad Segar',
    category: 'Cemilan',
    description: 'Warna-warni buah segar yang menyejukkan — seperti halaman penuh ilustrasi di buku anak-anak.',
    price: 20000,
    imageUrl: 'https://placehold.co/600x400/228B22/F5F0E8?text=Fruit+Salad'
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Terhubung ke MongoDB');

    await Product.deleteMany({});
    console.log('Koleksi products dibersihkan');

    await Product.insertMany(products);
    console.log(`${products.length} produk berhasil ditambahkan`);

    // Summary
    const minuman = products.filter(p => p.category === 'Minuman').length;
    const makanan = products.filter(p => p.category === 'Makanan').length;
    const cemilan = products.filter(p => p.category === 'Cemilan').length;
    console.log(`  - Minuman: ${minuman}`);
    console.log(`  - Makanan: ${makanan}`);
    console.log(`  - Cemilan: ${cemilan}`);

    await mongoose.connection.close();
    console.log('Seeding selesai.');
    process.exit(0);
  } catch (err) {
    console.error('Gagal melakukan seeding:', err.message);
    process.exit(1);
  }
}

seedDatabase();
