import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {
  
  // Forms
  emailForm!: FormGroup;
  verificationForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // State
  currentStep = 1;
  isLoading = false;
  userEmail = '';
  resetCode = '';
  
  // Alert
  alertMessage = '';
  alertType = '';
  
  // API Base URL
  private baseURL = 'http://localhost:5000/api/users';
  
  // ViewChild for code inputs
  @ViewChild('code1') code1!: ElementRef;
  @ViewChild('code2') code2!: ElementRef;
  @ViewChild('code3') code3!: ElementRef;
  @ViewChild('code4') code4!: ElementRef;
  @ViewChild('code5') code5!: ElementRef;
  @ViewChild('code6') code6!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Component initialization
  }
  
  ngAfterViewInit(): void {
    // Focus first input after view init
    if (this.currentStep === 1) {
      setTimeout(() => this.focusEmailInput(), 100);
    }
  }

  private initializeForms(): void {
    // Email Form
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Verification Form
    this.verificationForm = this.formBuilder.group({
      code1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      code2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      code3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      code4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      code5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      code6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });

    // Password Form
    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  // Form getters for easy access
  get email() { return this.emailForm.get('email'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  // Step 1: Email submission
  async onEmailSubmit(): Promise<void> {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }

    const email = this.emailForm.value.email;
    this.isLoading = true;
    this.clearAlert();

    try {
      const response = await this.http.post<any>(`${this.baseURL}/forgot-password`, {
        email: email
      }).toPromise();

      if (response.success) {
        this.userEmail = email;
        this.showAlert(response.message, 'success');
        this.goToStep(2);
      } else {
        this.showAlert(response.message, 'danger');
      }
    } catch (error: any) {
      console.error('Error:', error);
      this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // Step 2: Verification code submission
  async onVerificationSubmit(): Promise<void> {
    if (!this.isCodeComplete()) {
      this.showAlert('يرجى إدخال رمز التحقق كاملاً', 'danger');
      return;
    }

    const code = this.getVerificationCode();
    this.resetCode = code;
    this.isLoading = true;
    this.clearAlert();

    try {
      const response = await this.http.post<any>(`${this.baseURL}/verify-reset-code`, {
        email: this.userEmail,
        resetCode: code
      }).toPromise();

      if (response.success) {
        this.showAlert(response.message, 'success');
        this.goToStep(3);
      } else {
        this.showAlert(response.message, 'danger');
        this.clearCodeInputs();
      }
    } catch (error: any) {
      console.error('Error:', error);
      this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
      this.clearCodeInputs();
    } finally {
      this.isLoading = false;
    }
  }

  // Step 3: Password reset submission
  async onPasswordSubmit(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const newPassword = this.passwordForm.value.newPassword;
    this.isLoading = true;
    this.clearAlert();

    try {
      const response = await this.http.post<any>(`${this.baseURL}/reset-password`, {
        email: this.userEmail,
        resetCode: this.resetCode,
        newPassword: newPassword
      }).toPromise();

      if (response.success) {
        this.showAlert(response.message, 'success');
        this.goToStep(4);
      } else {
        this.showAlert(response.message, 'danger');
      }
    } catch (error: any) {
      console.error('Error:', error);
      this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // Resend verification code
  async resendCode(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.userEmail) {
      this.showAlert('حدث خطأ. يرجى البدء من جديد', 'danger');
      this.goToStep(1);
      return;
    }

    this.showAlert('جاري إعادة إرسال الرمز...', 'info');
    
    try {
      const response = await this.http.post<any>(`${this.baseURL}/forgot-password`, {
        email: this.userEmail
      }).toPromise();

      if (response.success) {
        this.showAlert('تم إعادة إرسال الرمز بنجاح', 'success');
        this.clearCodeInputs();
      } else {
        this.showAlert(response.message, 'danger');
      }
    } catch (error: any) {
      console.error('Error:', error);
      this.showAlert('حدث خطأ في إعادة الإرسال', 'danger');
    }
  }

  // Code input handling
  onCodeInput(event: any, index: number): void {
    const value = event.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      event.target.value = value.replace(/[^\d]/g, '');
      return;
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = this.getCodeInput(index + 1);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit when all fields are filled
    setTimeout(() => {
      if (this.isCodeComplete()) {
        this.onVerificationSubmit();
      }
    }, 100);
  }

  onCodeKeydown(event: any, index: number): void {
    // Backspace navigation
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
      const prevInput = this.getCodeInput(index - 1);
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  // Navigation
  goToStep(step: number): void {
    this.currentStep = step;
    this.clearAlert();

    // Focus appropriate input
    setTimeout(() => {
      if (step === 1) {
        this.focusEmailInput();
      } else if (step === 2) {
        this.focusFirstCodeInput();
      } else if (step === 3) {
        this.focusPasswordInput();
      }
    }, 100);
  }

  // Utility methods
  isCodeComplete(): boolean {
    return this.getVerificationCode().length === 6;
  }

  getVerificationCode(): string {
    const form = this.verificationForm.value;
    return `${form.code1}${form.code2}${form.code3}${form.code4}${form.code5}${form.code6}`;
  }

  clearCodeInputs(): void {
    this.verificationForm.reset();
    this.focusFirstCodeInput();
  }

  private getCodeInput(index: number): HTMLInputElement | null {
    const inputs = [this.code1, this.code2, this.code3, this.code4, this.code5, this.code6];
    return inputs[index]?.nativeElement || null;
  }

  private focusEmailInput(): void {
    const emailInput = document.querySelector('input[formControlName="email"]') as HTMLInputElement;
    if (emailInput) emailInput.focus();
  }

  private focusFirstCodeInput(): void {
    if (this.code1) {
      this.code1.nativeElement.focus();
    }
  }

  private focusPasswordInput(): void {
    const passwordInput = document.querySelector('input[formControlName="newPassword"]') as HTMLInputElement;
    if (passwordInput) passwordInput.focus();
  }

  // Alert methods
  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;

    // Auto-clear success and info alerts
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.clearAlert();
      }, 5000);
    }
  }

  clearAlert(): void {
    this.alertMessage = '';
    this.alertType = '';
  }

  getAlertIcon(): string {
    const icons: { [key: string]: string } = {
      success: 'fa-check-circle',
      danger: 'fa-exclamation-triangle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };
    return icons[this.alertType] || 'fa-info-circle';
  }

  // Form utility
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
} 