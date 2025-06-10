import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CartService } from '../../services/cart.service';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  sellerType: 'pharmacy' | 'rxclose';
  sellerName?: string;
  pharmacyId?: number;
  pharmacyName?: string;
  prescription?: boolean;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  productsCount?: number;
}

interface SearchFilters {
  category: string;
  priceRange: { min: number; max: number };
  sellerType: string;
  prescriptionRequired: boolean | null;
  availability: string;
  sortBy: string;
  maxDistance?: number;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatWidgetComponent, NavbarComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Product[] = [];
  nearbyPharmacies: Pharmacy[] = [];
  loading: boolean = false;
  error: string | null = null;
  noResults: boolean = false;
  userLocation: { latitude: number; longitude: number } | null = null;
  
  // UI State
  showFilters: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  showBackToTop: boolean = false;
  cartItemCount: number = 0;
  
  // Filters
  filters: SearchFilters = {
    category: '',
    priceRange: { min: 0, max: 1000 },
    sellerType: '',
    prescriptionRequired: null,
    availability: 'all',
    sortBy: 'relevance',
    maxDistance: undefined
  };

  // Quick Categories for Hero Section
  quickCategories = [
    { value: 'prescription', label: 'أدوية بروشتة', icon: 'fas fa-prescription' },
    { value: 'otc', label: 'بدون روشتة', icon: 'fas fa-pills' },
    { value: 'vitamins-supplements', label: 'فيتامينات', icon: 'fas fa-leaf' },
    { value: 'baby-care', label: 'منتجات الأطفال', icon: 'fas fa-baby' },
    { value: 'medical-supplies', label: 'مستلزمات طبية', icon: 'fas fa-stethoscope' }
  ];

  // Categories with display names
  categories = [
    { value: '', label: 'جميع الفئات' },
    { value: 'prescription', label: 'أدوية بروشتة' },
    { value: 'otc', label: 'أدوية بدون روشتة' },
    { value: 'medical-supplies', label: 'مستلزمات طبية' },
    { value: 'vitamins-supplements', label: 'فيتامينات ومكملات' },
    { value: 'baby-care', label: 'منتجات الأطفال' },
    { value: 'personal-care', label: 'العناية الشخصية' },
    { value: 'beauty-cosmetics', label: 'تجميل ومكياج' },
    { value: 'first-aid', label: 'إسعافات أولية' },
    { value: 'medical-devices', label: 'أجهزة طبية' },
    { value: 'herbal-natural', label: 'أعشاب طبيعية' },
    { value: 'diabetic-care', label: 'رعاية مرضى السكري' },
    { value: 'dental-care', label: 'العناية بالأسنان' },
    { value: 'eye-ear-care', label: 'العناية بالعين والأذن' },
    { value: 'respiratory-care', label: 'أمراض الجهاز التنفسي' },
    { value: 'weight-management', label: 'إدارة الوزن' },
    { value: 'sports-nutrition', label: 'التغذية الرياضية' },
    { value: 'elderly-care', label: 'رعاية كبار السن' },
    { value: 'women-health', label: 'صحة المرأة' },
    { value: 'men-health', label: 'صحة الرجل' },
    { value: 'sexual-health', label: 'الصحة الجنسية' },
    { value: 'homeopathy', label: 'المثلية' },
    { value: 'orthopedic', label: 'العظام والمفاصل' }
  ];

