export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  customerId?: number;
  staffId?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface Customer {
  id: number;
  customerNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  billingAddress: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  taxIdentificationNumber?: string;
  active: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  activeSubscriptionsCount?: number;
  totalInvoiced?: number;
  totalPaid?: number;
  outstandingBalance?: number;
}

export interface ProductVariant {
  id?: number;
  variantName: string;
  attributeValue: string;
  additionalPrice: number;
  active: boolean;
}

export interface Product {
  id: number;
  productCode: string;
  productName: string;
  productType: 'RECURRING' | 'ONE_TIME';
  description?: string;
  salesPrice: number;
  costPrice?: number;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: number;
  planCode: string;
  planName: string;
  description?: string;
  productId: number;
  productName?: string;
  productBasePrice?: number;
  billingPrice: number;
  billingFrequency: BillingFrequency;
  minimumQuantity: number;
  availableFrom?: string;
  availableUntil?: string;
  autoCloseOnExpiry: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  active: boolean;
  subscriberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tax {
  id: number;
  taxName: string;
  taxType: 'PERCENTAGE' | 'FIXED';
  taxRate: number;
  taxDescription?: string;
  applicableProductIds?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  active: boolean;
  createdAt: string;
}

export interface QuotationLine {
  id?: number;
  productId: number;
  productName?: string;
  productCode?: string;
  productVariantId?: number;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export type QuotationStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface Quotation {
  id: number;
  quotationNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  templateId?: number;
  templateName?: string;
  planId?: number;
  planName?: string;
  billingFrequency: BillingFrequency;
  creationDate: string;
  expiryDate?: string;
  paymentTerms: string;
  notes?: string;
  status: QuotationStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  convertedToSubscription: boolean;
  subscriptionId?: number;
  createdAt: string;
  lines: QuotationLine[];
}

export interface QuotationTemplateLine {
  id?: number;
  productId: number;
  productName?: string;
  productVariantId?: number;
  variantName?: string;
  planId?: number;
  quantity: number;
  unitPrice?: number;
  taxRate?: number;
}

export interface QuotationTemplate {
  id: number;
  templateName: string;
  description?: string;
  validityDays: number;
  paymentTerms: string;
  notes?: string;
  active: boolean;
  lines: QuotationLine[];
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELLED';

export interface SubscriptionLine {
  id?: number;
  productId: number;
  productName?: string;
  productCode?: string;
  productVariantId?: number;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface Subscription {
  id: number;
  subscriptionNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  planId: number;
  planName?: string;
  billingFrequency: BillingFrequency;
  startDate: string;
  expiryDate?: string;
  lastBillingDate?: string;
  nextBillingDate: string;
  paymentTerms: string;
  notes?: string;
  status: SubscriptionStatus;
  autoCloseOnExpiry: boolean;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  pausedAt?: string;
  closedAt?: string;
  closureReason?: string;
  createdAt: string;
  lines: SubscriptionLine[];
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLine {
  id?: number;
  productId: number;
  productName: string;
  productCode?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  customerBillingAddress?: string;
  subscriptionId?: number;
  subscriptionNumber?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms: string;
  notes?: string;
  pdfGenerated: boolean;
  createdAt: string;
  lines: InvoiceLine[];
}

export interface PaymentReceipt {
  receiptNumber: string;
  paymentId: number;
  receiptDate: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  invoiceNumber: string;
  notes?: string;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  invoiceId: number;
  invoiceNumber?: string;
  customerId: number;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CHEQUE';
  transactionReference?: string;
  notes?: string;
  createdAt: string;
  receipt?: PaymentReceipt;
}

export interface Discount {
  id: number;
  couponCode: string;
  discountName: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  validFrom?: string;
  validUntil?: string;
  maxUsageLimit?: number;
  currentUsageCount: number;
  active: boolean;
  createdAt: string;
}

export interface Staff {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  title?: string;
  active: boolean;
  hireDate?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  totalProducts: number;
  totalPlans: number;
  mrr: number;
  arr: number;
  totalRevenueCollected: number;
  outstandingBalance: number;
  overdueInvoicesCount: number;
  upcomingRenewalsCount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  subscriptionGrowth: { month: string; count: number }[];
  subscriptionsByStatus: { status: string; count: number }[];
  revenueByProduct: { productName: string; revenue: number }[];
  recentSubscriptions: Subscription[];
  recentPayments: Payment[];
  recentInvoices: Invoice[];
  upcomingRenewals: Subscription[];
  overdueInvoices: Invoice[];
}

export interface BillingExecution {
  id: number;
  executionDate: string;
  triggeredBy: string;
  subscriptionsProcessed: number;
  invoicesGenerated: number;
  subscriptionsExpired: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  notes?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
