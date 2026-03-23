import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  product: any;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Gunakan Angular Signals untuk keranjang yang reaktif
  cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  // Computed signal untuk total item dan total harga
  cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));

  constructor() {}

  private loadCartFromStorage(): CartItem[] {
    const saved = localStorage.getItem('sajakkopi_cart');
    return saved ? JSON.parse(saved) : [];
  }

  private saveCartToStorage() {
    localStorage.setItem('sajakkopi_cart', JSON.stringify(this.cartItems()));
  }

  addToCart(product: any, quantity: number = 1) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.product._id === product._id);
      if (existingItem) {
        // Jika produk sudah ada, tambah kuantitasnya
        existingItem.quantity += quantity;
        return [...items];
      }
      // Jika produk baru, masukkan ke array
      return [...items, { product, quantity }];
    });
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    this.cartItems.update(items => {
      const item = items.find(i => i.product._id === productId);
      if (item) item.quantity = quantity;
      return [...items];
    });
    this.saveCartToStorage();
  }

  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(i => i.product._id !== productId));
    this.saveCartToStorage();
  }

  clearCart() {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }
}
