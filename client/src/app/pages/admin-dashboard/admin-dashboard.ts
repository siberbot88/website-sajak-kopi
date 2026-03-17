import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';

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
  products = signal<Product[]>([]);
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
  }

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
