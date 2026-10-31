import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotationApi } from '../../api';
import { Quotation } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  Repeat,
  Building,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const quotationId = Number(id);

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchQuotation = async () => {
    setIsLoading(true);
    try {
      const data = await quotationApi.get(quotationId);
      setQuotation(data);
    } catch (err: any) {
      error('Failed to load quotation', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const updated = await quotationApi.confirm(quotationId);
      setQuotation(updated);
      success('Quotation Confirmed', `Quotation #${updated.quotationNumber} is now confirmed.`);
    } catch (err: any) {
      error('Confirmation Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToSubscription = async () => {
    setIsProcessing(true);
    try {
      const sub = await quotationApi.convert(quotationId);
      success('Converted to Subscription', `Created subscription #${sub.subscriptionNumber}`);
      navigate(`/subscriptions/${sub.id}`);
    } catch (err: any) {
      error('Conversion Failed', err.response?.data?.message || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quotation) return;
    try {
      await quotationApi.downloadPdf(quotation.id, quotation.quotationNumber);
      success('Download Started', `Saved ${quotation.quotationNumber}.pdf`);
    } catch (err) {
      error('Download Failed', 'Could not render quotation PDF.');
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

  if (isLoading || !quotation) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const canConfirm = ['DRAFT', 'QUOTATION'].includes(quotation.status);
  const canConvert = quotation.status === 'CONFIRMED' && !quotation.convertedToSubscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/quotations"
            className="p-2 text-[#929DAB] hover:text-[#E8EDF3] bg-[#151C26] rounded-md border border-[#273241] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">
                {quotation.quotationNumber}
              </h1>
              <Badge variant="auto" status={quotation.status}>
                {quotation.status}
              </Badge>
            </div>
            <p className="text-xs text-[#929DAB] mt-0.5">
              Created on {formatDate(quotation.creationDate)} • Expires on {formatDate(quotation.expiryDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
              onClick={handleConfirm}
              isLoading={isProcessing}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Quotation
            </Button>
          )}

          {canConvert && (
            <Button
              variant="primary"
              onClick={handleConvertToSubscription}
              isLoading={isProcessing}
              leftIcon={<Repeat className="w-4 h-4" />}
              className="bg-[#3FA77A] hover:bg-[#359068]"
            >
              Convert to Subscription
            </Button>
          )}

          {quotation.convertedToSubscription && quotation.subscriptionId && (
            <Link to={`/subscriptions/${quotation.subscriptionId}`}>
              <Button
                variant="subtle"
                leftIcon={<Repeat className="w-4 h-4 text-[#4F83CC]" />}
              >
                View Active Subscription
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#E8EDF3]">
            <Link
              to={`/customers/${quotation.customerId}`}
              className="font-semibold text-[#4F83CC] hover:underline block text-base"
            >
              {quotation.customerName}
            </Link>
            <div className="flex items-center gap-2 text-[#929DAB] text-xs">
              <Mail className="w-3.5 h-3.5 text-[#687586]" />
              <span>{quotation.customerEmail}</span>
            </div>
            {quotation.customerCompany && (
              <div className="flex items-center gap-2 text-[#929DAB] text-xs">
                <Building className="w-3.5 h-3.5 text-[#687586]" />
                <span>{quotation.customerCompany}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan & Frequency Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#E8EDF3]">
            <p className="font-semibold text-[#E8EDF3] text-base">
              {quotation.planName || 'Custom Configuration'}
            </p>
            <div className="text-xs text-[#929DAB]">
              Billing Cadence:{' '}
              <span className="font-semibold text-[#E8EDF3]">{quotation.billingFrequency}</span>
            </div>
            <div className="text-xs text-[#929DAB]">
              Payment Terms:{' '}
              <span className="font-semibold text-[#E8EDF3]">{quotation.paymentTerms || 'Immediate'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Grand Total Summary */}
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full bg-[#1B2430]">
            <div>
              <span className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider">
                Quotation Grand Total
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[#E8EDF3]">
                {formatCurrency(quotation.grandTotal)}
              </h2>
            </div>
            <div className="mt-4 pt-3 border-t border-[#273241] flex items-center justify-between text-xs text-[#929DAB]">
              <span>Taxes: {formatCurrency(quotation.taxTotal)}</span>
              <span>Discounts: {formatCurrency(quotation.discountTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Lines Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quotation Product Lines ({quotation.lines?.length || 0})</CardTitle>
            <p className="text-xs text-[#929DAB] mt-0.5">Itemized products, variant add-ons, and calculated taxes</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Variant</TableHeaderCell>
                <TableHeaderCell>Quantity</TableHeaderCell>
                <TableHeaderCell>Unit Price</TableHeaderCell>
                <TableHeaderCell>Subtotal</TableHeaderCell>
                <TableHeaderCell>Tax Rate</TableHeaderCell>
                <TableHeaderCell>Tax Amount</TableHeaderCell>
                <TableHeaderCell className="text-right">Total Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotation.lines?.map((line, idx) => (
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
                <span className="font-medium text-[#E8EDF3]">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#929DAB]">
                <span>Taxes:</span>
                <span className="font-medium text-[#E8EDF3]">+{formatCurrency(quotation.taxTotal)}</span>
              </div>
              {quotation.discountTotal > 0 && (
                <div className="flex justify-between text-[#3FA77A]">
                  <span>Discounts Applied:</span>
                  <span className="font-medium">-{formatCurrency(quotation.discountTotal)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#273241] flex justify-between text-base font-bold text-[#E8EDF3]">
                <span>Grand Total:</span>
                <span className="text-[#4F83CC]">{formatCurrency(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationDetailPage;
