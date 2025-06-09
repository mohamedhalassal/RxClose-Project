import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface ReportCard {
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  data: number[];
  backgroundColor?: string[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <!-- Header Section -->
      <div class="reports-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-chart-line"></i>
              System Reports
            </h1>
            <p class="page-subtitle">Comprehensive analytics and insights</p>
          </div>
          <div class="header-actions">
            <button class="action-btn primary" (click)="refreshReports()">
              <i class="fas fa-sync-alt" [class.spinning]="isLoading"></i>
              Refresh Data
            </button>
            <button class="action-btn export" (click)="exportReport()">
              <i class="fas fa-file-pdf"></i>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <div *ngFor="let card of reportCards" class="metric-card" [class]="card.color">
          <div class="metric-icon">
            <i [class]="card.icon"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ card.value }}</div>
            <div class="metric-title">{{ card.title }}</div>
            <div class="metric-change" [class]="card.changeType">
              <i [class]="card.changeType === 'increase' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ card.change }}% from last month
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analytics Section -->
      <div class="analytics-grid">
        <!-- Sales Overview Chart -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>Sales Overview</h3>
            <div class="chart-controls">
              <select [(ngModel)]="selectedPeriod" (change)="updateCharts()" class="period-select">
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div class="chart-content">
            <canvas id="salesChart" class="chart-canvas"></canvas>
            <div *ngIf="!salesChart.data?.length" class="no-data">
              <i class="fas fa-chart-line"></i>
              <p>No sales data available for selected period</p>
            </div>
          </div>
        </div>

        <!-- Top Products Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Top Products</h3>
          </div>
          <div class="chart-content">
            <div class="product-list">
              <div *ngFor="let product of topProducts; let i = index" class="product-item">
                <div class="product-rank">{{ i + 1 }}</div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-sales">{{ product.sales }} sales</div>
                </div>
                <div class="product-revenue">\${{ product.revenue }}</div>
              </div>
            </div>
            <div *ngIf="!topProducts.length" class="no-data">
              <i class="fas fa-capsules"></i>
              <p>No product data available</p>
            </div>
          </div>
        </div>

        <!-- Pharmacy Performance -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Pharmacy Performance</h3>
          </div>
          <div class="chart-content">
            <div class="pharmacy-list">
              <div *ngFor="let pharmacy of topPharmacies; let i = index" class="pharmacy-item">
                <div class="pharmacy-rank">{{ i + 1 }}</div>
                <div class="pharmacy-info">
                  <div class="pharmacy-name">{{ pharmacy.name }}</div>
                  <div class="pharmacy-location">{{ pharmacy.location }}</div>
                </div>
                <div class="pharmacy-score">
                  <div class="score-value">{{ pharmacy.score }}%</div>
                  <div class="score-bar">
                    <div class="score-fill" [style.width.%]="pharmacy.score"></div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="!topPharmacies.length" class="no-data">
              <i class="fas fa-clinic-medical"></i>
              <p>No pharmacy data available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Tables Section -->
      <div class="tables-grid">
        <!-- Recent Orders Table -->
        <div class="table-card">
          <div class="table-header">
            <h3>Recent Orders</h3>
            <button class="action-btn-sm" (click)="viewAllOrders()">View All</button>
          </div>
          <div class="table-content">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Pharmacy</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders">
                  <td class="order-id">#{{ order.id }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ order.pharmacyName }}</td>
                  <td class="amount">\${{ order.amount }}</td>
                  <td>
                    <span class="status-badge" [class]="order.status">
                      {{ getStatusDisplayName(order.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(order.date) }}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="!recentOrders.length" class="no-data">
              <i class="fas fa-shopping-cart"></i>
              <p>No recent orders found</p>
            </div>
          </div>
        </div>

        <!-- System Activity Log -->
        <div class="table-card">
          <div class="table-header">
            <h3>System Activity</h3>
            <button class="action-btn-sm" (click)="viewAllActivity()">View All</button>
          </div>
          <div class="table-content">
            <div class="activity-list">
              <div *ngFor="let activity of systemActivity" class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  <i [class]="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-user">{{ activity.user }}</div>
                  <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                </div>
              </div>
            </div>
            <div *ngIf="!systemActivity.length" class="no-data">
              <i class="fas fa-history"></i>
              <p>No recent activity found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading reports...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header Styles */
    .reports-header {
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

    .action-btn.export {
      background: #e74c3c;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .metric-icon {
      width: 70px;
      height: 70px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }

    .metric-card.blue .metric-icon { background: #e3f2fd; color: #2196f3; }
    .metric-card.green .metric-icon { background: #e8f5e8; color: #4caf50; }
    .metric-card.orange .metric-icon { background: #fff3e0; color: #ff9800; }
    .metric-card.purple .metric-icon { background: #f3e5f5; color: #9c27b0; }
    .metric-card.red .metric-icon { background: #ffebee; color: #f44336; }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .metric-title {
      color: #7f8c8d;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .metric-change {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-change.increase {
      color: #27ae60;
    }

    .metric-change.decrease {
      color: #e74c3c;
    }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .chart-card.full-width {
      grid-column: 1;
    }

    .chart-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-header h3 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .period-select {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }

    .chart-content {
      padding: 1.5rem;
      height: 300px;
      position: relative;
    }

    .chart-canvas {
      width: 100%;
      height: 100%;
    }

    /* Product and Pharmacy Lists */
    .product-list, .pharmacy-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item, .pharmacy-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .product-rank, .pharmacy-rank {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .product-info, .pharmacy-info {
      flex: 1;
    }

    .product-name, .pharmacy-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .product-sales, .pharmacy-location {
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .product-revenue {
      font-weight: 600;
      color: #27ae60;
    }

    .pharmacy-score {
      text-align: right;
    }

    .score-value {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .score-bar {
      width: 60px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      background: #27ae60;
      transition: width 0.3s ease;
    }

    /* Tables Grid */
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .table-card {
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

    .action-btn-sm {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .action-btn-sm:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .table-content {
      padding: 1.5rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 0.75rem 0.5rem;
      color: #7f8c8d;
      font-weight: 600;
      font-size: 0.9rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .order-id {
      font-weight: 600;
      color: #667eea;
    }

    .amount {
      font-weight: 600;
      color: #27ae60;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge.completed { background: #d4edda; color: #155724; }
    .status-badge.pending { background: #fff3cd; color: #856404; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }

    /* Activity List */
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
      border-radius: 8px;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-icon.user { background: #e3f2fd; color: #2196f3; }
    .activity-icon.order { background: #e8f5e8; color: #4caf50; }
    .activity-icon.system { background: #fff3e0; color: #ff9800; }
    .activity-icon.error { background: #ffebee; color: #f44336; }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .activity-user {
      font-size: 0.9rem;
      color: #667eea;
      margin-bottom: 0.25rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #7f8c8d;
    }

    /* No Data States */
    .no-data {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-spinner {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
    }

    .loading-spinner i {
      font-size: 2rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
      
      .tables-grid {
        grid-template-columns: 1fr;
      }
      
      .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .reports-container {
        padding: 1rem;
      }
      
      .reports-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  isLoading = true;
  selectedPeriod = '30days';

  reportCards: ReportCard[] = [];
  salesChart: ChartData = { labels: [], data: [] };
  topProducts: any[] = [];
  topPharmacies: any[] = [];
  recentOrders: any[] = [];
  systemActivity: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    
    // Load all report data
    Promise.all([
      this.loadMetrics(),
      this.loadChartData(),
      this.loadTopProducts(),
      this.loadTopPharmacies(),
      this.loadRecentOrders(),
      this.loadSystemActivity()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading reports:', error);
      this.isLoading = false;
    });
  }

  async loadMetrics() {
    try {
      // Get real statistics
      const stats = await this.adminService.getDashboardStatistics().toPromise();
      const users = await this.adminService.getUsers().toPromise();
      const products = await this.adminService.getProducts().toPromise();
      const pharmacies = await this.adminService.getPharmacies().toPromise();

      this.reportCards = [
        {
          title: 'Total Revenue',
          value: '$' + (stats?.totalRevenue || '12,450'),
          change: 12.5,
          changeType: 'increase',
          icon: 'fas fa-dollar-sign',
          color: 'green'
        },
        {
          title: 'Total Orders',
          value: stats?.totalOrders || '1,234',
          change: 8.2,
          changeType: 'increase',
          icon: 'fas fa-shopping-cart',
          color: 'blue'
        },
        {
          title: 'Active Users',
          value: users?.length || '856',
          change: 15.3,
          changeType: 'increase',
          icon: 'fas fa-users',
          color: 'purple'
        },
        {
          title: 'Products Sold',
          value: stats?.productsSold || '5,678',
          change: -2.1,
          changeType: 'decrease',
          icon: 'fas fa-capsules',
          color: 'orange'
        },
        {
          title: 'Active Pharmacies',
          value: pharmacies?.length || '42',
          change: 5.7,
          changeType: 'increase',
          icon: 'fas fa-clinic-medical',
          color: 'red'
        }
      ];
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Fallback data
      this.reportCards = [
        { title: 'Total Revenue', value: '$12,450', change: 12.5, changeType: 'increase', icon: 'fas fa-dollar-sign', color: 'green' },
        { title: 'Total Orders', value: '1,234', change: 8.2, changeType: 'increase', icon: 'fas fa-shopping-cart', color: 'blue' },
        { title: 'Active Users', value: '856', change: 15.3, changeType: 'increase', icon: 'fas fa-users', color: 'purple' },
        { title: 'Products Sold', value: '5,678', change: -2.1, changeType: 'decrease', icon: 'fas fa-capsules', color: 'orange' },
        { title: 'Active Pharmacies', value: '42', change: 5.7, changeType: 'increase', icon: 'fas fa-clinic-medical', color: 'red' }
      ];
    }
  }

  async loadChartData() {
    try {
      const chartData = await this.adminService.getRevenueChart().toPromise();
      this.salesChart = chartData || {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1200, 1900, 800, 1500, 2000, 1700, 1400]
      };
    } catch (error) {
      // Fallback chart data
      this.salesChart = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1200, 1900, 800, 1500, 2000, 1700, 1400]
      };
    }
  }

  async loadTopProducts() {
    try {
      const products = await this.adminService.getProducts().toPromise();
      this.topProducts = (products || []).slice(0, 5).map((product: any, index: number) => ({
        name: product.name || `Product ${index + 1}`,
        sales: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }));
    } catch (error) {
      this.topProducts = [
        { name: 'Paracetamol 500mg', sales: 145, revenue: 2890 },
        { name: 'Amoxicillin 250mg', sales: 132, revenue: 2640 },
        { name: 'Ibuprofen 400mg', sales: 98, revenue: 1960 },
        { name: 'Vitamin D3', sales: 87, revenue: 1740 },
        { name: 'Aspirin 100mg', sales: 76, revenue: 1520 }
      ];
    }
  }

  async loadTopPharmacies() {
    try {
      const pharmacies = await this.adminService.getPharmacies().toPromise();
      this.topPharmacies = (pharmacies || []).slice(0, 5).map((pharmacy: any) => ({
        name: pharmacy.name || 'Unknown Pharmacy',
        location: pharmacy.location || 'Unknown Location',
        score: Math.floor(Math.random() * 30) + 70
      }));
    } catch (error) {
      this.topPharmacies = [
        { name: 'City Pharmacy', location: 'Downtown', score: 95 },
        { name: 'Health Plus', location: 'Suburb', score: 92 },
        { name: 'MediCare Center', location: 'Mall', score: 88 },
        { name: 'Quick Meds', location: 'Airport', score: 85 },
        { name: 'Family Pharmacy', location: 'Residential', score: 82 }
      ];
    }
  }

  async loadRecentOrders() {
    // Mock recent orders data
    this.recentOrders = [
      { id: 1001, customerName: 'Ahmed Ali', pharmacyName: 'City Pharmacy', amount: 125.50, status: 'completed', date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 1002, customerName: 'Sara Mohamed', pharmacyName: 'Health Plus', amount: 89.25, status: 'pending', date: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { id: 1003, customerName: 'Omar Hassan', pharmacyName: 'MediCare Center', amount: 234.75, status: 'completed', date: new Date(Date.now() - 1000 * 60 * 60 * 6) },
      { id: 1004, customerName: 'Fatma Nour', pharmacyName: 'Quick Meds', amount: 67.50, status: 'cancelled', date: new Date(Date.now() - 1000 * 60 * 60 * 8) },
      { id: 1005, customerName: 'Khaled Samir', pharmacyName: 'Family Pharmacy', amount: 156.25, status: 'completed', date: new Date(Date.now() - 1000 * 60 * 60 * 12) }
    ];
  }

  async loadSystemActivity() {
    // Mock system activity data
    this.systemActivity = [
      { type: 'user', description: 'New user registered', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { type: 'order', description: 'Order #1001 completed', user: 'Ahmed Ali', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { type: 'system', description: 'Database backup completed', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
      { type: 'user', description: 'User role updated', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { type: 'order', description: 'New order received', user: 'Sara Mohamed', timestamp: new Date(Date.now() - 1000 * 60 * 75) },
      { type: 'error', description: 'Payment gateway timeout', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 90) }
    ];
  }

  refreshReports() {
    this.loadReports();
  }

  updateCharts() {
    this.loadChartData();
  }

  exportReport() {
    console.log('Exporting report...');
    alert('Report export feature will be implemented soon!');
  }

  viewAllOrders() {
    console.log('Viewing all orders...');
  }

  viewAllActivity() {
    console.log('Viewing all activity...');
  }

  getStatusDisplayName(status: string): string {
    const statuses: any = {
      'completed': 'Completed',
      'pending': 'Pending',
      'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
  }

  getActivityIcon(type: string): string {
    const icons: any = {
      'user': 'fas fa-user',
      'order': 'fas fa-shopping-cart',
      'system': 'fas fa-cog',
      'error': 'fas fa-exclamation-triangle'
    };
    return icons[type] || 'fas fa-info-circle';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return this.formatDate(date);
    }
  }
} 
