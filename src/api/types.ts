export interface Product {
  id: number;
  name: string;
  version: string;
  description: string;
  isActive: boolean;
  price: number;
  trialDays: number;
  defaultLicenseDays: number;
  minimumRequiredVersion?: string;
  enforceVersionCheck: boolean;
  sendPurchaseEmail: boolean;
  sendRenewalReminders: boolean;
  renewalReminderDays?: number;
  deactivationCooldownHours?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface License {
  activationKey: string;
  email: string;
  hardwareId?: string;
  activationDate?: string;
  createdAt: string;
  expirationDate: string;
  isActive: boolean;
  productId: number;
  productName: string;
  version?: string;
  note?: string;
  isCorporate: boolean;
  maxSeats?: number;
  corporateName?: string;
  currentSeats: number;
  isOffline: boolean;
  offlineCode?: string;
}

export interface GenerateKeyRequest {
  productName: string;
  email: string;
  validityDays?: number;
  planId?: number;
}

export interface GenerateKeyResponse {
  activationKey: string;
  isCorporate: boolean;
  maxSeats?: number;
  isOffline: boolean;
}

export interface LicenseHistory {
  id: number;
  action: string;
  hardwareId?: string;
  ipAddress?: string;
  timestamp: string;
  note?: string;
}
