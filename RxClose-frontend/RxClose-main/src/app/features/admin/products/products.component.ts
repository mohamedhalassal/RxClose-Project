import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  imageUrl: string;
  createdAt: string;
  prescription: boolean;
  
  // Seller information
  sellerType: 'pharmacy' | 'rxclose';
  sellerName?: string;
  pharmacyId?: number | null;
  pharmacyName?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-container">
      <!-- Header Section -->
      <div class="products-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-pills"></i>
              معرض المنتجات العالمي
            </h1>
            <p class="page-subtitle">إدارة كل المنتجات عبر المنصة</p>
          </div>
          <div class="header-actions">
            <button class="action-btn primary" (click)="showAddProductModal()">
              <i class="fas fa-plus"></i>
              Add New Product
            </button>
            <button class="action-btn export" (click)="exportProducts()">
              <i class="fas fa-download"></i>
              Export Catalog
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button class="btn primary" (click)="loadProducts()">Try Again</button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && !error">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="fas fa-pills"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalProducts() }}</div>
              <div class="stat-label">Total Products</div>
            </div>
          </div>
          
          <div class="stat-card active">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getActiveProducts() }}</div>
              <div class="stat-label">Active Products</div>
            </div>
          </div>
          
          <div class="stat-card categories">
            <div class="stat-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getUniqueCategories() }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
          
          <div class="stat-card value">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalValue() | currency:'EGP':'symbol':'1.0-0' }}</div>
              <div class="stat-label">Total Value</div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" 
                   [(ngModel)]="searchTerm" 
                   (input)="filterProducts()" 
                   placeholder="Search products...">
          </div>
          
          <div class="filter-controls">
            <select [(ngModel)]="categoryFilter" (change)="filterProducts()" class="filter-select">
              <option value="">All Categories</option>
              <option value="prescription">Prescription Drugs</option>
              <option value="otc">Over-the-Counter (OTC)</option>
              <option value="medical-supplies">Medical Supplies</option>
              <option value="vitamins-supplements">Vitamins & Supplements</option>
              <option value="baby-care">Baby Care</option>
              <option value="personal-care">Personal Care</option>
              <option value="beauty-cosmetics">Beauty & Cosmetics</option>
              <option value="first-aid">First Aid</option>
              <option value="medical-devices">Medical Devices</option>
              <option value="herbal-natural">Herbal & Natural</option>
              <option value="diabetic-care">Diabetic Care</option>
              <option value="dental-care">Dental Care</option>
              <option value="eye-ear-care">Eye & Ear Care</option>
              <option value="respiratory-care">Respiratory Care</option>
              <option value="weight-management">Weight Management</option>
              <option value="sports-nutrition">Sports & Nutrition</option>
              <option value="elderly-care">Elderly Care</option>
              <option value="women-health">Women's Health</option>
              <option value="men-health">Men's Health</option>
              <option value="sexual-health">Sexual Health</option>
              <option value="homeopathy">Homeopathy</option>
              <option value="orthopedic">Orthopedic Supplies</option>
            </select>
            
            <select [(ngModel)]="statusFilter" (change)="filterProducts()" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select [(ngModel)]="prescriptionFilter" (change)="filterProducts()" class="filter-select">
              <option value="">All Types</option>
              <option value="true">Prescription Only</option>
              <option value="false">Over the Counter</option>
            </select>
            
            <select [(ngModel)]="sellerTypeFilter" (change)="filterProducts()" class="filter-select">
              <option value="">All Seller Types</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="rxclose">RxClose</option>
            </select>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredProducts.length === 0 && !loading" class="empty-state">
          <div class="empty-content">
            <i class="fas fa-pills"></i>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or add new products</p>
            <button class="btn primary" (click)="showAddProductModal()">
              <i class="fas fa-plus"></i>
              Add First Product
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div *ngIf="filteredProducts.length > 0" class="products-grid-container">
          <div class="grid-header">
            <h3>Products ({{ filteredProducts.length }})</h3>
            <div class="view-toggle">
              <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
                <i class="fas fa-th"></i>
              </button>
              <button class="view-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>

          <!-- Grid View -->
          <div *ngIf="viewMode === 'grid'" class="products-grid">
            <div *ngFor="let product of filteredProducts" class="product-card">
              <div class="product-image">
                <img [src]="product.imageUrl || 'assets/images/default-product.png'" [alt]="product.name" 
                     onerror="this.src='assets/images/default-product.png'">
                <div class="product-badges">
                  <span *ngIf="product.prescription" class="badge prescription">Rx</span>
                  <span *ngIf="product.stock < 10" class="badge low-stock">Low Stock</span>
                  <span class="badge status" [class]="product.status">{{ product.status }}</span>
                </div>
              </div>
              
              <div class="product-content">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-category">{{ getCategoryDisplay(product.category) }}</p>
                <p class="product-description">{{ product.description }}</p>
                
                <!-- Seller Information -->
                <div class="seller-info">
                  <span class="seller-badge" [class]="product.sellerType">
                    <i class="fas" [class.fa-store]="product.sellerType === 'pharmacy'" 
                       [class.fa-building]="product.sellerType === 'rxclose'"></i>
                    {{ product.sellerType === 'rxclose' ? 'RxClose' : product.sellerName || 'Pharmacy' }}
                  </span>
                </div>
                
                <div class="product-details">
                  <div class="detail-item">
                    <span class="label">Price:</span>
                    <span class="value">{{ product.price | currency:'EGP':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Stock:</span>
                    <span class="value" [class.low]="product.stock < 10">{{ product.stock }}</span>
                  </div>
                </div>
                
                <div class="product-actions">
                  <button class="action-btn-sm primary" 
                          (click)="editProduct(product)"
                          [disabled]="actionLoading">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                  <button class="action-btn-sm secondary" (click)="viewProduct(product)">
                    <i class="fas fa-eye"></i>
                    View
                  </button>
                  <button class="action-btn-sm danger" 
                          (click)="deleteProduct(product)"
                          [disabled]="actionLoading">
                    <i class="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div *ngIf="viewMode === 'list'" class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts">
                  <td>
                    <div class="product-info">
                      <img [src]="product.imageUrl" [alt]="product.name" 
                           onerror="this.src='https://via.placeholder.com/40x40?text=P'">
                      <div>
                        <div class="product-name">{{ product.name }}</div>
                        <div class="product-desc">{{ product.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ getCategoryDisplay(product.category) }}</td>
                  <td>{{ product.price | currency:'EGP':'symbol':'1.2-2' }}</td>
                  <td>
                    <span [class.low]="product.stock < 10">{{ product.stock }}</span>
                  </td>
                  <td>
                    <span class="badge status" [class]="product.status">{{ product.status }}</span>
                  </td>
                  <td>
                    <span class="badge" [class.prescription]="product.prescription">
                      {{ product.prescription ? 'Prescription' : 'OTC' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-sm primary" 
                              (click)="editProduct(product)"
                              [disabled]="actionLoading">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-btn-sm secondary" (click)="viewProduct(product)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="action-btn-sm danger" 
                              (click)="deleteProduct(product)"
                              [disabled]="actionLoading">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Product Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveProduct()" #productForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Product Name *</label>
                  <input type="text" 
                         id="name" 
                         [(ngModel)]="currentProduct.name" 
                         name="name" 
                         required 
                         placeholder="Enter product name">
                </div>
                
                <div class="form-group">
                  <label for="category">Category *</label>
                  <select id="category" 
                          [(ngModel)]="currentProduct.category" 
                          name="category" 
                          required>
                    <option value="">Select category</option>
                    <option value="prescription">Prescription Drugs</option>
                    <option value="otc">Over-the-Counter (OTC)</option>
                    <option value="medical-supplies">Medical Supplies</option>
                    <option value="vitamins-supplements">Vitamins & Supplements</option>
                    <option value="baby-care">Baby Care</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="beauty-cosmetics">Beauty & Cosmetics</option>
                    <option value="first-aid">First Aid</option>
                    <option value="medical-devices">Medical Devices</option>
                    <option value="herbal-natural">Herbal & Natural</option>
                    <option value="diabetic-care">Diabetic Care</option>
                    <option value="dental-care">Dental Care</option>
                    <option value="eye-ear-care">Eye & Ear Care</option>
                    <option value="respiratory-care">Respiratory Care</option>
                    <option value="weight-management">Weight Management</option>
                    <option value="sports-nutrition">Sports & Nutrition</option>
                    <option value="elderly-care">Elderly Care</option>
                    <option value="women-health">Women's Health</option>
                    <option value="men-health">Men's Health</option>
                    <option value="sexual-health">Sexual Health</option>
                    <option value="homeopathy">Homeopathy</option>
                    <option value="orthopedic">Orthopedic Supplies</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" 
                          [(ngModel)]="currentProduct.description" 
                          name="description" 
                          rows="3" 
                          placeholder="Enter product description"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="price">Price (EGP) *</label>
                  <input type="number" 
                         id="price" 
                         [(ngModel)]="currentProduct.price" 
                         name="price" 
                         required 
                         min="0" 
                         step="0.01" 
                         placeholder="0.00">
                </div>
                
                <div class="form-group">
                  <label for="stock">Stock Quantity *</label>
                  <input type="number" 
                         id="stock" 
                         [(ngModel)]="currentProduct.stock" 
                         name="stock" 
                         required 
                         min="0" 
                         placeholder="0">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" 
                          [(ngModel)]="currentProduct.status" 
                          name="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="prescription">Prescription Required</label>
                  <select id="prescription" 
                          [(ngModel)]="currentProduct.prescription" 
                          name="prescription">
                    <option [value]="false">No</option>
                    <option [value]="true">Yes</option>
                  </select>
                </div>
              </div>
              
              <!-- Seller Type Selection -->
              <div class="form-group">
                <label for="sellerType">Seller Type</label>
                <select id="sellerType" 
                        [(ngModel)]="currentProduct.sellerType" 
                        name="sellerType"
                        [disabled]="isEditMode">
                  <option value="rxclose">RxClose (Global Products)</option>
                  <option value="pharmacy">Pharmacy Products</option>
                </select>
                <small class="form-help">
                  <i class="fas fa-info-circle"></i>
                  {{ currentProduct.sellerType === 'rxclose' ? 
                      'This product will be available globally across all pharmacies' : 
                      'This product will be assigned to a specific pharmacy' }}
                </small>
              </div>

              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <input type="url" 
                       id="imageUrl" 
                       [(ngModel)]="currentProduct.imageUrl" 
                       name="imageUrl" 
                       placeholder="https://example.com/image.jpg">
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn secondary" (click)="closeModal()">Cancel</button>
            <button type="button" 
                    class="btn primary" 
                    (click)="saveProduct()" 
                    [disabled]="!currentProduct.name || !currentProduct.category || !currentProduct.price || modalLoading">
              <i *ngIf="modalLoading" class="fas fa-spinner fa-spin"></i>
              {{ isEditMode ? 'Update Product' : 'Add Product' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Cairo', 'Tajawal', 'Inter', sans-serif;
      direction: ltr;
      text-align: left;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    /* Arabic Text Support */
    .arabic-text {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      direction: rtl;
      text-align: right;
    }

    .product-name,
    .product-category,
    .product-description,
    .seller-badge {
      font-family: 'Cairo', 'Tajawal', 'Inter', sans-serif;
    }

    /* Header Styles */
    .products-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      color: white;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-subtitle {
      opacity: 0.9;
      font-size: 1.1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .action-btn.primary {
      background: rgba(255, 255, 255, 0.95);
      color: #667eea;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
      text-align: center;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-spinner i {
      font-size: 2rem;
      color: #667eea;
    }

    /* Error State */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }

    .error-message {
      text-align: center;
      color: #e74c3c;
    }

    .error-message i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }

    .empty-content {
      text-align: center;
      color: #64748b;
    }

    .empty-content i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-content h3 {
      margin: 1rem 0 0.5rem 0;
      color: #334155;
    }

    /* Statistics Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
    .stat-card.active .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-card.categories .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-card.value .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .search-box {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
    }

    .filter-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Products Grid */
    .products-grid-container {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .grid-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.5rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #64748b;
    }

    .view-btn.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      background: white;
    }

    .product-card:hover {
      transform: translateY(-4px);
      border-color: #667eea;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.prescription {
      background: #e53e3e;
      color: white;
    }

    .badge.low-stock {
      background: #f56565;
      color: white;
    }

    .badge.status.active {
      background: #10b981;
      color: white;
    }

    .badge.status.inactive {
      background: #6b7280;
      color: white;
    }

    .product-content {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .product-category {
      color: #667eea;
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0 0 0.75rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-description {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    /* Seller Information */
    .seller-info {
      margin: 0.75rem 0;
    }

    .seller-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .seller-badge.rxclose {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .seller-badge.pharmacy {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .product-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item .label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    .detail-item .value {
      font-weight: 600;
      color: #1e293b;
    }

    .detail-item .value.low {
      color: #e53e3e;
    }

    .product-actions {
      padding: 1rem 1.5rem;
      border-top: 2px solid #f1f5f9;
      display: flex;
      gap: 0.5rem;
    }

    .action-btn-sm {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .action-btn-sm.primary {
      background: #667eea;
      color: white;
    }

    .action-btn-sm.primary:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .action-btn-sm.secondary {
      background: #64748b;
      color: white;
    }

    .action-btn-sm.secondary:hover {
      background: #475569;
      transform: translateY(-1px);
    }

    .action-btn-sm.danger {
      background: #e53e3e;
      color: white;
    }

    .action-btn-sm.danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .action-btn-sm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 2px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 2px solid #f1f5f9;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn.primary {
      background: #667eea;
      color: white;
    }

    .btn.secondary {
      background: #e2e8f0;
      color: #2c3e50;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .filters-section {
        flex-direction: column;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
        max-width: none;
      }
    }

    /* Form Styles */
    .form-help {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      font-style: italic;
    }

    .form-help i {
      margin-right: 0.5rem;
      color: #3b82f6;
    }

    /* Seller Badge Styles */
    .seller-info {
      margin: 0.75rem 0;
    }

    .seller-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .seller-badge.rxclose {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .seller-badge.pharmacy {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    /* Filter improvements */
    .filter-select option {
      padding: 0.5rem;
      background: white;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 2px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #334155;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-help {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .form-help i {
      color: #667eea;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 2px solid #f1f5f9;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* Button Styles */
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn.primary {
      background: #667eea;
      color: white;
    }

    .btn.primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn.secondary {
      background: #64748b;
      color: white;
    }

    .btn.secondary:hover {
      background: #475569;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    /* Products List View */
    .products-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-list-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border: 2px solid #f1f5f9;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .product-list-item:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .product-list-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
    }

    .product-list-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-list-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .product-list-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn-sm.primary {
      background: #667eea;
      color: white;
    }

    .action-btn-sm.primary:hover {
      background: #5a67d8;
    }

    .action-btn-sm.secondary {
      background: #64748b;
      color: white;
    }

    .action-btn-sm.secondary:hover {
      background: #475569;
    }

    .action-btn-sm.danger {
      background: #e53e3e;
      color: white;
    }

    .action-btn-sm.danger:hover {
      background: #dc2626;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .page-title {
        font-size: 2rem;
      }

      .filter-controls {
        grid-template-columns: 1fr;
      }

      .product-details {
        grid-template-columns: 1fr;
      }

      .modal-container {
        margin: 1rem;
        max-width: none;
      }

      .product-list-item {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  prescriptionFilter = '';
  sellerTypeFilter = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  loading = false;
  actionLoading = false;
  modalLoading = false;
  error = '';
  
  showModal = false;
  isEditMode = false;
  currentProduct: Partial<Product> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    
    this.adminService.getProducts().subscribe({
      next: (response) => {
        // Transform API response to component format
        this.products = response.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || 'General',
          description: item.description || '',
          price: item.price || 0,
          stock: item.stock || 0,
          status: item.status === 'active' ? 'active' : 'inactive',
          imageUrl: item.imageUrl || 'https://example.com/product-image.jpg',
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          prescription: item.prescription || false,
          sellerType: item.sellerType || 'pharmacy',
          sellerName: item.sellerName || item.pharmacyName,
          pharmacyId: item.pharmacyId,
          pharmacyName: item.pharmacyName
        }));
        
        // Add sample Arabic data if no products
        if (this.products.length === 0) {
          this.products = [
            {
              id: 1,
              name: 'باراسيتامول ٥٠٠ مجم',
              category: 'مسكنات الألم',
              description: 'دواء مسكن للألم وخافض للحرارة آمن وفعال',
              price: 25.50,
              stock: 102,
              status: 'active' as const,
              imageUrl: 'https://via.placeholder.com/200x200?text=باراسيتامول',
              createdAt: '2024-01-15',
              prescription: false,
              sellerType: 'pharmacy' as const,
              sellerName: 'صيدلية النور',
              pharmacyId: 1,
              pharmacyName: 'صيدلية النور'
            },
            {
              id: 2,
              name: 'أموكسيسيلين ٢٥٠ مجم',
              category: 'مضادات حيوية',
              description: 'مضاد حيوي واسع المدى لعلاج الالتهابات البكتيرية',
              price: 35.75,
              stock: 45,
              status: 'active' as const,
              imageUrl: 'https://via.placeholder.com/200x200?text=أموكسيسيلين',
              createdAt: '2024-01-10',
              prescription: true,
              sellerType: 'rxclose' as const,
              sellerName: 'RxClose',
              pharmacyId: null,
              pharmacyName: undefined
            },
            {
              id: 3,
              name: 'فيتامين د٣ ١٠٠٠ وحدة',
              category: 'فيتامينات',
              description: 'مكمل غذائي لتقوية العظام ودعم جهاز المناعة',
              price: 45.00,
              stock: 8,
              status: 'active' as const,
              imageUrl: 'https://via.placeholder.com/200x200?text=فيتامين+د٣',
              createdAt: '2024-01-08',
              prescription: false,
              sellerType: 'pharmacy' as const,
              sellerName: 'صيدلية الشفاء',
              pharmacyId: 2,
              pharmacyName: 'صيدلية الشفاء'
            },
            {
              id: 4,
              name: 'كريم مرطب للبشرة الحساسة',
              category: 'منتجات العناية',
              description: 'كريم مرطب طبيعي للبشرة الحساسة والجافة',
              price: 65.25,
              stock: 28,
              status: 'active' as const,
              imageUrl: 'https://via.placeholder.com/200x200?text=كريم+مرطب',
              createdAt: '2024-01-05',
              prescription: false,
              sellerType: 'rxclose' as const,
              sellerName: 'RxClose',
              pharmacyId: null,
              pharmacyName: undefined
            },
            {
              id: 5,
              name: 'شراب السعال للأطفال',
              category: 'أدوية الأطفال',
              description: 'شراب طبيعي آمن لعلاج السعال عند الأطفال',
              price: 28.90,
              stock: 0,
              status: 'inactive' as const,
              imageUrl: 'https://via.placeholder.com/200x200?text=شراب+السعال',
              createdAt: '2024-01-03',
              prescription: false,
              sellerType: 'pharmacy' as const,
              sellerName: 'صيدلية الأطفال',
              pharmacyId: 3,
              pharmacyName: 'صيدلية الأطفال'
            }
          ];
        }
        
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
      const matchesStatus = !this.statusFilter || product.status === this.statusFilter;
      const matchesPrescription = !this.prescriptionFilter || 
                                 product.prescription.toString() === this.prescriptionFilter;
      const matchesSellerType = !this.sellerTypeFilter || product.sellerType === this.sellerTypeFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPrescription && matchesSellerType;
    });
  }

  getTotalProducts(): number { 
    return this.products.length; 
  }
  
  getActiveProducts(): number { 
    return this.products.filter(p => p.status === 'active').length; 
  }
  
  getUniqueCategories(): number { 
    return new Set(this.products.map(p => p.category)).size; 
  }
  
  getTotalValue(): number { 
    return this.products.reduce((sum, p) => sum + (p.price * p.stock), 0); 
  }

  showAddProductModal() {
    this.currentProduct = {
      prescription: false,
      status: 'active',
      stock: 0,
      price: 0,
      sellerType: 'rxclose'
    };
    this.isEditMode = false;
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.currentProduct = { ...product };
    this.isEditMode = true;
    this.showModal = true;
  }

  viewProduct(product: Product) {
    console.log('Viewing product:', product);
    // Could implement a detailed view modal here
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.actionLoading = true;
      
      this.adminService.deleteProduct(product.id.toString()).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.filterProducts();
          this.actionLoading = false;
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product. Please try again.');
          this.actionLoading = false;
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentProduct = {};
    this.modalLoading = false;
  }

  saveProduct() {
    if (!this.currentProduct.name || !this.currentProduct.category || !this.currentProduct.price) {
      return;
    }

    this.modalLoading = true;

    const productData: any = {
      name: this.currentProduct.name,
      category: this.currentProduct.category,
      description: this.currentProduct.description || '',
      price: this.currentProduct.price,
      stock: this.currentProduct.stock || 0,
      imageUrl: this.currentProduct.imageUrl || 'https://example.com/product-image.jpg',
      prescription: this.currentProduct.prescription || false
    };

    if (this.currentProduct.sellerType === 'pharmacy') {
      productData.pharmacyId = 1;
    }

    console.log('Product data to be sent:', productData);

    if (this.isEditMode) {
      this.adminService.updateProduct(this.currentProduct.id!.toString(), productData).subscribe({
        next: (response) => {
          console.log('Product updated successfully:', response);
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          alert('Failed to update product. Please try again.');
          this.modalLoading = false;
        }
      });
    } else {
      // Use appropriate endpoint based on seller type
      const endpoint = this.currentProduct.sellerType === 'rxclose' ? 'rxclose' : 'pharmacy';
      const createMethod = endpoint === 'rxclose' ? 
        this.adminService.createRxCloseProduct(productData) : 
        this.adminService.createPharmacyProduct(productData);

      createMethod.subscribe({
        next: (response: any) => {
          console.log('Product created successfully:', response);
          this.loadProducts(); // Reload to get complete product data
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error creating product:', err);
          alert('Failed to create product. Check console for details.');
          this.modalLoading = false;
        }
      });
    }
  }

  getCategoryDisplay(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'prescription': 'Prescription Drugs',
      'otc': 'Over-the-Counter (OTC)',
      'medical-supplies': 'Medical Supplies',
      'vitamins-supplements': 'Vitamins & Supplements',
      'baby-care': 'Baby Care',
      'personal-care': 'Personal Care',
      'beauty-cosmetics': 'Beauty & Cosmetics',
      'first-aid': 'First Aid',
      'medical-devices': 'Medical Devices',
      'herbal-natural': 'Herbal & Natural',
      'diabetic-care': 'Diabetic Care',
      'dental-care': 'Dental Care',
      'eye-ear-care': 'Eye & Ear Care',
      'respiratory-care': 'Respiratory Care',
      'weight-management': 'Weight Management',
      'sports-nutrition': 'Sports & Nutrition',
      'elderly-care': 'Elderly Care',
      'women-health': 'Women\'s Health',
      'men-health': 'Men\'s Health',
      'sexual-health': 'Sexual Health',
      'homeopathy': 'Homeopathy',
      'orthopedic': 'Orthopedic Supplies'
    };
    return categoryMap[category] || category;
  }

  exportProducts() {
    console.log('Exporting products...');
    // Could implement CSV export here
    const csvContent = this.products.map(p => 
      `${p.name},${this.getCategoryDisplay(p.category)},${p.price},${p.stock},${p.status}`
    ).join('\n');
    
    const blob = new Blob([`Name,Category,Price,Stock,Status\n${csvContent}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 