import apiClient, { downloadBlob } from './client';
import {
  AuthResponse,
  Customer,
  Product,
  ProductVariant,
  Plan,
  Tax,
  Quotation,
  QuotationTemplate,
  Subscription,
  Invoice,
  Payment,
  PaymentReceipt,
  Discount,
  Staff,
  DashboardStats,
  BillingExecution,
  ApiResponse,
  PageResponse,
  User,
} from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (userData: { fullName: string; email: string; password: string; phone?: string; companyName?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return res.data.data;
  },
  forgotPassword: async (email: string): Promise<string> => {
    const res = await apiClient.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return res.data.message || 'Reset link sent';
  },
  resetPassword: async (data: { token: string; newPassword: string }): Promise<string> => {
    const res = await apiClient.post<ApiResponse<string>>('/auth/reset-password', data);
    return res.data.message || 'Password reset successful';
  },
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },
};

export const dashboardApi = {
  getStats: async (period: string = '30d', startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await apiClient.get<ApiResponse<DashboardStats>>(`/dashboard/stats?${params.toString()}`);
    return res.data.data;
  },
};

export const customerApi = {
  list: async (params?: { page?: number; size?: number; search?: string; active?: boolean }): Promise<PageResponse<Customer>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Customer>>>('/customers', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Customer> => {
    const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
  getSubscriptions: async (id: number): Promise<Subscription[]> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>(`/customers/${id}/subscriptions`);
    return res.data.data;
  },
  getInvoices: async (id: number): Promise<Invoice[]> => {
    const res = await apiClient.get<ApiResponse<Invoice[]>>(`/customers/${id}/invoices`);
    return res.data.data;
  },
  getPayments: async (id: number): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>(`/customers/${id}/payments`);
    return res.data.data;
  },
};

export const productApi = {
  list: async (params?: { page?: number; size?: number; search?: string; type?: string; active?: boolean }): Promise<PageResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
  addVariant: async (productId: number, variant: Partial<ProductVariant>): Promise<ProductVariant> => {
    const res = await apiClient.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, variant);
    return res.data.data;
  },
  updateVariant: async (productId: number, variantId: number, variant: Partial<ProductVariant>): Promise<ProductVariant> => {
    const res = await apiClient.put<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`, variant);
    return res.data.data;
  },
  deleteVariant: async (productId: number, variantId: number): Promise<void> => {
    await apiClient.delete(`/products/${productId}/variants/${variantId}`);
  },
};

export const planApi = {
  list: async (params?: { page?: number; size?: number; frequency?: string; active?: boolean }): Promise<PageResponse<Plan>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Plan>>>('/plans', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Plan> => {
    const res = await apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient.post<ApiResponse<Plan>>('/plans', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient.put<ApiResponse<Plan>>(`/plans/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },
  getSubscribers: async (id: number): Promise<Subscription[]> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>(`/plans/${id}/subscribers`);
    return res.data.data;
  },
};

