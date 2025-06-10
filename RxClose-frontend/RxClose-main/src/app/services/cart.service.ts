import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  pharmacyId?: number;
  pharmacyName?: string;
  maxQuantity?: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'rxclose_cart';
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromStorage();
  }

  // Get cart items as observable
  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  // Get current cart items
  getCurrentCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  // Add item to cart
  addToCart(item: CartItem): void {
    console.log('CartService: Adding item to cart:', item);
    
    const existingItemIndex = this.cartItems.findIndex(
      cartItem => cartItem.id === item.id && cartItem.pharmacyId === item.pharmacyId
    );

    if (existingItemIndex > -1) {
      // Item exists, update quantity
      console.log('CartService: Item exists, updating quantity');
      this.cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // New item, add to cart
      console.log('CartService: Adding new item');
      this.cartItems.push({ ...item });
    }

    this.updateCart();
    console.log('CartService: Updated cart:', this.cartItems);
  }

  // Remove item from cart
  removeFromCart(itemId: number, pharmacyId?: number): void {
    this.cartItems = this.cartItems.filter(
      item => !(item.id === itemId && item.pharmacyId === pharmacyId)
    );
    this.updateCart();
  }

  // Update item quantity
  updateItemQuantity(itemId: number, quantity: number, pharmacyId?: number): void {
    const itemIndex = this.cartItems.findIndex(
      item => item.id === itemId && item.pharmacyId === pharmacyId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(itemId, pharmacyId);
      } else {
        this.cartItems[itemIndex].quantity = quantity;
        this.updateCart();
      }
    }
  }

  // Get cart item count
  getCartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Get cart total price
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get cart summary
  getCartSummary(): CartSummary {
    const subtotal = this.getCartTotal();
    const tax = subtotal * 0.14; // 14% VAT in Egypt
    const shipping = subtotal > 200 ? 0 : 25; // Free shipping over 200 EGP
    const totalPrice = subtotal + tax + shipping;

    return {
      items: [...this.cartItems],
      totalItems: this.getCartItemCount(),
      totalPrice: Math.round(totalPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: shipping
    };
  }

  // Clear cart
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Check if item is in cart
  isInCart(itemId: number, pharmacyId?: number): boolean {
    return this.cartItems.some(
      item => item.id === itemId && item.pharmacyId === pharmacyId
    );
  }

  // Get item quantity in cart
  getItemQuantity(itemId: number, pharmacyId?: number): number {
    const item = this.cartItems.find(
      cartItem => cartItem.id === itemId && cartItem.pharmacyId === pharmacyId
    );
    return item ? item.quantity : 0;
  }

  // Group cart items by pharmacy
  getCartItemsByPharmacy(): { [pharmacyName: string]: CartItem[] } {
    const grouped: { [pharmacyName: string]: CartItem[] } = {};
    
    this.cartItems.forEach(item => {
      const key = item.pharmacyName || 'RxClose Global';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  }

  // Save to checkout (for order processing)
  prepareForCheckout(): CartSummary {
    const summary = this.getCartSummary();
    localStorage.setItem('rxclose_checkout', JSON.stringify(summary));
    return summary;
  }

  // Load cart from localStorage
  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        this.cartSubject.next([...this.cartItems]);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems = [];
    }
  }

  // Save cart to localStorage and notify subscribers
  private updateCart(): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
      this.cartSubject.next([...this.cartItems]);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Validate cart items (check stock, prices, etc.)
  async validateCart(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // In a real app, you would validate against the backend
    this.cartItems.forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.name}`);
      }
      if (item.price <= 0) {
        errors.push(`Invalid price for ${item.name}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Merge cart on login (if user had items before login)
  mergeCart(serverCartItems: CartItem[]): void {
    serverCartItems.forEach(serverItem => {
      const localItemIndex = this.cartItems.findIndex(
        localItem => localItem.id === serverItem.id && localItem.pharmacyId === serverItem.pharmacyId
      );

      if (localItemIndex > -1) {
        // Keep higher quantity
        this.cartItems[localItemIndex].quantity = Math.max(
          this.cartItems[localItemIndex].quantity,
          serverItem.quantity
        );
      } else {
        // Add new item from server
        this.cartItems.push({ ...serverItem });
      }
    });

    this.updateCart();
  }
} 