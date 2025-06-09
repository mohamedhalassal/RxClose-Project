import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api';
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    // تحميل السلة من localStorage عند بدء التطبيق
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
      this.updateCartCount();
    }
  }

  // الحصول على محتويات السلة
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  // الحصول على عدد المنتجات في السلة
  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  // إضافة منتج إلى السلة
  addToCart(item: CartItem): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { ...item, quantity: 1 }]);
    }

    this.updateCartCount();
    this.saveCartToLocalStorage();
  }

  // إزالة منتج من السلة
  removeFromCart(itemId: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    this.cartItems.next(updatedItems);
    this.updateCartCount();
    this.saveCartToLocalStorage();
  }

  // تحديث كمية منتج في السلة
  updateQuantity(itemId: number, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.updateCartCount();
      this.saveCartToLocalStorage();
    }
  }

  // مسح السلة
  clearCart(): void {
    this.cartItems.next([]);
    this.updateCartCount();
    this.saveCartToLocalStorage();
  }

  // حفظ السلة في localStorage
  private saveCartToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  // تحديث عداد السلة
  private updateCartCount(): void {
    const count = this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
    this.cartCount.next(count);
  }
} 