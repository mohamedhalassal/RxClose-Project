import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { CartService } from '../../services/cart.service';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';

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
  imports: [CommonModule, RouterLink, FormsModule, ChatWidgetComponent],
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

  // Mock additional images
  productImages: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.updateCartCount();
    this.route.queryParams.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(+productId);
      } else {
        this.loadSampleProduct();
      }
    });
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  loadProduct(productId: number) {
    this.loading = true;
    
    // Try to load from API
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
          this.product = this.mapProduct(foundProduct);
          this.loadPharmacyInfo();
          this.loadRelatedProducts();
          this.loadReviews();
          this.setupProductImages();
        } else {
          this.loadSampleProduct();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loadSampleProduct();
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
      imageUrl: product.imageUrl || 'assets/images/hero-image.jpeg',
      category: product.category,
      sellerType: product.sellerType || 'pharmacy',
      sellerName: product.sellerName,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName,
      prescription: product.prescription,
      details: {
        activeIngredient: product.activeIngredient || 'Paracetamol 500mg',
        manufacturer: product.manufacturer || 'Pharmaceutical Company Ltd.',
        expiryDate: product.expiryDate || '12/2025',
        dosage: product.dosage || 'Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours.',
        sideEffects: product.sideEffects || ['Nausea', 'Drowsiness', 'Dizziness'],
        contraindications: product.contraindications || ['Pregnancy', 'Liver disease', 'Kidney disease'],
        directions: product.directions || 'Take with food. Do not exceed recommended dose.',
        storage: product.storage || 'Store in a cool, dry place away from direct sunlight.'
      }
    };
  }

  loadSampleProduct() {
    this.product = {
      id: 1,
      name: 'Paracetamol 500mg',
      description: 'Effective pain relief and fever reducer. Suitable for headaches, muscle pain, arthritis, backache, toothaches, colds, and fevers.',
      price: 25.50,
      stock: 150,
      imageUrl: 'assets/images/d15d6b380ee108fb61242f02418115f9.png',
      category: 'otc',
      sellerType: 'pharmacy',
      sellerName: 'Al Noor Pharmacy',
      pharmacyId: 1,
      pharmacyName: 'Al Noor Pharmacy',
      prescription: false,
      details: {
        activeIngredient: 'Paracetamol 500mg',
        manufacturer: 'Global Pharma Industries',
        expiryDate: '06/2026',
        dosage: 'Adults and children over 12 years: 1-2 tablets every 4-6 hours as needed. Maximum 8 tablets in 24 hours.',
        sideEffects: ['Nausea (rare)', 'Skin rash (very rare)', 'Liver damage (with overdose)'],
        contraindications: ['Severe liver disease', 'Severe kidney disease', 'Known hypersensitivity to paracetamol'],
        directions: 'Swallow tablets whole with water. Can be taken with or without food. Do not exceed the recommended dose.',
        storage: 'Store below 25°C in a dry place. Keep out of reach of children.'
      }
    };
    
    this.loadPharmacyInfo();
    this.loadRelatedProducts();
    this.loadReviews();
    this.setupProductImages();
    this.loading = false;
  }

  setupProductImages() {
    if (this.product) {
      this.productImages = [
        this.product.imageUrl,
        'assets/images/f125ef9e5c913c92132edd4aa8e3875d.jpeg',
        'assets/images/d97659eb371495c0c491f9fa51ae2a48.jpeg'
      ];
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
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        // Filter related products by category
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id && p.category === this.product?.category)
          .slice(0, 8)
          .map(p => this.mapProduct(p));
        
        if (this.relatedProducts.length === 0) {
          this.loadSampleRelatedProducts();
        }
        this.startAutoScroll();
      },
      error: (error) => {
        console.error('Error loading related products:', error);
        this.loadSampleRelatedProducts();
        this.startAutoScroll();
      }
    });
  }

  loadSampleRelatedProducts() {
    this.relatedProducts = [
      {
        id: 2,
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory pain relief',
        price: 35.00,
        stock: 80,
        imageUrl: 'assets/images/img1.jpeg',
        category: 'otc',
        sellerType: 'pharmacy'
      },
      {
        id: 3,
        name: 'Aspirin 100mg',
        description: 'Heart health and pain relief',
        price: 22.00,
        stock: 120,
        imageUrl: 'assets/images/img2.jpeg',
        category: 'otc',
        sellerType: 'pharmacy'
      },
      {
        id: 4,
        name: 'Vitamin D3',
        description: 'Bone health supplement',
        price: 45.00,
        stock: 60,
        imageUrl: 'assets/images/img4.jpeg',
        category: 'vitamins-supplements',
        sellerType: 'rxclose'
      }
    ];
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
    }
  }

  increaseQuantity() {
    if (this.product && this.selectedQuantity < this.product.stock) {
      this.selectedQuantity++;
    }
  }

  // Cart and wishlist actions
  addToCart() {
    if (this.product) {
      this.cartService.addToCart({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        imageUrl: this.product.imageUrl,
        quantity: this.selectedQuantity,
        pharmacyId: this.product.pharmacyId,
        pharmacyName: this.product.pharmacyName
      });
      this.updateCartCount();
    }
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/auth/cart']);
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
    this.router.navigate(['/auth/product-details'], {
      queryParams: { id: product.id }
    });
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
