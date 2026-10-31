import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invoiceApi, paymentApi } from '../../api';
import { Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceApi.get(invoiceId);
      setInvoice(data);
      setPaymentAmount(data.balanceDue);
    } catch (err: any) {
      error('Failed to load invoice', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleConfirmInvoice = async () => {
    setIsProcessing(true);
    try {
      const updated = await invoiceApi.confirm(invoiceId);
      setInvoice(updated);
      success('Invoice Confirmed', `Invoice #${updated.invoiceNumber} is now confirmed.`);
    } catch (err: any) {
      error('Confirmation Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelInvoice = async () => {
    setIsProcessing(true);
    try {
      const updated = await invoiceApi.cancel(invoiceId);
      setInvoice(updated);
      success('Invoice Cancelled', `Invoice #${updated.invoiceNumber} has been cancelled.`);
    } catch (err: any) {
      error('Cancel Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (paymentAmount <= 0) {
      error('Invalid Amount', 'Payment amount must be greater than zero.');
      return;
    }

    if (paymentAmount > invoice.balanceDue) {
      error('Overpayment Disallowed', `Payment amount (₹${paymentAmount}) cannot exceed outstanding balance due (₹${invoice.balanceDue}).`);
      return;
    }

    setIsProcessing(true);
    try {
      const pmt = await paymentApi.record({
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentMethod,
        transactionReference: transactionRef || undefined,
        notes: paymentNotes || undefined,
      });

      success('Payment Recorded', `Payment #${pmt.paymentNumber} received and receipt generated.`);
      setIsPaymentModalOpen(false);
      fetchInvoice();
    } catch (err: any) {
      error('Payment Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      await invoiceApi.downloadPdf(invoice.id, invoice.invoiceNumber);
      success('Download Started', `Saved ${invoice.invoiceNumber}.pdf`);
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

  if (isLoading || !invoice) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const canConfirm = invoice.status === 'DRAFT';
  const canPay = ['CONFIRMED', 'PARTIAL', 'OVERDUE'].includes(invoice.status) && invoice.balanceDue > 0;
  const canCancel = ['DRAFT', 'CONFIRMED'].includes(invoice.status) && invoice.amountPaid === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="p-2 text-[#929DAB] hover:text-[#E8EDF3] bg-[#151C26] rounded-md border border-[#273241] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant="auto" status={invoice.status}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-xs text-[#929DAB] mt-0.5">
              Issued on {formatDate(invoice.invoiceDate)} • Due on{' '}
              <span className={`font-medium ${invoice.status === 'OVERDUE' ? 'text-[#D65B65]' : 'text-[#E8EDF3]'}`}>
                {formatDate(invoice.dueDate)}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            leftIcon={<Download className="w-4 h-4 text-[#4F83CC]" />}
          >
            Download PDF
          </Button>

          {canConfirm && (
            <Button
              variant="primary"
              onClick={handleConfirmInvoice}
              isLoading={isProcessing}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Invoice
            </Button>
          )}

          {canPay && (
            <Button
              variant="primary"
              onClick={() => {
                setPaymentAmount(invoice.balanceDue);
                setIsPaymentModalOpen(true);
              }}
              leftIcon={<CreditCard className="w-4 h-4" />}
              className="bg-[#3FA77A] hover:bg-[#359068]"
            >
              Record Payment
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancelInvoice}
              isLoading={isProcessing}
              leftIcon={<XCircle className="w-4 h-4 text-[#D65B65]" />}
            >
              Cancel Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Billed To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-[#E8EDF3]">
            <Link
              to={`/customers/${invoice.customerId}`}
              className="font-semibold text-[#4F83CC] hover:underline block text-base"
            >
              {invoice.customerName}
            </Link>
            <div className="flex items-center gap-2 text-[#929DAB] text-xs">
              <Mail className="w-3.5 h-3.5 text-[#687586]" />
              <span>{invoice.customerEmail}</span>
            </div>
            {invoice.customerBillingAddress && (
              <div className="flex items-start gap-2 text-[#929DAB] text-xs pt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#687586]" />
                <span>{invoice.customerBillingAddress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-[#929DAB]">
            {invoice.subscriptionNumber && (
              <div className="flex justify-between">
                <span>Subscription:</span>
                <Link
                  to={`/subscriptions/${invoice.subscriptionId}`}
                  className="font-mono text-xs font-medium text-[#4F83CC] hover:underline"
                >
                  {invoice.subscriptionNumber}
                </Link>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment Terms:</span>
              <span className="font-medium text-[#E8EDF3]">{invoice.paymentTerms || 'Immediate'}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-medium text-[#3FA77A]">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span>Balance Due:</span>
              <span className={`font-semibold ${invoice.balanceDue > 0 ? 'text-[#D65B65]' : 'text-[#929DAB]'}`}>
                {formatCurrency(invoice.balanceDue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full bg-[#1B2430]">
            <div>
              <span className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider">
                Total Invoiced
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#E8EDF3]">
                {formatCurrency(invoice.grandTotal)}
              </h2>
            </div>
            <div className="mt-4 pt-3 border-t border-[#273241] text-xs text-[#929DAB] flex justify-between">
              <span>Paid: <span className="text-[#3FA77A] font-medium">{formatCurrency(invoice.amountPaid)}</span></span>
              <span>Due: <span className="text-[#D65B65] font-semibold">{formatCurrency(invoice.balanceDue)}</span></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Invoice Line Items ({invoice.lines?.length || 0})</CardTitle>
            <p className="text-xs text-[#929DAB] mt-0.5">Historical price snapshot locked at time of invoice creation</p>
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
                <TableHeaderCell>Tax Rate</TableHeaderCell>
                <TableHeaderCell>Tax Amount</TableHeaderCell>
                <TableHeaderCell className="text-right">Line Total</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.lines?.map((line, idx) => (
                <TableRow key={idx} hoverable={false}>
                  <TableCell className="font-medium text-[#E8EDF3]">{line.productName}</TableCell>
                  <TableCell className="text-[#929DAB] text-xs">{line.variantName || '—'}</TableCell>
                  <TableCell className="text-[#E8EDF3] font-medium">{line.quantity}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(line.unitPrice)}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(line.subtotal)}</TableCell>
                  <TableCell className="text-xs text-[#687586]">{line.taxRate ? `${line.taxRate}%` : '0%'}</TableCell>
                  <TableCell className="text-[#929DAB]">{formatCurrency(line.taxAmount)}</TableCell>
                  <TableCell className="text-right font-semibold text-[#E8EDF3]">
                    {formatCurrency(line.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Breakdown Totals Footer */}
          <div className="p-6 bg-[#111720] border-t border-[#273241] flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between text-[#929DAB]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#E8EDF3]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#929DAB]">
                <span>Taxes:</span>
                <span className="font-medium text-[#E8EDF3]">+{formatCurrency(invoice.taxTotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-[#3FA77A]">
                  <span>Discounts Applied:</span>
                  <span className="font-medium">-{formatCurrency(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#273241] flex justify-between text-base font-bold text-[#E8EDF3]">
                <span>Grand Total:</span>
                <span className="text-[#4F83CC]">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#3FA77A]">
                <span>Amount Paid:</span>
                <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#D65B65] pt-1 border-t border-[#273241]">
                <span>Remaining Balance Due:</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        description={`Record payment for invoice ${invoice.invoiceNumber}. Outstanding balance: ${formatCurrency(invoice.balanceDue)}.`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            max={invoice.balanceDue}
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
          />

          <Select
            label="Payment Method"
            required
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'CREDIT_CARD', label: 'Credit Card' },
              { value: 'DEBIT_CARD', label: 'Debit Card' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS/IMPS)' },
              { value: 'UPI', label: 'UPI / QR Code' },
              { value: 'CASH', label: 'Cash' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]}
          />

          <Input
            label="Transaction Reference / Cheque No."
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="e.g. TXN-98437291 or UTR number"
          />

          <Input
            label="Payment Notes"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Optional settlement notes"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isProcessing}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceDetailPage;
