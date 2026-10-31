import React, { useState, useEffect } from 'react';
import { discountApi } from '../../api';
import { Discount } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Tag,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Zap,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const DiscountListPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    couponCode: string;
    discountName: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minimumOrderAmount: number;
    maximumDiscountAmount: number;
    validFrom: string;
    validUntil: string;
    maxUsageLimit: number;
  }>({
    couponCode: '',
    discountName: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    maxUsageLimit: 100,
  });

  // Interactive Coupon Tester State
  const [testCode, setTestCode] = useState('WELCOME20');
  const [testAmount, setTestAmount] = useState<number>(5000);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { success, error } = useToast();

  const fetchDiscounts = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await discountApi.list({ page, size: 10 });
      setDiscounts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load discounts', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts(currentPage);
  }, [currentPage]);

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    setFormData({
      couponCode: '',
      discountName: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      validFrom: '',
      validUntil: '',
      maxUsageLimit: 100,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Discount) => {
    setEditingDiscount(d);
    setFormData({
      couponCode: d.couponCode,
      discountName: d.discountName,
      discountType: d.discountType,
      discountValue: d.discountValue,
      minimumOrderAmount: d.minimumOrderAmount || 0,
      maximumDiscountAmount: d.maximumDiscountAmount || 0,
      validFrom: d.validFrom || '',
      validUntil: d.validUntil || '',
      maxUsageLimit: d.maxUsageLimit || 100,
    });
    setIsModalOpen(true);
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDiscount) {
        await discountApi.update(editingDiscount.id, formData);
        success('Discount Updated', `${formData.couponCode} modified.`);
      } else {
        await discountApi.create(formData);
        success('Discount Created', `Coupon ${formData.couponCode} is now active.`);
      }
      setIsModalOpen(false);
      fetchDiscounts(currentPage);
    } catch (err: any) {
      error('Failed to save discount', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await discountApi.delete(deleteTarget.id);
      success('Coupon Deleted', `${deleteTarget.couponCode} deleted.`);
      setDeleteTarget(null);
      fetchDiscounts(currentPage);
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode) return;
    setIsTesting(true);
    try {
      const res = await discountApi.validateCoupon(testCode, testAmount);
      setTestResult({
        tested: true,
        valid: res.valid,
        discountAmount: res.discountAmount,
        finalAmount: testAmount - res.discountAmount,
        message: res.message,
      });
      if (res.valid) {
        success('Valid Coupon', `Applied discount: ₹${res.discountAmount}`);
      } else {
        error('Invalid Coupon', res.message || 'Coupon does not satisfy order criteria');
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        valid: false,
        discountAmount: 0,
        finalAmount: testAmount,
        message: err.response?.data?.message || 'Invalid or expired coupon code',
      });
      error('Validation Failed', err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsTesting(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Discounts & Coupons</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Configure promotional promo codes, percentage or fixed discounts, usage caps, and order limits.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Create Coupon
        </Button>
      </div>

      {/* Interactive Coupon Tester Widget */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#4F83CC]" />
            <h3 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
              Live Coupon & Order Rule Simulator
            </h3>
          </div>
          <form onSubmit={handleTestCoupon} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <Input
                label="Coupon Code"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME20"
                required
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                label="Simulated Order Amount (₹)"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                placeholder="5000"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isTesting}
                leftIcon={<Zap className="w-4 h-4" />}
              >
                Validate Coupon
              </Button>
            </div>
          </form>

          {testResult && testResult.tested && (
            <div className="mt-4 p-3 rounded-md bg-[#10151D] border border-[#273241] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {testResult.valid ? (
                  <CheckCircle className="w-4 h-4 text-[#3FA77A]" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#D65B65]" />
                )}
                <span className="font-medium text-[#E8EDF3]">
                  {testResult.valid ? 'Coupon Applied Successfully' : 'Coupon Rejected'}
                </span>
                {testResult.message && <span className="text-[#929DAB]">({testResult.message})</span>}
              </div>
              {testResult.valid && (
                <div className="flex items-center gap-3">
                  <span className="text-[#3FA77A] font-medium">
                    Discount: -{formatCurrency(testResult.discountAmount)}
                  </span>
                  <span className="font-bold text-[#E8EDF3]">
                    Net Total: {formatCurrency(testResult.finalAmount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : discounts.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No discount rules configured"
            description="Create promotional codes to incentivize subscriptions or reward loyal accounts."
            actionText="Create Coupon"
            onAction={handleOpenAdd}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Coupon Code</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Discount Type & Value</TableHeaderCell>
                  <TableHeaderCell>Order Thresholds</TableHeaderCell>
                  <TableHeaderCell>Usage / Limit</TableHeaderCell>
                  <TableHeaderCell>Validity Window</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs font-semibold text-[#4F83CC]">
                      {d.couponCode}
                    </TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{d.discountName}</TableCell>
                    <TableCell>
                      <span className="font-medium text-[#E8EDF3]">
                        {d.discountType === 'PERCENTAGE' ? `${d.discountValue}% Off` : formatCurrency(d.discountValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">
                      <div>Min: {d.minimumOrderAmount ? formatCurrency(d.minimumOrderAmount) : 'None'}</div>
                      <div>Max: {d.maximumDiscountAmount ? formatCurrency(d.maximumDiscountAmount) : 'None'}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#929DAB]">
                        {d.currentUsageCount} / {d.maxUsageLimit ? d.maxUsageLimit : '∞'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">
                      {d.validFrom || d.validUntil ? `${formatDate(d.validFrom)} to ${formatDate(d.validUntil)}` : 'Ongoing'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={d.active ? 'ACTIVE' : 'INACTIVE'}>
                        {d.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(d)}
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(d)}
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4 text-[#D65B65] hover:text-red-400" />
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

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDiscount ? 'Edit Coupon' : 'Create New Discount Coupon'}
        description="Configure redemption restrictions, caps, and validity dates"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveDiscount} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Coupon Code"
              required
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER30"
            />
            <Input
              label="Campaign Name"
              required
              value={formData.discountName}
              onChange={(e) => setFormData({ ...formData, discountName: e.target.value })}
              placeholder="e.g. Summer Promo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              required
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })
              }
              options={[
                { value: 'PERCENTAGE', label: 'Percentage (%)' },
                { value: 'FIXED', label: 'Fixed Amount (₹)' },
              ]}
            />
            <Input
              label="Discount Value"
              type="number"
              step="0.01"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Order Amount (₹)"
              type="number"
              value={formData.minimumOrderAmount}
              onChange={(e) => setFormData({ ...formData, minimumOrderAmount: Number(e.target.value) })}
            />
            <Input
              label="Max Discount Cap (₹, 0 for none)"
              type="number"
              value={formData.maximumDiscountAmount}
              onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            />
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
            <Input
              label="Max Redemptions"
              type="number"
              value={formData.maxUsageLimit}
              onChange={(e) => setFormData({ ...formData, maxUsageLimit: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingDiscount ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete ${deleteTarget?.couponCode}? Active coupons with prior usages will be archived.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default DiscountListPage;
