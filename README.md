# Sajak Kopi — Website Kedai Kopi Sastra

> *"Menyeduh Kata dalam Secangkir Rasa"*

Website katalog informatif untuk kedai kopi **Sajak Kopi**, dibangun dengan **MEAN Stack** (MongoDB, Express, Angular, Node.js). Tidak ada fitur transaksi — hanya cerita, menu, dan kehangatan.

---

## Struktur Proyek

```
web/
├── server/          # Backend (Node.js + Express + MongoDB)
│   ├── models/      # Mongoose schemas
│   ├── routes/      # REST API endpoints
│   ├── seed/        # Database seeder
│   ├── server.js    # Entry point
│   └── .env         # Environment variables
├── client/          # Frontend (Angular)
│   └── src/
│       ├── app/
│       │   ├── components/   # Navbar, Footer
│       │   ├── pages/        # Beranda, Produk, Tentang, Perpustakaan
│       │   └── services/     # ProductService (HTTP)
│       ├── index.html
│       └── styles.css        # Global design system
└── README.md
```

---

## Prasyarat

- **Node.js** v18+
- **MongoDB** (lokal atau Atlas)
- **Angular CLI** (otomatis melalui npx)

---

## Instalasi & Menjalankan

### 1. Backend

```bash
cd server
npm install
```

**Jalankan seeder** (pastikan MongoDB berjalan):

```bash
npm run seed
```

**Jalankan server:**

```bash
npm start
```

Server berjalan di `http://localhost:3000`

### 2. Frontend

```bash
cd client
npm install
ng serve
```

Buka `http://localhost:4200` di browser.

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/products` | Semua produk |
| GET | `/api/products?category=Minuman` | Filter berdasar kategori |
| GET | `/api/products/:id` | Detail produk |

---

## Halaman

1. **Beranda** — Hero section, filosofi kedai, kutipan pendiri
2. **Produk** — Katalog menu dengan filter kategori (Minuman, Makanan, Cemilan)
3. **Tentang** — Cerita pendiri, nilai-nilai, galeri suasana
4. **Perpustakaan** — Koleksi buku pilihan dan kutipan inspiratif

---

## Teknologi

- **Frontend:** Angular 19 (standalone components, lazy loading, signals)
- **Backend:** Express.js 4
- **Database:** MongoDB + Mongoose 8
- **Font:** Ovo (heading) + Inter (body)
- **Ikon:** Heroicons (outline SVG)
- **Warna:** Earthy palette (#F5F0E8, #D9C5B3, #8B5A2B, #4A3B2C)
