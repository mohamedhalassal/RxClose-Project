import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';
import { AdminService } from '../../services/admin.service';
import { CartService } from '../../services/cart.service';
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
  distance?: number; // Distance in km from user location
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, ChatWidgetComponent, FormsModule, NavbarComponent]
})
export class HomeComponent implements OnInit {
  searchTerm: string = '';
  isSearching: boolean = false;
  searchResults: Product[] = [];
  featuredProducts: Product[] = [];
  topCategories = [
    {
      name: 'Prescription Drugs',
      value: 'prescription',
      image: 'assets/images/d205cd3e3164b8fad6636b79fd2e3e8e.png',
      description: 'Prescription medicines from licensed pharmacies'
    },
    {
      name: 'Over-the-Counter',
      value: 'otc',
      image: 'assets/images/be0033d7f0714fd42134988b00eee18c.png',
      description: 'Non-prescription medications and supplements'
    },
    {
      name: 'Medical Supplies',
      value: 'medical-supplies',
      image: 'assets/images/3a17d146b30dd27b909820717bf6c6ba.png',
      description: 'Medical equipment and healthcare supplies'
    },
    {
      name: 'Vitamins & Supplements',
      value: 'vitamins-supplements',
      image: 'assets/images/73daf744d18f9948dcf5d4a9bc3d5c69.png',
      description: 'Nutritional supplements and vitamins'
    },
    {
      name: 'Baby Care',
      value: 'baby-care',
      image: 'assets/images/aa74ea5e34ecf86bab83b20b2442c1c3.png',
      description: 'Baby health and care products'
    }
  ];

  userLocation: { latitude: number; longitude: number } | null = null;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.getUserLocation();
    this.loadFeaturedProducts();
    this.updateCartCount();
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
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (Cairo, Egypt)
          this.userLocation = {
            latitude: 30.0444,
            longitude: 31.2357
          };
        }
      );
    } else {
      console.log('Geolocation is not supported');
      // Set default location
      this.userLocation = {
        latitude: 30.0444,
        longitude: 31.2357
      };
    }
  }

  loadFeaturedProducts() {
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        this.featuredProducts = products.slice(0, 6).map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl || 'assets/images/hero-image.jpeg',
          sellerType: product.sellerType || 'pharmacy',
          sellerName: product.sellerName,
          pharmacyId: product.pharmacyId,
          pharmacyName: product.pharmacyName,
          prescription: product.prescription
        }));
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadSampleFeaturedProducts();
      }
    });
  }

  loadSampleFeaturedProducts() {
    this.featuredProducts = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        category: 'otc',
        description: 'Pain relief medication',
        price: 25.50,
        stock: 150,
        imageUrl: 'assets/images/d15d6b380ee108fb61242f02418115f9.png',
        sellerType: 'pharmacy',
        sellerName: 'Al Noor Pharmacy',
        pharmacyId: 1
      },
      {
        id: 2,
        name: 'Vitamin D3',
        category: 'vitamins-supplements',
        description: 'Daily vitamin supplement',
        price: 45.00,
        stock: 80,
        imageUrl: 'assets/images/f125ef9e5c913c92132edd4aa8e3875d.jpeg',
        sellerType: 'rxclose',
        sellerName: 'RxClose'
      },
      {
        id: 3,
        name: 'Digital Thermometer',
        category: 'medical-supplies',
        description: 'Accurate temperature measurement',
        price: 85.00,
        stock: 25,
        imageUrl: 'assets/images/d97659eb371495c0c491f9fa51ae2a48.jpeg',
        sellerType: 'pharmacy',
        sellerName: 'City Pharmacy',
        pharmacyId: 2
      }
    ];
  }

  searchProducts() {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        this.searchResults = products
          .filter(product => 
            product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
          .slice(0, 5)
          .map(product => this.mapProduct(product));
        
        if (this.userLocation) {
          this.calculateDistances(this.searchResults);
        }
        
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  private mapProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || 'assets/images/hero-image.jpeg',
      sellerType: product.sellerType || 'pharmacy',
      sellerName: product.sellerName,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName,
      prescription: product.prescription
    };
  }

  private calculateDistances(products: Product[]) {
    // Mock pharmacy locations - in real app, get from pharmacy service
    const pharmacyLocations: { [key: number]: { lat: number; lng: number } } = {
      1: { lat: 30.0626, lng: 31.2497 }, // Al Noor Pharmacy
      2: { lat: 30.0444, lng: 31.2357 }, // City Pharmacy
      3: { lat: 30.0875, lng: 31.3256 }  // Another pharmacy
    };

    products.forEach(product => {
      if (product.pharmacyId && pharmacyLocations[product.pharmacyId] && this.userLocation) {
        const pharmacyLocation = pharmacyLocations[product.pharmacyId];
        product.distance = this.calculateDistance(
          this.userLocation.latitude,
          this.userLocation.longitude,
          pharmacyLocation.lat,
          pharmacyLocation.lng
        );
      }
    });

    // Sort by distance
    products.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  addToCart(product: Product) {
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

  updateCartCount() {
    this.cartItemCount = this.cartService.getCartItemCount();
  }

  navigateToCategory(categoryValue: string) {
    this.router.navigate(['/auth/search'], { 
      queryParams: { category: categoryValue } 
    });
  }

  viewProductDetails(product: Product) {
    this.router.navigate(['/auth/product-details'], {
      queryParams: { id: product.id }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
