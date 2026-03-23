import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';
import { OrderService, Order } from '../../services/order.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule, FormsModule,
    TableModule, TagModule, ButtonModule, InputTextModule,
    DialogModule, SelectModule, TextareaModule, InputNumberModule,
    ToastModule, ConfirmDialogModule, ToolbarModule,
    IconFieldModule, InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  // Tabs: 'produk' | 'pesanan'
  activeTab = signal<'produk' | 'pesanan'>('produk');

  // Products State
  products = signal<Product[]>([]);
  
  // Orders State
  orders = signal<Order[]>([]);
  activePaymentTab = signal<'Kasir' | 'QRIS'>('Kasir');

  filteredOrders = computed(() => {
    const method = this.activePaymentTab();
    return this.orders().filter(o => o.paymentMethod === method);
  });

  loading = signal(true);
  showDialog = signal(false);
  editMode = signal(false);
  saving = signal(false);
  searchValue = '';
  selectedFile: File | null = null;

  form: Partial<Product> & { _id?: string } = {
    name: '',
    category: 'Minuman',
    description: '',
    price: null,
    imageUrl: ''
  };

  categoryOptions = [
    { label: 'Minuman', value: 'Minuman' },
    { label: 'Makanan', value: 'Makanan' },
    { label: 'Cemilan', value: 'Cemilan' }
  ];

  selectedCategory = signal<string>('');

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return this.products();
    return this.products().filter(p => p.category === cat);
  });

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProducts();
    this.loadOrders();
  }

  // ==== Orders Methods ====
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat pesanan' })
    });
  }

  updateOrderStatus(order: Order, newStatus: string) {
    this.orderService.updateOrderStatus(order._id, newStatus).subscribe({
      next: () => {
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Status pesanan diperbarui.' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengubah status.' })
    });
  }

  deleteOrder(order: Order) {
    this.confirmationService.confirm({
      message: `Yakin ingin menghapus pesanan <b>#${order.queueNumber}</b> dari <b>${order.buyerName}</b>? Data pesanan akan dihapus permanen dari database.`,
      header: 'Konfirmasi Hapus Pesanan',
      icon: 'pi pi-trash',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.orderService.deleteOrder(order._id).subscribe({
          next: () => {
            this.loadOrders();
            this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: `Pesanan #${order.queueNumber} berhasil dihapus.` });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus pesanan.' })
        });
      }
    });
  }

  getOrderSeverity(status: string) {
    switch (status) {
      case 'Selesai': return 'success';
      case 'Siap Diantar': return 'info';
      case 'Diproses': return 'warn';
      case 'Batal': return 'danger';
      default: return 'secondary';
    }
  }

  async printReceipt(order: Order) {
    const itemsHtml = order.items.map(item =>
      `<tr>
        <td style="text-align:left">${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${this.formatPrice(item.price * item.quantity)}</td>
      </tr>`
    ).join('');

    // Fetch logo and convert to base64 so it works in about:blank popup
    let logoBase64 = '';
    try {
      const resp = await fetch('/assets/images/logo-sajak-kopi.png');
      const blob = await resp.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { /* logo optional */ }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk - #${order.queueNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Ovo&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            width: 300px;
            margin: 0 auto;
            padding: 20px 15px;
            color: #333;
            position: relative;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            width: 240px;
            height: 240px;
            pointer-events: none;
            z-index: 0;
          }
          .content { position: relative; z-index: 1; }
          .header { text-align: center; margin-bottom: 16px; }
          .header h2 { font-family: 'Ovo', serif; font-size: 18px; color: #4A3B2C; }
          .header p { font-size: 11px; color: #6B6055; }
          .divider { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
          .queue { text-align: center; margin: 12px 0; }
          .queue span { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #6B6055; }
          .queue strong { display: block; font-size: 36px; font-family: 'Ovo', serif; color: #8B5A2B; }
          .info { font-size: 12px; }
          .info p { display: flex; justify-content: space-between; margin: 4px 0; }
          .info p strong { color: #6B6055; font-weight: 400; }
          table { width: 100%; font-size: 11px; margin: 8px 0; border-collapse: collapse; }
          table th { text-align: left; border-bottom: 1px solid #ddd; padding: 4px 0; font-weight: 600; }
          table td { padding: 3px 0; }
          .total { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #999; }
          @media print { body { width: 100%; } .watermark { position: fixed; } }
        </style>
      </head>
      <body>
        ${logoBase64 ? `<img src="${logoBase64}" class="watermark" alt="">` : ''}
        <div class="content">
          <div class="header">
            <h2>Sajak Kopi</h2>
            <p>Struk Pesanan</p>
          </div>
          <hr class="divider">
          <div class="queue">
            <span>Nomor Antrean</span>
            <strong>${order.queueNumber}</strong>
          </div>
          <hr class="divider">
          <div class="info">
            <p><strong>Nama:</strong> <span>${order.buyerName}</span></p>
            <p><strong>Meja:</strong> <span>${order.tableNumber}</span></p>
            <p><strong>Bayar:</strong> <span>${order.paymentMethod}</span></p>
            <p><strong>Status:</strong> <span>${order.status}</span></p>
            <p><strong>Waktu:</strong> <span>${new Date(order.createdAt).toLocaleString('id-ID')}</span></p>
          </div>
          <hr class="divider">
          <table>
            <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <hr class="divider">
          <div class="subtotal-line" style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0;color:#6B6055;">
            <span>Subtotal</span>
            <span>${this.formatPrice(Math.round(order.totalAmount / 1.11))}</span>
          </div>
          <div class="tax-line" style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0;color:#6B6055;padding-bottom:8px;border-bottom:1px dashed #ccc;">
            <span>Tax (11%)</span>
            <span>${this.formatPrice(order.totalAmount - Math.round(order.totalAmount / 1.11))}</span>
          </div>
          <div class="total" style="display:flex;justify-content:space-between;font-weight:700;font-size:14px;margin-top:8px;">
            <span>Total</span>
            <span>${this.formatPrice(order.totalAmount)}</span>
          </div>
          <div class="footer">
            <p>Terima kasih telah memesan di Sajak Kopi</p>
            <p>Setiap Sajian, Sebuah Cerita</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  }

  // ==== Products Methods ====

  get username(): string {
    return this.authService.username || 'Admin';
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCategoryCount(category: string): number {
    return this.products().filter(p => p.category === category).length;
  }

  getCategorySeverity(category: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (category) {
      case 'Minuman': return 'warn';
      case 'Makanan': return 'danger';
      case 'Cemilan': return 'success';
      default: return 'info';
    }
  }

  formatPrice(price: number | null): string {
    if (!price) return '-';
    return 'Rp ' + price.toLocaleString('id-ID');
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(this.selectedCategory() === category ? '' : category);
  }

  openAddDialog() {
    this.editMode.set(false);
    this.form = { name: '', category: 'Minuman', description: '', price: null, imageUrl: '' };
    this.selectedFile = null;
    this.showDialog.set(true);
  }

  openEditDialog(product: Product) {
    this.editMode.set(true);
    this.form = { ...product };
    this.selectedFile = null;
    this.showDialog.set(true);
  }

  hideDialog() {
    this.showDialog.set(false);
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveProduct() {
    if (!this.form.name || !this.form.description) {
      this.messageService.add({ severity: 'warn', summary: 'Peringatan', detail: 'Nama dan deskripsi wajib diisi.', life: 3000 });
      return;
    }
    this.saving.set(true);

    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('category', this.form.category || 'Minuman');
    formData.append('description', this.form.description);
    if (this.form.price) formData.append('price', this.form.price.toString());
    
    // Append file if selected, otherwise keep existing imageUrl string if edit mode
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.form.imageUrl && this.editMode()) {
      formData.append('imageUrl', this.form.imageUrl);
    } // If no file & no image & new product, backend will use placeholder or default handled by logic

    if (this.editMode() && this.form._id) {
      this.productService.updateProduct(this.form._id, formData).subscribe({
        next: () => {
          this.saving.set(false);
          this.hideDialog();
          this.loadProducts();
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Produk berhasil diperbarui.', life: 3000 });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui produk.', life: 3000 });
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.saving.set(false);
          this.hideDialog();
          this.loadProducts();
          this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Produk berhasil ditambahkan.', life: 3000 });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menambahkan produk.', life: 3000 });
        }
      });
    }
  }

  confirmDelete(product: Product) {
    this.confirmationService.confirm({
      message: `Apakah Anda yakin ingin menghapus "${product.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-trash',
      rejectButtonProps: {
        label: 'Batal',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Hapus',
        severity: 'danger'
      },
      accept: () => {
        this.productService.deleteProduct(product._id).subscribe({
          next: () => {
            this.loadProducts();
            this.messageService.add({ severity: 'success', summary: 'Berhasil', detail: 'Produk berhasil dihapus.', life: 3000 });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus produk.', life: 3000 });
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onGlobalFilter(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value;
  }
}
