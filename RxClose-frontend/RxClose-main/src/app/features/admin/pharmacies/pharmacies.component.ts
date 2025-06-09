import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface Pharmacy {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  status: 'active' | 'pending' | 'suspended';
  registeredAt: string;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  rating: number;
  verified: boolean;
}

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pharmacies-container">
      <!-- Header Section -->
      <div class="pharmacies-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-clinic-medical"></i>
              Pharmacies Management
            </h1>
            <p class="page-subtitle">Oversee all registered pharmacies on the platform</p>
          </div>
          <div class="header-actions">
            <button class="action-btn primary" (click)="showAddPharmacyModal()">
              <i class="fas fa-plus"></i>
              Add New Pharmacy
            </button>
            <button class="action-btn export" (click)="exportPharmacies()">
              <i class="fas fa-download"></i>
              Export Data
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-clinic-medical"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalPharmacies() }}</div>
            <div class="stat-label">Total Pharmacies</div>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getActivePharmacies() }}</div>
            <div class="stat-label">Active Pharmacies</div>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getPendingPharmacies() }}</div>
            <div class="stat-label">Pending Approval</div>
          </div>
        </div>
        
        <div class="stat-card revenue">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalRevenue() | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 (input)="filterPharmacies()" 
                 placeholder="Search pharmacies...">
        </div>
        
        <div class="filter-controls">
          <select [(ngModel)]="statusFilter" (change)="filterPharmacies()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select [(ngModel)]="cityFilter" (change)="filterPharmacies()" class="filter-select">
            <option value="">All Cities</option>
            <option value="Cairo">Cairo</option>
            <option value="Alexandria">Alexandria</option>
            <option value="Giza">Giza</option>
            <option value="Sharm El Sheikh">Sharm El Sheikh</option>
          </select>
          
          <select [(ngModel)]="verifiedFilter" (change)="filterPharmacies()" class="filter-select">
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
        </div>
      </div>

      <!-- Pharmacies Table -->
      <div class="pharmacies-table-container">
        <div class="table-header">
          <h3>All Pharmacies ({{ filteredPharmacies.length }})</h3>
          <div class="table-actions">
            <button class="action-btn-sm" (click)="selectAllPharmacies()">
              <i class="fas fa-check-square"></i>
              Select All
            </button>
            <button class="action-btn-sm danger" (click)="bulkAction()" [disabled]="selectedPharmacies.length === 0">
              <i class="fas fa-cog"></i>
              Bulk Actions ({{ selectedPharmacies.length }})
            </button>
          </div>
        </div>
        
        <div class="table-wrapper">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading pharmacies...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && filteredPharmacies.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-clinic-medical"></i>
            </div>
            <h3>No Pharmacies Found</h3>
            <p>There are no pharmacies matching your criteria.</p>
          </div>

          <!-- Pharmacies Table -->
          <table class="pharmacies-table" *ngIf="!isLoading && filteredPharmacies.length > 0">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" (change)="toggleSelectAll($event)">
                </th>
                <th>Pharmacy</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pharmacy of filteredPharmacies" 
                  [class.selected]="isPharmacySelected(pharmacy.id)">
                <td>
                  <input type="checkbox" 
                         [checked]="isPharmacySelected(pharmacy.id)"
                         (change)="togglePharmacySelection(pharmacy.id)">
                </td>
                <td>
                  <div class="pharmacy-info">
                    <div class="pharmacy-avatar">
                      <i class="fas fa-clinic-medical"></i>
                    </div>
                    <div class="pharmacy-details">
                      <div class="pharmacy-name">
                        {{ pharmacy.name }}
                        <i *ngIf="pharmacy.verified" class="fas fa-check-circle verified-icon" title="Verified"></i>
                      </div>
                      <div class="pharmacy-id">#{{ pharmacy.id }}</div>
                      <div class="pharmacy-contact">{{ pharmacy.phoneNumber }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="owner-info">
                    <div class="owner-name">{{ pharmacy.ownerName }}</div>
                    <div class="owner-email">{{ pharmacy.email }}</div>
                  </div>
                </td>
                <td>
                  <div class="location-info">
                    <div class="city">{{ pharmacy.city }}</div>
                    <div class="address">{{ pharmacy.address }}</div>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="pharmacy.status">
                    {{ getStatusDisplayName(pharmacy.status) }}
                  </span>
                </td>
                <td>
                  <div class="performance-info">
                    <div class="rating">
                      <i class="fas fa-star"></i>
                      {{ pharmacy.rating }}/5
                    </div>
                    <div class="stats">
                      {{ pharmacy.totalProducts }} products • {{ pharmacy.totalOrders }} orders
                    </div>
                  </div>
                </td>
                <td>
                  <div class="revenue-amount">
                    {{ pharmacy.revenue | currency:'EGP':'symbol':'1.0-0' }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn-sm primary" (click)="viewPharmacy(pharmacy)" title="View Details">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn-sm secondary" (click)="editPharmacy(pharmacy)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn-sm" (click)="manageProducts(pharmacy)" title="Manage Products">
                      <i class="fas fa-pills"></i>
                    </button>
                    <button class="action-btn-sm warning" (click)="togglePharmacyStatus(pharmacy)" title="Toggle Status">
                      <i class="fas fa-power-off"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pharmacy Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Pharmacy' : 'Add New Pharmacy' }}</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="savePharmacy()">
              <div class="form-row">
                <div class="form-group">
                  <label>Pharmacy Name</label>
                  <input type="text" [(ngModel)]="currentPharmacy.name" name="name" required>
                </div>
                
                <div class="form-group">
                  <label>Owner Name</label>
                  <input type="text" [(ngModel)]="currentPharmacy.ownerName" name="ownerName" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="currentPharmacy.email" name="email" required>
                </div>
                
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" [(ngModel)]="currentPharmacy.phoneNumber" name="phoneNumber" required>
                </div>
              </div>
              
              <div class="form-group">
                <label>Address</label>
                <textarea [(ngModel)]="currentPharmacy.address" name="address" rows="2" required></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <select [(ngModel)]="currentPharmacy.city" name="city" required>
                    <option value="Cairo">Cairo</option>
                    <option value="Alexandria">Alexandria</option>
                    <option value="Giza">Giza</option>
                    <option value="Sharm El Sheikh">Sharm El Sheikh</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Status</label>
                  <select [(ngModel)]="currentPharmacy.status" name="status" required>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="currentPharmacy.verified" name="verified">
                  <span class="checkmark"></span>
                  Verified Pharmacy
                </label>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn primary">{{ isEditMode ? 'Update' : 'Create' }} Pharmacy</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- View Pharmacy Details Modal -->
    <div class="modal-overlay" *ngIf="showViewModal" (click)="closeViewModal()">
      <div class="modal-content view-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <i class="fas fa-clinic-medical"></i>
            Pharmacy Details
          </h3>
          <button class="close-btn" (click)="closeViewModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State -->
          <div *ngIf="isLoadingDetails" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading pharmacy details...</p>
          </div>

          <!-- Pharmacy Details -->
          <div *ngIf="!isLoadingDetails && viewPharmacyDetails" class="pharmacy-details">
            <!-- Basic Information -->
            <div class="detail-section">
              <h4>
                <i class="fas fa-info-circle"></i>
                Basic Information
              </h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Pharmacy Name</label>
                  <span>{{ viewPharmacyDetails.name || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <label>Owner Name</label>
                  <span>{{ viewPharmacyDetails.ownerName || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <label>License Number</label>
                  <span>{{ viewPharmacyDetails.licenseNumber || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <label>Email</label>
                  <span>{{ viewPharmacyDetails.email || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <label>Phone Number</label>
                  <span>{{ viewPharmacyDetails.phoneNumber || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <label>Status</label>
                  <span class="status-badge" [class]="viewPharmacyDetails.status?.toLowerCase()">
                    {{ getStatusDisplayName(viewPharmacyDetails.status) }}
                  </span>
                </div>
              </div>
              
              <div class="detail-item full-width">
                <label>Address</label>
                <span>{{ viewPharmacyDetails.address || 'N/A' }}</span>
              </div>
            </div>

            <!-- Business Information -->
            <div class="detail-section" *ngIf="viewPharmacyDetails.businessHours || viewPharmacyDetails.description || viewPharmacyDetails.website">
              <h4>
                <i class="fas fa-briefcase"></i>
                Business Information
              </h4>
              <div class="detail-grid">
                <div class="detail-item" *ngIf="viewPharmacyDetails.businessHours">
                  <label>Business Hours</label>
                  <span>{{ viewPharmacyDetails.businessHours }}</span>
                </div>
                <div class="detail-item" *ngIf="viewPharmacyDetails.website">
                  <label>Website</label>
                  <span>
                    <a [href]="viewPharmacyDetails.website" target="_blank" class="link">
                      {{ viewPharmacyDetails.website }}
                    </a>
                  </span>
                </div>
                <div class="detail-item" *ngIf="viewPharmacyDetails.emergencyNumber">
                  <label>Emergency Number</label>
                  <span>{{ viewPharmacyDetails.emergencyNumber }}</span>
                </div>
                <div class="detail-item" *ngIf="viewPharmacyDetails.deliveryRadius">
                  <label>Delivery Radius</label>
                  <span>{{ viewPharmacyDetails.deliveryRadius }} km</span>
                </div>
                <div class="detail-item" *ngIf="viewPharmacyDetails.deliveryFee">
                  <label>Delivery Fee</label>
                  <span>{{ viewPharmacyDetails.deliveryFee }} EGP</span>
                </div>
                <div class="detail-item" *ngIf="viewPharmacyDetails.acceptsInsurance !== null">
                  <label>Accepts Insurance</label>
                  <span class="badge" [class]="viewPharmacyDetails.acceptsInsurance ? 'success' : 'danger'">
                    {{ viewPharmacyDetails.acceptsInsurance ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
              
              <div class="detail-item full-width" *ngIf="viewPharmacyDetails.description">
                <label>Description</label>
                <span>{{ viewPharmacyDetails.description }}</span>
              </div>
              
              <div class="detail-item full-width" *ngIf="viewPharmacyDetails.specializations && viewPharmacyDetails.specializations.length">
                <label>Specializations</label>
                <div class="specializations">
                  <span class="specialization-tag" *ngFor="let spec of viewPharmacyDetails.specializations">
                    {{ spec }}
                  </span>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="detail-section">
              <h4>
                <i class="fas fa-cog"></i>
                System Information
              </h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Profile Completed</label>
                  <span class="badge" [class]="viewPharmacyDetails.profileCompleted ? 'success' : 'warning'">
                    {{ viewPharmacyDetails.profileCompleted ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Verified</label>
                  <span class="badge" [class]="viewPharmacyDetails.isVerified ? 'success' : 'danger'">
                    {{ viewPharmacyDetails.isVerified ? 'Verified' : 'Not Verified' }}
                  </span>
                </div>
                                 <div class="detail-item">
                   <label>Registration Date</label>
                   <span>{{ viewPharmacyDetails.createdAt ? (viewPharmacyDetails.createdAt | date:'medium') : 'N/A' }}</span>
                 </div>
                 <div class="detail-item">
                   <label>Last Updated</label>
                   <span>{{ viewPharmacyDetails.updatedAt ? (viewPharmacyDetails.updatedAt | date:'medium') : 'N/A' }}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn secondary" (click)="closeViewModal()">Close</button>
          <button type="button" class="btn primary" (click)="editPharmacy(viewPharmacyDetails)">
            <i class="fas fa-edit"></i>
            Edit Pharmacy
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pharmacies-container {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header Styles */
    .pharmacies-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      color: white;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-subtitle {
      margin: 0.5rem 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .action-btn.primary {
      background: #2ecc71;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Statistics */
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
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card.total .stat-icon { background: #e3f2fd; color: #2196f3; }
    .stat-card.active .stat-icon { background: #e8f5e8; color: #4caf50; }
    .stat-card.pending .stat-icon { background: #fff3e0; color: #ff9800; }
    .stat-card.revenue .stat-icon { background: #f3e5f5; color: #9c27b0; }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    /* Filters */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #7f8c8d;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Table */
    .pharmacies-table-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h3 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
    }

    .action-btn-sm {
      background: #f8fafc;
      color: #2c3e50;
      border: 1px solid #e2e8f0;
    }

    .action-btn-sm.primary { background: #667eea; color: white; border: none; }
    .action-btn-sm.secondary { background: #6c757d; color: white; border: none; }
    .action-btn-sm.danger { background: #e74c3c; color: white; border: none; }
    .action-btn-sm.warning { background: #f39c12; color: white; border: none; }

    .action-btn-sm:hover {
      transform: translateY(-1px);
    }

    .action-btn-sm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .loading-spinner {
      font-size: 2rem;
      color: #3498db;
      margin-bottom: 1rem;
    }

    .loading-container p {
      color: #7f8c8d;
      margin: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      color: #bdc3c7;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #7f8c8d;
      margin: 0;
    }

    .pharmacies-table {
      width: 100%;
      border-collapse: collapse;
    }

    .pharmacies-table th,
    .pharmacies-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .pharmacies-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .pharmacies-table tr.selected {
      background: #f0f9ff;
    }

    .pharmacy-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pharmacy-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .pharmacy-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .verified-icon {
      color: #4caf50;
      font-size: 0.8rem;
    }

    .pharmacy-id {
      color: #7f8c8d;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }

    .pharmacy-contact {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .owner-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .owner-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .owner-email {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .city {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .address {
      color: #7f8c8d;
      font-size: 0.8rem;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active { background: #e8f5e8; color: #2e7d32; }
    .status-badge.pending { background: #fff3e0; color: #f57c00; }
    .status-badge.suspended { background: #ffebee; color: #d32f2f; }

    .performance-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .rating i {
      color: #ffc107;
    }

    .stats {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .revenue-amount {
      font-weight: 700;
      color: #2c3e50;
      font-size: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    /* Modal */
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
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-content.large {
      max-width: 800px;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #7f8c8d;
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
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn.primary {
      background: #667eea;
      color: white;
    }

    .btn.secondary {
      background: #e2e8f0;
      color: #2c3e50;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    /* View Modal Specific Styles */
    .view-modal {
      max-width: 900px;
    }

    .pharmacy-details {
      max-height: 70vh;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .detail-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .detail-item span {
      color: #2c3e50;
      font-size: 0.95rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.success {
      background: #d4edda;
      color: #155724;
    }

    .badge.danger {
      background: #f8d7da;
      color: #721c24;
    }

    .badge.warning {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.suspended {
      background: #f8d7da;
      color: #721c24;
    }

    .specializations {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .specialization-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pharmacies-container {
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

      .table-header {
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PharmaciesComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  filteredPharmacies: Pharmacy[] = [];
  selectedPharmacies: number[] = [];
  searchTerm = '';
  statusFilter = '';
  cityFilter = '';
  verifiedFilter = '';

  showModal = false;
  showViewModal = false;
  isEditMode = false;
  currentPharmacy: Partial<Pharmacy> = {};
  viewPharmacyDetails: any = null;
  isLoading = true;
  isLoadingDetails = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPharmacies();
  }

  loadPharmacies() {
    this.isLoading = true;
    
    this.adminService.getPharmacies().subscribe({
      next: (response) => {
        console.log('Pharmacies API Response:', response);
        
        // Transform API response to match component interface
        this.pharmacies = response.map((pharmacy: any) => ({
          id: pharmacy.id,
          name: pharmacy.name,
          ownerName: pharmacy.ownerName || 'N/A',
          email: pharmacy.email,
          phoneNumber: pharmacy.phoneNumber,
          address: pharmacy.address,
          city: pharmacy.city,
          status: pharmacy.status === 'Active' ? 'active' : 
                  pharmacy.status === 'Pending' ? 'pending' : 'suspended',
          registeredAt: pharmacy.createdAt ? new Date(pharmacy.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalProducts: pharmacy.totalProducts || 0,
          totalOrders: pharmacy.totalOrders || 0,
          revenue: pharmacy.revenue || 0,
          rating: pharmacy.rating || 4.0,
          verified: pharmacy.verified || false
        }));
        
        this.filteredPharmacies = [...this.pharmacies];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pharmacies:', error);
        this.isLoading = false;
        // Keep empty arrays for error case
        this.pharmacies = [];
        this.filteredPharmacies = [];
      }
    });
  }

  filterPharmacies() {
    this.filteredPharmacies = this.pharmacies.filter(pharmacy => {
      const matchesSearch = pharmacy.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           pharmacy.ownerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           pharmacy.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || pharmacy.status === this.statusFilter;
      const matchesCity = !this.cityFilter || pharmacy.city === this.cityFilter;
      const matchesVerified = !this.verifiedFilter || 
                             pharmacy.verified.toString() === this.verifiedFilter;
      
      return matchesSearch && matchesStatus && matchesCity && matchesVerified;
    });
  }

  getTotalPharmacies(): number { return this.pharmacies.length; }
  getActivePharmacies(): number { return this.pharmacies.filter(p => p.status === 'active').length; }
  getPendingPharmacies(): number { return this.pharmacies.filter(p => p.status === 'pending').length; }
  getTotalRevenue(): number { 
    return this.pharmacies.reduce((sum, p) => sum + p.revenue, 0); 
  }

  isPharmacySelected(pharmacyId: number): boolean {
    return this.selectedPharmacies.includes(pharmacyId);
  }

  togglePharmacySelection(pharmacyId: number) {
    const index = this.selectedPharmacies.indexOf(pharmacyId);
    if (index > -1) {
      this.selectedPharmacies.splice(index, 1);
    } else {
      this.selectedPharmacies.push(pharmacyId);
    }
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedPharmacies = this.filteredPharmacies.map(p => p.id);
    } else {
      this.selectedPharmacies = [];
    }
  }

  selectAllPharmacies() {
    this.selectedPharmacies = this.filteredPharmacies.map(p => p.id);
  }

  showAddPharmacyModal() {
    this.currentPharmacy = {
      status: 'pending',
      verified: false
    };
    this.isEditMode = false;
    this.showModal = true;
  }

  editPharmacy(pharmacy: Pharmacy) {
    this.currentPharmacy = { ...pharmacy };
    this.isEditMode = true;
    this.showModal = true;
  }

  viewPharmacy(pharmacy: Pharmacy) {
    this.isLoadingDetails = true;
    this.showViewModal = true;
    
    // Get detailed pharmacy information
    this.adminService.getPharmacy(pharmacy.id.toString()).subscribe({
      next: (details: any) => {
        this.viewPharmacyDetails = details;
        this.isLoadingDetails = false;
      },
      error: (error: any) => {
        console.error('Error loading pharmacy details:', error);
        this.isLoadingDetails = false;
        // Fallback to basic pharmacy data
        this.viewPharmacyDetails = pharmacy;
      }
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewPharmacyDetails = null;
  }

  manageProducts(pharmacy: Pharmacy) {
    console.log('Managing products for:', pharmacy);
  }

  togglePharmacyStatus(pharmacy: Pharmacy) {
    const newStatus = pharmacy.status === 'active' ? 'suspended' : 'active';
    if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} ${pharmacy.name}?`)) {
      // Update via API
      const updateData = { 
        ...pharmacy, 
        status: newStatus === 'active' ? 'Active' : 'Suspended'
      };
      
      this.adminService.adminUpdatePharmacy(pharmacy.id.toString(), updateData).subscribe({
        next: (response) => {
          console.log('Pharmacy status updated:', response);
          this.loadPharmacies(); // Reload data
        },
        error: (error) => {
          console.error('Error updating pharmacy status:', error);
        }
      });
    }
  }

  bulkAction() {
    console.log('Bulk action for:', this.selectedPharmacies);
  }

  closeModal() {
    this.showModal = false;
    this.currentPharmacy = {};
  }

  savePharmacy() {
    if (this.isEditMode) {
      // Update existing pharmacy via API
      const updateData = {
        name: this.currentPharmacy.name,
        ownerName: this.currentPharmacy.ownerName,
        email: this.currentPharmacy.email,
        phoneNumber: this.currentPharmacy.phoneNumber,
        address: this.currentPharmacy.address,
        city: this.currentPharmacy.city,
        status: this.currentPharmacy.status === 'active' ? 'Active' : 
                this.currentPharmacy.status === 'pending' ? 'Pending' : 'Suspended'
      };
      
      this.adminService.adminUpdatePharmacy(this.currentPharmacy.id!.toString(), updateData).subscribe({
        next: (response) => {
          console.log('Pharmacy updated:', response);
          this.loadPharmacies(); // Reload data
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating pharmacy:', error);
        }
      });
    } else {
      // Create new pharmacy via API
      const newPharmacyData = {
        name: this.currentPharmacy.name,
        ownerName: this.currentPharmacy.ownerName,
        email: this.currentPharmacy.email,
        phoneNumber: this.currentPharmacy.phoneNumber,
        address: this.currentPharmacy.address,
        city: this.currentPharmacy.city,
        status: this.currentPharmacy.status === 'active' ? 'Active' : 
                this.currentPharmacy.status === 'pending' ? 'Pending' : 'Suspended',
        userId: 1 // Default to Super Admin user
      };
      
      this.adminService.createPharmacy(newPharmacyData).subscribe({
        next: (response) => {
          console.log('Pharmacy created:', response);
          this.loadPharmacies(); // Reload data
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating pharmacy:', error);
        }
      });
    }
  }

  exportPharmacies() {
    console.log('Exporting pharmacies...');
  }

  getStatusDisplayName(status: string): string {
    const statuses: any = {
      'active': 'Active',
      'pending': 'Pending',
      'suspended': 'Suspended'
    };
    return statuses[status] || status;
  }
} 