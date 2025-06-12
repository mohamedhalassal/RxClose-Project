import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService, CartItem } from '../../services/cart.service';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { filter } from 'rxjs/operators';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  sellerType: 'pharmacy' | 'rxclose';
  sellerName?: string;
  pharmacyId?: number;
  pharmacyName?: string;
  prescription?: boolean;
  details?: {
    activeIngredient?: string;
    manufacturer?: string;
    expiryDate?: string;
    dosage?: string;
    sideEffects?: string[];
    contraindications?: string[];
    directions?: string;
    storage?: string;
  };
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  openingHours?: string;
  rating?: number;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ChatWidgetComponent, FooterComponent, NavbarComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  pharmacy: Pharmacy | null = null;
  relatedProducts: Product[] = [];
  reviews: Review[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Product interaction
  selectedQuantity: number = 1;
  currentImageIndex: number = 0;
  showFullDescription: boolean = false;
  activeTab: string = 'details';
  
  // Cart and wishlist
  cartItemCount: number = 0;
  isInWishlist: boolean = false;
  
  // Auto-scroll for related products
  private autoScrollSubscription?: Subscription;
  private scrollAmount = 0;
  private readonly SCROLL_INTERVAL = 4000;

  // Route subscriptions
  private routeSubscription?: Subscription;
  private routerSubscription?: Subscription;

  // Mock additional images
  productImages: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.updateCartCount();
    console.log('ProductDetailsComponent initialized');
    
    // Subscribe to route params changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('Route params changed, new ID:', id);
      console.log('Current URL:', this.router.url);
      console.log('Route snapshot:', this.route.snapshot.url);
      
      if (id) {
        this.loadProductDetails(id);
      } else {
        console.error('No ID parameter found in route');
        this.error = 'Invalid product ID';
        this.loading = false;
      }
    });
    
    // Listen to router events to detect unwanted navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation ended to:', event.url);
        console.log('Expected URL pattern: /auth/product-details/[number]');
        
        // Check if this is an unexpected navigation
        if (event.url.includes('/auth/product-details/') && 
            !event.url.match(/\/auth\/product-details\/\d+$/)) {
          console.warn('Unexpected navigation pattern detected:', event.url);
        }
      });
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    
    // Unsubscribe from all subscriptions
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadProductDetails(id: string) {
    // Reset component state
    this.loading = true;
    this.error = null;
    this.product = null;
    this.pharmacy = null;
    this.relatedProducts = [];
    this.selectedQuantity = 1;
    this.currentImageIndex = 0;
    this.activeTab = 'details';
    this.showFullDescription = false;
    
    const numericId = Number(id);
    
    // Load specific product from API
    this.productService.getProduct(numericId).subscribe({
      next: (product: any) => {
        console.log('Product loaded:', product);
        if (product) {
          this.product = this.mapProduct(product);
          this.loadPharmacyInfo();
          this.loadRelatedProducts();
          this.loadReviews();
          this.setupProductImages();
        } else {
          this.error = 'Product not found';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Product not found';
        this.product = null;
        this.loading = false;
      }
    });
  }

  private mapProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category,
      sellerType: product.sellerType,
      sellerName: product.sellerName,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName,
      prescription: product.prescription,
      details: {
        activeIngredient: product.activeIngredient,
        manufacturer: product.manufacturer,
        expiryDate: product.expiryDate,
        dosage: product.dosage,
        sideEffects: product.sideEffects,
        contraindications: product.contraindications,
        directions: product.directions,
        storage: product.storage
      }
    };
  }

  setupProductImages() {
    if (this.product && this.product.imageUrl) {
      this.productImages = [this.product.imageUrl];
    } else {
      this.productImages = [];
    }
  }

  loadPharmacyInfo() {
    if (this.product?.pharmacyId) {
      // Mock pharmacy data
      this.pharmacy = {
        id: this.product.pharmacyId,
        name: this.product.pharmacyName || 'Al Noor Pharmacy',
        address: 'Downtown Cairo, Egypt',
        phone: '+20 123 456 789',
        latitude: 30.0626,
        longitude: 31.2497,
        distance: 2.5,
        openingHours: '24/7',
        rating: 4.8
      };
    }
  }

  loadRelatedProducts() {
    this.productService.getProducts().subscribe({
      next: (products: any[]) => {
        // Filter related products by category
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id && p.category === this.product?.category)
          .slice(0, 8)
          .map(p => this.mapProduct(p));
        
        this.startAutoScroll();
      },
      error: (error) => {
        console.error('Error loading related products:', error);
        this.startAutoScroll();
      }
    });
  }

  loadReviews() {
    // Mock reviews data
    this.reviews = [
      {
        id: 1,
        userName: 'Ahmed M.',
        rating: 5,
        comment: 'Very effective for headaches. Fast delivery from the pharmacy.',
        date: new Date('2024-01-15'),
        verified: true
      },
      {
        id: 2,
        userName: 'Fatima S.',
        rating: 4,
        comment: 'Good quality product. Works as expected.',
        date: new Date('2024-01-10'),
        verified: true
      },
      {
        id: 3,
        userName: 'Omar K.',
        rating: 5,
        comment: 'Great price and authentic product. Highly recommended.',
        date: new Date('2024-01-05'),
        verified: false
      }
    ];
  }

  // Image gallery
  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.productImages.length;
  }

  previousImage() {
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.productImages.length - 1 
      : this.currentImageIndex - 1;
  }

  // Quantity controls
  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    } else {
      this.showNotification('الكمية لا يمكن أن تكون أقل من 1', 'info');
    }
  }

  increaseQuantity() {
    if (this.product && this.selectedQuantity < this.product.stock) {
      this.selectedQuantity++;
    } else if (this.product) {
      this.showNotification(`الكمية المتاحة في المخزن: ${this.product.stock} فقط`, 'error');
    }
  }

  // Cart and wishlist actions
  addToCart() {
    console.log('addToCart called for product:', this.product?.id);
    
    if (this.product) {
      if (this.product.stock === 0) {
        this.showNotification('عذراً، هذا المنتج غير متوفر حالياً', 'error');
        return;
      }
      
      if (this.selectedQuantity > this.product.stock) {
        this.showNotification(`الكمية المطلوبة (${this.selectedQuantity}) أكبر من المتاح (${this.product.stock})`, 'error');
        return;
      }

      console.log('Adding to cart - Product ID:', this.product.id, 'Current route:', this.router.url);
      
      const cartItem = {
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        imageUrl: this.product.imageUrl,
        quantity: this.selectedQuantity,
        pharmacyId: this.product.pharmacyId,
        pharmacyName: this.product.pharmacyName
      };
      
      console.log('Cart item to add:', cartItem);
      
      this.cartService.addToCart(cartItem);
      this.updateCartCount();
      
      // Show success notification
      this.showNotification(`تم إضافة ${this.selectedQuantity} من ${this.product.name} إلى السلة بنجاح!`, 'success');
      
      console.log('After adding to cart - Current route:', this.router.url);
    }
  }

  buyNow() {
    console.log('buyNow called for product:', this.product?.id);
    
    if (this.product) {
      if (this.product.stock === 0) {
        this.showNotification('عذراً، هذا المنتج غير متوفر حالياً', 'error');
        return;
      }
      
      console.log('Buy now - adding to cart first');
      this.addToCart();
      
      console.log('Buy now - navigating to cart after delay');
      // Small delay to show the success message before navigation
      setTimeout(() => {
        console.log('Navigating to cart page');
        this.router.navigate(['/auth/cart']);
      }, 1500);
    }
  }

  // Show notification to user
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
      direction: rtl;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  toggleWishlist() {
    this.isInWishlist = !this.isInWishlist;
    // In real app, sync with backend
  }

  updateCartCount() {
    this.cartItemCount = this.cartService.getCartItemCount();
  }

  // Tab switching
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // Description toggle
  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  // Pharmacy actions
  callPharmacy() {
    if (this.pharmacy) {
      window.location.href = `tel:${this.pharmacy.phone}`;
    }
  }

  getDirections() {
    if (this.pharmacy) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${this.pharmacy.latitude},${this.pharmacy.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  viewPharmacyProducts() {
    if (this.pharmacy) {
      this.router.navigate(['/auth/search'], {
        queryParams: { pharmacy: this.pharmacy.id }
      });
    }
  }

  // Related products auto-scroll
  startAutoScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.autoScrollSubscription = interval(this.SCROLL_INTERVAL).subscribe(() => {
        this.scrollRight();
      });
    }
  }

  stopAutoScroll() {
    if (this.autoScrollSubscription) {
      this.autoScrollSubscription.unsubscribe();
    }
  }

  scrollLeft() {
    if (isPlatformBrowser(this.platformId)) {
      const container = document.querySelector('.related-products-slider');
      if (container) {
        this.scrollAmount -= 300;
        if (this.scrollAmount < 0) {
          this.scrollAmount = container.scrollWidth - container.clientWidth;
        }
        container.scrollTo({
          left: this.scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }

  scrollRight() {
    if (isPlatformBrowser(this.platformId)) {
      const container = document.querySelector('.related-products-slider');
      if (container) {
        this.scrollAmount += 300;
        if (this.scrollAmount >= container.scrollWidth - container.clientWidth) {
          this.scrollAmount = 0;
        }
        container.scrollTo({
          left: this.scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }

  // Related product actions
  viewProduct(product: Product) {
    this.router.navigate(['/auth/product-details', product.id]);
  }

  addRelatedToCart(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName
    });
    this.updateCartCount();
  }

  // Utility methods
  getCategoryDisplay(category: string): string {
    const categories: { [key: string]: string } = {
      'prescription': 'Prescription Drugs',
      'otc': 'Over-the-Counter',
      'medical-supplies': 'Medical Supplies',
      'vitamins-supplements': 'Vitamins & Supplements',
      'baby-care': 'Baby Care',
      'personal-care': 'Personal Care'
    };
    return categories[category] || category;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/auth/search']);
  }
}
