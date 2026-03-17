import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/beranda/beranda').then(m => m.Beranda),
    title: 'Sajak Kopi — Menyeduh Kata dalam Secangkir Rasa'
  },
  {
    path: 'produk',
    loadComponent: () => import('./pages/produk/produk').then(m => m.Produk),
    title: 'Produk — Sajak Kopi'
  },
  {
    path: 'tentang',
    loadComponent: () => import('./pages/tentang/tentang').then(m => m.Tentang),
    title: 'Tentang — Sajak Kopi'
  },
  {
    path: 'perpustakaan',
    loadComponent: () => import('./pages/perpustakaan/perpustakaan').then(m => m.Perpustakaan),
    title: 'Sudut Perpustakaan — Sajak Kopi'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Login Admin — Sajak Kopi'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    title: 'Dashboard — Sajak Kopi'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
