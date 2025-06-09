import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../services/pharmacy.service';
import { Product } from '../../../models/product-updated.model';

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
              My Pharmacy Products
            </h1>
            <p class="page-subtitle">Manage your pharmacy inventory and products</p>
          </div>
          <div class="header-actions">
            <button (click)="openAddModal()" class="add-btn">
              <i class="fas fa-plus"></i>
              Add Pharmacy Product
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card total-products">
          <div class="stat-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ products.length }}</div>
            <div class="stat-label">My Products</div>
          </div>
        </div>

        <div class="stat-card low-stock">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getLowStockCount() }}</div>
            <div class="stat-label">Low Stock</div>
          </div>
        </div>

        <div class="stat-card categories">
          <div class="stat-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getUniqueCategories() }}</div>
            <div class="stat-label">Categories</div>
          </div>
        </div>

        <div class="stat-card total-value">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getTotalValue() | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Value</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-card">
          <div class="filter-header">
            <i class="fas fa-filter"></i>
            <span>Filters</span>
          </div>
          <div class="filter-controls">
            <div class="filter-group">
              <label>Category</label>
              <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="filter-select">
                <option value="all">All Categories</option>
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
            <div class="filter-group">
              <label>Search</label>
              <input type="text" [(ngModel)]="searchTerm" (input)="filterProducts()" 
                     placeholder="Search products..." class="search-input">
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <div *ngFor="let product of filteredProducts" class="product-card">
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/300x200?text=Product'" 
                 [alt]="product.name">
            <div class="product-badges">
              <span *ngIf="product.requiresPrescription" class="badge prescription">
                <i class="fas fa-prescription"></i>
                Rx
              </span>
              <span *ngIf="(product.stock || product.quantity || 0) < 10" class="badge low-stock">
                <i class="fas fa-exclamation"></i>
                Low Stock
              </span>
              <!-- Seller Badge -->
              <span class="badge seller" [class]="product.sellerType">
                <i class="fas" [class.fa-store]="product.sellerType === 'pharmacy'" 
                   [class.fa-building]="product.sellerType === 'rxclose'"></i>
                {{ product.sellerType === 'pharmacy' ? 'My Product' : 'RxClose' }}
              </span>
            </div>
          </div>
          
          <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="product-details">
              <div class="detail-item">
                <span class="label">Price:</span>
                <span class="value price">{{ product.price | currency:'EGP':'symbol':'1.0-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Stock:</span>
                <span class="value" [class.low-stock]="(product.stock || product.quantity || 0) < 10">
                  {{ product.stock || product.quantity || 0 }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Category:</span>
                <span class="value category">{{ getCategoryDisplay(product.category) }}</span>
              </div>
            </div>
          </div>

          <div class="product-actions" *ngIf="product.sellerType === 'pharmacy'">
            <button (click)="openEditModal(product)" class="action-btn edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button (click)="deleteProduct(product.id)" class="action-btn delete">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
          
          <div class="product-actions readonly" *ngIf="product.sellerType === 'rxclose'">
            <span class="readonly-notice">
              <i class="fas fa-info-circle"></i>
              RxClose Global Product (Read Only)
            </span>
          </div>
        </div>
      </div>

      <!-- No Products Message -->
      <div *ngIf="filteredProducts.length === 0" class="no-products">
        <div class="no-products-icon">
          <i class="fas fa-box-open"></i>
        </div>
        <h3>No Products Found</h3>
        <p>Add your first pharmacy product to get started</p>
        <button (click)="openAddModal()" class="add-btn">
          <i class="fas fa-plus"></i>
          Add Product
        </button>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div *ngIf="showAddModal" class="modal-overlay" (click)="closeModals()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add New Product</h2>
          <button (click)="closeModals()" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form (ngSubmit)="addProduct()" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Product Name *</label>
              <input type="text" id="name" [(ngModel)]="newProduct.name" name="name" required
                     placeholder="Enter product name" class="form-input">
            </div>
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" [(ngModel)]="newProduct.category" name="category" required class="form-select">
                <option value="">Select Category</option>
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
            <textarea id="description" [(ngModel)]="newProduct.description" name="description"
                      placeholder="Enter product description" class="form-textarea" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price (EGP) *</label>
              <input type="number" id="price" [(ngModel)]="newProduct.price" name="price" required
                     placeholder="0.00" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label for="quantity">Stock Quantity *</label>
              <input type="number" id="quantity" [(ngModel)]="newProduct.quantity" name="quantity" required
                     placeholder="0" min="0" class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label for="imageUrl">Image URL</label>
            <input type="url" id="imageUrl" [(ngModel)]="newProduct.imageUrl" name="imageUrl"
                   placeholder="https://example.com/image.jpg" class="form-input">
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="newProduct.requiresPrescription" name="requiresPrescription">
              <span class="checkbox-custom"></span>
              Requires Prescription
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" (click)="closeModals()" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">Add Product</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div *ngIf="showEditModal" class="modal-overlay" (click)="closeModals()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Edit Product</h2>
          <button (click)="closeModals()" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form (ngSubmit)="updateProduct()" class="product-form" *ngIf="selectedProduct">
          <div class="form-row">
            <div class="form-group">
              <label for="editName">Product Name *</label>
              <input type="text" id="editName" [(ngModel)]="selectedProduct.name" name="editName" required
                     placeholder="Enter product name" class="form-input">
            </div>
            <div class="form-group">
              <label for="editCategory">Category *</label>
              <select id="editCategory" [(ngModel)]="selectedProduct.category" name="editCategory" required class="form-select">
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
            <label for="editDescription">Description</label>
            <textarea id="editDescription" [(ngModel)]="selectedProduct.description" name="editDescription"
                      placeholder="Enter product description" class="form-textarea" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editPrice">Price (EGP) *</label>
              <input type="number" id="editPrice" [(ngModel)]="selectedProduct.price" name="editPrice" required
                     placeholder="0.00" step="0.01" min="0" class="form-input">
            </div>
            <div class="form-group">
              <label for="editQuantity">Stock Quantity *</label>
              <input type="number" id="editQuantity" [(ngModel)]="selectedProduct.quantity" name="editQuantity" required
                     placeholder="0" min="0" class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label for="editImageUrl">Image URL</label>
            <input type="url" id="editImageUrl" [(ngModel)]="selectedProduct.imageUrl" name="editImageUrl"
                   placeholder="https://example.com/image.jpg" class="form-input">
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="selectedProduct.requiresPrescription" name="editRequiresPrescription">
              <span class="checkbox-custom"></span>
              Requires Prescription
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" (click)="closeModals()" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .products-header {
      margin-bottom: 2rem;
    }

    .header-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #718096;
      margin: 0.5rem 0 0 0;
    }

    .add-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--card-color), var(--card-color-light));
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .total-products { --card-color: #4299e1; --card-color-light: #90cdf4; }
    .low-stock { --card-color: #f56565; --card-color-light: #fc8181; }
    .categories { --card-color: #48bb78; --card-color-light: #9ae6b4; }
    .total-value { --card-color: #ed8936; --card-color-light: #fbb670; }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--card-color), var(--card-color-light));
      color: white;
      font-size: 1.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #718096;
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .filter-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .filter-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 1rem;
    }

    .filter-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group label {
      display: block;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .filter-select, .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .filter-select:focus, .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
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
      transform: scale(1.1);
    }

    .product-badges {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .badge.prescription {
      background: #e53e3e;
      color: white;
    }

    .badge.low-stock {
      background: #f56565;
      color: white;
    }

    .badge.seller {
      font-size: 0.75rem;
    }

    .badge.seller.pharmacy {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .badge.seller.rxclose {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .product-content {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .product-description {
      color: #718096;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item .label {
      font-weight: 500;
      color: #4a5568;
    }

    .detail-item .value {
      font-weight: 600;
      color: #1a202c;
    }

    .detail-item .value.price {
      color: #38a169;
    }

    .detail-item .value.low-stock {
      color: #e53e3e;
    }

    .detail-item .value.category {
      background: #e2e8f0;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .product-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
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
    }

    .action-btn.edit {
      background: #4299e1;
      color: white;
    }

    .action-btn.edit:hover {
      background: #3182ce;
      transform: translateY(-2px);
    }

    .action-btn.delete {
      background: #f56565;
      color: white;
    }

    .action-btn.delete:hover {
      background: #e53e3e;
      transform: translateY(-2px);
    }

    .no-products {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .no-products-icon {
      font-size: 4rem;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .no-products h3 {
      font-size: 1.5rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .no-products p {
      color: #718096;
      margin-bottom: 2rem;
    }

    .product-actions.readonly {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 1rem 1.5rem;
      text-align: center;
    }

    .readonly-notice {
      color: #64748b;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .readonly-notice i {
      color: #3b82f6;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
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
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #718096;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f7fafc;
      color: #e53e3e;
    }

    .product-form {
      padding: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .checkbox-group {
      margin-bottom: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      color: #4a5568;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .checkbox-custom {
      position: relative;
      width: 20px;
      height: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel,
    .btn-submit {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 1rem;
    }

    .btn-cancel {
      background: #f7fafc;
      color: #4a5568;
      border: 2px solid #e2e8f0;
    }

    .btn-cancel:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .page-title {
        font-size: 2rem;
      }

      .modal-content {
        margin: 1rem;
        max-width: calc(100% - 2rem);
      }

      .modal-header,
      .product-form {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  showAddModal = false;
  showEditModal = false;
  selectedProduct: Product | null = null;
  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    quantity: 0,
    imageUrl: '',
    requiresPrescription: false
  };

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.pharmacyService.getProducts().subscribe({
      next: (products: any) => {
        console.log('Loaded products from API:', products);
        this.products = products || [];
        this.filterProducts();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.filterProducts();
      }
    });
  }



  filterProducts() {
    let filtered = this.products;
    
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    this.filteredProducts = filtered;
  }

  onCategoryChange() {
    this.filterProducts();
  }

  getLowStockCount(): number {
    return this.products.filter(p => (p.stock || p.quantity || 0) < 10).length;
  }

  getUniqueCategories(): number {
    return new Set(this.products.map(p => p.category)).size;
  }

  getTotalValue(): number {
    return this.products.reduce((sum, product) => sum + (product.price * (product.stock || product.quantity || 0)), 0);
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

  openAddModal() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      quantity: 0,
      imageUrl: '',
      requiresPrescription: false
    };
    this.showAddModal = true;
  }

  openEditModal(product: Product) {
    this.selectedProduct = { 
      ...product,
      quantity: product.stock || product.quantity || 0 // Ensure quantity is set correctly
    };
    this.showEditModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedProduct = null;
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      quantity: 0,
      imageUrl: '',
      requiresPrescription: false
    };
  }

  addProduct() {
    if (!this.newProduct.name || !this.newProduct.category || !this.newProduct.price || !this.newProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    // Get current pharmacy profile first to get pharmacy ID
    this.pharmacyService.getPharmacyProfile().subscribe({
      next: (pharmacy: any) => {
        const productData = {
          name: this.newProduct.name,
          description: this.newProduct.description,
          price: this.newProduct.price,
          category: this.newProduct.category,
          stock: this.newProduct.quantity, // Backend uses 'stock' not 'quantity'
          imageUrl: this.newProduct.imageUrl,
          prescription: this.newProduct.requiresPrescription, // Backend uses 'prescription' not 'requiresPrescription'
          pharmacyId: pharmacy.id,
          sellerType: 'pharmacy',
          sellerName: pharmacy.name
        };

        console.log('Adding product:', productData);

        this.pharmacyService.addProduct(productData as any).subscribe({
          next: (newProduct: any) => {
            console.log('Product added successfully:', newProduct);
            this.products.push(newProduct);
            this.filterProducts();
            this.closeModals();
            alert('Product added successfully!');
          },
          error: (error: any) => {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
          }
        });
      },
      error: (error: any) => {
        console.error('Error getting pharmacy profile:', error);
        alert('Failed to get pharmacy information. Please try again.');
      }
    });
  }

  updateProduct() {
    if (!this.selectedProduct) return;

    const updateData = {
      name: this.selectedProduct.name,
      description: this.selectedProduct.description,
      price: this.selectedProduct.price,
      category: this.selectedProduct.category,
      stock: this.selectedProduct.quantity, // Backend uses 'stock' not 'quantity'
      imageUrl: this.selectedProduct.imageUrl,
      prescription: this.selectedProduct.requiresPrescription // Backend uses 'prescription' not 'requiresPrescription'
    };

    console.log('Updating product:', updateData);

    this.pharmacyService.updateProduct(this.selectedProduct.id, updateData as any).subscribe({
      next: (updatedProduct: any) => {
        console.log('Product updated successfully:', updatedProduct);
        
        // Update the product in the local array
        const index = this.products.findIndex(p => p.id === this.selectedProduct?.id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedProduct };
        }
        
        this.filterProducts();
        this.closeModals();
        alert('Product updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      }
    });
  }

  deleteProduct(productId: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.pharmacyService.deleteProduct(productId).subscribe({
        next: () => {
          // Remove the product from the local array after successful deletion
          this.products = this.products.filter(p => p.id !== productId);
          this.filterProducts();
          console.log('Product deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }
} 