  sortOptions = [
    { value: 'relevance', label: 'الأكثر صلة' },
    { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
    { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
    { value: 'distance', label: 'الأقرب أولاً' },
    { value: 'name', label: 'الاسم أ-ي' },
    { value: 'stock', label: 'الأكثر توفراً' }
  ];

  // Search suggestions for no results
  searchSuggestions = [
    'باراسيتامول', 'إيبوبروفين', 'أسبرين', 'فيتامين د', 'أوميجا 3',
    'مضاد حيوي', 'كريم مرطب', 'شراب كحة', 'قطرة عين', 'مسكن ألم'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.getUserLocation();
    this.updateCartCount();
    this.setupScrollListener();
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'];
      }
      if (params['search']) {
        this.searchQuery = params['search'];
        this.searchProducts();
      } else {
        this.loadAllProducts();
      }
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('User location obtained:', this.userLocation);
          this.loadNearbyPharmacies();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (Cairo, Egypt)
          this.userLocation = {
            latitude: 30.0444,
            longitude: 31.2357
          };
          this.loadNearbyPharmacies();
        }
      );
    } else {
      console.log('Geolocation is not supported');
      this.userLocation = {
        latitude: 30.0444,
        longitude: 31.2357
      };
      this.loadNearbyPharmacies();
    }
  }

  loadNearbyPharmacies() {
    // Mock pharmacy data with locations in Cairo
    this.nearbyPharmacies = [
      {
        id: 1,
        name: 'صيدلية النور',
        address: 'وسط البلد، القاهرة',
        phone: '+20 123 456 789',
        latitude: 30.0626,
        longitude: 31.2497,
        productsCount: 1250
      },
      {
        id: 2,
        name: 'صيدلية المدينة',
        address: 'الزمالك، القاهرة',
        phone: '+20 123 456 790',
        latitude: 30.0444,
        longitude: 31.2357,
        productsCount: 980
      },
      {
        id: 3,
        name: 'صيدلية الصحة بلس',
        address: 'مصر الجديدة، القاهرة',
        phone: '+20 123 456 791',
        latitude: 30.0875,
        longitude: 31.3256,
        productsCount: 1100
      },
      {
        id: 4,
        name: 'صيدلية الشفاء',
        address: 'المعادي، القاهرة',
        phone: '+20 123 456 792',
        latitude: 29.9602,
        longitude: 31.2569,
        productsCount: 850
      },
      {
        id: 5,
        name: 'صيدلية الهرم',
        address: 'الهرم، الجيزة',
        phone: '+20 123 456 793',
        latitude: 29.9792,
        longitude: 31.1342,
        productsCount: 750
      }
    ];

    if (this.userLocation) {
      this.calculatePharmacyDistances();
    }
  }

  calculatePharmacyDistances() {
    if (!this.userLocation) return;

    this.nearbyPharmacies = this.nearbyPharmacies.map(pharmacy => ({
      ...pharmacy,
      distance: this.calculateDistance(
        this.userLocation!.latitude,
        this.userLocation!.longitude,
        pharmacy.latitude,
        pharmacy.longitude
      )
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  loadAllProducts() {
    this.loading = true;
    this.error = null;
    
    // First try to load from AdminService (real database)
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        console.log('Products loaded from database:', products);
        this.searchResults = products.map(product => this.mapProduct(product));
        this.calculateProductDistances();
        this.applyFilters();
        this.loading = false;
        this.noResults = this.searchResults.length === 0;
      },
      error: (error) => {
        console.error('Error loading products from database:', error);
        // Fallback to sample data
        this.loadSampleProducts();
      }
    });
  }

  searchProducts() {
    if (!this.searchQuery.trim() && !this.filters.category) {
      this.loadAllProducts();
      return;
    }

    this.loading = true;
    this.error = null;
    this.noResults = false;

    // Try to load from AdminService first
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        console.log('Search - Products from database:', products);
        let filteredProducts = products.map(product => this.mapProduct(product));
        
        // Apply text search
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase().trim();
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.sellerName && product.sellerName.toLowerCase().includes(query))
          );
        }
        
        this.searchResults = filteredProducts;
        this.calculateProductDistances();
        this.applyFilters();
        this.loading = false;
        this.noResults = this.searchResults.length === 0;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        // Fallback to sample data
        this.loadSampleProducts();
      }
    });
  }

  private mapProduct(product: any): Product {
    // Map pharmacy coordinates for distance calculation
    const pharmacyCoords = this.getPharmacyCoordinates(product.pharmacyId);
    
    return {
      id: product.id,
      name: product.name,
      category: product.category || 'otc',
      description: product.description || 'دواء عالي الجودة',
      price: product.price || 50,
      stock: product.stock || 10,
      imageUrl: product.imageUrl || 'assets/images/default-medicine.png',
      sellerType: product.sellerType || 'pharmacy',
      sellerName: product.sellerName || product.pharmacyName,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName,
      prescription: product.prescription || false,
      latitude: pharmacyCoords?.latitude,
      longitude: pharmacyCoords?.longitude
    };
  }

  private getPharmacyCoordinates(pharmacyId?: number) {
    if (!pharmacyId) return null;
    const pharmacy = this.nearbyPharmacies.find(p => p.id === pharmacyId);
    return pharmacy ? { latitude: pharmacy.latitude, longitude: pharmacy.longitude } : null;
  }

  private calculateProductDistances() {
    if (!this.userLocation) return;

    this.searchResults = this.searchResults.map(product => {
      if (product.latitude && product.longitude) {
        product.distance = this.calculateDistance(
          this.userLocation!.latitude,
          this.userLocation!.longitude,
          product.latitude,
          product.longitude
        );
      }
      return product;
    });
  }

  loadSampleProducts() {
    console.log('Loading sample products...');
    
    const sampleProducts: Product[] = [
          {
            id: 1,
        name: 'باراسيتامول 500 مجم',
        category: 'otc',
        description: 'مسكن للألم وخافض للحرارة',
        price: 25.50,
        stock: 150,
        imageUrl: 'assets/images/d15d6b380ee108fb61242f02418115f9.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية النور',
        pharmacyId: 1,
        prescription: false,
        latitude: 30.0626,
        longitude: 31.2497
          },
          {
            id: 2,
        name: 'فيتامين د3 1000 وحدة',
        category: 'vitamins-supplements',
        description: 'مكمل غذائي لتقوية العظام',
        price: 45.00,
        stock: 80,
        imageUrl: 'assets/images/f125ef9e5c913c92132edd4aa8e3875d.jpeg',
        sellerType: 'rxclose',
        sellerName: 'RxClose',
        prescription: false,
        latitude: 30.0444,
        longitude: 31.2357
      },
      {
        id: 3,
        name: 'أموكسيسيللين 500 مجم',
        category: 'prescription',
        description: 'مضاد حيوي واسع المجال',
        price: 85.00,
        stock: 25,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية المدينة',
        pharmacyId: 2,
        prescription: true,
        latitude: 30.0444,
        longitude: 31.2357
      },
      {
        id: 4,
        name: 'كريم بيتادين',
        category: 'first-aid',
        description: 'مطهر للجروح والعدوى',
        price: 32.00,
        stock: 60,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الصحة بلس',
        pharmacyId: 3,
        prescription: false,
        latitude: 30.0875,
        longitude: 31.3256
      },
      {
        id: 5,
        name: 'شراب فنتولين للربو',
        category: 'respiratory-care',
        description: 'موسع للشعب الهوائية',
        price: 95.00,
        stock: 15,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الشفاء',
        pharmacyId: 4,
        prescription: true,
        latitude: 29.9602,
        longitude: 31.2569
      },
      {
        id: 6,
        name: 'كريم للأطفال جونسون',
        category: 'baby-care',
        description: 'كريم مرطب لبشرة الأطفال',
        price: 28.00,
        stock: 120,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الهرم',
        pharmacyId: 5,
        prescription: false,
        latitude: 29.9792,
        longitude: 31.1342
      },
      {
        id: 7,
        name: 'حبوب منع الحمل ياسمين',
        category: 'women-health',
        description: 'وسيلة منع حمل هرمونية',
        price: 120.00,
        stock: 40,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية النور',
        pharmacyId: 1,
        prescription: true,
        latitude: 30.0626,
        longitude: 31.2497
      },
      {
        id: 8,
        name: 'جهاز قياس السكر',
        category: 'medical-devices',
        description: 'جهاز رقمي لقياس مستوى السكر',
        price: 350.00,
        stock: 8,
        imageUrl: 'assets/images/d97659eb371495c0c491f9fa51ae2a48.jpeg',
        sellerType: 'rxclose',
        sellerName: 'RxClose',
        prescription: false,
        latitude: 30.0444,
        longitude: 31.2357
      },
      {
        id: 9,
        name: 'أوميجا 3 بلس',
        category: 'vitamins-supplements',
        description: 'مكمل غذائي للقلب والدماغ',
        price: 180.00,
        stock: 55,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية المدينة',
        pharmacyId: 2,
        prescription: false,
        latitude: 30.0444,
        longitude: 31.2357
      },
      {
        id: 10,
        name: 'إيبوبروفين 400 مجم',
        category: 'otc',
        description: 'مضاد للالتهابات ومسكن للألم',
        price: 18.00,
        stock: 0,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الصحة بلس',
        pharmacyId: 3,
        prescription: false,
        latitude: 30.0875,
        longitude: 31.3256
      },
      {
        id: 11,
        name: 'شامبو نيزورال ضد القشرة',
        category: 'personal-care',
        description: 'شامبو طبي لعلاج قشرة الشعر',
        price: 75.00,
        stock: 35,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الشفاء',
        pharmacyId: 4,
        prescription: false,
        latitude: 29.9602,
        longitude: 31.2569
      },
      {
        id: 12,
        name: 'أقراص الكالسيوم والمغنيسيوم',
        category: 'vitamins-supplements',
        description: 'مكمل غذائي للعظام والعضلات',
        price: 65.00,
        stock: 90,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية الهرم',
        pharmacyId: 5,
        prescription: false,
        latitude: 29.9792,
        longitude: 31.1342
      },
      {
        id: 13,
        name: 'لانسوبرازول لعلاج الحموضة',
        category: 'prescription',
        description: 'دواء لعلاج قرحة المعدة والحموضة',
        price: 42.00,
        stock: 3,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية النور',
        pharmacyId: 1,
        prescription: true,
        latitude: 30.0626,
        longitude: 31.2497
      },
      {
        id: 14,
        name: 'كريم واقي من الشمس SPF 50',
        category: 'beauty-cosmetics',
        description: 'حماية فائقة من أشعة الشمس',
        price: 95.00,
        stock: 45,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'rxclose',
        sellerName: 'RxClose',
        prescription: false,
        latitude: 30.0444,
        longitude: 31.2357
      },
      {
        id: 15,
        name: 'شرائط اختبار الحمل',
        category: 'women-health',
        description: 'اختبار حمل منزلي دقيق',
        price: 25.00,
        stock: 75,
        imageUrl: 'assets/images/default-medicine.png',
        sellerType: 'pharmacy',
        sellerName: 'صيدلية المدينة',
        pharmacyId: 2,
        prescription: false,
        latitude: 30.0444,
        longitude: 31.2357
      }
    ];

    this.searchResults = sampleProducts;
    this.calculateProductDistances();
    this.applyFilters();
    this.loading = false;
    this.noResults = this.searchResults.length === 0;
  }

  // New methods for enhanced functionality
  onSearchInput() {
    // Implement real-time search suggestions here
    if (this.searchQuery.length > 2) {
      // Could add debounced search suggestions
    }
  }

  selectQuickCategory(category: string) {
    this.filters.category = category;
    this.applyFilters();
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filters.category) count++;
    if (this.filters.sellerType) count++;
    if (this.filters.prescriptionRequired !== null) count++;
    if (this.filters.availability !== 'all') count++;
    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 1000) count++;
    if (this.filters.maxDistance) count++;
    return count;
  }

  applyFilters() {
    let filtered = [...this.searchResults];
    
    // Category filter
    if (this.filters.category) {
      filtered = filtered.filter(product => product.category === this.filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= this.filters.priceRange.min && 
      product.price <= this.filters.priceRange.max
    );

    // Seller type filter
    if (this.filters.sellerType) {
      filtered = filtered.filter(product => product.sellerType === this.filters.sellerType);
    }

    // Prescription filter
    if (this.filters.prescriptionRequired !== null) {
      filtered = filtered.filter(product => !!product.prescription === this.filters.prescriptionRequired);
    }

    // Availability filter
    if (this.filters.availability === 'in-stock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (this.filters.availability === 'low-stock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock < 10);
    } else if (this.filters.availability === 'out-of-stock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Distance filter
    if (this.filters.maxDistance && this.userLocation) {
      filtered = filtered.filter(product => 
        !product.distance || product.distance <= this.filters.maxDistance!
      );
    }

    // Apply sorting and update results
    this.searchResults = this.applySorting(filtered);
    this.noResults = this.searchResults.length === 0;
  }

  applySorting(products: Product[]) {
    switch (this.filters.sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'distance':
        return products.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'stock':
        return products.sort((a, b) => b.stock - a.stock);
      default:
        return products;
    }
  }

  // UI Helper methods
  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'fas fa-times-circle';
    if (stock < 10) return 'fas fa-exclamation-triangle';
    return 'fas fa-check-circle';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'غير متوفر';
    if (stock < 10) return `${stock} قطعة متبقية`;
    return `متوفر (${stock})`;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-medicine.png';
  }

  searchSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.searchProducts();
  }

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.showBackToTop = window.pageYOffset > 400;
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.filters = {
      category: '',
      priceRange: { min: 0, max: 1000 },
      sellerType: '',
      prescriptionRequired: null,
      availability: 'all',
      sortBy: 'relevance',
      maxDistance: undefined
    };
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  addToCart(product: Product) {
    if (product.stock === 0) return;
    
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      pharmacyId: product.pharmacyId || 1,
      pharmacyName: product.sellerName || 'صيدلية عامة',
      quantity: 1
    });
    
    this.updateCartCount();
    console.log('Product added to cart:', product.name);
  }

  updateCartCount() {
    const summary = this.cartService.getCartSummary();
    this.cartItemCount = summary.totalItems;
  }

  viewProductDetails(product: Product) {
    this.router.navigate(['/auth/product-details', product.id]);
  }

  navigateToPharmacy(pharmacy: Pharmacy) {
    console.log('Navigate to pharmacy:', pharmacy.name);
  }

  getDirections(pharmacy: Pharmacy) {
    if (this.userLocation) {
      const url = `https://www.google.com/maps/dir/${this.userLocation.latitude},${this.userLocation.longitude}/${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    }
  }

  callPharmacy(phone: string) {
    window.open(`tel:${phone}`, '_self');
  }

  getCategoryDisplay(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.loadAllProducts();
  }

  goBack() {
    this.router.navigate(['/home']);
  }
} 