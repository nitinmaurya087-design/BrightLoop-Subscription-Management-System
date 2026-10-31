import React, { useState, useEffect } from 'react';
import { portalApi, invoiceApi } from '../../api';
import { Subscription, Invoice, Payment, Plan, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Repeat,
  FileText,
  CreditCard,
  Layers,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cancellation Modal State
  const [cancellingSubId, setCancellingSubId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState<Partial<Customer>>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { success, error } = useToast();

  const loadPortalData = async () => {
    setIsLoading(true);
    try {
      const [ovData, subsData, invsData, pmtsData, plansData] = await Promise.all([
        portalApi.getOverview(),
        portalApi.getSubscriptions(),
        portalApi.getInvoices(),
        portalApi.getPayments(),
        portalApi.getPlans(),
      ]);
      setOverview(ovData);
      setSubscriptions(subsData);
      setInvoices(invsData);
      setPayments(pmtsData);
      setPlans(plansData);
      if (ovData.customer) {
        setProfile(ovData.customer);
        setProfileForm(ovData.customer);
      }
    } catch (err: any) {
      error('Failed to load portal data', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handlePauseSubscription = async (id: number) => {
    setIsProcessing(true);
    try {
      await portalApi.pauseSubscription(id);
      success('Subscription Paused', 'Your recurring billing has been paused.');
      loadPortalData();
    } catch (err: any) {
      error('Pause Not Permitted', err.response?.data?.message || 'This plan does not permit pausing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSubId) return;
    setIsProcessing(true);
    try {
      await portalApi.cancelSubscription(cancellingSubId, cancelReason);
      success('Subscription Cancelled', 'Your subscription has been cancelled.');
      setCancellingSubId(null);
      setCancelReason('');
      loadPortalData();
    } catch (err: any) {
      error('Cancellation Failed', err.response?.data?.message || 'Could not cancel subscription.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updated = await portalApi.updateProfile(profileForm);
      setProfile(updated);
      success('Profile Updated', 'Your contact and billing details have been updated.');
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDownloadInvoicePdf = async (invId: number, invNumber: string) => {
    try {
      await invoiceApi.downloadPdf(invId, invNumber);
      success('Download Started', `Saved ${invNumber}.pdf`);
    } catch (err) {
      error('Download Failed', 'Could not render invoice PDF.');
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-semibold tracking-wider text-[#4F83CC]">
              Customer Self-Service Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8EDF3] mt-1">
              Welcome, {profile?.fullName || user?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
              {profile?.companyName ? `${profile.companyName} • ` : ''}Manage active software subscriptions, download tax invoices, and update billing information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono py-1 px-2.5 rounded bg-[#10151D] border border-[#273241] text-[#929DAB]">
              Customer ID: {profile?.customerNumber || 'CUST-DEMO'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Active Subscriptions</p>
              <h3 className="text-xl font-bold text-[#E8EDF3] mt-1">
                {subscriptions.filter((s) => s.status === 'ACTIVE').length}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#4F83CC]/10 text-[#4F83CC] border border-[#4F83CC]/20">
              <Repeat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Total Paid to Date</p>
              <h3 className="text-xl font-bold text-[#3FA77A] mt-1">
                {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#3FA77A]/10 text-[#3FA77A] border border-[#3FA77A]/20">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Outstanding Invoices</p>
              <h3 className="text-xl font-bold text-[#D65B65] mt-1">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0))}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#D65B65]/10 text-[#D65B65] border border-[#D65B65]/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Available Upgrade Plans</p>
              <h3 className="text-xl font-bold text-[#E8EDF3] mt-1">{plans.length}</h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#1B2430] text-[#929DAB] border border-[#273241]">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portal Tabs */}
      <Card>
        <div className="px-6 pt-2 border-b border-[#273241]">
          <Tabs
            tabs={[
              { id: 'overview', label: 'My Subscriptions', badge: subscriptions.length },
              { id: 'invoices', label: 'My Invoices', badge: invoices.length },
              { id: 'payments', label: 'Payment Receipts', badge: payments.length },
              { id: 'plans', label: 'Browse Plans', badge: plans.length },
              { id: 'profile', label: 'Billing Profile' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <CardContent className="p-6">
          {/* Subscriptions Tab */}
          {activeTab === 'overview' && (
            subscriptions.length === 0 ? (
              <EmptyState
                icon={Repeat}
                title="No active subscriptions"
                description="Browse our software plans to start a new subscription."
                actionText="Browse Plans"
                onAction={() => setActiveTab('plans')}
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Subscription #</TableHeaderCell>
                      <TableHeaderCell>Plan</TableHeaderCell>
                      <TableHeaderCell>Cadence</TableHeaderCell>
                      <TableHeaderCell>Next Billing Date</TableHeaderCell>
                      <TableHeaderCell>Cycle Amount</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions.map((s) => (
                      <TableRow key={s.id} hoverable={false}>
                        <TableCell className="font-mono text-xs text-[#4F83CC]">
                          {s.subscriptionNumber}
                        </TableCell>
                        <TableCell className="font-medium text-[#E8EDF3]">{s.planName}</TableCell>
                        <TableCell>
                          <Badge variant="info">
                            {s.billingFrequency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-[#4F83CC]">
                          {formatDate(s.nextBillingDate)}
                        </TableCell>
                        <TableCell className="font-semibold text-[#E8EDF3]">
                          {formatCurrency(s.grandTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="auto" status={s.status}>{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePauseSubscription(s.id)}
                                title="Pause billing"
                              >
                                Pause
                              </Button>
                            )}
                            {['ACTIVE', 'PAUSED'].includes(s.status) && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setCancellingSubId(s.id)}
                                title="Cancel subscription"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No invoices found"
                description="Invoices will appear here as billing cycles complete."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow hoverable={false}>
                    <TableHeaderCell>Invoice #</TableHeaderCell>
                    <TableHeaderCell>Invoice Date</TableHeaderCell>
                    <TableHeaderCell>Due Date</TableHeaderCell>
                    <TableHeaderCell>Grand Total</TableHeaderCell>
                    <TableHeaderCell>Amount Paid</TableHeaderCell>
                    <TableHeaderCell>Balance Due</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">PDF</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} hoverable={false}>
                      <TableCell className="font-mono text-xs text-[#4F83CC]">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="font-semibold text-[#E8EDF3]">{formatCurrency(inv.grandTotal)}</TableCell>
                      <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(inv.amountPaid)}</TableCell>
                      <TableCell className={`font-semibold ${inv.balanceDue > 0 ? 'text-[#D65B65]' : 'text-[#929DAB]'}`}>
                        {formatCurrency(inv.balanceDue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="auto" status={inv.status}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoicePdf(inv.id, inv.invoiceNumber)}
                          leftIcon={<Download className="w-3.5 h-3.5 text-[#4F83CC]" />}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments recorded"
                description="Payment receipts will appear here once settled."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow hoverable={false}>
                    <TableHeaderCell>Payment #</TableHeaderCell>
                    <TableHeaderCell>Invoice #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Method</TableHeaderCell>
                    <TableHeaderCell>Reference</TableHeaderCell>
                    <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((pmt) => (
                    <TableRow key={pmt.id} hoverable={false}>
                      <TableCell className="font-mono text-xs text-[#E8EDF3]">{pmt.paymentNumber}</TableCell>
                      <TableCell className="font-mono text-xs text-[#4F83CC]">{pmt.invoiceNumber || '—'}</TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(pmt.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge variant="neutral">
                          {pmt.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#687586]">{pmt.transactionReference || '—'}</TableCell>
                      <TableCell className="text-right font-semibold text-[#3FA77A]">
                        {formatCurrency(pmt.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {/* Browse Plans Tab */}
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-md border border-[#273241] p-5 flex flex-col justify-between hover:border-[#4F83CC] transition-all bg-[#10151D]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="info">
                        {plan.billingFrequency}
                      </Badge>
                      <span className="text-xs text-[#687586] font-mono">{plan.planCode}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#E8EDF3]">{plan.planName}</h3>
                    <p className="text-xs text-[#929DAB] mt-1 line-clamp-2">{plan.description}</p>
                    <div className="mt-4 mb-4">
                      <span className="text-2xl font-bold text-[#E8EDF3]">{formatCurrency(plan.billingPrice)}</span>
                      <span className="text-xs text-[#929DAB]"> / {plan.billingFrequency.toLowerCase()}</span>
                    </div>
                    <div className="space-y-2 text-xs text-[#929DAB] border-t border-[#273241] pt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3FA77A]" />
                        <span>Core Cloud Platform License</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3FA77A]" />
                        <span>Min. Quantity: {plan.minimumQuantity} user(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3FA77A]" />
                        <span>{plan.allowPause ? 'Self-service pause permitted' : 'Continuous cycle'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#273241]">
                    <Button variant="outline" className="w-full text-xs font-medium">
                      Contact Sales to Upgrade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={profileForm.fullName || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
                <Input
                  label="Company Name"
                  value={profileForm.companyName || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  disabled
                  value={profileForm.email || ''}
                  helperText="Contact enterprise support to update account email"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <Input
                label="Billing Address"
                required
                value={profileForm.billingAddress || ''}
                onChange={(e) => setProfileForm({ ...profileForm, billingAddress: e.target.value })}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="City"
                  required
                  value={profileForm.city || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={profileForm.state || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                />
                <Input
                  label="Country"
                  required
                  value={profileForm.country || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                />
                <Input
                  label="Postal Code"
                  required
                  value={profileForm.postalCode || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                />
              </div>

              <Input
                label="GSTIN / Tax Identification"
                value={profileForm.taxIdentificationNumber || ''}
                onChange={(e) => setProfileForm({ ...profileForm, taxIdentificationNumber: e.target.value })}
                placeholder="27AADCB2230M1Z2"
              />

              <div className="pt-4">
                <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Subscription Cancellation Modal */}
      <Modal
        isOpen={!!cancellingSubId}
        onClose={() => setCancellingSubId(null)}
        title="Cancel Subscription"
        description="Please let us know why you are cancelling your subscription."
        maxWidth="md"
      >
        <form onSubmit={handleCancelSubscription} className="space-y-4">
          <Input
            label="Cancellation Reason"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Budget adjustment or project completion"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancellingSubId(null)}
              disabled={isProcessing}
            >
              Keep Subscription
            </Button>
            <Button type="submit" variant="danger" isLoading={isProcessing}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPortalPage;
