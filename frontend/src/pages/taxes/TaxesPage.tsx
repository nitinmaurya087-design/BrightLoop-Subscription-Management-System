import React, { useState, useEffect } from 'react';
import { taxApi } from '../../api';
import { Tax } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Percent,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const TaxesPage: React.FC = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    taxName: string;
    taxType: 'PERCENTAGE' | 'FIXED';
    taxRate: number;
    taxDescription: string;
    active: boolean;
  }>({
    taxName: '',
    taxType: 'PERCENTAGE',
    taxRate: 18,
    taxDescription: '',
    active: true,
  });

  const { success, error } = useToast();

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const data = await taxApi.list(false);
      setTaxes(data);
    } catch (err: any) {
      error('Failed to load taxes', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleOpenAdd = () => {
    setEditingTax(null);
    setFormData({
      taxName: '',
      taxType: 'PERCENTAGE',
      taxRate: 18,
      taxDescription: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tax) => {
    setEditingTax(t);
    setFormData({
      taxName: t.taxName,
      taxType: t.taxType,
      taxRate: t.taxRate,
      taxDescription: t.taxDescription || '',
      active: t.active,
    });
    setIsModalOpen(true);
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTax) {
        await taxApi.update(editingTax.id, formData);
        success('Tax Rule Updated', `${formData.taxName} has been saved.`);
      } else {
        await taxApi.create(formData);
        success('Tax Rule Created', `${formData.taxName} is now active.`);
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (err: any) {
      error('Failed to save tax', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTax = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await taxApi.delete(deleteTarget.id);
      success('Tax Removed', `${deleteTarget.taxName} removed.`);
      setDeleteTarget(null);
      fetchTaxes();
    } catch (err: any) {
      error('Cannot Delete Tax', err.response?.data?.message || 'Tax rule is referenced in historical invoices.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = taxes.filter(
    (t) =>
      t.taxName.toLowerCase().includes(search.toLowerCase()) ||
      (t.taxDescription && t.taxDescription.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Tax Management & GST</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Configure Indian GST rates (Integrated IGST, Intra-state CGST/SGST), export exemptions, and tax rules.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Add Tax Rule
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tax rules by name, description..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>
          <div className="text-xs text-[#929DAB] font-medium">
            Active Tax Rates: <span className="font-semibold text-[#E8EDF3]">{taxes.filter(t => t.active).length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Taxes Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Percent}
            title="No tax rules found"
            description="Create GST rates to be applied during quotation and recurring billing generations."
            actionText="Add Tax Rule"
            onAction={handleOpenAdd}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>Tax Rule Name</TableHeaderCell>
                <TableHeaderCell>Calculation Type</TableHeaderCell>
                <TableHeaderCell>Rate</TableHeaderCell>
                <TableHeaderCell>Description / Compliance</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-[#E8EDF3]">
                    {t.taxName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">
                      {t.taxType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-[#4F83CC]">
                    {t.taxType === 'PERCENTAGE' ? `${t.taxRate}%` : `₹${t.taxRate}`}
                  </TableCell>
                  <TableCell className="text-xs text-[#929DAB]">
                    {t.taxDescription || 'Standard statutory taxation rule'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="auto" status={t.active ? 'ACTIVE' : 'INACTIVE'}>
                      {t.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(t)}
                        title="Edit Tax Rule"
                      >
                        <Edit2 className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(t)}
                        title="Remove Tax Rule"
                      >
                        <Trash2 className="w-4 h-4 text-[#D65B65] hover:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Tax Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTax ? 'Edit Tax Rule' : 'Create Tax Rule'}
        description="Configure tax rates applied automatically during invoice calculations"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTax} className="space-y-4">
          <Input
            label="Tax Name"
            required
            value={formData.taxName}
            onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
            placeholder="e.g. GST 18% or IGST 18%"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tax Type"
              required
              value={formData.taxType}
              onChange={(e) =>
                setFormData({ ...formData, taxType: e.target.value as 'PERCENTAGE' | 'FIXED' })
              }
              options={[
                { value: 'PERCENTAGE', label: 'Percentage (%)' },
                { value: 'FIXED', label: 'Fixed Amount (₹)' },
              ]}
            />
            <Input
              label="Tax Rate / Value"
              type="number"
              step="0.01"
              required
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Description & Statutory Reference"
            value={formData.taxDescription}
            onChange={(e) => setFormData({ ...formData, taxDescription: e.target.value })}
            placeholder="e.g. Standard rate for Indian SaaS enterprise services"
          />

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
              {editingTax ? 'Save Changes' : 'Create Tax Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTax}
        title="Remove Tax Rule"
        message={`Are you sure you want to remove ${deleteTarget?.taxName}? Historical invoices will preserve their tax rates.`}
        confirmText="Remove Tax Rule"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TaxesPage;
