import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';

interface PharmacyGroup {
  pharmacyId: number;
  pharmacyName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  estimatedDelivery: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ChatWidgetComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0
  };
  
  pharmacyGroups: PharmacyGroup[] = [];
  
  // Shipping options
  shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 25,
      estimatedTime: '2-3 business days',
      description: 'Regular delivery during business hours'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 50,
      estimatedTime: 'Same day',
      description: 'Express delivery within 6 hours'
    },
    {
      id: 'pickup',
      name: 'Pharmacy Pickup',
      price: 0,
      estimatedTime: 'Ready in 30 minutes',
      description: 'Pick up from pharmacy location'
    }
  ];
  
  selectedShippingOption: string = 'standard';
  
  // Promo codes
  availablePromoCodes: PromoCode[] = [
    {
      code: 'WELCOME10',
      discount: 10,
      type: 'percentage',
      description: '10% off for new customers'
    },
    {
      code: 'SAVE50',
      discount: 50,
      type: 'fixed',
      description: 'EGP 50 off orders over EGP 200'
    }
  ];
  
  promoCode: string = '';
  appliedPromoCode: PromoCode | null = null;
  promoError: string = '';
  
  // UI state
  loading: boolean = false;
  isCheckingOut: boolean = false;
  showShippingOptions: boolean = false;
  showPromoInput: boolean = false;
  
  private cartSubscription: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.subscribeToCartChanges();
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
  }

  loadCart() {
    this.cartItems = this.cartService.getCurrentCartItems();
    this.cartSummary = this.cartService.getCartSummary();
    this.groupItemsByPharmacy();
    this.updateShipping();
  }

  subscribeToCartChanges() {
    this.cartSubscription.add(
      this.cartService.getCartItems().subscribe((items: CartItem[]) => {
        this.cartItems = items;
        this.cartSummary = this.cartService.getCartSummary();
        this.groupItemsByPharmacy();
        this.updateShipping();
      })
    );
  }

  groupItemsByPharmacy() {
    const groups: { [key: string]: PharmacyGroup } = {};
    
    this.cartItems.forEach(item => {
      const pharmacyKey = item.pharmacyId?.toString() || 'rxclose';
      const pharmacyName = item.pharmacyName || 'RxClose Direct';
      
      if (!groups[pharmacyKey]) {
        groups[pharmacyKey] = {
          pharmacyId: item.pharmacyId || 0,
          pharmacyName: pharmacyName,
          items: [],
          subtotal: 0,
          deliveryFee: this.getDeliveryFee(pharmacyKey),
          estimatedDelivery: this.getEstimatedDelivery()
        };
      }
      
      groups[pharmacyKey].items.push(item);
      groups[pharmacyKey].subtotal += item.price * item.quantity;
    });
    
    this.pharmacyGroups = Object.values(groups);
  }

  getDeliveryFee(pharmacyKey: string): number {
    const selectedOption = this.shippingOptions.find(option => option.id === this.selectedShippingOption);
    return selectedOption?.price || 0;
  }

  getEstimatedDelivery(): string {
    const selectedOption = this.shippingOptions.find(option => option.id === this.selectedShippingOption);
    return selectedOption?.estimatedTime || '2-3 business days';
  }

  // Cart item actions
  updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    const item = this.cartItems.find(i => i.id === itemId);
    this.cartService.updateItemQuantity(itemId, newQuantity, item?.pharmacyId);
  }

  removeItem(itemId: number) {
    const item = this.cartItems.find(i => i.id === itemId);
    this.cartService.removeFromCart(itemId, item?.pharmacyId);
  }

  increaseQuantity(item: CartItem) {
    this.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.updateQuantity(item.id, item.quantity - 1);
  }

  // Shipping options
  selectShippingOption(optionId: string) {
    this.selectedShippingOption = optionId;
    this.updateShipping();
    this.showShippingOptions = false;
  }

  updateShipping() {
    const selectedOption = this.shippingOptions.find(option => option.id === this.selectedShippingOption);
    if (selectedOption) {
      this.cartSummary.shipping = selectedOption.price * this.pharmacyGroups.length;
      this.recalculateTotal();
    }
  }

  toggleShippingOptions() {
    this.showShippingOptions = !this.showShippingOptions;
  }

  // Promo code handling
  togglePromoInput() {
    this.showPromoInput = !this.showPromoInput;
    if (!this.showPromoInput) {
      this.promoCode = '';
      this.promoError = '';
    }
  }

  applyPromoCode() {
    this.promoError = '';
    
    const promo = this.availablePromoCodes.find(p => 
      p.code.toLowerCase() === this.promoCode.toLowerCase()
    );
    
    if (!promo) {
      this.promoError = 'Invalid promo code';
      return;
    }
    
    // Check minimum order for fixed discount
    if (promo.type === 'fixed' && this.cartSummary.subtotal < 200) {
      this.promoError = 'Minimum order of EGP 200 required for this promo code';
      return;
    }
    
    this.appliedPromoCode = promo;
    this.promoCode = '';
    this.showPromoInput = false;
    this.recalculateTotal();
  }

  removePromoCode() {
    this.appliedPromoCode = null;
    this.recalculateTotal();
  }

  getPromoDiscount(): number {
    if (!this.appliedPromoCode) return 0;
    
    if (this.appliedPromoCode.type === 'percentage') {
      return this.cartSummary.subtotal * (this.appliedPromoCode.discount / 100);
    } else {
      return Math.min(this.appliedPromoCode.discount, this.cartSummary.subtotal);
    }
  }

  recalculateTotal() {
    const promoDiscount = this.getPromoDiscount();
    this.cartSummary.totalPrice = this.cartSummary.subtotal + this.cartSummary.tax + this.cartSummary.shipping - promoDiscount;
  }

  // Pharmacy actions
  callPharmacy(pharmacyId: number) {
    // Mock phone numbers
    const phoneNumbers: { [key: number]: string } = {
      1: '+20 123 456 789',
      2: '+20 123 456 790',
      3: '+20 123 456 791'
    };
    
    const phone = phoneNumbers[pharmacyId] || '+20 123 456 789';
    window.location.href = `tel:${phone}`;
  }

  getDirectionsToPharmacy(pharmacyId: number) {
    // Mock pharmacy locations
    const locations: { [key: number]: { lat: number, lng: number } } = {
      1: { lat: 30.0626, lng: 31.2497 },
      2: { lat: 30.0444, lng: 31.2357 },
      3: { lat: 30.0875, lng: 31.2573 }
    };
    
    const location = locations[pharmacyId] || { lat: 30.0626, lng: 31.2497 };
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    window.open(googleMapsUrl, '_blank');
  }

  viewPharmacyProducts(pharmacyId: number, pharmacyName: string) {
    this.router.navigate(['/auth/search'], {
      queryParams: { pharmacy: pharmacyId, name: pharmacyName }
    });
  }

  // Checkout process
  proceedToCheckout() {
    if (this.cartItems.length === 0) return;
    
    this.isCheckingOut = true;
    
    // Simulate checkout process
    setTimeout(() => {
      // For now, navigate to a checkout confirmation
      // In real app, this would integrate with payment gateway
      this.router.navigate(['/auth/checkout'], {
        state: {
          cartSummary: this.cartSummary,
          shippingOption: this.selectedShippingOption,
          promoCode: this.appliedPromoCode
        }
      });
      this.isCheckingOut = false;
    }, 2000);
  }

  continueShopping() {
    this.router.navigate(['/auth/search']);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  // Recommended products (mock data)
  getRecommendedProducts() {
    return [
      {
        id: 101,
        name: 'Vitamin C 1000mg',
        price: 45.00,
        imageUrl: 'assets/images/img4.jpeg',
        description: 'Immune system support'
      },
      {
        id: 102,
        name: 'First Aid Kit',
        price: 120.00,
        imageUrl: 'assets/images/img5.jpeg',
        description: 'Complete emergency kit'
      },
      {
        id: 103,
        name: 'Digital Thermometer',
        price: 85.00,
        imageUrl: 'assets/images/img6.jpeg',
        description: 'Fast and accurate readings'
      }
    ];
  }

  addRecommendedToCart(product: any) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
  }

  goBack() {
    this.router.navigate(['/auth/search']);
  }
} 