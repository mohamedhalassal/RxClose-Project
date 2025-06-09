export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  stock?: number; // For backend compatibility
  imageUrl: string;
  requiresPrescription: boolean;
  prescription?: boolean; // For backend compatibility
  
  // Seller information - NEW FIELDS
  sellerType: 'pharmacy' | 'rxclose';
  sellerName?: string;
  pharmacyId?: number | null;
  pharmacyName?: string;
  
  // Additional fields for compatibility
  status?: 'active' | 'inactive';
  createdAt?: string;
  manufacturer?: string;
  activeIngredient?: string;
  dosage?: string;
  expiryDate?: string;
} 