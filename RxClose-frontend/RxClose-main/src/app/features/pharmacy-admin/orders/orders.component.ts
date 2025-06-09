import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../services/pharmacy.service';

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: Date;
  amount: number;
  status: string;
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  notes?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <!-- Header Section -->
      <div class="orders-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-clipboard-list"></i>
              Process Orders
            </h1>
            <p class="page-subtitle">View and manage customer orders efficiently</p>
          </div>
          <div class="header-actions">
            <button (click)="exportOrders()" class="action-btn export">
              <i class="fas fa-download"></i>
              Export Orders
            </button>
            <button (click)="loadOrders()" class="action-btn refresh">
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getPendingCount() }}</div>
            <div class="stat-label">Pending Orders</div>
            <div class="stat-change">{{ getPendingPercent() }}</div>
          </div>
        </div>

        <div class="stat-card processing">
          <div class="stat-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getProcessingCount() }}</div>
            <div class="stat-label">Processing</div>
            <div class="stat-change">{{ getProcessingPercent() }}</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getCompletedCount() }}</div>
            <div class="stat-label">Completed</div>
            <div class="stat-change">{{ getCompletedPercent() }}</div>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getTotalRevenue() | currency:'EGP':'symbol':'1.0-0' }}</div>
            <div class="stat-label">Total Revenue</div>
            <div class="stat-change">+12.5%</div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-card">
          <div class="filter-header">
            <i class="fas fa-filter"></i>
            <span>Filter Orders</span>
          </div>
          <div class="filter-controls">
            <div class="filter-group">
              <label>Order Status</label>
              <select [(ngModel)]="statusFilter" (change)="filterOrders()" class="filter-select">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Search Customer</label>
              <input type="text" [(ngModel)]="searchTerm" (input)="filterOrders()" 
                     placeholder="Search by customer name..." class="search-input">
            </div>
            <div class="filter-group">
              <label>Date Range</label>
              <select class="filter-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="orders-table-section">
        <div class="table-header">
          <h3><i class="fas fa-list"></i> Orders List ({{ filteredOrders.length }})</h3>
        </div>
        
        <div class="orders-table">
          <div class="table-header-row">
            <div class="table-cell">Order ID</div>
            <div class="table-cell">Customer</div>
            <div class="table-cell">Date</div>
            <div class="table-cell">Items</div>
            <div class="table-cell">Amount</div>
            <div class="table-cell">Status</div>
            <div class="table-cell">Actions</div>
          </div>

          <div *ngFor="let order of filteredOrders" class="table-row">
            <div class="table-cell order-id">
              <strong>#{{ order.id }}</strong>
            </div>
            
            <div class="table-cell customer-info">
              <div class="customer-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="customer-details">
                <div class="customer-name">{{ order.customerName }}</div>
                <div class="customer-phone">{{ order.customerPhone }}</div>
              </div>
            </div>

            <div class="table-cell date-info">
              <div class="order-date">{{ order.date | date:'MMM dd, yyyy' }}</div>
              <div class="order-time">{{ order.date | date:'HH:mm' }}</div>
            </div>

            <div class="table-cell items-count">
              <span class="items-badge">{{ order.items.length }} items</span>
            </div>

            <div class="table-cell amount">
              <span class="price">{{ order.amount | currency:'EGP':'symbol':'1.0-2' }}</span>
            </div>

            <div class="table-cell status">
              <select [(ngModel)]="order.status" (change)="updateOrderStatus(order)" 
                      class="status-select" [class]="'status-' + order.status">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="table-cell actions">
              <button (click)="viewOrderDetails(order)" class="action-btn view" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button (click)="printOrder(order)" class="action-btn print" title="Print Order">
                <i class="fas fa-print"></i>
              </button>
              <button class="action-btn edit" title="Edit Order">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- No Orders Message -->
        <div *ngIf="filteredOrders.length === 0" class="no-orders">
          <div class="no-orders-icon">
            <i class="fas fa-clipboard"></i>
          </div>
          <h3>No Orders Found</h3>
          <p>{{ statusFilter ? 'No orders match the selected status' : 'No orders available' }}</p>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div *ngIf="selectedOrder" class="modal-overlay" (click)="closeOrderDetails()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <i class="fas fa-receipt"></i>
              Order Details #{{ selectedOrder.id }}
            </h2>
            <button (click)="closeOrderDetails()" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="order-details-grid">
              <!-- Customer Information -->
              <div class="detail-section">
                <h3><i class="fas fa-user"></i> Customer Information</h3>
                <div class="detail-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedOrder.customerName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Phone:</span>
                  <span class="value">{{ selectedOrder.customerPhone }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedOrder.customerEmail }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Address:</span>
                  <span class="value">{{ selectedOrder.deliveryAddress }}</span>
                </div>
              </div>

              <!-- Order Information -->
              <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Order Information</h3>
                <div class="detail-item">
                  <span class="label">Order Date:</span>
                  <span class="value">{{ selectedOrder.date | date:'full' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Payment Method:</span>
                  <span class="value">{{ selectedOrder.paymentMethod }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="value status-badge" [class]="'status-' + selectedOrder.status">
                    {{ selectedOrder.status | titlecase }}
                  </span>
                </div>
                <div class="detail-item" *ngIf="selectedOrder.notes">
                  <span class="label">Notes:</span>
                  <span class="value">{{ selectedOrder.notes }}</span>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="detail-section">
              <h3><i class="fas fa-box"></i> Order Items</h3>
              <div class="items-list">
                <div *ngFor="let item of selectedOrder.items" class="item-row">
                  <div class="item-image">
                    <img [src]="item.imageUrl || 'https://via.placeholder.com/50x50?text=RX'" 
                         [alt]="item.productName">
                  </div>
                  <div class="item-details">
                    <div class="item-name">{{ item.productName }}</div>
                    <div class="item-price">{{ item.price | currency:'EGP':'symbol':'1.0-2' }} each</div>
                  </div>
                  <div class="item-quantity">
                    <span>Qty: {{ item.quantity }}</span>
                  </div>
                  <div class="item-total">
                    <strong>{{ (item.price * item.quantity) | currency:'EGP':'symbol':'1.0-2' }}</strong>
                  </div>
                </div>
              </div>
              
              <div class="order-total">
                <div class="total-row">
                  <span class="total-label">Total Amount:</span>
                  <span class="total-amount">{{ selectedOrder.amount | currency:'EGP':'symbol':'1.0-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="printOrder(selectedOrder)" class="btn primary">
              <i class="fas fa-print"></i>
              Print Order
            </button>
            <button (click)="closeOrderDetails()" class="btn secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .orders-header {
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

    /* Statistics Grid */
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

    .stat-card.pending .stat-icon {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }

    .stat-card.processing .stat-icon {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .stat-card.completed .stat-icon {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .stat-card.revenue .stat-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      line-height: 1;
    }

    .stat-label {
      color: #4a5568;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .stat-change {
      color: #10b981;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    /* Filters Section */
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
      margin-bottom: 1rem;
      color: #1a202c;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .filter-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .filter-select, .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #1a202c;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .filter-select:focus, .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Orders Table */
    .orders-table-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      margin-bottom: 1.5rem;
    }

    .table-header h3 {
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
    }

    .orders-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .table-header-row {
      display: grid;
      grid-template-columns: 100px 200px 120px 100px 120px 140px 120px;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 100px 200px 120px 100px 120px 140px 120px;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      align-items: center;
    }

    .table-row:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .table-cell {
      display: flex;
      align-items: center;
    }

    .order-id {
      color: #667eea;
      font-weight: 600;
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .customer-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .customer-details {
      flex: 1;
    }

    .customer-name {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.9rem;
    }

    .customer-phone {
      color: #4a5568;
      font-size: 0.8rem;
    }

    .date-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .order-date {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.9rem;
    }

    .order-time {
      color: #4a5568;
      font-size: 0.8rem;
    }

    .items-badge {
      background: #e2e8f0;
      color: #4a5568;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .price {
      font-weight: 700;
      color: #059669;
      font-size: 1rem;
    }

    .status-select {
      padding: 0.5rem;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      color: white;
    }

    .status-select.status-pending {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }

    .status-select.status-processing {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .status-select.status-completed {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .status-select.status-cancelled {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .actions {
      gap: 0.5rem;
    }

    .action-btn.view {
      background: #667eea;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .action-btn.print {
      background: #10b981;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .action-btn.edit {
      background: #f59e0b;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    /* No Orders */
    .no-orders {
      text-align: center;
      padding: 3rem;
      color: #4a5568;
    }

    .no-orders-icon {
      font-size: 4rem;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 16px 16px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .detail-section {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .detail-section h3 {
      color: #1a202c;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item .label {
      font-weight: 600;
      color: #4a5568;
    }

    .detail-item .value {
      color: #1a202c;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
    }

    .status-badge.status-pending {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }

    .status-badge.status-processing {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .status-badge.status-completed {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .items-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-row {
      display: grid;
      grid-template-columns: 60px 1fr 80px 100px;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      align-items: center;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-image img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-name {
      font-weight: 600;
      color: #1a202c;
    }

    .item-price {
      color: #4a5568;
      font-size: 0.9rem;
    }

    .item-quantity {
      text-align: center;
      font-weight: 600;
      color: #4a5568;
    }

    .item-total {
      text-align: right;
      color: #059669;
      font-weight: 700;
    }

    .order-total {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      font-weight: 600;
      color: #1a202c;
      font-size: 1.1rem;
    }

    .total-amount {
      font-weight: 700;
      color: #059669;
      font-size: 1.25rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn.secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .table-header-row, .table-row {
        grid-template-columns: 80px 180px 100px 80px 100px 120px 100px;
        gap: 0.5rem;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 768px) {
      .orders-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .order-details-grid {
        grid-template-columns: 1fr;
      }
      
      .table-header-row, .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .table-cell {
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .table-cell:before {
        content: attr(data-label);
        font-weight: 600;
        color: #4a5568;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  statusFilter = '';
  searchTerm = '';

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit() {
    this.loadSampleOrders();
  }

  loadOrders() {
    this.pharmacyService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loadSampleOrders();
      }
    });
  }

  loadSampleOrders() {
    if (this.orders.length === 0) {
      this.orders = [
        {
          id: 1001,
          customerName: 'Ahmed Hassan',
          customerPhone: '+20 100 123 4567',
          customerEmail: 'ahmed.hassan@email.com',
          date: new Date(),
          amount: 285.50,
          status: 'pending',
          items: [
            { productId: 1, productName: 'Paracetamol 500mg', quantity: 2, price: 25.50, imageUrl: 'https://via.placeholder.com/50x50?text=Paracetamol' },
            { productId: 2, productName: 'Vitamin D3 1000 IU', quantity: 1, price: 85.75, imageUrl: 'https://via.placeholder.com/50x50?text=VitD3' },
            { productId: 6, productName: 'Medical Face Mask (50pcs)', quantity: 3, price: 45.50, imageUrl: 'https://via.placeholder.com/50x50?text=Mask' }
          ],
          deliveryAddress: '15 Tahrir Square, Downtown, Cairo',
          paymentMethod: 'Cash on Delivery',
          notes: 'Please call before delivery'
        },
        {
          id: 1002,
          customerName: 'Sara Mohamed',
          customerPhone: '+20 101 987 6543',
          customerEmail: 'sara.mohamed@email.com',
          date: new Date(Date.now() - 86400000),
          amount: 420.00,
          status: 'completed',
          items: [
            { productId: 3, productName: 'Digital Thermometer', quantity: 1, price: 120.00, imageUrl: 'https://via.placeholder.com/50x50?text=Thermometer' },
            { productId: 7, productName: 'Blood Glucose Test Strips', quantity: 2, price: 150.00, imageUrl: 'https://via.placeholder.com/50x50?text=Glucose' }
          ],
          deliveryAddress: '28 Zamalek Street, Zamalek, Cairo',
          paymentMethod: 'Credit Card'
        },
        {
          id: 1003,
          customerName: 'Omar Ali',
          customerPhone: '+20 102 555 1234',
          customerEmail: 'omar.ali@email.com',
          date: new Date(Date.now() - 172800000),
          amount: 680.00,
          status: 'processing',
          items: [
            { productId: 4, productName: 'Blood Pressure Monitor', quantity: 1, price: 450.00, imageUrl: 'https://via.placeholder.com/50x50?text=BP-Monitor' },
            { productId: 8, productName: 'Omega-3 Fish Oil', quantity: 2, price: 115.00, imageUrl: 'https://via.placeholder.com/50x50?text=Omega3' }
          ],
          deliveryAddress: '5 Mohandessin Street, Giza',
          paymentMethod: 'Bank Transfer',
          notes: 'Urgent delivery needed'
        },
        {
          id: 1004,
          customerName: 'Fatma Ibrahim',
          customerPhone: '01234567893',
          customerEmail: 'fatma@example.com',
          date: new Date(Date.now() - 259200000),
          amount: 150.00,
          status: 'completed',
          items: [
            { productId: 1, productName: 'Paracetamol 500mg', quantity: 3, price: 25.50 },
            { productId: 2, productName: 'Vitamin D3', quantity: 2, price: 35.75 }
          ],
          deliveryAddress: '101 Pine St, Luxor',
          paymentMethod: 'Online Payment'
        },
        {
          id: 1005,
          customerName: 'Khaled Ahmed',
          customerPhone: '01234567894',
          customerEmail: 'khaled@example.com',
          date: new Date(Date.now() - 345600000),
          amount: 275.00,
          status: 'pending',
          items: [
            { productId: 5, productName: 'Amoxicillin 250mg', quantity: 2, price: 45.00 },
            { productId: 3, productName: 'Digital Thermometer', quantity: 1, price: 85.00 }
          ],
          deliveryAddress: '202 Cedar St, Aswan',
          paymentMethod: 'Cash on Delivery'
        }
      ];
      this.filterOrders();
    }
  }

  filterOrders() {
    let filtered = this.orders;
    
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }
    
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    this.filteredOrders = filtered;
  }

  getPendingCount(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getProcessingCount(): number {
    return this.orders.filter(order => order.status === 'processing').length;
  }

  getCompletedCount(): number {
    return this.orders.filter(order => order.status === 'completed').length;
  }

  getTotalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + order.amount, 0);
  }

  getPendingPercent(): string {
    const pending = this.getPendingCount();
    const total = this.orders.length;
    return total > 0 ? `${((pending / total) * 100).toFixed(1)}%` : '0%';
  }

  getProcessingPercent(): string {
    const processing = this.getProcessingCount();
    const total = this.orders.length;
    return total > 0 ? `${((processing / total) * 100).toFixed(1)}%` : '0%';
  }

  getCompletedPercent(): string {
    const completed = this.getCompletedCount();
    const total = this.orders.length;
    return total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%';
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: Order) {
    this.pharmacyService.updateOrderStatus(order.id, order.status).subscribe({
      next: () => {
        console.log('Order status updated successfully');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  exportOrders() {
    console.log('Exporting orders...');
  }

  printOrder(order: Order) {
    console.log('Printing order:', order.id);
  }
} 