export const taxApi = {
  list: async (activeOnly: boolean = false): Promise<Tax[]> => {
    const res = await apiClient.get<ApiResponse<Tax[]>>(`/taxes?activeOnly=${activeOnly}`);
    return res.data.data;
  },
  get: async (id: number): Promise<Tax> => {
    const res = await apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Tax>): Promise<Tax> => {
    const res = await apiClient.post<ApiResponse<Tax>>('/taxes', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<Tax>): Promise<Tax> => {
    const res = await apiClient.put<ApiResponse<Tax>>(`/taxes/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/taxes/${id}`);
  },
};

export const quotationTemplateApi = {
  list: async (): Promise<QuotationTemplate[]> => {
    const res = await apiClient.get<ApiResponse<QuotationTemplate[]>>('/quotation-templates');
    return res.data.data;
  },
  get: async (id: number): Promise<QuotationTemplate> => {
    const res = await apiClient.get<ApiResponse<QuotationTemplate>>(`/quotation-templates/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<QuotationTemplate>): Promise<QuotationTemplate> => {
    const res = await apiClient.post<ApiResponse<QuotationTemplate>>('/quotation-templates', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<QuotationTemplate>): Promise<QuotationTemplate> => {
    const res = await apiClient.put<ApiResponse<QuotationTemplate>>(`/quotation-templates/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/quotation-templates/${id}`);
  },
};

export const quotationApi = {
  list: async (params?: { page?: number; size?: number; search?: string; status?: string }): Promise<PageResponse<Quotation>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Quotation>>>('/quotations', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Quotation> => {
    const res = await apiClient.get<ApiResponse<Quotation>>(`/quotations/${id}`);
    return res.data.data;
  },
  create: async (data: any): Promise<Quotation> => {
    const res = await apiClient.post<ApiResponse<Quotation>>('/quotations', data);
    return res.data.data;
  },
  update: async (id: number, data: any): Promise<Quotation> => {
    const res = await apiClient.put<ApiResponse<Quotation>>(`/quotations/${id}`, data);
    return res.data.data;
  },
  confirm: async (id: number): Promise<Quotation> => {
    const res = await apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/confirm`);
    return res.data.data;
  },
  convert: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/quotations/${id}/convert-to-subscription`);
    return res.data.data;
  },
  downloadPdf: async (id: number, quotationNumber: string = 'quotation'): Promise<void> => {
    const res = await apiClient.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
    downloadBlob(res.data, `${quotationNumber}.pdf`, 'application/pdf');
  },
};

export const subscriptionApi = {
  list: async (params?: { page?: number; size?: number; search?: string; status?: string; customerId?: number }): Promise<PageResponse<Subscription>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Subscription>>>('/subscriptions', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Subscription> => {
    const res = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return res.data.data;
  },
  create: async (data: any): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', data);
    return res.data.data;
  },
  update: async (id: number, data: any): Promise<Subscription> => {
    const res = await apiClient.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, data);
    return res.data.data;
  },
  activate: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/activate`);
    return res.data.data;
  },
  pause: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`);
    return res.data.data;
  },
  resume: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`);
    return res.data.data;
  },
  close: async (id: number, reason?: string): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/close`, { reason });
    return res.data.data;
  },
  earlyTerminate: async (id: number, reason?: string): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/early-terminate`, { reason });
    return res.data.data;
  },
  renew: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/renew`);
    return res.data.data;
  },
};

export const invoiceApi = {
  list: async (params?: { page?: number; size?: number; search?: string; status?: string; customerId?: number }): Promise<PageResponse<Invoice>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Invoice>>>('/invoices', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return res.data.data;
  },
  create: async (data: any): Promise<Invoice> => {
    const res = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return res.data.data;
  },
  confirm: async (id: number): Promise<Invoice> => {
    const res = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/confirm`);
    return res.data.data;
  },
  cancel: async (id: number): Promise<Invoice> => {
    const res = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/cancel`);
    return res.data.data;
  },
  downloadPdf: async (id: number, invoiceNumber: string = 'invoice'): Promise<void> => {
    const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    downloadBlob(res.data, `${invoiceNumber}.pdf`, 'application/pdf');
  },
};

export const paymentApi = {
  list: async (params?: { page?: number; size?: number; search?: string; customerId?: number }): Promise<PageResponse<Payment>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Payment>>>('/payments', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Payment> => {
    const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  },
  record: async (data: { invoiceId: number; amount: number; paymentMethod: string; transactionReference?: string; notes?: string }): Promise<Payment> => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return res.data.data;
  },
  getReceipt: async (id: number): Promise<PaymentReceipt> => {
    const res = await apiClient.get<ApiResponse<PaymentReceipt>>(`/payments/${id}/receipt`);
    return res.data.data;
  },
};

export const discountApi = {
  list: async (params?: { page?: number; size?: number; active?: boolean }): Promise<PageResponse<Discount>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Discount>>>('/discounts', { params });
    return res.data.data;
  },
  get: async (id: number): Promise<Discount> => {
    const res = await apiClient.get<ApiResponse<Discount>>(`/discounts/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Discount>): Promise<Discount> => {
    const res = await apiClient.post<ApiResponse<Discount>>('/discounts', data);
    return res.data.data;
  },
  update: async (id: number, data: Partial<Discount>): Promise<Discount> => {
    const res = await apiClient.put<ApiResponse<Discount>>(`/discounts/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/discounts/${id}`);
  },
  validateCoupon: async (couponCode: string, orderAmount: number): Promise<{ valid: boolean; discountAmount: number; discount: Discount; message?: string }> => {
    const res = await apiClient.post<ApiResponse<any>>('/discounts/validate', { couponCode, orderAmount });
    return res.data.data;
  },
};

