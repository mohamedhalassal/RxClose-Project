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
      <div *ngIf="!isLoading">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <i class="fas fa-tachometer-alt"></i>
                لوحة تحكم السوبر أدمن
              </h1>
              <p class="page-subtitle">نظرة شاملة على النظام والإدارة</p>
            </div>
            <div class="header-actions">
              <div class="current-time">
                <i class="fas fa-clock"></i>
                <span>{{ getCurrentTime() }}</span>
              </div>
              <button class="action-btn refresh" (click)="refreshData()">
                <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
                تحديث
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
              <div class="metric-label">إجمالي المستخدمين</div>
              <div class="metric-change positive">
                <i class="fas fa-arrow-up"></i>
                +{{ newUsersThisMonth }} هذا الشهر
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
              <div class="metric-label">الصيدليات النشطة</div>
              <div class="metric-change" [ngClass]="pendingPharmacies > 0 ? 'warning' : 'positive'">
                <i class="fas fa-clock"></i>
                {{ pendingPharmacies }} في الانتظار
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
              <div class="metric-label">المنتجات في الكتالوج</div>
              <div class="metric-change" [ngClass]="lowStockProducts > 0 ? 'warning' : 'positive'">
                <i class="fas fa-exclamation-triangle"></i>
                {{ lowStockProducts }} منخفض المخزون
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
              <div class="metric-label">إيرادات النظام</div>
              <div class="metric-change positive">
                <i class="fas fa-shopping-cart"></i>
                {{ totalOrders }} طلب
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
            الإجراءات السريعة
          </h2>
          <div class="quick-actions-grid">
            <div class="quick-action-card" routerLink="/admin/users">
              <div class="action-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <h3>إدارة المستخدمين</h3>
              <p>إضافة وتعديل وحذف المستخدمين من النظام</p>
            </div>
            
            <div class="quick-action-card" routerLink="/admin/pharmacies">
              <div class="action-icon">
                <i class="fas fa-store-alt"></i>
              </div>
              <h3>إدارة الصيدليات</h3>
              <p>الإشراف على تسجيل الصيدليات وعملياتها</p>
            </div>
            
            <div class="quick-action-card" routerLink="/admin/products">
              <div class="action-icon">
                <i class="fas fa-capsules"></i>
              </div>
              <h3>كتالوج المنتجات</h3>
              <p>إدارة قاعدة بيانات المنتجات العامة</p>
            </div>
            
            <div class="quick-action-card" (click)="viewReports()">
              <div class="action-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <h3>تقارير النظام</h3>
              <p>عرض التحليلات والتقارير الشاملة</p>
            </div>
          </div>
        </div>

        <!-- Recent Activities and System Status -->
        <div class="bottom-section">
          <div class="recent-activities">
            <h3 class="section-title">
              <i class="fas fa-history"></i>
              الأنشطة الحديثة
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
              حالة النظام
            </h3>
            <div class="status-grid">
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>قاعدة البيانات</span>
                <span class="status-value">متصلة</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>خادم API</span>
                <span class="status-value">صحي</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>بوابة الدفع</span>
                <span class="status-value">نشطة</span>
              </div>
              <div class="status-item">
                <div class="status-indicator" [ngClass]="pendingOrders > 5 ? 'warning' : 'online'"></div>
                <span>الطلبات</span>
                <span class="status-value">{{ pendingOrders }} في الانتظار</span>
              </div>
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

    /* Loading Styles */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50vh;
    }

    .loading-spinner {
      text-align: center;
      color: #667eea;
    }

    .loading-spinner i {
      font-size: 3rem;
      margin-bottom: 1rem;
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
      font-size: 1rem;
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
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
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
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .metric-card.users { border-left: 4px solid #3498db; }
    .metric-card.pharmacies { border-left: 4px solid #2ecc71; }
    .metric-card.products { border-left: 4px solid #e74c3c; }
    .metric-card.revenue { border-left: 4px solid #f39c12; }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .users .metric-icon { background: linear-gradient(135deg, #3498db, #2980b9); }
    .pharmacies .metric-icon { background: linear-gradient(135deg, #2ecc71, #27ae60); }
    .products .metric-icon { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .revenue .metric-icon { background: linear-gradient(135deg, #f39c12, #e67e22); }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 2rem;
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

    .metric-change.positive { color: #2ecc71; }
    .metric-change.warning { color: #f39c12; }
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
      gap: 0.5rem;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
    .activity-icon.order { background: #f39c12; }

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
    
    // Get dashboard statistics from API
    this.http.get(`${environment.apiUrl}/Dashboard/statistics`).subscribe({
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