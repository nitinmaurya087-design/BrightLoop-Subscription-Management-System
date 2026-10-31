import React, { useState, useEffect } from 'react';
import { paymentApi, invoiceApi } from '../../api';
import { Payment, Invoice, PaymentReceipt } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Plus,
  Search,
  FileText,
  Printer,
  CheckCircle,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceipt | null>(null);

  const { success, error } = useToast();

  const fetchPayments = async (page: number, searchKeyword: string) => {
    setIsLoading(true);
    try {
      const data = await paymentApi.list({ page, size: 10, search: searchKeyword });
      setPayments(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load payments', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnpaidInvoices = async () => {
    try {
      const data = await invoiceApi.list({ size: 100 });
      const due = data.content.filter((inv) => inv.balanceDue > 0 && inv.status !== 'CANCELLED');
      setUnpaidInvoices(due);
      if (due.length > 0) {
        setSelectedInvoiceId(due[0].id);
        setPaymentAmount(due[0].balanceDue);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage, search);
  }, [currentPage, search]);

  const handleOpenRecord = async () => {
    await loadUnpaidInvoices();
    setIsRecordModalOpen(true);
  };

  const handleInvoiceSelect = (invId: number) => {
    setSelectedInvoiceId(invId);
    const inv = unpaidInvoices.find((i) => i.id === invId);
    if (inv) {
      setPaymentAmount(inv.balanceDue);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = unpaidInvoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) {
      error('Invoice Required', 'Please select an invoice to record payment against.');
      return;
    }

    if (paymentAmount <= 0) {
      error('Invalid Amount', 'Payment must be greater than zero.');
      return;
    }

    if (paymentAmount > inv.balanceDue) {
      error('Overpayment Not Allowed', `Amount (₹${paymentAmount}) exceeds invoice balance (₹${inv.balanceDue}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const pmt = await paymentApi.record({
        invoiceId: selectedInvoiceId,
        amount: paymentAmount,
        paymentMethod,
        transactionReference: transactionRef || undefined,
        notes: notes || undefined,
      });

      success('Payment Recorded', `Payment #${pmt.paymentNumber} processed.`);
      setIsRecordModalOpen(false);
      setTransactionRef('');
      setNotes('');
      fetchPayments(0, '');
      if (pmt.receipt) {
        setViewingReceipt(pmt.receipt);
      }
    } catch (err: any) {
      error('Failed to record payment', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = async (paymentId: number) => {
    try {
      const r = await paymentApi.getReceipt(paymentId);
      setViewingReceipt(r);
    } catch (err) {
      error('Could not load receipt');
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Payments & Receipts</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Collections ledger, settlement reconciliation, payment methods, and transaction receipts.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenRecord}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Payment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-[#687586]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search by payment #, invoice #, customer name..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>
          <div className="text-xs text-[#929DAB] font-medium">
            Total Collections Logged: <span className="font-semibold text-[#E8EDF3]">{totalElements}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments recorded"
            description="Record incoming payments against open customer invoices to settle balances."
            actionText="Record Payment"
            onAction={handleOpenRecord}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Payment #</TableHeaderCell>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Payment Date</TableHeaderCell>
                  <TableHeaderCell>Payment Method</TableHeaderCell>
                  <TableHeaderCell>Transaction Ref</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell className="text-right">Receipt</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((pmt) => (
                  <TableRow key={pmt.id}>
                    <TableCell className="font-mono text-xs text-[#E8EDF3]">
                      {pmt.paymentNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {pmt.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">
                      {pmt.customerName}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(pmt.paymentDate)}</TableCell>
                    <TableCell>
                      <Badge variant="neutral">
                        {pmt.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#687586]">
                      {pmt.transactionReference || '—'}
                    </TableCell>
                    <TableCell className="font-semibold text-[#3FA77A]">
                      {formatCurrency(pmt.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(pmt.id)}
                        leftIcon={<FileText className="w-3.5 h-3.5 text-[#4F83CC]" />}
                      >
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Customer Payment"
        description="Select an unpaid invoice and log collection details"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Select Invoice (with balance due)"
            required
            value={selectedInvoiceId}
            onChange={(e) => handleInvoiceSelect(Number(e.target.value))}
            options={unpaidInvoices.map((inv) => ({
              value: inv.id,
              label: `${inv.invoiceNumber} - ${inv.customerName} (Due: ${formatCurrency(inv.balanceDue)})`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
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
                { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)' },
                { value: 'UPI', label: 'UPI / QR Code' },
                { value: 'CASH', label: 'Cash' },
                { value: 'CHEQUE', label: 'Cheque' },
              ]}
            />
          </div>

          <Input
            label="Transaction Reference / Cheque No."
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="e.g. TXN-129384729"
          />

          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRecordModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Process Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Payment Receipt Modal */}
      <Modal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Payment Receipt"
        maxWidth="md"
      >
        {viewingReceipt && (
          <div className="space-y-6">
            <div className="p-6 bg-[#10151D] rounded-md border border-[#273241] text-center space-y-2">
              <div className="w-10 h-10 bg-[#3FA77A]/15 text-[#3FA77A] rounded-full flex items-center justify-center mx-auto border border-[#3FA77A]/30">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#E8EDF3]">Payment Confirmed</h3>
              <p className="text-2xl font-bold text-[#3FA77A]">
                {formatCurrency(viewingReceipt.amount)}
              </p>
              <p className="text-xs font-mono text-[#687586]">
                Receipt #{viewingReceipt.receiptNumber}
              </p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-[#273241]">
              <div className="flex justify-between py-1.5">
                <span className="text-[#929DAB]">Customer:</span>
                <span className="font-medium text-[#E8EDF3]">{viewingReceipt.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#929DAB]">Email:</span>
                <span className="font-medium text-[#E8EDF3]">{viewingReceipt.customerEmail}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#929DAB]">Invoice Settled:</span>
                <span className="font-mono font-medium text-[#4F83CC]">{viewingReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#929DAB]">Date:</span>
                <span className="font-medium text-[#E8EDF3]">{formatDate(viewingReceipt.receiptDate)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#929DAB]">Method:</span>
                <span className="font-medium text-[#E8EDF3]">{viewingReceipt.paymentMethod}</span>
              </div>
              {viewingReceipt.transactionReference && (
                <div className="flex justify-between py-1.5">
                  <span className="text-[#929DAB]">Reference:</span>
                  <span className="font-mono font-medium text-[#E8EDF3]">{viewingReceipt.transactionReference}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#273241]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingReceipt(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentListPage;
