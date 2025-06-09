import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
 checkoutForm!: FormGroup;
constructor(
  private fb: FormBuilder,       // ✅ أهو
  private userService: UserService
) {}



  ngOnInit(): void {
    const user = this.userService.getUserProfile();

    this.checkoutForm = this.fb.group({
      fullName: [user.fullName, Validators.required],
      phone: [user.phone, Validators.required],
      address: [user.address, Validators.required],
      city: [user.city, Validators.required],
      zip: [user.zip, Validators.required],
      cardNumber: ['', Validators.required],
      expiryDate: ['', Validators.required],
      cvv: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      const orderData = this.checkoutForm.value;
      console.log('Order submitted:', orderData);
      alert('✅ Order submitted successfully!');
      // You can send this data to an API using HttpClient
    }
  }
}