export const billingApi = {
  runBilling: async (): Promise<BillingExecution> => {
    const res = await apiClient.post<ApiResponse<BillingExecution>>('/billing/run');
    return res.data.data;
  },
  getExecutions: async (): Promise<BillingExecution[]> => {
    const res = await apiClient.get<ApiResponse<BillingExecution[]>>('/billing/executions');
    return res.data.data;
  },
};

export const reportApi = {
  getSummary: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/summary');
    return res.data.data;
  },
  getRevenue: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await apiClient.get<ApiResponse<any>>(`/reports/revenue?${params.toString()}`);
    return res.data.data;
  },
  getSubscriptions: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/subscriptions');
    return res.data.data;
  },
  getInvoices: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/invoices');
    return res.data.data;
  },
  getPayments: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/payments');
    return res.data.data;
  },
  getTaxes: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/taxes');
    return res.data.data;
  },
  getChurn: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/churn');
    return res.data.data;
  },
  exportCsv: async (reportType: string, filename: string): Promise<void> => {
    const res = await apiClient.get(`/reports/${reportType}/export`, { responseType: 'blob' });
    downloadBlob(res.data, `${filename}.csv`, 'text/csv');
  },
};

export const staffApi = {
  list: async (): Promise<Staff[]> => {
    const res = await apiClient.get<ApiResponse<Staff[]>>('/staff');
    return res.data.data;
  },
  get: async (id: number): Promise<Staff> => {
    const res = await apiClient.get<ApiResponse<Staff>>(`/staff/${id}`);
    return res.data.data;
  },
  create: async (data: { fullName: string; email: string; password: string; department?: string; title?: string; phone?: string }): Promise<Staff> => {
    const res = await apiClient.post<ApiResponse<Staff>>('/staff', data);
    return res.data.data;
  },
  toggleActive: async (id: number): Promise<Staff> => {
    const res = await apiClient.post<ApiResponse<Staff>>(`/staff/${id}/toggle-active`);
    return res.data.data;
  },
};

export const portalApi = {
  getOverview: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/portal/overview');
    return res.data.data;
  },
  getSubscriptions: async (): Promise<Subscription[]> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>('/portal/subscriptions');
    return res.data.data;
  },
  getInvoices: async (): Promise<Invoice[]> => {
    const res = await apiClient.get<ApiResponse<Invoice[]>>('/portal/invoices');
    return res.data.data;
  },
  getPayments: async (): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/portal/payments');
    return res.data.data;
  },
  getPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>('/portal/plans');
    return res.data.data;
  },
  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await apiClient.put<ApiResponse<Customer>>('/portal/profile', data);
    return res.data.data;
  },
  pauseSubscription: async (id: number): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/portal/subscriptions/${id}/pause`);
    return res.data.data;
  },
  cancelSubscription: async (id: number, reason?: string): Promise<Subscription> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/portal/subscriptions/${id}/cancel`, { reason });
    return res.data.data;
  },
};
