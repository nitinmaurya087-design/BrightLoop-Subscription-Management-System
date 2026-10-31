import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationApi, quotationTemplateApi, customerApi, productApi, planApi, taxApi } from '../../api';
import {
  Quotation,
  QuotationTemplate,
  Customer,
  Product,
  Plan,
  Tax,
  BillingFrequency,
} from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
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

export const QuotationListPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference data for creation
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  // Form State
  const [formData, setFormData] = useState<{
    customerId: number;
    templateId?: number;
    planId: number;
    billingFrequency: BillingFrequency;
    validityDays: number;
    paymentTerms: string;
    notes: string;
    lines: {
      productId: number;
      productVariantId?: number;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }[];
  }>({
    customerId: 0,
    planId: 0,
    billingFrequency: 'MONTHLY',
    validityDays: 15,
    paymentTerms: 'Immediate Payment',
    notes: 'Thank you for your business!',
    lines: [],
  });

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchQuotations = async (page: number, searchKeyword: string, status: string) => {
    setIsLoading(true);
    try {
      const data = await quotationApi.list({
        page,
        size: 10,
        search: searchKeyword,
        status: status || undefined,
      });
      setQuotations(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load quotations', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [custList, tmplList, prodList, planList, taxList] = await Promise.all([
        customerApi.list({ size: 100, active: true }),
        quotationTemplateApi.list(),
        productApi.list({ size: 100, active: true }),
        planApi.list({ size: 100, active: true }),
        taxApi.list(true),
      ]);
      setCustomers(custList.content);
      setTemplates(tmplList);
      setProducts(prodList.content);
      setPlans(planList.content);
      setTaxes(taxList);

      if (custList.content.length > 0 && planList.content.length > 0 && prodList.content.length > 0) {
        const defaultProd = prodList.content[0];
        setFormData((prev) => ({
          ...prev,
          customerId: custList.content[0].id,
          planId: planList.content[0].id,
          lines: [
            {
              productId: defaultProd.id,
              quantity: 1,
              unitPrice: defaultProd.salesPrice,
              taxRate: 18,
            },
          ],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations(currentPage, search, statusFilter);
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const handleApplyTemplate = async (templateId: number) => {
    if (!templateId) return;
    try {
      const tmpl = await quotationTemplateApi.get(templateId);
      setFormData((prev) => ({
        ...prev,
        templateId,
        paymentTerms: tmpl.paymentTerms || prev.paymentTerms,
        validityDays: tmpl.validityDays || prev.validityDays,
        notes: tmpl.notes || prev.notes,
        lines: tmpl.lines.map((l) => ({
          productId: l.productId,
          productVariantId: l.productVariantId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate || 18,
        })),
      }));
      success('Template Applied', `Populated ${tmpl.lines.length} lines from ${tmpl.templateName}`);
    } catch (err) {
      error('Failed to load template');
    }
  };

  const handleProductChange = (lineIndex: number, productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newLines = [...formData.lines];
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      productId,
      productVariantId: undefined,
      unitPrice: prod.salesPrice,
    };
    setFormData({ ...formData, lines: newLines });
  };

  const handleVariantChange = (lineIndex: number, variantId?: number) => {
    const line = formData.lines[lineIndex];
    const prod = products.find((p) => p.id === line.productId);
    if (!prod) return;

    let price = prod.salesPrice;
    if (variantId) {
      const v = prod.variants?.find((varItem) => varItem.id === variantId);
      if (v) price += v.additionalPrice;
    }

    const newLines = [...formData.lines];
    newLines[lineIndex] = {
      ...line,
      productVariantId: variantId,
      unitPrice: price,
    };
    setFormData({ ...formData, lines: newLines });
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        {
          productId: p.id,
          quantity: 1,
          unitPrice: p.salesPrice,
          taxRate: 18,
        },
      ],
    });
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length <= 1) return;
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await quotationApi.create(formData);
      success('Quotation Generated', `Quotation #${created.quotationNumber} is ready.`);
      setIsCreateModalOpen(false);
      fetchQuotations(0, '', '');
      navigate(`/quotations/${created.id}`);
    } catch (err: any) {
      error('Failed to create quotation', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async (id: number, quotationNumber: string) => {
    try {
      await quotationApi.downloadPdf(id, quotationNumber);
      success('Download Started', `Saved ${quotationNumber}.pdf`);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Quotations & Offers</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Build proposals, apply reusable templates, and convert confirmed deals directly into active subscriptions.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Quotation
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
              placeholder="Search quotation number, customer name..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#10151D] border border-[#273241] rounded-md">
            {['', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1B2430] text-[#E8EDF3] border border-[#4F83CC]/40 shadow-xs'
                    : 'text-[#929DAB] hover:text-[#E8EDF3]'
                }`}
              >
                {st || 'All'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : quotations.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No quotations found"
            description="Create custom proposals for customers or start from a pre-configured template."
            actionText="Create Quotation"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Quotation #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Expiry Date</TableHeaderCell>
                  <TableHeaderCell>Grand Total</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow
                    key={q.id}
                    onClick={() => navigate(`/quotations/${q.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {q.quotationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{q.customerName}</div>
                      <div className="text-xs text-[#687586]">{q.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-[#929DAB] font-medium text-xs">
                      {q.planName || 'Custom Line Bundle'}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(q.creationDate)}</TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(q.expiryDate)}</TableCell>
                    <TableCell className="font-semibold text-[#E8EDF3]">
                      {formatCurrency(q.grandTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={q.status}>{q.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/quotations/${q.id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(q.id, q.quotationNumber)}
                          title="Download Quotation PDF"
                        >
                          <Download className="w-4 h-4 text-[#4F83CC] hover:text-blue-400" />
                        </Button>
                      </div>
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

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Quotation"
        description="Select customer, optional template, and configure product lines with variant pricing"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Customer"
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: Number(e.target.value) })}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.fullName} (${c.companyName || c.email})`,
              }))}
            />
            <Select
              label="Quotation Template (Optional)"
              value={formData.templateId || ''}
              onChange={(e) => handleApplyTemplate(Number(e.target.value))}
            >
              <option value="">-- Start from scratch --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateName} ({t.validityDays} days)
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Associated Plan"
              required
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: Number(e.target.value) })}
              options={plans.map((p) => ({
                value: p.id,
                label: `${p.planName} (${p.billingFrequency})`,
              }))}
            />
            <Select
              label="Billing Frequency"
              required
              value={formData.billingFrequency}
              onChange={(e) =>
                setFormData({ ...formData, billingFrequency: e.target.value as BillingFrequency })
              }
              options={[
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
            />
            <Input
              label="Validity (Days)"
              type="number"
              min="1"
              required
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
            />
          </div>

          {/* Line items section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
                Quotation Product Lines ({formData.lines.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Line
              </Button>
            </div>

            <div className="space-y-2">
              {formData.lines.map((line, idx) => {
                const currentProd = products.find((p) => p.id === line.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#10151D] rounded-md border border-[#273241] grid grid-cols-12 gap-2.5 items-end"
                  >
                    <div className="col-span-12 sm:col-span-4">
                      <Select
                        label={idx === 0 ? 'Product' : undefined}
                        value={line.productId}
                        onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                        options={products.map((p) => ({
                          value: p.id,
                          label: p.productName,
                        }))}
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-3">
                      <Select
                        label={idx === 0 ? 'Variant' : undefined}
                        value={line.productVariantId || ''}
                        onChange={(e) =>
                          handleVariantChange(idx, e.target.value ? Number(e.target.value) : undefined)
                        }
                      >
                        <option value="">Base (Standard)</option>
                        {currentProd?.variants?.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.variantName}: {v.attributeValue} (+₹{v.additionalPrice})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        label={idx === 0 ? 'Qty' : undefined}
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => {
                          const newLines = [...formData.lines];
                          newLines[idx].quantity = Number(e.target.value);
                          setFormData({ ...formData, lines: newLines });
                        }}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <Input
                        label={idx === 0 ? 'Unit Price (₹)' : undefined}
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => {
                          const newLines = [...formData.lines];
                          newLines[idx].unitPrice = Number(e.target.value);
                          setFormData({ ...formData, lines: newLines });
                        }}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-center pb-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={formData.lines.length <= 1}
                        className="text-[#687586] hover:text-[#D65B65] disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Terms"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              placeholder="e.g. Net 30 days or Immediate"
            />
            <Input
              label="Notes & Expiry Conditions"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Terms and conditions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Generate Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationListPage;
