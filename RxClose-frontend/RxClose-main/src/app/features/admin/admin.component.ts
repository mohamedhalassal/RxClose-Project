import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Mobile Toggle Button -->
      <button class="mobile-toggle" (click)="toggleSidebar()">
        <i class="fas fa-bars"></i>
      </button>

      <!-- Modern Sidebar -->
      <nav class="modern-sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-header">
          <div class="admin-logo">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="admin-info">
            <h3>RxClose</h3>
            <p>Super Admin</p>
          </div>
        </div>

        <div class="nav-section">
          <div class="nav-title">MAIN DASHBOARD</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="dashboard" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </div>
                <small>Overview & Analytics</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-title">MANAGEMENT</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="pharmacies" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-clinic-medical"></i>
                  <span>Pharmacies</span>
                </div>
                <small>Manage pharmacies</small>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="users" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-users"></i>
                  <span>Users</span>
                </div>
                <small>Manage users</small>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="products" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-pills"></i>
                  <span>Products</span>
                </div>
                <small>Global product catalog</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-title">ANALYTICS</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="reports" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-chart-line"></i>
                  <span>System Reports</span>
                </div>
                <small>Analytics & insights</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-title">SYSTEM</div>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link" routerLink="settings" routerLinkActive="active">
                <div class="nav-link-content">
                  <i class="fas fa-cog"></i>
                  <span>Settings</span>
                </div>
                <small>System configuration</small>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="user-details">
              <div class="user-name">Super Admin</div>
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
      direction: ltr;
    }

    .mobile-toggle {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      background: #667eea;
      border: none;
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      z-index: 1001;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .mobile-toggle:hover {
      background: #5a67d8;
      transform: translateY(-2px);
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

    .admin-logo {
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

    .admin-info h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .admin-info p {
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
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateX(-4px);
      border-right-color: rgba(255, 255, 255, 0.3);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.15);
      border-right-color: white;
      color: white;
    }

    .nav-link-content {
      display: flex;
      align-items: center;
      width: 100%;
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
      margin-left: 2.75rem;
      width: 100%;
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
      width: calc(100% - 280px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }

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
        width: 100%;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  isSidebarOpen = false;

  constructor() {}

  ngOnInit() {
    // Component initialized
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
  }
} 