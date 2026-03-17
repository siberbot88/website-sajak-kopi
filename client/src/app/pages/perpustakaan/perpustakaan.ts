import { Component } from '@angular/core';

@Component({
  selector: 'app-perpustakaan',
  imports: [],
  templateUrl: './perpustakaan.html',
  styleUrl: './perpustakaan.css'
})
export class Perpustakaan {
  books = [
    { title: 'Pulang', author: 'Tere Liye', cover: 'https://placehold.co/300x420/4A3B2C/F5F0E8?text=Pulang', quote: 'Kadang kita harus pergi jauh untuk memahami arti pulang.' },
    { title: 'Filosofi Teras', author: 'Henry Manampiring', cover: 'https://placehold.co/300x420/8B5A2B/F5F0E8?text=Filosofi+Teras', quote: 'Kebahagiaan bukan soal mendapatkan apa yang kita mau, tapi menerima apa yang kita punya.' },
    { title: 'Laut Bercerita', author: 'Leila S. Chudori', cover: 'https://placehold.co/300x420/6B8E5A/F5F0E8?text=Laut+Bercerita', quote: 'Laut tidak pernah berhenti bercerita, meski tak ada yang mendengarnya.' },
    { title: 'Bumi Manusia', author: 'Pramoedya A. Toer', cover: 'https://placehold.co/300x420/5C3A1E/F5F0E8?text=Bumi+Manusia', quote: 'Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran.' },
    { title: 'Sapiens', author: 'Yuval N. Harari', cover: 'https://placehold.co/300x420/7A5C3E/F5F0E8?text=Sapiens', quote: 'Cerita yang kita percaya bersama-lah yang menyatukan kita.' },
    { title: 'Catatan Pinggir', author: 'Goenawan Mohamad', cover: 'https://placehold.co/300x420/A0764A/F5F0E8?text=Catatan+Pinggir', quote: 'Menulis adalah tindakan keberanian untuk menghadapi kesunyian.' },
    { title: 'Perahu Kertas', author: 'Dee Lestari', cover: 'https://placehold.co/300x420/D9C5B3/4A3B2C?text=Perahu+Kertas', quote: 'Hidup ini tentang perjalanan, bukan tujuan akhir.' },
    { title: 'Laskar Pelangi', author: 'Andrea Hirata', cover: 'https://placehold.co/300x420/8BA87A/4A3B2C?text=Laskar+Pelangi', quote: 'Mimpi adalah kunci. Bermimpilah, karena Tuhan akan memeluk mimpi-mimpi itu.' },
  ];

  quotes = [
    { text: 'Membaca adalah bepergian tanpa harus membeli tiket.', source: 'Anonim' },
    { text: 'Sebuah ruangan tanpa buku ibarat raga tanpa jiwa.', source: 'Cicero' },
    { text: 'Buku adalah cermin. Jika seekor keledai yang melihat, jangan berharap yang terpantul seorang nabi.', source: 'Peribahasa Spanyol' },
    { text: 'Kopi dan buku: dua hal yang mengajarkan kita untuk duduk lebih lama dan berpikir lebih dalam.', source: 'Sajak Kopi' },
  ];
}
