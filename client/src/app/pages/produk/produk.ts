import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-produk',
  imports: [CommonModule],
  templateUrl: './produk.html',
  styleUrl: './produk.css'
})
export class Produk implements OnInit {
  products = signal<Product[]>([]);
  activeCategory = signal<string>('Semua');
  loading = signal<boolean>(true);
  currentPage = signal(1);
  itemsPerPage = 9;
  categories = ['Semua', 'Minuman', 'Makanan', 'Cemilan'];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setCategory(category: string) {
    this.activeCategory.set(category);
    this.currentPage.set(1);
  }

  get filteredProducts(): Product[] {
    const cat = this.activeCategory();
    if (cat === 'Semua') return this.products();
    return this.products().filter(p => p.category === cat);
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }

  formatPrice(price: number | null): string {
    if (!price) return '';
    return 'Rp ' + price.toLocaleString('id-ID');
  }
}
