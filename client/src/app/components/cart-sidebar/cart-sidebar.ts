import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

// Deklarasi objek global Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

@Component({
  selector: 'app-cart-sidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebarComponent {
  cartService = inject(CartService);

  isOpen = signal(false);
  
  // Form checkout
  buyerName = signal('');
  tableNumber = signal<number | null>(null);
  paymentMethod = signal('Kasir');

  // Checkout Status
  isSubmitting = signal(false);
  checkoutError = signal('');
  checkoutSuccess = signal<{ order: any } | null>(null);

  toggleSidebar() {
    this.isOpen.update(val => !val);
    if (!this.isOpen()) {
      this.resetErrorState();
    }
  }

  resetErrorState() {
    this.checkoutError.set('');
    this.checkoutSuccess.set(null);
  }

  async checkout() {
    if (!this.buyerName().trim()) {
      this.checkoutError.set('Nama pembeli wajib diisi.');
      return;
    }
    if (!this.tableNumber()) {
      this.checkoutError.set('Nomor meja wajib diisi.');
      return;
    }

    this.isSubmitting.set(true);
    this.checkoutError.set('');

    const apiUrl = `${environment.apiUrl}/api/orders`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: this.buyerName(),
          tableNumber: this.tableNumber(),
          paymentMethod: this.paymentMethod(),
          totalAmount: Math.round(this.cartService.cartTotal() * 1.11),
          items: this.cartService.cartItems().map(item => ({
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat pesanan');
      }

      // Jika ada token Snap (Pembayaran QRIS via Midtrans)
      if (data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: async (result: any) => {
            // Update status di backend karena webhook tidak bisa ke localhost
            await fetch(`${environment.apiUrl}/api/orders/${data.order._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
              body: JSON.stringify({ status: 'Diproses' })
            }).catch(() => {});
            this.checkoutSuccess.set(data);
            this.cartService.clearCart();
            this.isSubmitting.set(false);
          },
          onPending: (result: any) => {
            // Pending = QR sudah di-scan tapi belum settle
            this.checkoutSuccess.set(data);
            this.cartService.clearCart();
            this.isSubmitting.set(false);
          },
          onError: (result: any) => {
            this.checkoutError.set('Pembayaran gagal atau dibatalkan.');
            this.isSubmitting.set(false);
          },
          onClose: () => {
            this.checkoutError.set('Selesaikan pembayaran untuk memproses pesanan.');
            this.isSubmitting.set(false);
          }
        });
      } else {
        // Jika Pembayaran Tunai
        this.checkoutSuccess.set(data);
        this.cartService.clearCart();
        this.isSubmitting.set(false);
      }

    } catch (err: any) {
      this.checkoutError.set(err.message || 'Terjadi kesalahan sistem.');
      this.isSubmitting.set(false);
    }
  }

  closeReceipt() {
    this.isOpen.set(false);
    this.resetErrorState();
    this.buyerName.set('');
    this.tableNumber.set(null);
  }

  formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
  }

  async downloadReceipt() {
    const order = this.checkoutSuccess()?.order;
    if (!order) return;

    const itemsHtml = order.items.map((item: any) =>
      `<tr>
        <td style="text-align:left">${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${this.formatPrice(item.price * item.quantity)}</td>
      </tr>`
    ).join('');

    const subtotal = Math.round(order.totalAmount / 1.11);
    const tax = order.totalAmount - subtotal;

    // Fetch logo as base64
    let logoBase64 = '';
    try {
      const resp = await fetch('/assets/images/logo-sajak-kopi.png');
      const blob = await resp.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Ovo&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            width: 280px;
            padding: 20px 15px;
            color: #333;
            position: relative;
            background: #fff;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.07;
            width: 200px;
            height: 200px;
            pointer-events: none;
          }
          .content { position: relative; z-index: 1; }
          .header { text-align: center; margin-bottom: 14px; }
          .header h2 { font-family: 'Ovo', serif; font-size: 17px; color: #4A3B2C; }
          .header p { font-size: 10px; color: #6B6055; }
          .divider { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
          .queue { text-align: center; margin: 10px 0; }
          .queue span { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #6B6055; }
          .queue strong { display: block; font-size: 32px; font-family: 'Ovo', serif; color: #8B5A2B; }
          .info { font-size: 11px; }
          .info p { display: flex; justify-content: space-between; margin: 3px 0; }
          .info p strong { color: #6B6055; font-weight: 400; }
          table { width: 100%; font-size: 10px; margin: 6px 0; border-collapse: collapse; }
          table th { text-align: left; border-bottom: 1px solid #ddd; padding: 3px 0; font-weight: 600; }
          table td { padding: 2px 0; }
          .subtotal-line, .tax-line { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; color: #6B6055; }
          .tax-line { padding-bottom: 6px; border-bottom: 1px dashed #ccc; }
          .total { display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; margin-top: 6px; }
          .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #999; }
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
            <p><strong>Status:</strong> <span>${order.status || 'Menunggu Pembayaran'}</span></p>
            <p><strong>Waktu:</strong> <span>${new Date(order.createdAt || Date.now()).toLocaleString('id-ID')}</span></p>
          </div>
          <hr class="divider">
          <table>
            <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <hr class="divider">
          <div class="subtotal-line"><span>Subtotal</span><span>${this.formatPrice(subtotal)}</span></div>
          <div class="tax-line"><span>Tax (11%)</span><span>${this.formatPrice(tax)}</span></div>
          <div class="total"><span>Total</span><span>${this.formatPrice(order.totalAmount)}</span></div>
          <div class="footer">
            <p>Terima kasih telah memesan di Sajak Kopi</p>
            <p>Setiap Sajian, Sebuah Cerita</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open receipt in new window for print/save
    const printWindow = window.open('', '_blank', 'width=320,height=700');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      // Auto trigger print (user can Save as PDF)
      printWindow.onload = () => printWindow.print();
    }
  }
}
