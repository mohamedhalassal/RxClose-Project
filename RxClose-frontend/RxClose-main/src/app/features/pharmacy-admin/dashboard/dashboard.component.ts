import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PharmacyService } from '../../../services/pharmacy.service';
import { Pharmacy } from '../../../models/pharmacy.model';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <h1 class="dashboard-title">Pharmacy Dashboard</h1>
            <p class="dashboard-subtitle">Welcome back! Here's what's happening at your pharmacy.</p>
          </div>
          <div class="date-time">
            <div class="current-date">{{ currentDate | date:'fullDate' }}</div>
            <div class="current-time">{{ currentTime }}</div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card products-card">
          <div class="stat-icon">
            <i class="fas fa-pills"></i>
            </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalProducts }}</div>
            <div class="stat-label">Total Products</div>
            <div class="stat-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+12% this month</span>
            </div>
          </div>
        </div>

        <div class="stat-card orders-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
            </div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingOrders }}</div>
            <div class="stat-label">Pending Orders</div>
            <div class="stat-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+8% this week</span>
            </div>
          </div>
        </div>

        <div class="stat-card revenue-card">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
            </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalRevenue | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+15% this month</span>
            </div>
          </div>
        </div>

        <div class="stat-card stock-card">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
            </div>
          <div class="stat-content">
            <div class="stat-value">{{ lowStockProducts }}</div>
            <div class="stat-label">Low Stock Items</div>
            <div class="stat-trend negative">
              <i class="fas fa-arrow-down"></i>
              <span>Action needed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
      <!-- Recent Orders -->
        <div class="content-card orders-table-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-list-alt"></i>
              Recent Orders
            </h2>
            <button routerLink="/pharmacy-admin/orders" class="view-all-btn">
              View All
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
              </tr>
            </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders" class="table-row">
                  <td><span class="order-id">#{{ order.id }}</span></td>
                  <td>
                    <div class="customer-info">
                      <div class="customer-avatar">{{ order.customerName.charAt(0) }}</div>
                      <span>{{ order.customerName }}</span>
                    </div>
                  </td>
                  <td>{{ order.date | date:'MMM dd, yyyy' }}</td>
                  <td><span class="amount">{{ order.amount | currency:'EGP':'symbol':'1.0-2' }}</span></td>
                  <td>
                    <span [class]="'status-badge ' + getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                  <td>
                    <button (click)="viewOrder(order.id)" class="action-btn">
                      <i class="fas fa-eye"></i>
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
        <div class="content-card quick-actions-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-bolt"></i>
              Quick Actions
            </h2>
          </div>
          <div class="quick-actions-grid">
            <button routerLink="/pharmacy-admin/products" class="action-card add-product">
              <div class="action-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Manage Products</div>
                <div class="action-desc">Add or edit pharmacy products</div>
              </div>
            </button>

            <button routerLink="/pharmacy-admin/orders" class="action-card view-orders">
              <div class="action-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Process Orders</div>
                <div class="action-desc">View and manage orders</div>
              </div>
            </button>

            <button routerLink="/pharmacy-admin/profile" class="action-card update-profile">
              <div class="action-icon">
                <i class="fas fa-store"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Update Profile</div>
                <div class="action-desc">Edit pharmacy information</div>
              </div>
            </button>

            <button class="action-card reports">
              <div class="action-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <div class="action-content">
                <div class="action-title">View Reports</div>
                <div class="action-desc">Analytics and insights</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Pharmacy Profile -->
        <div class="content-card profile-card" *ngIf="pharmacy">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-building"></i>
              Pharmacy Profile
            </h2>
            <span [class]="'verification-badge ' + (pharmacy.isVerified ? 'verified' : 'pending')">
              <i [class]="pharmacy.isVerified ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
              {{ pharmacy.isVerified ? 'Verified' : 'Pending' }}
            </span>
          </div>
          <div class="profile-content">
            <div class="profile-item">
              <div class="profile-label">Pharmacy Name</div>
              <div class="profile-value">{{ pharmacy.name }}</div>
            </div>
            <div class="profile-item">
              <div class="profile-label">License Number</div>
              <div class="profile-value">{{ pharmacy.licenseNumber }}</div>
            </div>
            <div class="profile-item">
              <div class="profile-label">Phone</div>
              <div class="profile-value">{{ pharmacy.phoneNumber || 'Not provided' }}</div>
            </div>
            <div class="profile-item">
              <div class="profile-label">Email</div>
              <div class="profile-value">{{ pharmacy.email || 'Not provided' }}</div>
            </div>
            <div class="profile-item">
              <div class="profile-label">Address</div>
              <div class="profile-value">{{ pharmacy.address || 'Not provided' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .dashboard-header {
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

    .dashboard-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .dashboard-subtitle {
      font-size: 1.1rem;
      color: #718096;
      margin: 0.5rem 0 0 0;
    }

    .date-time {
      text-align: right;
    }

    .current-date {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .current-time {
      font-size: 0.9rem;
      color: #718096;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

    .products-card {
      --card-color: #4299e1;
      --card-color-light: #90cdf4;
    }

    .orders-card {
      --card-color: #48bb78;
      --card-color-light: #9ae6b4;
    }

    .revenue-card {
      --card-color: #ed8936;
      --card-color-light: #fbb670;
    }

    .stock-card {
      --card-color: #f56565;
      --card-color-light: #fc8181;
    }

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
      margin-bottom: 0.5rem;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .stat-trend.positive {
      color: #38a169;
    }

    .stat-trend.negative {
      color: #e53e3e;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .content-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .view-all-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .view-all-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    }

    .table-container {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
    }

    .modern-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f7fafc;
    }

    .modern-table td {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .table-row:hover {
      background: #f7fafc;
    }

    .order-id {
      font-weight: 600;
      color: #667eea;
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .customer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .amount {
      font-weight: 600;
      color: #38a169;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge.pending {
      background: #fed7d7;
      color: #c53030;
    }

    .status-badge.completed {
      background: #c6f6d5;
      color: #2f855a;
    }

    .status-badge.processing {
      background: #feebc8;
      color: #d69e2e;
    }

    .action-btn {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #667eea;
      color: white;
    }

    .quick-actions-grid {
      padding: 1.5rem;
      display: grid;
      gap: 1rem;
    }

    .action-card {
      background: none;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
    }

    .action-card:hover {
      border-color: #667eea;
      background: #f7fafc;
      transform: translateY(-2px);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-size: 1.25rem;
    }

    .action-title {
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 0.25rem;
    }

    .action-desc {
      font-size: 0.875rem;
      color: #718096;
    }

    .profile-content {
      padding: 1.5rem;
    }

    .profile-item {
      margin-bottom: 1rem;
    }

    .profile-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.25rem;
    }

    .profile-value {
      font-weight: 600;
      color: #1a202c;
    }

    .verification-badge {
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .verification-badge.verified {
      background: #c6f6d5;
      color: #2f855a;
    }

    .verification-badge.pending {
      background: #feebc8;
      color: #d69e2e;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-title {
        font-size: 2rem;
      }
    }
  `]
})
export class PharmacyDashboardComponent implements OnInit {
  pharmacy: Pharmacy | null = null;
  totalProducts = 0;
  lowStockProducts = 0;
  pendingOrders = 0;
  totalRevenue = 0;
  recentOrders: any[] = [];
  currentDate = new Date();
  currentTime = '';

  constructor(private pharmacyService: PharmacyService) {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  ngOnInit() {
    this.loadPharmacyProfile();
    this.loadDashboardData();
    this.loadSampleData();
  }

  loadSampleData() {
    // Sample data for demo purposes
    if (this.totalProducts === 0) {
      this.totalProducts = 156;
    }
    if (this.pendingOrders === 0) {
      this.pendingOrders = 12;
    }
    if (this.lowStockProducts === 0) {
      this.lowStockProducts = 8;
    }
    if (this.totalRevenue === 0) {
      this.totalRevenue = 45750;
    }
    if (this.recentOrders.length === 0) {
      this.recentOrders = [
        { id: 1001, customerName: 'Ahmed Hassan', date: new Date(), amount: 250, status: 'pending' },
        { id: 1002, customerName: 'Sara Mohamed', date: new Date(), amount: 180, status: 'completed' },
        { id: 1003, customerName: 'Omar Ali', date: new Date(), amount: 320, status: 'processing' },
        { id: 1004, customerName: 'Fatma Ibrahim', date: new Date(), amount: 150, status: 'completed' },
        { id: 1005, customerName: 'Khaled Ahmed', date: new Date(), amount: 275, status: 'pending' }
      ];
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  loadPharmacyProfile() {
    this.pharmacyService.getPharmacyProfile().subscribe({
      next: (pharmacy) => {
        this.pharmacy = pharmacy;
      },
      error: (error) => {
        console.error('Error loading pharmacy profile:', error);
      }
    });
  }

  loadDashboardData() {
    // Load products count
    this.pharmacyService.getProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.lowStockProducts = products.filter(p => p.quantity < 10).length;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });

    // Load orders
    this.pharmacyService.getOrders().subscribe({
      next: (orders) => {
        this.pendingOrders = orders.filter(o => o.status === 'pending').length;
        this.totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        this.recentOrders = orders.slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'pending';
      default:
        return 'pending';
    }
  }

  viewOrder(orderId: number) {
    // Implement order view logic
    console.log('View order:', orderId);
  }
} 