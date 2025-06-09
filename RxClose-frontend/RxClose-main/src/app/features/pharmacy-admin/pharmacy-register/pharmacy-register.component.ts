import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PharmacyService } from '../../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-6">Register Your Pharmacy</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Pharmacy Name</label>
              <input type="text" formControlName="name" 
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <div *ngIf="registerForm.get('name')?.errors?.['required'] && registerForm.get('name')?.touched"
                   class="text-red-500 text-sm mt-1">
                Pharmacy name is required
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">License Number</label>
              <input type="text" formControlName="licenseNumber"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <div *ngIf="registerForm.get('licenseNumber')?.errors?.['required'] && registerForm.get('licenseNumber')?.touched"
                   class="text-red-500 text-sm mt-1">
                License number is required
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" formControlName="phoneNumber"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <div *ngIf="registerForm.get('phoneNumber')?.errors?.['required'] && registerForm.get('phoneNumber')?.touched"
                   class="text-red-500 text-sm mt-1">
                Phone number is required
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <div *ngIf="registerForm.get('email')?.errors?.['required'] && registerForm.get('email')?.touched"
                   class="text-red-500 text-sm mt-1">
                Email is required
              </div>
              <div *ngIf="registerForm.get('email')?.errors?.['email'] && registerForm.get('email')?.touched"
                   class="text-red-500 text-sm mt-1">
                Please enter a valid email
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <textarea formControlName="address" rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            <div *ngIf="registerForm.get('address')?.errors?.['required'] && registerForm.get('address')?.touched"
                 class="text-red-500 text-sm mt-1">
              Address is required
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Owner Name</label>
            <input type="text" formControlName="ownerName"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <div *ngIf="registerForm.get('ownerName')?.errors?.['required'] && registerForm.get('ownerName')?.touched"
                 class="text-red-500 text-sm mt-1">
              Owner name is required
            </div>
          </div>

          <div class="flex justify-end">
            <button type="submit" 
                    [disabled]="registerForm.invalid || isSubmitting"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              {{ isSubmitting ? 'Registering...' : 'Register Pharmacy' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PharmacyRegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      ownerName: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.pharmacyService.updatePharmacyProfile(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/pharmacy-admin/dashboard']);
        },
        error: (error) => {
          console.error('Error registering pharmacy:', error);
          this.isSubmitting = false;
        }
      });
    }
  }
} 