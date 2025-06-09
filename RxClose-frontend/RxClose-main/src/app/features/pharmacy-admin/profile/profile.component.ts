import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyService } from '../../../services/pharmacy.service';
import { Pharmacy } from '../../../models/pharmacy.model';

@Component({
  selector: 'app-pharmacy-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <!-- First Login Welcome Message -->
      <div *ngIf="isFirstLogin" class="welcome-message">
        <div class="welcome-content">
          <div class="welcome-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="welcome-text">
            <h3>Welcome to RxClose!</h3>
            <p>Please complete your pharmacy profile to get started. This information will help customers find and connect with your pharmacy.</p>
            <div class="completion-indicator">
              <span>Profile Completion: {{ getProfileCompletion() }}%</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getProfileCompletion()"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="profile-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <i class="fas fa-user-edit"></i>
              {{ isFirstLogin ? 'Complete Your Profile' : 'Update Profile' }}
            </h1>
            <p class="page-subtitle">{{ isFirstLogin ? 'Complete your pharmacy information to get started' : 'Edit pharmacy information and settings' }}</p>
          </div>
          <div class="header-actions">
            <button (click)="forceRefresh()" class="action-btn refresh">
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
            <button (click)="previewChanges()" class="action-btn preview" [disabled]="profileForm.pristine">
              <i class="fas fa-eye"></i>
              Preview
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card verification">
          <div class="stat-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getVerificationStatus() }}</div>
            <div class="stat-label">Verification Status</div>
            <div class="stat-badge" [class]="getVerificationClass()">
              {{ isVerified ? 'VERIFIED' : 'PENDING' }}
            </div>
          </div>
        </div>

        <div class="stat-card profile-completion">
          <div class="stat-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getProfileCompletion() }}%</div>
            <div class="stat-label">Profile Completion</div>
            <div class="completion-bar">
              <div class="completion-fill" [style.width.%]="getProfileCompletion()"></div>
            </div>
          </div>
        </div>

        <div class="stat-card last-updated">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getLastUpdated() }}</div>
            <div class="stat-label">Last Updated</div>
            <div class="stat-change">{{ getTimeSinceUpdate() }}</div>
          </div>
        </div>

        <div class="stat-card account-age">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getAccountAge() }}</div>
            <div class="stat-label">Account Age</div>
            <div class="stat-change">Since {{ getCreationDate() }}</div>
          </div>
        </div>
      </div>

      <!-- Profile Form Section -->
      <div class="profile-form-section">
        <div class="form-card">
          <div class="form-header">
            <h3><i class="fas fa-building"></i> Pharmacy Information</h3>
            <div class="form-status" [class]="profileForm.dirty ? 'modified' : 'saved'">
              <i class="fas" [class]="profileForm.dirty ? 'fa-circle' : 'fa-check-circle'"></i>
              {{ profileForm.dirty ? 'Modified' : 'Saved' }}
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
            <!-- Basic Information Section -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-info-circle"></i>
                Basic Information
              </h4>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-store"></i>
                    Pharmacy Name *
                    <span class="readonly-indicator">(Set by admin)</span>
                  </label>
                  <input type="text" formControlName="name" class="form-input readonly-field" 
                         placeholder="Enter pharmacy name" readonly>
                  <small class="field-note">This field can only be modified by system administrators</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-certificate"></i>
                    License Number *
                  </label>
                  <input type="text" formControlName="licenseNumber" class="form-input"
                         placeholder="Enter license number">
                <div *ngIf="profileForm.get('licenseNumber')?.errors?.['required'] && profileForm.get('licenseNumber')?.touched"
                       class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                  License number is required
                </div>
              </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user"></i>
                    Owner Name *
                    <span class="readonly-indicator">(Set by admin)</span>
                  </label>
                  <input type="text" formControlName="ownerName" class="form-input readonly-field"
                         placeholder="Enter owner's full name" readonly>
                  <small class="field-note">This field can only be modified by system administrators</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-shield-check"></i>
                    Verification Status
                  </label>
                  <div class="verification-display">
                    <div class="verification-badge" [class]="getVerificationClass()">
                      <i class="fas" [class]="isVerified ? 'fa-check-circle' : 'fa-clock'"></i>
                      {{ isVerified ? 'Verified' : 'Pending Verification' }}
                    </div>
                    <small class="verification-note">
                      {{ isVerified ? 'Your pharmacy is verified and trusted' : 'Verification is being processed' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-address-book"></i>
                Contact Information
              </h4>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone"></i>
                    Phone Number *
                    <span class="readonly-indicator">(Set by admin)</span>
                  </label>
                  <input type="tel" formControlName="phoneNumber" class="form-input readonly-field"
                         placeholder="+20 XXX XXX XXXX" readonly>
                  <small class="field-note">This field can only be modified by system administrators</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-envelope"></i>
                    Email Address *
                    <span class="readonly-indicator">(Set by admin)</span>
                  </label>
                  <input type="email" formControlName="email" class="form-input readonly-field"
                         placeholder="pharmacy@example.com" readonly>
                  <small class="field-note">This field can only be modified by system administrators</small>
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i>
                  Full Address *
                  <span class="readonly-indicator">(Set by admin)</span>
                </label>
                <textarea formControlName="address" rows="3" class="form-textarea readonly-field"
                          placeholder="Enter complete address including street, area, city" readonly></textarea>
                <small class="field-note">This field can only be modified by system administrators</small>
              </div>
            </div>

            <!-- Business Information Section -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-briefcase"></i>
                Business Information
              </h4>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-clock"></i>
                    Business Hours
                  </label>
                  <input type="text" formControlName="businessHours" class="form-input"
                         placeholder="e.g., Mon-Sat: 9AM-10PM, Sun: 10AM-8PM">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone-alt"></i>
                    Emergency Number
                  </label>
                  <input type="tel" formControlName="emergencyNumber" class="form-input"
                         placeholder="+20 XXX XXX XXXX">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-globe"></i>
                    Website
                  </label>
                  <input type="url" formControlName="website" class="form-input"
                         placeholder="https://yourpharmacy.com">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-map-marked-alt"></i>
                    Delivery Radius (km)
                  </label>
                  <input type="number" formControlName="deliveryRadius" class="form-input"
                         placeholder="e.g., 10" min="1" max="50">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-dollar-sign"></i>
                    Delivery Fee (EGP)
                  </label>
                  <input type="number" formControlName="deliveryFee" class="form-input"
                         placeholder="e.g., 25" min="0" step="0.01">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-shield-alt"></i>
                    Accepts Insurance
                  </label>
                  <select formControlName="acceptsInsurance" class="form-input">
                    <option value="">Select option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">
                  <i class="fas fa-info-circle"></i>
                  Pharmacy Description
                </label>
                <textarea formControlName="description" rows="4" class="form-textarea"
                          placeholder="Describe your pharmacy, services, specializations, etc."></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">
                  <i class="fas fa-stethoscope"></i>
                  Specializations (comma-separated)
                </label>
                <input type="text" formControlName="specializations" class="form-input"
                       placeholder="e.g., Diabetes Care, Pediatric Medicine, Dermatology">
              </div>
            </div>

            <!-- Additional Settings Section -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-cogs"></i>
                Additional Settings
              </h4>
              
              <div class="settings-grid">
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-title">
                      <i class="fas fa-bell"></i>
                      Email Notifications
                    </div>
                    <div class="setting-description">
                      Receive notifications about new orders and updates
                    </div>
                  </div>
                  <div class="setting-toggle">
                    <input type="checkbox" formControlName="emailNotifications" id="emailNotifications" class="toggle-checkbox">
                    <label for="emailNotifications" class="toggle-label"></label>
              </div>
            </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-title">
                      <i class="fas fa-mobile-alt"></i>
                      SMS Notifications
                    </div>
                    <div class="setting-description">
                      Get SMS alerts for urgent orders and updates
                    </div>
                  </div>
                  <div class="setting-toggle">
                    <input type="checkbox" formControlName="smsNotifications" id="smsNotifications" class="toggle-checkbox">
                    <label for="smsNotifications" class="toggle-label"></label>
              </div>
            </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-title">
                      <i class="fas fa-eye"></i>
                      Public Profile
                    </div>
                    <div class="setting-description">
                      Make your pharmacy visible in public search
                    </div>
                  </div>
                  <div class="setting-toggle">
                    <input type="checkbox" formControlName="publicProfile" id="publicProfile" class="toggle-checkbox">
                    <label for="publicProfile" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" (click)="resetForm()" class="btn secondary" [disabled]="isSubmitting">
                <i class="fas fa-undo"></i>
                Reset Changes
              </button>
              <button type="button" (click)="saveAsDraft()" class="btn draft" [disabled]="isSubmitting || !profileForm.dirty">
                <i class="fas fa-save"></i>
                Save as Draft
              </button>
              <button type="submit" [disabled]="profileForm.invalid || isSubmitting" class="btn primary"
                      [title]="profileForm.invalid ? 'Please fill all required fields' : 'Save profile changes'">
                <i class="fas" [class]="isSubmitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                {{ isSubmitting ? 'Saving...' : (isFirstLogin ? 'Complete Profile' : 'Save Changes') }}
              </button>
              
              <!-- Debug info for form validity -->
              <div *ngIf="profileForm.invalid" class="form-debug" style="color: red; font-size: 0.8rem; margin-top: 0.5rem;">
                <small>Form is invalid. Missing required fields or validation errors.</small>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="showSuccessMessage" class="alert success">
        <i class="fas fa-check-circle"></i>
        <div>
          <strong>Success!</strong>
          {{ isFirstLogin && profileCompleted ? 'Profile completed successfully! Redirecting to dashboard...' : 'Profile updated successfully.' }}
        </div>
        <button (click)="showSuccessMessage = false" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div *ngIf="showErrorMessage" class="alert error">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>Error!</strong>
          Failed to update profile. Please check your connection and try again.
        </div>
        <button (click)="showErrorMessage = false" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Welcome Message Styles */
    .welcome-message {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .welcome-content {
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      color: white;
    }

    .welcome-icon {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .welcome-text h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .welcome-text p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      line-height: 1.6;
    }

    .completion-indicator {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .completion-indicator span {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: white;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .profile-header {
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

    .action-btn.refresh {
      background: #4299e1;
      color: white;
    }

    .action-btn.preview {
      background: #48bb78;
      color: white;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn:hover:not(:disabled) {
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

    .stat-card.verification .stat-icon {
      background: linear-gradient(135deg, #48bb78, #38a169);
    }

    .stat-card.profile-completion .stat-icon {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .stat-card.last-updated .stat-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .stat-card.account-age .stat-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      line-height: 1;
    }

    .stat-label {
      color: #4a5568;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .stat-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-top: 0.5rem;
      display: inline-block;
    }

    .stat-badge.verified {
      background: #d1fae5;
      color: #065f46;
    }

    .stat-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .completion-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .completion-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .stat-change {
      color: #4a5568;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    /* Profile Form Section */
    .profile-form-section {
      margin-bottom: 2rem;
    }

    .form-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .form-header h3 {
      color: #1a202c;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
    }

    .form-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-status.saved {
      background: #d1fae5;
      color: #065f46;
    }

    .form-status.modified {
      background: #fef3c7;
      color: #92400e;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .section-title {
      color: #1a202c;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      color: #374151;
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input, .form-textarea {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #1a202c;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .verification-display {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .verification-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: fit-content;
    }

    .verification-badge.verified {
      background: #d1fae5;
      color: #065f46;
    }

    .verification-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .verification-note {
      color: #6b7280;
      font-size: 0.8rem;
    }

    /* Settings Section */
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .setting-info {
      flex: 1;
    }

    .setting-title {
      font-weight: 600;
      color: #1a202c;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .setting-description {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .setting-toggle {
      position: relative;
    }

    .toggle-checkbox {
      display: none;
    }

    .toggle-label {
      display: block;
      width: 48px;
      height: 24px;
      background: #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: background 0.3s ease;
    }

    .toggle-label::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .toggle-checkbox:checked + .toggle-label {
      background: #667eea;
    }

    .toggle-checkbox:checked + .toggle-label::after {
      transform: translateX(24px);
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
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
      font-size: 0.9rem;
    }

    .btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn.secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn.draft {
      background: #fbbf24;
      color: white;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Alerts */
    .alert {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 1000;
      min-width: 300px;
    }

    .alert.success {
      border-left: 4px solid #48bb78;
    }

    .alert.error {
      border-left: 4px solid #e53e3e;
    }

    .alert-close {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
    }

    /* Readonly Field Styles */
    .readonly-field {
      background-color: #f7fafc !important;
      border-color: #e2e8f0 !important;
      color: #718096 !important;
      cursor: not-allowed !important;
    }

    .readonly-indicator {
      color: #ed8936;
      font-size: 0.75rem;
      font-weight: 500;
      background: rgba(237, 137, 54, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-left: 0.5rem;
    }

    .field-note {
      color: #a0aec0;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
      font-style: italic;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-container {
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
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .setting-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class PharmacyProfileComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  originalPharmacy: Pharmacy | null = null;
  showSuccessMessage = false;
  showErrorMessage = false;
  isVerified = false;
  isFirstLogin = false;
  profileCompleted = false;

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      // Core fields - set by admin, readonly for pharmacy owners
      name: [''],
      phoneNumber: [''],
      email: [''],
      address: [''],
      ownerName: [''],
      
      // Profile fields - editable by pharmacy owners
      licenseNumber: [''],
      businessHours: [''],
      description: [''],
      website: [''],
      emergencyNumber: [''],
      deliveryRadius: [''],
      deliveryFee: [''],
      acceptsInsurance: [''],
      specializations: [''],
      isVerified: [false],
      emailNotifications: [true],
      smsNotifications: [false],
      publicProfile: [true]
    });

    // Don't load sample data automatically - wait for real data
  }

  ngOnInit() {
    // Check if this is first login
    this.route.queryParams.subscribe(params => {
      this.isFirstLogin = params['firstLogin'] === 'true';
    });
    
    this.loadPharmacyProfile();
  }

  loadSampleData() {
    // Get current user data to pre-fill some fields
    const currentUser = this.route.snapshot.queryParams['userData'] ? 
      JSON.parse(this.route.snapshot.queryParams['userData']) : null;
    
    const sampleData = {
      name: currentUser?.pharmacyName || '',
      licenseNumber: '',
      phoneNumber: currentUser?.phoneNumber || '',
      email: currentUser?.email || '',
      address: currentUser?.address || '',
      ownerName: currentUser?.name || '',
      isVerified: false,
      profileCompleted: false,
      emailNotifications: true,
      smsNotifications: false,
      publicProfile: true
    };
    
    console.log('Loading sample data:', sampleData);
    this.profileForm.patchValue(sampleData);
    this.isVerified = sampleData.isVerified;
    this.originalPharmacy = sampleData as any;
  }

  loadPharmacyProfile() {
    this.pharmacyService.getPharmacyProfile().subscribe({
      next: (pharmacy) => {
        console.log('Loaded pharmacy profile:', pharmacy);
        this.originalPharmacy = pharmacy;
        this.isVerified = pharmacy.isVerified || false;
        this.profileCompleted = pharmacy.profileCompleted || false;
        
        // Convert data for form display
        const formData = {
          ...pharmacy,
          acceptsInsurance: pharmacy.acceptsInsurance !== null && pharmacy.acceptsInsurance !== undefined ? pharmacy.acceptsInsurance.toString() : '',
          deliveryRadius: pharmacy.deliveryRadius ? pharmacy.deliveryRadius.toString() : '',
          deliveryFee: pharmacy.deliveryFee ? pharmacy.deliveryFee.toString() : '',
          specializations: Array.isArray(pharmacy.specializations) 
            ? pharmacy.specializations.join(', ') 
            : pharmacy.specializations || ''
        };
        
        console.log('Setting form data:', formData);
        this.profileForm.patchValue(formData);
        
        // Mark form as pristine after loading data
        this.profileForm.markAsPristine();
        
        // Enable all form controls in case they were disabled
        this.profileForm.enable();
        
        console.log('Form validity after loading:', this.profileForm.valid);
        console.log('Form errors after loading:', this.getFormErrors());
        console.log('Form values after loading:', this.profileForm.value);
        
        // Detailed field validation check
        Object.keys(this.profileForm.controls).forEach(key => {
          const control = this.profileForm.get(key);
          if (control && control.errors) {
            console.log(`Field ${key} has errors:`, control.errors);
          }
        });
      },
      error: (error) => {
        console.error('Error loading pharmacy profile:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        if (error.status === 404 || error.message?.includes('No pharmacy found')) {
          console.log('No pharmacy found for user - this might be a new pharmacy');
          // For new pharmacy, don't load sample data, let them fill real data
          this.isFirstLogin = true;
        } else {
          console.log('Loading sample data due to API error');
          this.loadSampleData();
        }
      }
    });
  }

  onSubmit() {
    console.log('Form validity status:', this.profileForm.valid);
    console.log('Form errors:', this.getFormErrors());
    
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;
      
      // Clean up data for backend
      const updatedProfile = {
        ...formData,
        acceptsInsurance: formData.acceptsInsurance === 'true' ? true : formData.acceptsInsurance === 'false' ? false : null,
        deliveryRadius: formData.deliveryRadius ? Number(formData.deliveryRadius) : null,
        deliveryFee: formData.deliveryFee ? Number(formData.deliveryFee) : null,
        // Keep specializations as string - the service will handle array conversion if needed
        specializations: formData.specializations || ''
      };

      // Check if this is profile completion (first login)
      const isCompletion = this.isFirstLogin && this.isRequiredFieldsComplete();
      const service = isCompletion 
        ? this.pharmacyService.completePharmacyProfile(updatedProfile)
        : this.pharmacyService.updatePharmacyProfile(updatedProfile);

      service.subscribe({
        next: (pharmacy) => {
          console.log('Profile update successful:', pharmacy);
          this.originalPharmacy = pharmacy;
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          this.profileCompleted = true;
          
          // Reset the first login flag after successful completion
          if (isCompletion) {
            this.isFirstLogin = false;
          }
          
          // Reload the profile data to ensure form is properly updated
          this.loadPharmacyProfile();
          
          if (isCompletion) {
            // Redirect to dashboard after completion
            setTimeout(() => {
              this.router.navigate(['/pharmacy-admin/dashboard']);
            }, 2000);
          }
          
          setTimeout(() => this.showSuccessMessage = false, 5000);
        },
        error: (error) => {
          console.error('Error updating pharmacy profile:', error);
          console.error('Error details:', error.error);
          this.isSubmitting = false;
          this.showErrorMessage = true;
          
          // Show more specific error message if available
          if (error.error && error.error.message) {
            console.error('Server error message:', error.error.message);
          }
          
          setTimeout(() => this.showErrorMessage = false, 5000);
        }
      });
    } else {
      console.log('Form is invalid. Please check required fields.');
      console.log('Form errors:', this.getFormErrors());
    }
  }

  // Add helper method to debug form errors
  getFormErrors() {
    const errors: any = {};
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  isRequiredFieldsComplete(): boolean {
    const requiredFields = ['name', 'phoneNumber', 'email', 'address', 'ownerName'];
    return requiredFields.every(field => {
      const value = this.profileForm.get(field)?.value;
      return value && value.toString().trim().length > 0;
    });
  }

  resetForm() {
    if (this.originalPharmacy) {
      // Convert data for form display just like in loadPharmacyProfile
      const formData = {
        ...this.originalPharmacy,
        acceptsInsurance: this.originalPharmacy.acceptsInsurance !== null && this.originalPharmacy.acceptsInsurance !== undefined ? this.originalPharmacy.acceptsInsurance.toString() : '',
        deliveryRadius: this.originalPharmacy.deliveryRadius ? this.originalPharmacy.deliveryRadius.toString() : '',
        deliveryFee: this.originalPharmacy.deliveryFee ? this.originalPharmacy.deliveryFee.toString() : '',
        specializations: Array.isArray(this.originalPharmacy.specializations) 
          ? this.originalPharmacy.specializations.join(', ') 
          : this.originalPharmacy.specializations || ''
      };
      
      this.profileForm.patchValue(formData);
      this.profileForm.markAsPristine();
      this.profileForm.enable();
      
      console.log('Form reset with data:', formData);
      console.log('Form validity after reset:', this.profileForm.valid);
    }
  }

  forceRefresh() {
    console.log('Force refreshing profile data...');
    this.loadPharmacyProfile();
  }

  saveAsDraft() {
    // Simulate saving draft
    console.log('Saving as draft...');
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  previewChanges() {
    console.log('Preview changes:', this.profileForm.value);
  }

  getVerificationStatus(): string {
    return this.isVerified ? 'Verified' : 'Pending';
  }

  getVerificationClass(): string {
    return this.isVerified ? 'verified' : 'pending';
  }

  getProfileCompletion(): number {
    const requiredFields = ['name', 'phoneNumber', 'email', 'address', 'ownerName'];
    const optionalFields = ['licenseNumber', 'businessHours', 'description', 'website', 'emergencyNumber', 'deliveryRadius', 'deliveryFee', 'specializations'];
    
    const filledRequired = requiredFields.filter(field => {
      const value = this.profileForm.get(field)?.value;
      return value && value.toString().trim().length > 0;
    });
    
    const filledOptional = optionalFields.filter(field => {
      const value = this.profileForm.get(field)?.value;
      return value && value.toString().trim().length > 0;
    });
    
    // Required fields count for 70%, optional for 30%
    const requiredPercentage = (filledRequired.length / requiredFields.length) * 70;
    const optionalPercentage = (filledOptional.length / optionalFields.length) * 30;
    
    return Math.round(requiredPercentage + optionalPercentage);
  }

  getLastUpdated(): string {
    return 'Today';
  }

  getTimeSinceUpdate(): string {
    return '2 hours ago';
  }

  getAccountAge(): string {
    return '2 years';
  }

  getCreationDate(): string {
    return '2022';
  }
} 