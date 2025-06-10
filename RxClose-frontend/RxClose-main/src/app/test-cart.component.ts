import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-test-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding: 2rem; font-family: Arial, sans-serif;">
      <h2>Test Cart Functionality</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
        <div *ngFor="let product of testProducts" style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
          <img [src]="product.imageUrl" [alt]="product.name" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;">
          <h4>{{ product.name }}</h4>
          <p>{{ product.price | currency:'EGP':'symbol':'1.2-2' }}</p>
          <button (click)="addToCart(product)" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Add to Cart
          </button>
        </div>
      </div>
      
      <div style="margin: 2rem 0; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
        <h3>Cart Summary</h3>
        <p>Items in cart: {{ cartItemCount }}</p>
        <p>Total: {{ cartTotal | currency:'EGP':'symbol':'1.2-2' }}</p>
        <a routerLink="/auth/cart" style="background: #10b981; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Cart
        </a>
        <button (click)="clearCart()" style="background: #ef4444; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; margin-left: 1rem;">
          Clear Cart
        </button>
      </div>
      
      <div style="margin: 2rem 0;">
        <h3>Cart Items:</h3>
        <div *ngFor="let item of cartItems" style="padding: 0.5rem; border-bottom: 1px solid #eee;">
          {{ item.name }} - Quantity: {{ item.quantity }} - Total: {{ (item.price * item.quantity) | currency:'EGP':'symbol':'1.2-2' }}
        </div>
        <div *ngIf="cartItems.length === 0" style="color: #666; font-style: italic;">
          No items in cart
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TestCartComponent {
  cartItems: any[] = [];
  cartItemCount: number = 0;
  cartTotal: number = 0;

  testProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      price: 25.50,
      imageUrl: 'assets/images/d15d6b380ee108fb61242f02418115f9.png',
      pharmacyId: 1,
      pharmacyName: 'Al Noor Pharmacy'
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg',
      price: 45.00,
      imageUrl: 'assets/images/img4.jpeg',
      pharmacyId: 2,
      pharmacyName: 'City Pharmacy'
    },
    {
      id: 3,
      name: 'First Aid Kit',
      price: 120.00,
      imageUrl: 'assets/images/img5.jpeg',
      pharmacyId: 1,
      pharmacyName: 'Al Noor Pharmacy'
    }
  ];

  constructor(private cartService: CartService) {
    this.updateCartInfo();
    
    // Subscribe to cart changes
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.updateCartInfo();
    });
  }

  addToCart(product: any) {
    console.log('Adding to cart:', product);
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName
    });
    
    // Show success message
    this.showMessage(`${product.name} added to cart!`, 'success');
  }

  clearCart() {
    this.cartService.clearCart();
    this.showMessage('Cart cleared!', 'info');
  }

  updateCartInfo() {
    this.cartItemCount = this.cartService.getCartItemCount();
    this.cartTotal = this.cartService.getCartTotal();
    this.cartItems = this.cartService.getCurrentCartItems();
  }

  showMessage(message: string, type: 'success' | 'info' | 'error' = 'success') {
    const colors = {
      success: '#10b981',
      info: '#3b82f6', 
      error: '#ef4444'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-weight: 600;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
} 