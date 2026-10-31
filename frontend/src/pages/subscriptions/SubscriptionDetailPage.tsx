import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionApi, customerApi, invoiceApi } from '../../api';
import { Subscription, Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Repeat,
  Download,
  Building,
  Mail,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals for actions requiring reasons
  const [closeModalType, setCloseModalType] = useState<'CLOSE' | 'EARLY_TERMINATE' | null>(null);
  const [closureReason, setClosureReason] = useState('');

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const sub = await subscriptionApi.get(subscriptionId);
      setSubscription(sub);
      // Fetch invoices for customer
      const custInvoices = await customerApi.getInvoices(sub.customerId);
      setInvoices(custInvoices.filter((inv) => inv.subscriptionId === sub.id));
    } catch (err: any) {
      error('Failed to load subscription', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscription();
    }
  }, [subscriptionId]);

  const handleActivate = async () => {
    setIsProcessing(true);
    try {
      const updated = await subscriptionApi.activate(subscriptionId);
      setSubscription(updated);
      success('Subscription Activated', `Recurring billing scheduled for ${updated.nextBillingDate}`);
    } catch (err: any) {
      error('Activation Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      const updated = await subscriptionApi.pause(subscriptionId);
      setSubscription(updated);
      success('Subscription Paused', 'Recurring billing halted for this contract.');
    } catch (err: any) {
      error('Pause Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      const updated = await subscriptionApi.resume(subscriptionId);
      setSubscription(updated);
      success('Subscription Resumed', `Next billing cycle recalculated for ${updated.nextBillingDate}`);
    } catch (err: any) {
      error('Resume Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenew = async () => {
    setIsProcessing(true);
    try {
      const updated = await subscriptionApi.renew(subscriptionId);
      setSubscription(updated);
      success('Subscription Renewed', `Term extended. Next billing: ${updated.nextBillingDate}`);
    } catch (err: any) {
      error('Renewal Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseOrTerminate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let updated: Subscription;
      if (closeModalType === 'EARLY_TERMINATE') {
        updated = await subscriptionApi.earlyTerminate(subscriptionId, closureReason);
        success('Subscription Terminated Early', 'Term cancelled ahead of expiration.');
      } else {
        updated = await subscriptionApi.close(subscriptionId, closureReason);
        success('Subscription Closed', 'Contract status moved to closed.');
      }
      setSubscription(updated);
      setCloseModalType(null);
      setClosureReason('');
    } catch (err: any) {
      error('Action Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoicePdf = async (invId: number, invNum: string) => {
    try {
      await invoiceApi.downloadPdf(invId, invNum);
      success('Download Started', `Saved ${invNum}.pdf`);
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

  if (isLoading || !subscription) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const isConfirmed = subscription.status === 'CONFIRMED';
  const isActive = subscription.status === 'ACTIVE';
  const isPaused = subscription.status === 'PAUSED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/subscriptions"
            className="p-2 text-[#929DAB] hover:text-[#E8EDF3] bg-[#151C26] rounded-md border border-[#273241] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">
                {subscription.subscriptionNumber}
              </h1>
              <Badge variant="auto" status={subscription.status}>
                {subscription.status}
              </Badge>
            </div>
            <p className="text-xs text-[#929DAB] mt-0.5">
              Plan: <span className="font-semibold text-[#E8EDF3]">{subscription.planName}</span> • Frequency:{' '}
              <span className="font-medium text-[#4F83CC]">{subscription.billingFrequency}</span>
            </p>
          </div>
        </div>

        {/* Lifecycle Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isConfirmed && (
            <Button
              variant="primary"
              onClick={handleActivate}
              isLoading={isProcessing}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Activate Subscription
            </Button>
          )}

          {isActive && (
            <>
              <Button
                variant="outline"
                onClick={handlePause}
                isLoading={isProcessing}
                leftIcon={<PauseCircle className="w-4 h-4 text-[#D6A04B]" />}
              >
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={handleRenew}
                isLoading={isProcessing}
                leftIcon={<Repeat className="w-4 h-4 text-[#4F83CC]" />}
              >
                Renew Term
              </Button>
              <Button
                variant="outline"
                onClick={() => setCloseModalType('CLOSE')}
                leftIcon={<CheckCircle className="w-4 h-4 text-[#929DAB]" />}
              >
                Close
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCloseModalType('EARLY_TERMINATE')}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Terminate Early
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                variant="primary"
                onClick={handleResume}
                isLoading={isProcessing}
                leftIcon={<PlayCircle className="w-4 h-4" />}
                className="bg-[#3FA77A] hover:bg-[#359068]"
              >
                Resume Subscription
              </Button>
              <Button
                variant="outline"
                onClick={() => setCloseModalType('CLOSE')}
                leftIcon={<XCircle className="w-4 h-4 text-[#D65B65]" />}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#E8EDF3]">
            <Link
              to={`/customers/${subscription.customerId}`}
              className="font-semibold text-[#4F83CC] hover:underline block text-base"
            >
              {subscription.customerName}
            </Link>
            <div className="flex items-center gap-2 text-[#929DAB] text-xs">
              <Mail className="w-3.5 h-3.5 text-[#687586]" />
              <span>{subscription.customerEmail}</span>
            </div>
            {subscription.customerCompany && (
              <div className="flex items-center gap-2 text-[#929DAB] text-xs">
                <Building className="w-3.5 h-3.5 text-[#687586]" />
                <span>{subscription.customerCompany}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-[#929DAB]">
            <div className="flex justify-between">
              <span>Start Date:</span>
              <span className="font-medium text-[#E8EDF3]">{formatDate(subscription.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next Billing Date:</span>
              <span className="font-medium text-[#4F83CC]">{formatDate(subscription.nextBillingDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Expiration Date:</span>
              <span className="font-medium text-[#E8EDF3]">{formatDate(subscription.expiryDate) || 'Continuous'}</span>
            </div>
            <div className="flex justify-between">
              <span>Auto Close on Expiry:</span>
              <span className="font-medium text-[#E8EDF3]">
                {subscription.autoCloseOnExpiry ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full bg-[#1B2430]">
            <div>
              <span className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider">
                Cycle Amount
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#E8EDF3]">
                {formatCurrency(subscription.grandTotal)}
              </h2>
            </div>
            <div className="mt-4 pt-3 border-t border-[#273241] text-xs text-[#929DAB] flex justify-between">
              <span>Cadence: {subscription.billingFrequency}</span>
              <span>Terms: {subscription.paymentTerms || 'Immediate'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Lines */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Subscription Product Lines ({subscription.lines?.length || 0})</CardTitle>
            <p className="text-xs text-[#929DAB] mt-0.5">Products and variants billed on each cycle</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Variant</TableHeaderCell>
                <TableHeaderCell>Qty</TableHeaderCell>
                <TableHeaderCell>Unit Price</TableHeaderCell>
                <TableHeaderCell>Subtotal</TableHeaderCell>
                <TableHeaderCell>Tax</TableHeaderCell>
                <TableHeaderCell className="text-right">Line Total</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscription.lines?.map((l, i) => (
                <TableRow key={i} hoverable={false}>
                  <TableCell className="font-medium text-[#E8EDF3]">{l.productName}</TableCell>
                  <TableCell className="text-[#929DAB] text-xs">{l.variantName || '—'}</TableCell>
                  <TableCell className="font-medium text-[#E8EDF3]">{l.quantity}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(l.unitPrice)}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(l.subtotal)}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(l.taxAmount)}</TableCell>
                  <TableCell className="text-right font-semibold text-[#E8EDF3]">
                    {formatCurrency(l.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-6 bg-[#111720] border-t border-[#273241] flex justify-end">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#929DAB]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#E8EDF3]">{formatCurrency(subscription.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#929DAB]">
                <span>Taxes:</span>
                <span className="font-medium text-[#E8EDF3]">+{formatCurrency(subscription.taxTotal)}</span>
              </div>
              {subscription.discountTotal > 0 && (
                <div className="flex justify-between text-[#3FA77A]">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(subscription.discountTotal)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#273241] flex justify-between text-base font-bold text-[#E8EDF3]">
                <span>Total per Cycle:</span>
                <span className="text-[#4F83CC]">{formatCurrency(subscription.grandTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Invoices History */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Generated Invoices ({invoices.length})</CardTitle>
            <p className="text-xs text-[#929DAB] mt-0.5">Recurring billing invoices generated for this subscription</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#687586]">
              No recurring invoices generated yet. The scheduler runs automatically on the next billing date.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Grand Total</TableHeaderCell>
                  <TableHeaderCell>Amount Paid</TableHeaderCell>
                  <TableHeaderCell>Balance Due</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(inv.amountPaid)}</TableCell>
                    <TableCell className="font-medium text-[#D65B65]">{formatCurrency(inv.balanceDue)}</TableCell>
                    <TableCell>
                      <Badge variant="auto" status={inv.status}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoicePdf(inv.id, inv.invoiceNumber)}
                        title="Download Invoice PDF"
                      >
                        <Download className="w-4 h-4 text-[#4F83CC] hover:text-blue-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal for Close or Early Terminate */}
      <Modal
        isOpen={!!closeModalType}
        onClose={() => setCloseModalType(null)}
        title={closeModalType === 'EARLY_TERMINATE' ? 'Early Termination' : 'Close Subscription'}
        description="Provide a reason for contract modification"
        maxWidth="md"
      >
        <form onSubmit={handleCloseOrTerminate} className="space-y-4">
          <Input
            label="Closure Reason"
            required
            value={closureReason}
            onChange={(e) => setClosureReason(e.target.value)}
            placeholder="e.g. Customer requested cancellation or project completed"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCloseModalType(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={closeModalType === 'EARLY_TERMINATE' ? 'danger' : 'primary'}
              isLoading={isProcessing}
            >
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubscriptionDetailPage;
