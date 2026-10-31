import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerApi, invoiceApi } from '../../api';
import { Customer, Subscription, Invoice, Payment } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Repeat,
  CreditCard,
  Download,
  Edit2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchCustomerDetails = async () => {
    setIsLoading(true);
    try {
      const [custData, subData, invData, pmtData] = await Promise.all([
        customerApi.get(customerId),
        customerApi.getSubscriptions(customerId),
        customerApi.getInvoices(customerId),
        customerApi.getPayments(customerId),
      ]);
      setCustomer(custData);
      setSubscriptions(subData);
      setInvoices(invData);
      setPayments(pmtData);
      setEditFormData(custData);
    } catch (err: any) {
      error('Failed to load customer details', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await customerApi.update(customerId, editFormData);
      setCustomer(updated);
      success('Customer Updated', 'Profile changes have been saved.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoicePdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      await invoiceApi.downloadPdf(invoiceId, invoiceNumber);
      success('Download Started', `Saved ${invoiceNumber}.pdf`);
    } catch (err: any) {
      error('Download Failed', 'Could not generate invoice PDF.');
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

  if (isLoading || !customer) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back button & page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#273241]">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-1.5 text-[#929DAB] hover:text-[#E8EDF3] bg-[#151C26] rounded-md border border-[#273241] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#E8EDF3] tracking-tight">{customer.fullName}</h1>
              <Badge variant="auto" status={customer.active ? 'ACTIVE' : 'INACTIVE'}>
                {customer.active ? 'Active' : 'Archived'}
              </Badge>
            </div>
            <p className="text-xs text-[#929DAB] mt-0.5">
              Account: <span className="font-mono text-[#4F83CC]">{customer.customerNumber}</span> • Enrolled: {formatDate(customer.registrationDate)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          Edit Profile
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB]">Active Subscriptions</p>
              <h3 className="text-lg font-semibold text-[#E8EDF3] mt-1">
                {subscriptions.filter((s) => s.status === 'ACTIVE').length}
              </h3>
            </div>
            <div className="p-2 rounded-md bg-[#1B2430] text-[#4F83CC] border border-[#273241]">
              <Repeat className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB]">Total Invoiced</p>
              <h3 className="text-lg font-semibold text-[#E8EDF3] mt-1">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0))}
              </h3>
            </div>
            <div className="p-2 rounded-md bg-[#1B2430] text-[#929DAB] border border-[#273241]">
              <FileText className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB]">Total Paid</p>
              <h3 className="text-lg font-semibold text-[#3FA77A] mt-1">
                {formatCurrency(payments.reduce((sum, pmt) => sum + (pmt.amount || 0), 0))}
              </h3>
            </div>
            <div className="p-2 rounded-md bg-[#1B2430] text-[#3FA77A] border border-[#273241]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB]">Outstanding Balance</p>
              <h3 className="text-lg font-semibold text-[#D65B65] mt-1">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0))}
              </h3>
            </div>
            <div className="p-2 rounded-md bg-[#1B2430] text-[#D65B65] border border-[#273241]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation */}
      <Card>
        <div className="px-5 pt-1 border-b border-[#273241]">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'subscriptions', label: 'Subscriptions', badge: subscriptions.length },
              { id: 'invoices', label: 'Invoices', badge: invoices.length },
              { id: 'payments', label: 'Payments', badge: payments.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <CardContent className="p-5">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#929DAB] border-b border-[#273241] pb-2">
                  Contact Information
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-[#929DAB]">
                    <Mail className="w-3.5 h-3.5 text-[#687586] shrink-0" />
                    <span className="text-[#E8EDF3]">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#929DAB]">
                    <Phone className="w-3.5 h-3.5 text-[#687586] shrink-0" />
                    <span className="text-[#E8EDF3]">{customer.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#929DAB]">
                    <Building className="w-3.5 h-3.5 text-[#687586] shrink-0" />
                    <span className="text-[#E8EDF3]">{customer.companyName || 'Individual Entity'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#929DAB]">
                    <span className="text-xs font-mono text-[#687586] w-8">GSTIN:</span>
                    <span className="font-mono text-xs text-[#4F83CC]">{customer.taxIdentificationNumber || 'Unregistered'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#929DAB] border-b border-[#273241] pb-2">
                  Registered Billing Location
                </h4>
                <div className="p-3.5 bg-[#10151D] rounded-md border border-[#273241] space-y-1 text-xs text-[#929DAB]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#4F83CC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#E8EDF3]">{customer.billingAddress}</p>
                      <p className="text-[#929DAB]">
                        {customer.city}{customer.state ? `, ${customer.state}` : ''} - {customer.postalCode}
                      </p>
                      <p className="text-[#929DAB]">{customer.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Subscriptions */}
          {activeTab === 'subscriptions' && (
            subscriptions.length === 0 ? (
              <EmptyState
                icon={Repeat}
                title="No active subscriptions"
                description="This client does not have any subscriptions configured."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow hoverable={false}>
                    <TableHeaderCell>Subscription #</TableHeaderCell>
                    <TableHeaderCell>Plan</TableHeaderCell>
                    <TableHeaderCell>Cadence</TableHeaderCell>
                    <TableHeaderCell>Start Date</TableHeaderCell>
                    <TableHeaderCell>Next Billing</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">
                        {sub.subscriptionNumber}
                      </TableCell>
                      <TableCell className="font-medium text-[#E8EDF3]">{sub.planName}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#1B2430] px-2 py-0.5 rounded text-[#929DAB]">
                          {sub.billingFrequency}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(sub.startDate)}</TableCell>
                      <TableCell className="text-xs font-medium text-[#4F83CC]">
                        {formatDate(sub.nextBillingDate)}
                      </TableCell>
                      <TableCell className="font-medium text-[#E8EDF3]">
                        {formatCurrency(sub.grandTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="auto" status={sub.status}>{sub.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {/* Tab 3: Invoices */}
          {activeTab === 'invoices' && (
            invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No invoices"
                description="This customer does not have any generated invoices yet."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow hoverable={false}>
                    <TableHeaderCell>Invoice #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Due Date</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                    <TableHeaderCell>Paid</TableHeaderCell>
                    <TableHeaderCell>Balance Due</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">PDF</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="font-medium text-[#E8EDF3]">
                        {formatCurrency(inv.grandTotal)}
                      </TableCell>
                      <TableCell className="font-medium text-[#3FA77A]">
                        {formatCurrency(inv.amountPaid)}
                      </TableCell>
                      <TableCell className="font-medium text-[#D65B65]">
                        {formatCurrency(inv.balanceDue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="auto" status={inv.status}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoicePdf(inv.id, inv.invoiceNumber)}
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-[#4F83CC]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {/* Tab 4: Payments */}
          {activeTab === 'payments' && (
            payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments recorded"
                description="No payment collections logged for this account."
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
                    <TableRow key={pmt.id}>
                      <TableCell className="font-mono text-xs font-medium text-[#E8EDF3]">
                        {pmt.paymentNumber}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#4F83CC]">
                        {pmt.invoiceNumber || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-[#929DAB]">{formatDate(pmt.paymentDate)}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#1B2430] px-2 py-0.5 rounded text-[#929DAB]">
                          {pmt.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#687586]">
                        {pmt.transactionReference || '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#3FA77A]">
                        {formatCurrency(pmt.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile"
        description="Update corporate contact, address, and GSTIN details"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              value={editFormData.fullName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
            />
            <Input
              label="Company Name"
              value={editFormData.companyName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Address"
              type="email"
              required
              value={editFormData.email || ''}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={editFormData.phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <Input
            label="Billing Address"
            required
            value={editFormData.billingAddress || ''}
            onChange={(e) => setEditFormData({ ...editFormData, billingAddress: e.target.value })}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="City"
              required
              value={editFormData.city || ''}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
            />
            <Input
              label="State"
              value={editFormData.state || ''}
              onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
            />
            <Input
              label="Country"
              required
              value={editFormData.country || ''}
              onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
            />
            <Input
              label="PIN Code"
              required
              value={editFormData.postalCode || ''}
              onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
            />
          </div>

          <Input
            label="GSTIN / Tax ID"
            value={editFormData.taxIdentificationNumber || ''}
            onChange={(e) => setEditFormData({ ...editFormData, taxIdentificationNumber: e.target.value })}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
