import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userProfile = {
    fullName: 'Ahmed Mostafa',
    address: 'Street 10 - Cairo',
    city: 'Cairo',
    zip: '12345',
    phone: '01000000000'
  };

  getUserProfile() {
    return this.userProfile;
  }
}
