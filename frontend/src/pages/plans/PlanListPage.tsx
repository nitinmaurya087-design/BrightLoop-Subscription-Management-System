import React, { useState, useEffect } from 'react';
import { planApi, productApi } from '../../api';
import { Plan, Product, BillingFrequency } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  Users,
  Edit2,
  Trash2,
  ShieldCheck,
  PauseCircle,
  Repeat,
  Sparkles,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select, Textarea } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const PlanListPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    planName: string;
    description: string;
    productId: number;
    billingPrice: number;
    billingFrequency: BillingFrequency;
    minimumQuantity: number;
    availableFrom: string;
    availableUntil: string;
    autoCloseOnExpiry: boolean;
    allowEarlyClosure: boolean;
    allowPause: boolean;
    allowRenewal: boolean;
  }>({
    planName: '',
    description: '',
    productId: 0,
    billingPrice: 0,
    billingFrequency: 'MONTHLY',
    minimumQuantity: 1,
    availableFrom: '',
    availableUntil: '',
    autoCloseOnExpiry: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
  });

  const { success, error } = useToast();

  const fetchPlans = async (page: number, freq: string) => {
    setIsLoading(true);
    try {
      const data = await planApi.list({ page, size: 10, frequency: freq || undefined });
      setPlans(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load plans', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const data = await productApi.list({ size: 100, active: true });
      setProducts(data.content);
      if (data.content.length > 0 && formData.productId === 0) {
        setFormData((prev) => ({ ...prev, productId: data.content[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans(currentPage, frequencyFilter);
  }, [currentPage, frequencyFilter]);

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      planName: '',
      description: '',
      productId: products[0]?.id || 0,
      billingPrice: 0,
      billingFrequency: 'MONTHLY',
      minimumQuantity: 1,
      availableFrom: '',
      availableUntil: '',
      autoCloseOnExpiry: false,
      allowEarlyClosure: true,
      allowPause: true,
      allowRenewal: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Plan) => {
    setEditingPlan(p);
    setFormData({
      planName: p.planName,
      description: p.description || '',
      productId: p.productId,
      billingPrice: p.billingPrice,
      billingFrequency: p.billingFrequency,
      minimumQuantity: p.minimumQuantity || 1,
      availableFrom: p.availableFrom || '',
      availableUntil: p.availableUntil || '',
      autoCloseOnExpiry: p.autoCloseOnExpiry ?? false,
      allowEarlyClosure: p.allowEarlyClosure ?? true,
      allowPause: p.allowPause ?? true,
      allowRenewal: p.allowRenewal ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        await planApi.update(editingPlan.id, formData);
        success('Plan Updated', `${formData.planName} has been modified.`);
      } else {
        await planApi.create(formData);
        success('Plan Created', `${formData.planName} is now active.`);
      }
      setIsModalOpen(false);
      fetchPlans(currentPage, frequencyFilter);
    } catch (err: any) {
      error('Failed to save plan', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await planApi.delete(deleteTarget.id);
      success('Plan Archived', `${deleteTarget.planName} archived.`);
      setDeleteTarget(null);
      fetchPlans(currentPage, frequencyFilter);
    } catch (err: any) {
      error('Cannot Archive Plan', err.response?.data?.message || 'Plan has active subscriptions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Subscription Plans</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Configure frequencies, pricing tiers, and subscription lifecycle rules.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Create Plan
        </Button>
      </div>

      {/* Frequency Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#687586] uppercase tracking-wider">
              Frequency:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-[#10151D] border border-[#273241] rounded-md">
              {['', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => {
                    setFrequencyFilter(freq);
                    setCurrentPage(0);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    frequencyFilter === freq
                      ? 'bg-[#1B2430] text-[#E8EDF3] border border-[#4F83CC]/40 shadow-xs'
                      : 'text-[#929DAB] hover:text-[#E8EDF3]'
                  }`}
                >
                  {freq || 'All Frequencies'}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-[#929DAB] font-medium">
            Active Plans: <span className="font-semibold text-[#E8EDF3]">{totalElements}</span>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No subscription plans found"
            description="Create subscription tiers with custom frequencies and lifecycle permissions."
            actionText="Create Plan"
            onAction={handleOpenAdd}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Plan Name</TableHeaderCell>
                  <TableHeaderCell>Linked Product</TableHeaderCell>
                  <TableHeaderCell>Frequency</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Min Qty</TableHeaderCell>
                  <TableHeaderCell>Subscribers</TableHeaderCell>
                  <TableHeaderCell>Lifecycle Permissions</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-[#929DAB]">
                      {p.planCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{p.planName}</div>
                      {p.description && (
                        <div className="text-xs text-[#687586] line-clamp-1 mt-0.5">{p.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-[#929DAB] font-medium">{p.productName}</TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {p.billingFrequency}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-[#E8EDF3]">
                      {formatCurrency(p.billingPrice)}
                    </TableCell>
                    <TableCell className="text-[#929DAB] text-xs font-medium">
                      {p.minimumQuantity}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8EDF3]">
                        <Users className="w-3.5 h-3.5 text-[#4F83CC]" />
                        <span>{p.subscriberCount ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-[#687586]">
                        <span
                          title={p.allowPause ? 'Pause allowed' : 'Pause not permitted'}
                          className={`p-1 rounded ${p.allowPause ? 'text-[#3FA77A] bg-[#3FA77A]/10 border border-[#3FA77A]/20' : 'text-[#687586]/40'}`}
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                        </span>
                        <span
                          title={p.allowRenewal ? 'Renewal allowed' : 'Renewal not permitted'}
                          className={`p-1 rounded ${p.allowRenewal ? 'text-[#4F83CC] bg-[#4F83CC]/10 border border-[#4F83CC]/20' : 'text-[#687586]/40'}`}
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </span>
                        <span
                          title={p.allowEarlyClosure ? 'Early closure permitted' : 'Early closure locked'}
                          className={`p-1 rounded ${p.allowEarlyClosure ? 'text-[#D6A04B] bg-[#D6A04B]/10 border border-[#D6A04B]/20' : 'text-[#687586]/40'}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Plan"
                        >
                          <Edit2 className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(p)}
                          title="Archive Plan"
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

      {/* Add / Edit Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}
        description="Configure pricing, recurrence frequency, and lifecycle control policies"
        maxWidth="2xl"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              required
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              placeholder="e.g. Enterprise Business Monthly"
            />
            <Select
              label="Linked Software Product"
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.productName} (${formatCurrency(p.salesPrice)})`,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              label="Billing Price (₹)"
              type="number"
              step="0.01"
              required
              value={formData.billingPrice}
              onChange={(e) => setFormData({ ...formData, billingPrice: Number(e.target.value) })}
            />
            <Input
              label="Minimum Quantity"
              type="number"
              min="1"
              required
              value={formData.minimumQuantity}
              onChange={(e) => setFormData({ ...formData, minimumQuantity: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Plan Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Plan tier details..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Available From"
              type="date"
              value={formData.availableFrom}
              onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
            />
            <Input
              label="Available Until"
              type="date"
              value={formData.availableUntil}
              onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
            />
          </div>

          {/* Lifecycle Permissions Checkboxes */}
          <div className="p-4 bg-[#10151D] rounded-md border border-[#273241] space-y-3">
            <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
              Subscription Lifecycle Permissions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-[#E8EDF3]">
                <input
                  type="checkbox"
                  checked={formData.allowPause}
                  onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                  className="rounded bg-[#1B2430] border-[#273241] text-[#4F83CC] focus:ring-[#4F83CC] w-4 h-4"
                />
                <div>
                  <span className="font-medium block">Allow Customer to Pause</span>
                  <span className="text-[11px] text-[#687586]">Permit customer to pause billing cycles</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[#E8EDF3]">
                <input
                  type="checkbox"
                  checked={formData.allowRenewal}
                  onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                  className="rounded bg-[#1B2430] border-[#273241] text-[#4F83CC] focus:ring-[#4F83CC] w-4 h-4"
                />
                <div>
                  <span className="font-medium block">Allow Auto-Renewal</span>
                  <span className="text-[11px] text-[#687586]">Auto-extend subscription at expiry</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[#E8EDF3]">
                <input
                  type="checkbox"
                  checked={formData.allowEarlyClosure}
                  onChange={(e) => setFormData({ ...formData, allowEarlyClosure: e.target.checked })}
                  className="rounded bg-[#1B2430] border-[#273241] text-[#4F83CC] focus:ring-[#4F83CC] w-4 h-4"
                />
                <div>
                  <span className="font-medium block">Allow Early Closure</span>
                  <span className="text-[11px] text-[#687586]">Customer or staff can cancel before term</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[#E8EDF3]">
                <input
                  type="checkbox"
                  checked={formData.autoCloseOnExpiry}
                  onChange={(e) => setFormData({ ...formData, autoCloseOnExpiry: e.target.checked })}
                  className="rounded bg-[#1B2430] border-[#273241] text-[#4F83CC] focus:ring-[#4F83CC] w-4 h-4"
                />
                <div>
                  <span className="font-medium block">Auto Close On Expiry</span>
                  <span className="text-[11px] text-[#687586]">Terminate automatically on expiry date</span>
                </div>
              </label>
            </div>
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
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Plan Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePlan}
        title="Archive Subscription Plan"
        message={`Are you sure you want to archive ${deleteTarget?.planName}? Plans with active subscribers cannot be removed.`}
        confirmText="Archive Plan"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PlanListPage;
