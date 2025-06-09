import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pharmacy-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Modern Sidebar -->
      <nav class="modern-sidebar">
        <div class="sidebar-header">
          <div class="pharmacy-logo">
            <i class="fas fa-clinic-medical"></i>
          </div>
          <div class="pharmacy-info">
            <h3>RxClose</h3>
            <p>Pharmacy Admin</p>
          </div>
        </div>

        <div class="nav-section">
          <div class="nav-title">MAIN MENU</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="dashboard" routerLinkActive="active">
                <i class="fas fa-chart-pie"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="orders" routerLinkActive="active">
                <i class="fas fa-clipboard-list"></i>
                <span>Process Orders</span>
                <small>View and manage orders</small>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="products" routerLinkActive="active">
                <i class="fas fa-pills"></i>
                <span>Products</span>
                <small>Manage inventory</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-title">ANALYTICS</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="reports" routerLinkActive="active">
                <i class="fas fa-chart-line"></i>
                <span>View Reports</span>
                <small>Analytics and insights</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-title">SETTINGS</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="profile" routerLinkActive="active">
                <i class="fas fa-user-edit"></i>
                <span>Update Profile</span>
                <small>Edit pharmacy information</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <div class="user-name">{{ pharmacy?.ownerName || 'Pharmacy Admin' }}</div>
              <div class="user-role">Administrator</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    .modern-sidebar {
      width: 280px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .pharmacy-logo {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
    }

    .pharmacy-info h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .pharmacy-info p {
      margin: 0.25rem 0 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .nav-section {
      padding: 1.5rem 0;
    }

    .nav-title {
      padding: 0 1.5rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 1px;
      opacity: 0.7;
      text-transform: uppercase;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.875rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      border-right: 3px solid transparent;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateX(-4px);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.15);
      border-right-color: white;
      color: white;
    }

    .nav-link i {
      font-size: 1.1rem;
      width: 20px;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .nav-link span {
      font-weight: 500;
      flex: 1;
    }

    .nav-link small {
      display: block;
      font-size: 0.7rem;
      opacity: 0.7;
      margin-top: 0.25rem;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.7rem;
      opacity: 0.7;
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .modern-sidebar {
        width: 100%;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .modern-sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class PharmacyAdminComponent implements OnInit {
  pharmacy: any = {
    ownerName: 'Pharmacy Admin',
    name: 'RxClose Pharmacy'
  };

  constructor() {}

  ngOnInit() {
    // Component initialized
  }

  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
  }
} 