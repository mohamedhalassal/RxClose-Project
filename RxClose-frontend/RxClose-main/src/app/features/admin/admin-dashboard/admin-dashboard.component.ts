import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading" class="dashboard-content">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-tachometer-alt"></i>
              لوحة تحكم السوبر أدمن
            </h1>
            <p class="page-subtitle">Complete system overview and management</p>
          </div>
          <div class="header-actions">
            <div class="current-time">
              <i class="fas fa-clock"></i>
              <span>{{ getCurrentTime() }}</span>
            </div>
            <button class="action-btn refresh" (click)="refreshData()">
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card users">
          <div class="metric-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ totalUsers }}</div>
            <div class="metric-label">Total Users</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +{{ newUsersThisMonth }} مستخدم جديد
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart users-chart"></div>
          </div>
        </div>

        <div class="metric-card pharmacies">
          <div class="metric-icon">
            <i class="fas fa-clinic-medical"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ totalPharmacies }}</div>
            <div class="metric-label">Active Pharmacies</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +8% this month
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart pharmacies-chart"></div>
          </div>
        </div>

        <div class="metric-card products">
          <div class="metric-icon">
            <i class="fas fa-pills"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ totalProducts }}</div>
            <div class="metric-label">Products in Catalog</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +25% this month
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart products-chart"></div>
          </div>
        </div>

        <div class="metric-card revenue">
          <div class="metric-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ totalRevenue | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="metric-label">System Revenue</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +18% this month
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart revenue-chart"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <h2 class="section-title">
          <i class="fas fa-bolt"></i>
          Quick Actions
        </h2>
        <div class="quick-actions-grid">
          <div class="quick-action-card" routerLink="/admin/users">
            <div class="action-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <h3>Manage Users</h3>
            <p>Add, edit, or remove users from the system</p>
          </div>
          
          <div class="quick-action-card" routerLink="/admin/pharmacies">
            <div class="action-icon">
              <i class="fas fa-store-alt"></i>
            </div>
            <h3>Pharmacy Management</h3>
            <p>Oversee pharmacy registrations and operations</p>
          </div>
          
          <div class="quick-action-card" routerLink="/admin/products">
            <div class="action-icon">
              <i class="fas fa-capsules"></i>
            </div>
            <h3>Product Catalog</h3>
            <p>Manage global product database</p>
          </div>
          
          <div class="quick-action-card" (click)="viewReports()">
            <div class="action-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <h3>System Reports</h3>
            <p>View comprehensive analytics and reports</p>
          </div>
        </div>
      </div>

      <!-- Recent Activities and System Status -->
      <div class="bottom-section">
        <div class="recent-activities">
          <h3 class="section-title">
            <i class="fas fa-history"></i>
            Recent Activities
          </h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [ngClass]="getActivityIconClass(activity.type)">
                <i [class]="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.description }}</div>
                <div class="activity-time">{{ getTimeAgo(activity.date) }}</div>
              </div>
            </div>
            <div class="activity-item" *ngIf="recentActivities.length === 0">
              <div class="activity-icon new-user">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">لا توجد أنشطة حديثة</div>
                <div class="activity-time">--</div>
              </div>
            </div>
          </div>
        </div>

        <div class="system-status">
          <h3 class="section-title">
            <i class="fas fa-server"></i>
            System Status
          </h3>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-indicator online"></div>
              <span>Database</span>
              <span class="status-value">Online</span>
            </div>
            <div class="status-item">
              <div class="status-indicator online"></div>
              <span>API Server</span>
              <span class="status-value">Healthy</span>
            </div>
            <div class="status-item">
              <div class="status-indicator online"></div>
              <span>Payment Gateway</span>
              <span class="status-value">Active</span>
            </div>
            <div class="status-item">
              <div class="status-indicator warning"></div>
              <span>Email Service</span>
              <span class="status-value">Slow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header Styles */
    .dashboard-header {
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
      align-items: center;
      gap: 1rem;
    }

    .current-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      opacity: 0.9;
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

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .metric-card.users::before { background: #3498db; }
    .metric-card.pharmacies::before { background: #2ecc71; }
    .metric-card.products::before { background: #e74c3c; }
    .metric-card.revenue::before { background: #f39c12; }

    .metric-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .users .metric-icon { background: #e3f2fd; color: #3498db; }
    .pharmacies .metric-icon { background: #e8f5e8; color: #2ecc71; }
    .products .metric-icon { background: #ffebee; color: #e74c3c; }
    .revenue .metric-icon { background: #fff3e0; color: #f39c12; }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .metric-label {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .metric-change.positive { color: #27ae60; }
    .metric-change.negative { color: #e74c3c; }

    /* Quick Actions */
    .quick-actions-section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .quick-action-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 2px solid transparent;
    }

    .quick-action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
      border-color: #667eea;
    }

    .action-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      margin: 0 auto 1rem;
    }

    .quick-action-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .quick-action-card p {
      color: #7f8c8d;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Bottom Section */
    .bottom-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .recent-activities,
    .system-status {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
    }

    .activity-icon.new-user { background: #3498db; }
    .activity-icon.product-add { background: #2ecc71; }
    .activity-icon.user-activity { background: #e74c3c; }

    .activity-title {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .activity-time {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .status-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 0.75rem;
    }

    .status-indicator.online { background: #2ecc71; }
    .status-indicator.warning { background: #f39c12; }
    .status-indicator.error { background: #e74c3c; }

    .status-value {
      font-weight: 600;
      font-size: 0.8rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }

      .bottom-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard Statistics
  totalUsers = 0;
  totalPharmacies = 0;
  totalProducts = 0;
  totalRevenue = 0;
  
  // Additional Statistics
  activeUsers = 0;
  newUsersThisMonth = 0;
  activePharmacies = 0;
  pendingPharmacies = 0;
  lowStockProducts = 0;
  totalOrders = 0;
  pendingOrders = 0;
  recentActivities: any[] = [];
  
  // Loading state
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Check if user is logged in and is superadmin
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase();
    
    if (!this.authService.isLoggedIn() || userRole !== 'superadmin') {
      console.log('AdminDashboardComponent: Access denied, redirecting to login');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } else {
      console.log('AdminDashboardComponent: Access granted for superadmin');
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Get dashboard statistics from API using AdminService
    this.adminService.getDashboardStatistics().subscribe({
      next: (data: any) => {
        console.log('Dashboard data received:', data);
        
        // Update main statistics
        this.totalUsers = data.users.total;
        this.totalPharmacies = data.pharmacies.total;
        this.totalProducts = data.products.total;
        this.totalRevenue = data.revenue.total;
        
        // Update additional statistics
        this.activeUsers = data.users.active;
        this.newUsersThisMonth = data.users.newThisMonth;
        this.activePharmacies = data.pharmacies.active;
        this.pendingPharmacies = data.pharmacies.pending;
        this.lowStockProducts = data.products.lowStock;
        this.totalOrders = data.orders.total;
        this.pendingOrders = data.orders.pending;
        this.recentActivities = data.recentActivities || [];
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        // Keep default values on error
      }
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshData() {
    console.log('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  viewReports() {
    console.log('Navigating to reports...');
    // Implement reports navigation
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Helper methods for activities
  getActivityIcon(type: string): string {
    switch (type) {
      case 'order': return 'fas fa-shopping-cart';
      case 'user': return 'fas fa-user-plus';
      case 'pharmacy': return 'fas fa-clinic-medical';
      case 'product': return 'fas fa-plus-circle';
      default: return 'fas fa-bell';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'order': return 'order';
      case 'user': return 'new-user';
      case 'pharmacy': return 'product-add';
      case 'product': return 'user-activity';
      default: return 'new-user';
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffInHours > 0) {
      return `منذ ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      return 'منذ قليل';
    }
  }
} 