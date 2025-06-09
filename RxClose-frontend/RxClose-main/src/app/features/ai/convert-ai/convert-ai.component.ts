import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-convert-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './convert-ai.component.html',
  styleUrls: ['./convert-ai.component.scss']
})
export class ConvertAiComponent implements OnInit {
  prescriptionText: string = '';
  convertedText: string | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    console.log('Convert AI component initialized');
  }

  convertPrescription(): void {
    if (!this.prescriptionText.trim()) {
      this.error = 'الرجاء إدخال الوصفة الطبية';
      return;
    }

    this.loading = true;
    this.error = null;
    this.convertedText = null;

    // Simulate API call
    setTimeout(() => {
      // Mock conversion
      this.convertedText = `الوصفة المحولة: ${this.prescriptionText}`;
      this.loading = false;
    }, 2000);

    // TODO: Implement actual API call
    /*
    this.http.post('/api/convert', { prescription: this.prescriptionText })
      .subscribe({
        next: (response: any) => {
          this.convertedText = response.convertedText;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحويل الوصفة. يرجى المحاولة مرة أخرى.';
          this.loading = false;
        }
      });
    */
  }
}
