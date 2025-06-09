import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  products: number;
  growth: number;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  imageUrl: string;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerSatisfaction: number;
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
              View Reports
            </h1>
            <p class="page-subtitle">Analytics and insights for your pharmacy</p>
          </div>
          <div class="header-actions">
            <select [(ngModel)]="selectedPeriod" (change)="updateReports()" class="period-select">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button (click)="exportReport()" class="action-btn export">
              <i class="fas fa-download"></i>
              Export PDF
            </button>
            <button (click)="refreshData()" class="action-btn refresh">
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Key Metrics Dashboard -->
      <div class="metrics-grid">
        <div class="metric-card revenue">
          <div class="metric-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getTotalRevenue() | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="metric-label">Total Revenue</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +{{ getRevenueGrowth() }}%
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart revenue-chart"></div>
          </div>
        </div>

        <div class="metric-card orders">
          <div class="metric-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getTotalOrders() }}</div>
            <div class="metric-label">Total Orders</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +{{ getOrdersGrowth() }}%
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart orders-chart"></div>
          </div>
        </div>

        <div class="metric-card customers">
          <div class="metric-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getTotalCustomers() }}</div>
            <div class="metric-label">Active Customers</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i>
              +{{ getCustomersGrowth() }}%
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart customers-chart"></div>
          </div>
        </div>

        <div class="metric-card avg-order">
          <div class="metric-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getAverageOrderValue() | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="metric-label">Avg. Order Value</div>
            <div class="metric-change negative">
              <i class="fas fa-arrow-down"></i>
              -{{ getAOVChange() }}%
            </div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart aov-chart"></div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-row">
          <!-- Sales Trend Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-area"></i> Sales Trend</h3>
              <div class="chart-controls">
                <button class="chart-btn active">Revenue</button>
                <button class="chart-btn">Orders</button>
                <button class="chart-btn">Products</button>
              </div>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-visual sales-trend">
                  <div class="trend-line">
                    <div *ngFor="let point of getTrendData(); let i = index" 
                         class="trend-point" 
                         [style.height.%]="point"
                         [style.left.%]="(i * 100) / (getTrendData().length - 1)">
                    </div>
                  </div>
                </div>
                <div class="chart-labels">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Breakdown -->
          <div class="chart-card">
            <div class="chart-header">
              <h3><i class="fas fa-pie-chart"></i> Revenue Breakdown</h3>
              <div class="chart-info">
                <span class="info-badge">{{ selectedPeriod | titlecase }}</span>
              </div>
            </div>
            <div class="chart-container">
              <div class="pie-chart">
                <div class="pie-segments">
                  <div class="pie-segment prescription" style="--percentage: 45"></div>
                  <div class="pie-segment otc" style="--percentage: 30"></div>
                  <div class="pie-segment medical" style="--percentage: 15"></div>
                  <div class="pie-segment other" style="--percentage: 10"></div>
                </div>
                <div class="pie-center">
                  <div class="pie-total">{{ getTotalRevenue() | currency:'EGP':'symbol':'1.0-0' }}</div>
                  <div class="pie-label">Total</div>
                </div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <div class="legend-color prescription"></div>
                  <span>Prescription Drugs (45%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color otc"></div>
                  <span>Over-the-Counter (30%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color medical"></div>
                  <span>Medical Supplies (15%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color other"></div>
                  <span>Other Products (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products & Customer Analytics -->
      <div class="analytics-section">
        <div class="analytics-row">
          <!-- Top Products -->
          <div class="analytics-card">
            <div class="analytics-header">
              <h3><i class="fas fa-star"></i> Top Performing Products</h3>
              <button class="view-all-btn">View All</button>
            </div>
            <div class="top-products">
              <div *ngFor="let product of getTopProducts(); let i = index" class="product-item">
                <div class="product-rank">{{ i + 1 }}</div>
                <div class="product-image">
                  <img [src]="product.imageUrl" [alt]="product.name">
                </div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-category">{{ product.category }}</div>
                </div>
                <div class="product-metrics">
                  <div class="product-sales">{{ product.sales }} sold</div>
                  <div class="product-revenue">{{ product.revenue | currency:'EGP':'symbol':'1.0-0' }}</div>
                </div>
                <div class="product-growth" [class.positive]="product.growth > 0" [class.negative]="product.growth < 0">
                  <i class="fas" [class.fa-arrow-up]="product.growth > 0" [class.fa-arrow-down]="product.growth < 0"></i>
                  {{ Math.abs(product.growth) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Analytics -->
          <div class="analytics-card">
            <div class="analytics-header">
              <h3><i class="fas fa-users-cog"></i> Customer Analytics</h3>
              <div class="analytics-period">{{ selectedPeriod | titlecase }}</div>
            </div>
            <div class="customer-analytics">
              <div class="customer-metric">
                <div class="customer-metric-icon">
                  <i class="fas fa-user-plus"></i>
                </div>
                <div class="customer-metric-content">
                  <div class="customer-metric-value">{{ getCustomerMetrics().newCustomers }}</div>
                  <div class="customer-metric-label">New Customers</div>
                  <div class="customer-metric-change positive">+12%</div>
                </div>
              </div>

              <div class="customer-metric">
                <div class="customer-metric-icon">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="customer-metric-content">
                  <div class="customer-metric-value">{{ getCustomerMetrics().returningCustomers }}</div>
                  <div class="customer-metric-label">Returning Customers</div>
                  <div class="customer-metric-change positive">+8%</div>
                </div>
              </div>

              <div class="customer-metric">
                <div class="customer-metric-icon">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="customer-metric-content">
                  <div class="customer-metric-value">{{ getCustomerMetrics().customerSatisfaction }}%</div>
                  <div class="customer-metric-label">Satisfaction Rate</div>
                  <div class="customer-metric-change positive">+3%</div>
                </div>
              </div>

              <div class="satisfaction-chart">
                <div class="satisfaction-title">Customer Satisfaction Breakdown</div>
                <div class="satisfaction-bars">
                  <div class="satisfaction-bar">
                    <span class="bar-label">Excellent</span>
                    <div class="bar-container">
                      <div class="bar-fill excellent" style="width: 65%"></div>
                    </div>
                    <span class="bar-value">65%</span>
                  </div>
                  <div class="satisfaction-bar">
                    <span class="bar-label">Good</span>
                    <div class="bar-container">
                      <div class="bar-fill good" style="width: 25%"></div>
                    </div>
                    <span class="bar-value">25%</span>
                  </div>
                  <div class="satisfaction-bar">
                    <span class="bar-label">Average</span>
                    <div class="bar-container">
                      <div class="bar-fill average" style="width: 8%"></div>
                    </div>
                    <span class="bar-value">8%</span>
                  </div>
                  <div class="satisfaction-bar">
                    <span class="bar-label">Poor</span>
                    <div class="bar-container">
                      <div class="bar-fill poor" style="width: 2%"></div>
                    </div>
                    <span class="bar-value">2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Insights -->
      <div class="insights-section">
        <div class="insights-row">
          <!-- Performance Insights -->
          <div class="insight-card">
            <div class="insight-header">
              <h3><i class="fas fa-lightbulb"></i> Performance Insights</h3>
            </div>
            <div class="insights-list">
              <div class="insight-item positive">
                <div class="insight-icon">
                  <i class="fas fa-trending-up"></i>
                </div>
                <div class="insight-content">
                  <div class="insight-title">Sales Increase</div>
                  <div class="insight-description">Your sales have increased by 15% compared to last month. Keep up the great work!</div>
                </div>
              </div>

              <div class="insight-item warning">
                <div class="insight-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="insight-content">
                  <div class="insight-title">Low Stock Alert</div>
                  <div class="insight-description">5 products are running low on stock. Consider restocking soon.</div>
                </div>
              </div>

              <div class="insight-item info">
                <div class="insight-icon">
                  <i class="fas fa-info-circle"></i>
                </div>
                <div class="insight-content">
                  <div class="insight-title">Peak Hours</div>
                  <div class="insight-description">Most orders come between 10 AM - 2 PM. Consider staffing accordingly.</div>
                </div>
              </div>

              <div class="insight-item positive">
                <div class="insight-icon">
                  <i class="fas fa-star"></i>
                </div>
                <div class="insight-content">
                  <div class="insight-title">Customer Feedback</div>
                  <div class="insight-description">You received 12 positive reviews this week. Great customer service!</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-card">
            <div class="quick-actions-header">
              <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            </div>
            <div class="quick-actions-grid">
              <button class="quick-action-btn">
                <i class="fas fa-file-pdf"></i>
                <span>Generate Report</span>
              </button>
              <button class="quick-action-btn">
                <i class="fas fa-envelope"></i>
                <span>Email Summary</span>
              </button>
              <button class="quick-action-btn">
                <i class="fas fa-chart-bar"></i>
                <span>Custom Analytics</span>
              </button>
              <button class="quick-action-btn">
                <i class="fas fa-cog"></i>
                <span>Report Settings</span>
              </button>
              <button class="quick-action-btn">
                <i class="fas fa-calendar"></i>
                <span>Schedule Report</span>
              </button>
              <button class="quick-action-btn">
                <i class="fas fa-share-alt"></i>
                <span>Share Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .reports-header {
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
      color: #4a5568;
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .period-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #1a202c;
      font-weight: 600;
      cursor: pointer;
    }

    .action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .action-btn.export {
      background: #48bb78;
      color: white;
    }

    .action-btn.refresh {
      background: #4299e1;
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .metric-card:hover {
      transform: translateY(-4px);
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      z-index: 2;
    }

    .metric-card.revenue .metric-icon {
      background: linear-gradient(135deg, #48bb78, #38a169);
    }

    .metric-card.orders .metric-icon {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .metric-card.customers .metric-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .metric-card.avg-order .metric-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .metric-content {
      flex: 1;
      z-index: 2;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      line-height: 1;
    }

    .metric-label {
      color: #4a5568;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .metric-change {
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-change.positive {
      color: #10b981;
    }

    .metric-change.negative {
      color: #ef4444;
    }

    .metric-chart {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 80px;
      height: 40px;
      opacity: 0.1;
    }

    .mini-chart {
      width: 100%;
      height: 100%;
      background: currentColor;
      border-radius: 4px;
    }

    /* Charts Section */
    .charts-section {
      margin-bottom: 2rem;
    }

    .chart-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .chart-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
    }

    .chart-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      color: #4a5568;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8rem;
    }

    .chart-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .chart-container {
      height: 250px;
      position: relative;
    }

    .chart-placeholder {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .chart-visual {
      width: 100%;
      height: 200px;
      position: relative;
    }

    .trend-line {
      position: relative;
      height: 100%;
      background: linear-gradient(to right, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-radius: 8px;
    }

    .trend-point {
      position: absolute;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to top, #667eea, #764ba2);
      border-radius: 2px;
      animation: growUp 1s ease-out;
    }

    @keyframes growUp {
      from { height: 0%; }
      to { height: var(--height, 50%); }
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      color: #6b7280;
      font-size: 0.8rem;
    }

    /* Pie Chart */
    .pie-chart {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto;
    }

    .pie-segments {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(
        #667eea 0% 45%,
        #48bb78 45% 75%,
        #f59e0b 75% 90%,
        #ef4444 90% 100%
      );
      position: relative;
    }

    .pie-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .pie-total {
      font-size: 1rem;
      font-weight: 700;
      color: #1a202c;
    }

    .pie-label {
      font-size: 0.7rem;
      color: #6b7280;
    }

    .pie-legend {
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.prescription { background: #667eea; }
    .legend-color.otc { background: #48bb78; }
    .legend-color.medical { background: #f59e0b; }
    .legend-color.other { background: #ef4444; }

    /* Analytics Section */
    .analytics-section {
      margin-bottom: 2rem;
    }

    .analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .analytics-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .analytics-header h3 {
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .view-all-btn {
      background: none;
      border: 1px solid #e2e8f0;
      color: #667eea;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    /* Top Products */
    .product-item {
      display: grid;
      grid-template-columns: 30px 50px 1fr auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .product-item:last-child {
      border-bottom: none;
    }

    .product-rank {
      width: 24px;
      height: 24px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .product-image img {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
    }

    .product-name {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.9rem;
    }

    .product-category {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .product-metrics {
      text-align: right;
    }

    .product-sales {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .product-revenue {
      font-weight: 600;
      color: #1a202c;
    }

    .product-growth {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Customer Analytics */
    .customer-metric {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .customer-metric-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .customer-metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
    }

    .customer-metric-label {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .customer-metric-change {
      font-size: 0.8rem;
      font-weight: 600;
      color: #10b981;
    }

    .satisfaction-chart {
      margin-top: 1.5rem;
    }

    .satisfaction-title {
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .satisfaction-bar {
      display: grid;
      grid-template-columns: 80px 1fr 40px;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .bar-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .bar-container {
      background: #e2e8f0;
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease-out;
    }

    .bar-fill.excellent { background: #10b981; }
    .bar-fill.good { background: #48bb78; }
    .bar-fill.average { background: #f59e0b; }
    .bar-fill.poor { background: #ef4444; }

    .bar-value {
      font-size: 0.8rem;
      font-weight: 600;
      color: #1a202c;
      text-align: right;
    }

    /* Insights Section */
    .insights-section {
      margin-bottom: 2rem;
    }

    .insights-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .insight-card, .quick-actions-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .insight-header, .quick-actions-header {
      margin-bottom: 1.5rem;
    }

    .insight-header h3, .quick-actions-header h3 {
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .insight-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid;
    }

    .insight-item.positive {
      background: #f0fff4;
      border-color: #10b981;
    }

    .insight-item.warning {
      background: #fffbeb;
      border-color: #f59e0b;
    }

    .insight-item.info {
      background: #eff6ff;
      border-color: #3b82f6;
    }

    .insight-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .insight-item.positive .insight-icon {
      background: #10b981;
    }

    .insight-item.warning .insight-icon {
      background: #f59e0b;
    }

    .insight-item.info .insight-icon {
      background: #3b82f6;
    }

    .insight-title {
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 0.25rem;
    }

    .insight-description {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #4a5568;
    }

    .quick-action-btn:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .quick-action-btn i {
      font-size: 1.5rem;
    }

    .quick-action-btn span {
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .chart-row {
        grid-template-columns: 1fr;
      }
      
      .analytics-row {
        grid-template-columns: 1fr;
      }
      
      .insights-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .reports-container {
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
    }
  `]
})
export class ReportsComponent implements OnInit {
  selectedPeriod = 'month';
  Math = Math;

  private salesData: SalesData[] = [
    { period: 'Jan', revenue: 45000, orders: 120, products: 850, growth: 12 },
    { period: 'Feb', revenue: 52000, orders: 135, products: 920, growth: 15 },
    { period: 'Mar', revenue: 48000, orders: 128, products: 890, growth: 8 },
    { period: 'Apr', revenue: 58000, orders: 145, products: 950, growth: 20 },
    { period: 'May', revenue: 62000, orders: 155, products: 980, growth: 25 },
    { period: 'Jun', revenue: 68000, orders: 168, products: 1020, growth: 30 }
  ];

  private topProducts: TopProduct[] = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      sales: 245,
      revenue: 6125,
      growth: 15,
      imageUrl: 'https://via.placeholder.com/40x40?text=P'
    },
    {
      id: 2,
      name: 'Vitamin D3 1000 IU',
      category: 'Supplements',
      sales: 180,
      revenue: 15400,
      growth: 22,
      imageUrl: 'https://via.placeholder.com/40x40?text=V'
    },
    {
      id: 3,
      name: 'Digital Thermometer',
      category: 'Medical Devices',
      sales: 95,
      revenue: 11400,
      growth: -5,
      imageUrl: 'https://via.placeholder.com/40x40?text=T'
    },
    {
      id: 4,
      name: 'Hand Sanitizer 500ml',
      category: 'Hygiene',
      sales: 320,
      revenue: 9600,
      growth: 35,
      imageUrl: 'https://via.placeholder.com/40x40?text=H'
    },
    {
      id: 5,
      name: 'Blood Pressure Monitor',
      category: 'Medical Devices',
      sales: 45,
      revenue: 20250,
      growth: 8,
      imageUrl: 'https://via.placeholder.com/40x40?text=B'
    }
  ];

  private customerMetrics: CustomerMetrics = {
    totalCustomers: 1245,
    newCustomers: 156,
    returningCustomers: 1089,
    averageOrderValue: 185,
    customerSatisfaction: 92
  };

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  updateReports(): void {
    console.log('Updating reports for period:', this.selectedPeriod);
    // Simulate data refresh
  }

  exportReport(): void {
    console.log('Exporting report...');
    // Implement PDF export logic
  }

  refreshData(): void {
    console.log('Refreshing data...');
    // Implement data refresh logic
  }

  getTotalRevenue(): number {
    return this.salesData[this.salesData.length - 1]?.revenue || 68000;
  }

  getRevenueGrowth(): number {
    return this.salesData[this.salesData.length - 1]?.growth || 15;
  }

  getTotalOrders(): number {
    return this.salesData[this.salesData.length - 1]?.orders || 168;
  }

  getOrdersGrowth(): number {
    return 12;
  }

  getTotalCustomers(): number {
    return this.customerMetrics.totalCustomers;
  }

  getCustomersGrowth(): number {
    return 8;
  }

  getAverageOrderValue(): number {
    return this.customerMetrics.averageOrderValue;
  }

  getAOVChange(): number {
    return 3;
  }

  getTrendData(): number[] {
    return [20, 35, 25, 45, 55, 70, 85, 75, 90, 80, 95, 88];
  }

  getTopProducts(): TopProduct[] {
    return this.topProducts;
  }

  getCustomerMetrics(): CustomerMetrics {
    return this.customerMetrics;
  }
} 