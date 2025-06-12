import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CartService } from '../../services/cart.service';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { MapService } from '../../services/map.service';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from '../../shared/components/map/map.component';

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
  imports: [CommonModule, FormsModule, ChatWidgetComponent, NavbarComponent, MapComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="search-container">
      <!-- Search Header -->
      <div class="search-header">
        <h1>
          <i class="fas fa-search"></i>
          Smart Medicine Search
        </h1>
        <p>Find medicines near you with location-based search</p>
      </div>

      <!-- Search Form -->
      <div class="search-form-card">
        <div class="search-form">
          <div class="search-input-group">
            <div class="input-wrapper">
              <i class="fas fa-pills"></i>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Search for medicines..."
                class="search-input"
                (keyup.enter)="performSearch()"
                (input)="onSearchInput()">
              <button 
                *ngIf="searchQuery" 
                (click)="clearSearch()" 
                class="clear-btn"
                title="Clear search">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button 
              (click)="performSearch()" 
              [disabled]="isSearching"
              class="search-btn">
              <i class="fas fa-search"></i>
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
          </div>

          <!-- Search Options -->
          <div class="search-options">
            <div class="option-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="useLocationSearch">
                <span class="checkmark"></span>
                Use location-based search
              </label>
            </div>

            <div class="option-group" *ngIf="useLocationSearch">
              <label for="maxDistance">Search radius:</label>
              <select [(ngModel)]="maxDistance" id="maxDistance" class="distance-select">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- User Location Section -->
      <div class="location-section" *ngIf="useLocationSearch">
        <h3>
          <i class="fas fa-map-marker-alt"></i>
          Your Location
        </h3>
        <p *ngIf="!userLocation">Please set your location to enable location-based search</p>
        
        <div class="location-info" *ngIf="userLocation">
          <p>
            <strong>Current Location:</strong> 
            {{ userLocation.latitude | number:'1.6-6' }}, {{ userLocation.longitude | number:'1.6-6' }}
          </p>
          <button (click)="getCurrentLocation()" class="btn secondary">
            <i class="fas fa-crosshairs"></i>
            Update Location
          </button>
        </div>

        <app-map
          title="Set Your Location for Search"
          subtitle="Click on the map to set your current location"
          [initialLatitude]="userLocation?.latitude"
          [initialLongitude]="userLocation?.longitude"
          (locationSelected)="onLocationSelected($event)"
          [height]="'300px'">
        </app-map>
      </div>

      <!-- Search Results -->
      <div class="results-section" *ngIf="searchResults.length > 0 || hasSearched || isInitialLoad">
        <div class="results-header">
          <h3>
            <i class="fas fa-list"></i>
            <span *ngIf="!hasSearched && !isInitialLoad">All Medicines</span>
            <span *ngIf="hasSearched">Search Results</span>
            <span *ngIf="isInitialLoad">Loading Medicines...</span>
            <span class="results-count" *ngIf="searchResults.length > 0 && !isInitialLoad">
              ({{ searchResults.length }} found)
            </span>
          </h3>
          <div class="search-info" *ngIf="useLocationSearch && userLocation && hasSearched">
            <i class="fas fa-location-arrow"></i>
            Showing results within {{ maxDistance }}km
          </div>
          <div class="search-info" *ngIf="!hasSearched && !isInitialLoad">
            <i class="fas fa-pills"></i>
            Browse all available medicines or use search to find specific products
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isSearching">
          <div class="loading-icon">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h4>Searching medicines...</h4>
          <p *ngIf="useLocationSearch">Finding nearest pharmacies with your requested medicine</p>
          <p *ngIf="!useLocationSearch">Searching through all available medicines</p>
        </div>

        <div class="no-results" *ngIf="hasSearched && searchResults.length === 0 && !isSearching">
          <div class="no-results-icon">
            <i class="fas fa-search-minus"></i>
          </div>
          <h4>No medicines found</h4>
          <p *ngIf="useLocationSearch">Try adjusting your search terms or increasing the search radius.</p>
          <p *ngIf="!useLocationSearch">Try adjusting your search terms or check the spelling.</p>
        </div>

        <div class="results-grid" *ngIf="searchResults.length > 0">
          <div class="result-card" *ngFor="let result of searchResults">
            <div class="result-header">
              <h4>{{ result.name }}</h4>
              <div class="price">{{ result.price | currency:'EGP':'symbol':'1.2-2' }}</div>
            </div>
            
            <div class="result-info">
              <p class="description">{{ result.description }}</p>
              <div class="result-details">
                <span class="category">
                  <i class="fas fa-tag"></i>
                  {{ result.category }}
                </span>
                <span class="stock" [class.low-stock]="result.stock < 10">
                  <i class="fas fa-boxes"></i>
                  {{ result.stock }} in stock
                </span>
                <span class="prescription" *ngIf="result.prescription">
                  <i class="fas fa-prescription"></i>
                  Prescription Required
                </span>
              </div>
            </div>

            <div class="pharmacy-info">
              <div class="pharmacy-details">
                <h5>
                  <i class="fas fa-store"></i>
                  {{ result.pharmacyName || result.sellerName }}
                </h5>
                <p *ngIf="result.pharmacyAddress" class="address">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ result.pharmacyAddress }}
                </p>
                <p *ngIf="result.pharmacyPhone" class="phone">
                  <i class="fas fa-phone"></i>
                  {{ result.pharmacyPhone }}
                </p>
              </div>
              
              <div class="distance-info" *ngIf="result.distance !== undefined">
                <div class="distance-badge" [class]="getDistanceClass(result.distance)">
                  <i class="fas fa-route"></i>
                  {{ result.distanceText }}
                </div>
              </div>
            </div>

            <div class="result-actions">
              <button class="btn primary" (click)="addToCart(result)">
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
              </button>
              <button class="btn secondary" (click)="viewDetails(result)">
                <i class="fas fa-info-circle"></i>
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem 1rem;
    }

    .search-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .search-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .search-header p {
      font-size: 1.1rem;
      color: #7f8c8d;
    }

    .search-form-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .search-input-group {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .input-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper i {
      position: absolute;
      left: 1rem;
      color: #7f8c8d;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 1rem 3rem 1rem 3rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .clear-btn {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;
      z-index: 2;
    }

    .clear-btn:hover {
      background: #f8f9fa;
      color: #dc3545;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .search-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-options {
      display: flex;
      gap: 2rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .option-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }

    .distance-select {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .location-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .location-section h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .location-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .results-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .results-header h3 {
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .results-count {
      color: #667eea;
      font-weight: normal;
    }

    .search-info {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      color: #6c757d;
    }

    .loading-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #007bff;
    }

    .loading-icon i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .no-results-icon {
      font-size: 3rem;
      color: #bdc3c7;
      margin-bottom: 1rem;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .result-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .result-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .result-header h4 {
      color: #2c3e50;
      margin: 0;
      flex: 1;
    }

    .price {
      font-size: 1.25rem;
      font-weight: bold;
      color: #27ae60;
    }

    .description {
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .result-details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .result-details span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: #f8f9fa;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #495057;
    }

    .low-stock {
      background: #fff5f5 !important;
      color: #e53e3e !important;
    }

    .prescription {
      background: #fef5e7 !important;
      color: #dd6b20 !important;
    }

    .pharmacy-info {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .pharmacy-details h5 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
    }

    .pharmacy-details p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .distance-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-align: center;
    }

    .distance-badge.very-close {
      background: #d4edda;
      color: #155724;
    }

    .distance-badge.close {
      background: #fff3cd;
      color: #856404;
    }

    .distance-badge.far {
      background: #f8d7da;
      color: #721c24;
    }

    .result-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn.secondary {
      background: #e9ecef;
      color: #495057;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .search-container {
        padding: 1rem;
      }

      .search-input-group {
        flex-direction: column;
      }

      .search-options {
        flex-direction: column;
        align-items: flex-start;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .result-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  useLocationSearch: boolean = false;
  maxDistance: number = 25;
  userLocation?: {latitude: number, longitude: number};
  searchResults: any[] = [];
  allProducts: any[] = [];
  isSearching: boolean = false;
  hasSearched: boolean = false;
  isInitialLoad: boolean = true;

  constructor(
    private productService: ProductService,
    private mapService: MapService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCurrentLocation();
    this.loadAllProducts();
  }

  loadAllProducts() {
    this.isSearching = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products.map(product => ({
          ...product,
          pharmacyName: product.sellerName,
          distanceText: 'Location not specified'
        }));
        this.searchResults = [...this.allProducts];
        this.isSearching = false;
        this.isInitialLoad = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isSearching = false;
        this.isInitialLoad = false;
      }
    });
  }

  async getCurrentLocation() {
    try {
      this.userLocation = await this.mapService.getCurrentLocation();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  onLocationSelected(location: {latitude: number, longitude: number}) {
    this.userLocation = location;
  }

  onSearchInput() {
    // Auto search as user types if enabled
    if (!this.searchQuery.trim()) {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [...this.allProducts];
    this.hasSearched = false;
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [...this.allProducts];
      this.hasSearched = false;
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    if (this.useLocationSearch && this.userLocation) {
      this.productService.searchNearbyProducts(
        this.searchQuery,
        this.userLocation.latitude,
        this.userLocation.longitude,
        this.maxDistance
      ).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults = [];
          this.isSearching = false;
        }
      });
    } else {
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (results) => {
          this.searchResults = results.map(product => ({
            ...product,
            pharmacyName: product.sellerName,
            distanceText: 'Location not specified'
          }));
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults = [];
          this.isSearching = false;
        }
      });
    }
  }

  addToCart(product: any) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      pharmacyId: product.pharmacyId,
      pharmacyName: product.pharmacyName || product.sellerName,
      quantity: 1,
      maxQuantity: product.stock
    });
    
    // Show success message or notification here
    console.log('Product added to cart:', product.name);
  }

  viewDetails(product: any) {
    this.router.navigate(['/auth/product-details', product.id]);
  }

  getDistanceClass(distance: number): string {
    if (distance <= 5) return 'very-close';
    if (distance <= 15) return 'close';
    return 'far';
  }
} 