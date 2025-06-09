import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLogin: string;
  avatar: string;
  phoneNumber?: string;
  userName?: string;
  location?: string;
  password?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <!-- Header Section -->
      <div class="users-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-users"></i>
              User Management
            </h1>
            <p class="page-subtitle">Manage all users in the system</p>
          </div>
          <div class="header-actions">
            <button class="action-btn primary" (click)="showAddUserModal()">
              <i class="fas fa-user-plus"></i>
              Add New User
            </button>
            <button class="action-btn export" (click)="exportUsers()">
              <i class="fas fa-download"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalUsers() }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getActiveUsers() }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        
        <div class="stat-card pharmacies">
          <div class="stat-icon">
            <i class="fas fa-clinic-medical"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getPharmacyAdmins() }}</div>
            <div class="stat-label">Pharmacy Admins</div>
          </div>
        </div>
        
        <div class="stat-card new">
          <div class="stat-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getNewUsersThisMonth() }}</div>
            <div class="stat-label">New This Month</div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 (input)="filterUsers()" 
                 placeholder="Search users...">
        </div>
        
        <div class="filter-controls">
          <select [(ngModel)]="roleFilter" (change)="filterUsers()" class="filter-select">
            <option value="">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="admin">Pharmacy Admins</option>
            <option value="superadmin">Super Admins</option>
          </select>
          
          <select [(ngModel)]="statusFilter" (change)="filterUsers()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="users-table-container">
        <div class="table-header">
          <h3>All Users ({{ filteredUsers.length }})</h3>
          <div class="table-actions">
            <button class="action-btn-sm" (click)="selectAllUsers()">
              <i class="fas fa-check-square"></i>
              Select All
            </button>
            <button class="action-btn-sm danger" (click)="bulkDeleteUsers()" [disabled]="selectedUsers.length === 0">
              <i class="fas fa-trash"></i>
              Delete Selected ({{ selectedUsers.length }})
            </button>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" (change)="toggleSelectAll($event)">
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers" 
                  [class.selected]="isUserSelected(user.id)">
                <td>
                  <input type="checkbox" 
                         [checked]="isUserSelected(user.id)"
                         (change)="toggleUserSelection(user.id)">
                </td>
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      <img [src]="user.avatar" [alt]="user.name">
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-id">#{{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class]="user.role">
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="user.status">
                    {{ getStatusDisplayName(user.status) }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>{{ formatDate(user.lastLogin) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn-sm" (click)="editUser(user)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn-sm" (click)="viewUser(user)" title="View">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn-sm danger" (click)="deleteUser(user)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit User' : 'Add New User' }}</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveUser()">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="currentUser.name" name="name" required>
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentUser.email" name="email" required>
              </div>
              
              <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="currentUser.role" name="role" required>
                                          <option value="user">Regular User</option>
                        <option value="admin">Pharmacy Admin</option>
                        <option value="superadmin">Super Admin</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="currentUser.status" name="status" required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn primary">{{ isEditMode ? 'Update' : 'Create' }} User</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header Styles */
    .users-header {
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
    .stat-card.pharmacies .stat-icon { background: #fff3e0; color: #ff9800; }
    .stat-card.new .stat-icon { background: #f3e5f5; color: #9c27b0; }

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
    .users-table-container {
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
    }

    .action-btn-sm {
      background: #f8fafc;
      color: #2c3e50;
      border: 1px solid #e2e8f0;
    }

    .action-btn-sm.danger {
      background: #fee;
      color: #e74c3c;
      border-color: #e74c3c;
    }

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

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .users-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .users-table tr.selected {
      background: #f0f9ff;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .user-id {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .role-badge,
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.user { background: #e3f2fd; color: #1976d2; }
    .role-badge.admin { background: #fff3e0; color: #f57c00; }
    .role-badge.superadmin { background: #f3e5f5; color: #7b1fa2; }

    .status-badge.active { background: #e8f5e8; color: #2e7d32; }
    .status-badge.inactive { background: #fff3e0; color: #f57c00; }
    .status-badge.banned { background: #ffebee; color: #d32f2f; }

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
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

    /* Responsive */
    @media (max-width: 768px) {
      .users-container {
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
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: number[] = [];
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  isLoading = true;
  
  showModal = false;
  isEditMode = false;
  currentUser: Partial<User> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    
    this.adminService.getUsers().subscribe({
      next: (response) => {
        console.log('Users API Response:', response);
        
        // Transform API response to match component interface
        this.users = response.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          status: user.status || 'active',
          createdAt: user.createdAt || new Date().toISOString().split('T')[0],
          lastLogin: user.lastLogin || 'Never',
          avatar: user.avatar || `https://via.placeholder.com/40x40?text=${(user.name || 'U').substring(0, 2).toUpperCase()}`,
          phoneNumber: user.phoneNumber,
          userName: user.userName,
          location: user.location
        }));
        
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('خطأ في تحميل المستخدمين. يرجى التأكد من تشغيل Backend API.');
        this.users = [];
        this.filteredUsers = [];
        this.isLoading = false;
      }
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      const matchesStatus = !this.statusFilter || user.status === this.statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getTotalUsers(): number { return this.users.length; }
  getActiveUsers(): number { return this.users.filter(u => u.status === 'active').length; }
  getPharmacyAdmins(): number { return this.users.filter(u => u.role === 'admin').length; }
  getNewUsersThisMonth(): number { 
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.includes(userId);
  }

  toggleUserSelection(userId: number) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedUsers = this.filteredUsers.map(u => u.id);
    } else {
      this.selectedUsers = [];
    }
  }

  selectAllUsers() {
    this.selectedUsers = this.filteredUsers.map(u => u.id);
  }

  showAddUserModal() {
    this.currentUser = {};
    this.isEditMode = false;
    this.showModal = true;
  }

  editUser(user: User) {
    this.currentUser = { ...user };
    this.isEditMode = true;
    this.showModal = true;
  }

  viewUser(user: User) {
    console.log('Viewing user:', user);
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.adminService.deleteUser(user.id.toString()).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  bulkDeleteUsers() {
    if (confirm(`Delete ${this.selectedUsers.length} selected users?`)) {
      this.selectedUsers.forEach(id => {
        this.adminService.deleteUser(id.toString()).subscribe(() => {
          this.loadUsers();
        });
      });
      this.selectedUsers = [];
      this.filterUsers();
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentUser = {};
  }

  saveUser() {
    // No need to transform role - send it as is from frontend
    const userData = {
      phoneNumber: this.currentUser.phoneNumber || '1234567890',
      name: this.currentUser.name || '',
      userName: this.currentUser.userName || this.currentUser.email || '',
      password: this.currentUser.password || '123456', // Default password for updates
      email: this.currentUser.email || '',
      location: this.currentUser.location || 'Unknown',
      role: this.currentUser.role || 'user'
    };

    console.log('Saving user with data:', userData);
    console.log('Original currentUser:', this.currentUser);

    if (this.isEditMode) {
      // Update user role first if it changed
      const originalUser = this.users.find(u => u.id === this.currentUser.id);
      const roleChanged = originalUser && originalUser.role !== this.currentUser.role;
      
      if (roleChanged) {
        console.log('Role changed, updating role using dedicated endpoint...');
        this.adminService.updateUserRole(this.currentUser.id!.toString(), this.currentUser.role || 'user').subscribe({
          next: (roleResponse) => {
            console.log('Role updated successfully:', roleResponse);
            alert('User role updated successfully!');
            this.loadUsers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating user role:', error);
            alert('Failed to update user role. Please try again.');
          }
        });
      } else {
        // No role change - for now, just show message
        console.log('No role change detected. Only role updates are currently supported.');
        alert('Only role updates are currently supported. Please change the user role to update.');
        this.closeModal();
      }
    } else {
      this.adminService.createUser(userData).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Failed to create user. Please try again.');
        }
      });
    }
  }

  exportUsers() {
    console.log('Exporting users...');
  }

  getRoleDisplayName(role: string): string {
    const roles: any = {
      'user': 'Regular User',
      'admin': 'Pharmacy Admin',
      'superadmin': 'Super Admin'
    };
    return roles[role] || role;
  }

  getStatusDisplayName(status: string): string {
    const statuses: any = {
      'active': 'Active',
      'inactive': 'Inactive',
      'banned': 'Banned'
    };
    return statuses[status] || status;
  }

  formatDate(dateString: string): string {
    if (dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 