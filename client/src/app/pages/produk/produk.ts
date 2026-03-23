import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-produk',
  imports: [CommonModule, FormsModule],
  templateUrl: './produk.html',
  styleUrl: './produk.css'
})
export class Produk implements OnInit {
  cartService = inject(CartService);

  products = signal<Product[]>([]);
  activeCategory = signal<string>('Semua');
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);
  
  // Modal State
  selectedProduct = signal<Product | null>(null);
  modalQuantity = signal(1);
  currentPage = signal(1);
  itemsPerPage = 9;
  categories = ['Semua', 'Minuman', 'Makanan', 'Cemilan'];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  // ==== Modal Handlers ====
  openModal(product: Product) {
    this.selectedProduct.set(product);
    this.modalQuantity.set(1);
  }

  closeModal() {
    this.selectedProduct.set(null);
  }

  incrementQty() {
    this.modalQuantity.update(q => q + 1);
  }

  decrementQty() {
    this.modalQuantity.update(q => (q > 1 ? q - 1 : 1));
  }

  addToCart() {
    const product = this.selectedProduct();
    if (product) {
      this.cartService.addToCart(product, this.modalQuantity());
      this.closeModal();
    }
  }
  // ========================

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

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  get filteredProducts(): Product[] {
    const cat = this.activeCategory();
    const query = this.searchQuery().toLowerCase().trim();
    let results = this.products();

    if (cat !== 'Semua') {
      results = results.filter(p => p.category === cat);
    }
    if (query) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    return results;
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
