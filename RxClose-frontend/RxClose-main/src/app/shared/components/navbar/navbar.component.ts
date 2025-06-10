import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CartService, CartItem } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface Product {
  id: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl: string;
  sellerType?: 'pharmacy' | 'rxclose';
  sellerName?: string;
  pharmacyId?: number;
  pharmacyName?: string;
  prescription?: boolean;
  distance?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: Product[] = [];
  isSearching: boolean = false;
  cartItemCount: number = 0;
  
  private searchSubject = new Subject<string>();
  private searchTimeout: any;
  private cartSubscription?: Subscription;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Initialize search debouncing
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm.trim()) {
        this.performSearch(searchTerm);
      } else {
        this.searchResults = [];
      }
    });

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCartItems().subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    // Initialize cart count
    this.cartItemCount = this.cartService.getCartItemCount();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  searchProducts() {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string) {
    this.isSearching = true;
    console.log('Performing search for term:', term);
    
    // Try multiple product endpoints
    this.searchAllProducts(term);
  }

  private searchAllProducts(term: string) {
    // Search in all products first
    this.adminService.getProducts().subscribe({
      next: (response: any) => {
        console.log('All Products API Response:', response);
        this.handleSearchResponse(response, term);
      },
      error: (error) => {
        console.error('All Products search error:', error);
        // Fallback to RxClose products
        this.searchRxCloseProducts(term);
      }
    });
  }

  private searchRxCloseProducts(term: string) {
    this.adminService.getRxCloseProducts().subscribe({
      next: (response: any) => {
        console.log('RxClose Products API Response:', response);
        this.handleSearchResponse(response, term);
      },
      error: (error) => {
        console.error('RxClose Products search error:', error);
        // Fallback to pharmacy products
        this.searchPharmacyProducts(term);
      }
    });
  }

  private searchPharmacyProducts(term: string) {
    this.adminService.getAllPharmacyProducts().subscribe({
      next: (response: any) => {
        console.log('Pharmacy Products API Response:', response);
        this.handleSearchResponse(response, term);
      },
      error: (error) => {
        console.error('Pharmacy Products search error:', error);
        // Use mock data as final fallback
        this.useMockSearchData(term);
      }
    });
  }

  private handleSearchResponse(response: any, term: string) {
    try {
      let products: Product[] = [];
      
      if (response && Array.isArray(response)) {
        // Direct array response
        products = response.map((item: any) => this.mapProduct(item));
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        products = response.data.map((item: any) => this.mapProduct(item));
      } else if (response && response.products && Array.isArray(response.products)) {
        // Response with products property
        products = response.products.map((item: any) => this.mapProduct(item));
      } else {
        console.log('No valid products array found in response');
        this.useMockSearchData(term);
        return;
      }

      // Filter products by search term
      this.searchResults = products.filter((product: Product) => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description?.toLowerCase().includes(term.toLowerCase()) ||
        product.category?.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5); // Limit to 5 results

      console.log('Filtered search results:', this.searchResults);
      this.isSearching = false;
      
    } catch (error) {
      console.error('Error processing search response:', error);
      this.useMockSearchData(term);
    }
  }

  private useMockSearchData(term: string) {
    console.log('Using mock search data for term:', term);
    
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'باراسيتامول 500 مجم',
        category: 'أدوية',
        description: 'مسكن للألم وخافض للحرارة',
        price: 15.50,
        imageUrl: 'assets/images/products/paracetamol.jpg',
        sellerName: 'صيدلية العزبي',
        sellerType: 'pharmacy'
      },
      {
        id: 2,
        name: 'فيتامين سي 1000 مجم',
        category: 'فيتامينات',
        description: 'مكمل غذائي لتقوية المناعة',
        price: 45.00,
        imageUrl: 'assets/images/products/vitamin-c.jpg',
        sellerName: 'RxClose',
        sellerType: 'rxclose'
      },
      {
        id: 3,
        name: 'أسبرين 75 مجم',
        category: 'أدوية',
        description: 'مميع للدم ومسكن للألم',
        price: 12.00,
        imageUrl: 'assets/images/products/aspirin.jpg',
        sellerName: 'صيدلية النهضة',
        sellerType: 'pharmacy'
      },
      {
        id: 4,
        name: 'كريم ترطيب البشرة',
        category: 'العناية',
        description: 'كريم مرطب للبشرة الجافة',
        price: 35.00,
        imageUrl: 'assets/images/products/moisturizer.jpg',
        sellerName: 'RxClose',
        sellerType: 'rxclose'
      },
      {
        id: 5,
        name: 'شامبو طبي',
        category: 'العناية',
        description: 'شامبو طبي للقشرة',
        price: 55.00,
        imageUrl: 'assets/images/products/shampoo.jpg',
        sellerName: 'صيدلية الشفاء',
        sellerType: 'pharmacy'
      }
    ];

    // Filter mock products by search term
    this.searchResults = mockProducts.filter((product: Product) => 
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.description?.toLowerCase().includes(term.toLowerCase()) ||
      product.category?.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);

    console.log('Mock search results:', this.searchResults);
    this.isSearching = false;
  }

  private mapProduct(apiProduct: any): Product {
    // Handle different API response formats
    const product = {
      id: apiProduct.id || apiProduct.productId || apiProduct.medicineId || Math.random(),
      name: apiProduct.name || 
            apiProduct.productName || 
            apiProduct.medicineName || 
            apiProduct.title || 
            'منتج غير محدد',
      category: apiProduct.category || 
                apiProduct.categoryName || 
                apiProduct.type || 
                'غير محدد',
      description: apiProduct.description || 
                   apiProduct.productDescription || 
                   apiProduct.details || 
                   apiProduct.summary || 
                   '',
      price: Number(apiProduct.price || 
                    apiProduct.productPrice || 
                    apiProduct.cost || 
                    apiProduct.salePrice || 
                    0),
      stock: Number(apiProduct.stock || 
                    apiProduct.quantity || 
                    apiProduct.availableQuantity || 
                    0),
      imageUrl: apiProduct.image || 
                apiProduct.imageUrl || 
                apiProduct.picture || 
                apiProduct.photo || 
                'assets/images/placeholder.jpg',
      sellerType: apiProduct.sellerType || 
                  (apiProduct.pharmacyId ? 'pharmacy' : 'rxclose'),
      sellerName: apiProduct.pharmacy?.name || 
                  apiProduct.pharmacyName || 
                  apiProduct.sellerName || 
                  apiProduct.storeName || 
                  (apiProduct.pharmacyId ? 'صيدلية' : 'RxClose'),
      pharmacyId: apiProduct.pharmacyId || apiProduct.storeId,
      pharmacyName: apiProduct.pharmacyName || apiProduct.storeName,
      prescription: Boolean(apiProduct.prescription || 
                           apiProduct.requiresPrescription || 
                           apiProduct.prescriptionRequired),
      distance: apiProduct.distance || apiProduct.distanceKm || undefined
    };

    console.log('Mapped product:', product);
    return product;
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.isSearching = false;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  viewProductDetails(product: Product) {
    this.router.navigate([`/auth/product-details/${product.id}`]);
    this.clearSearch();
  }

  addToCart(product: Product) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      pharmacyName: product.sellerName || product.pharmacyName,
      pharmacyId: product.pharmacyId
    };

    console.log('Adding to cart:', cartItem);
    this.cartService.addToCart(cartItem);
    
    // Show success message
    alert('تم إضافة المنتج إلى العربة بنجاح!');
  }

  logout() {
    // Add logout logic here
    console.log('Logging out...');
    this.router.navigate(['/auth/login']);
  }
} 