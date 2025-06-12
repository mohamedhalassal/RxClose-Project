export interface User {
  id: number;
  phoneNumber: string;
  name: string;
  userName: string;
  email: string;
  location: string;
  latitude?: number;
  longitude?: number;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  status: string;
  avatar: string | null;
  // Optional: add notification and 2FA fields if needed
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  twoFactorEnabled?: boolean;
} 