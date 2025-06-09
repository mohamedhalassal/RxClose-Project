export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  ownerName: string;
  ownerId: number;
  isVerified: boolean;
  profileCompleted: boolean;
  businessHours?: string;
  description?: string;
  website?: string;
  emergencyNumber?: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  acceptsInsurance?: boolean;
  specializations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: ProductCategory;
  pharmacyId: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  Drugs = 'Drugs',
  MedicalSupplies = 'Medical Supplies',
  FitnessNutrition = 'Fitness & Nutrition',
  OrganicHerbal = 'Organic & Herbal Product',
  HomeCare = 'Home Care'
} 