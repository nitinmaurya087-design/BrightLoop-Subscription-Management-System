import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Customers
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';

// Products & Plans
import ProductListPage from './pages/products/ProductListPage';
import ProductVariantsPage from './pages/variants/ProductVariantsPage';
import PlanListPage from './pages/plans/PlanListPage';

// Quotations
import QuotationListPage from './pages/quotations/QuotationListPage';
import QuotationDetailPage from './pages/quotations/QuotationDetailPage';

// Subscriptions
import SubscriptionListPage from './pages/subscriptions/SubscriptionListPage';
import SubscriptionDetailPage from './pages/subscriptions/SubscriptionDetailPage';

// Invoices & Payments
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import PaymentListPage from './pages/payments/PaymentListPage';

// Discounts, Taxes, Reports, Audit Logs, Staff, Portal, Settings
import DiscountListPage from './pages/discounts/DiscountListPage';
import TaxesPage from './pages/taxes/TaxesPage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import StaffListPage from './pages/staff/StaffListPage';
import CustomerPortalPage from './pages/portal/CustomerPortalPage';
import SettingsPage from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Main Application with Sidebar & Navbar Layout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Admin & Staff Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <CustomerListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <CustomerDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <ProductListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/variants"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <ProductVariantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <PlanListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quotations"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <QuotationListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quotations/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <QuotationDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <SubscriptionListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <SubscriptionDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <InvoiceListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <InvoiceDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <PaymentListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discounts"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <DiscountListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/taxes"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <TaxesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Route */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <StaffListPage />
                    </ProtectedRoute>
                  }
                />

                {/* Settings Route */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Customer Portal Route */}
                <Route
                  path="/portal"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                      <CustomerPortalPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
