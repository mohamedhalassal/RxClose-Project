import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ChatWidgetComponent } from '../../../shared/components/chat-widget/chat-widget.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-contactpage',
  templateUrl: './contactpage.component.html',
  styleUrls: ['./contactpage.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterModule, ChatWidgetComponent, NavbarComponent, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ContactpageComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitted = false;

  constructor(
    private _Router: Router,
    private _AuthService: AuthService,
    private fb: FormBuilder
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get f() { 
    return this.contactForm.controls; 
  }

  onSubmit() {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Contact form submitted:', this.contactForm.value);
      alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      this.contactForm.reset();
      this.submitted = false;
      this.isSubmitting = false;
    }, 2000);
  }

  logout() {
    this._AuthService.logout();
    this._Router.navigate(['/auth/login']);
  }
}
