import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cartpage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './cartpage.component.html',
  styleUrls: ['./cartpage.component.scss']
})
export class CartpageComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total: number = 0;
  cartSubscription: Subscription | null = null;
  
  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.subscribeToCartChanges();
    this.loadCartItems();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  subscribeToCartChanges() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  loadCartItems() {
    this.cartItems = this.cartService.getCurrentCartItems();
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity > 0) {
      this.cartService.updateItemQuantity(item.id, newQuantity, item.pharmacyId);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id, item.pharmacyId);
  }

  clearCart() {
    if (confirm('هل أنت متأكد من إفراغ سلة التسوق؟')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('سلة التسوق فارغة! يرجى إضافة منتجات أولاً.');
      return;
    }
    
    const summary = this.cartService.prepareForCheckout();
    alert(`إجمالي الطلب: ${summary.totalPrice.toFixed(2)} ج.م\nسيتم نقلك إلى صفحة الدفع`);
  }

  increaseQuantity(item: CartItem) {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  getTotalWithTax(): number {
    return this.total + (this.total * 0.14);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
} 