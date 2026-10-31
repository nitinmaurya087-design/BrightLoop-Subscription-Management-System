import React, { useState, useEffect } from 'react';
import { productApi } from '../../api';
import { Product, ProductVariant } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Calculator,
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

interface FlatVariant extends ProductVariant {
  id: number;
  productId: number;
  parentProductName: string;
  parentProductCode: string;
  parentSalesPrice: number;
}

export const ProductVariantsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flatVariants, setFlatVariants] = useState<FlatVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<{ productId: number; variantId: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ productId: number; variantId: number; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    productId: number;
    variantName: string;
    attributeValue: string;
    additionalPrice: number;
    active: boolean;
  }>({
    productId: 0,
    variantName: '',
    attributeValue: '',
    additionalPrice: 0,
    active: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await productApi.list({ size: 100 });
      setProducts(res.content);

      const flattened: FlatVariant[] = [];
      res.content.forEach((p) => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v) => {
            if (v.id) {
              flattened.push({
                ...v,
                id: v.id,
                productId: p.id,
                parentProductName: p.productName,
                parentProductCode: p.productCode,
                parentSalesPrice: p.salesPrice,
              });
            }
          });
        }
      });
      setFlatVariants(flattened);
    } catch (err: any) {
      error('Failed to load variants', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingVariant(null);
    setFormData({
      productId: products[0]?.id || 0,
      variantName: '',
      attributeValue: '',
      additionalPrice: 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: FlatVariant) => {
    setEditingVariant({ productId: v.productId, variantId: v.id });
    setFormData({
      productId: v.productId,
      variantName: v.variantName,
      attributeValue: v.attributeValue,
      additionalPrice: v.additionalPrice,
      active: v.active,
    });
    setIsModalOpen(true);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingVariant) {
        await productApi.updateVariant(editingVariant.productId, editingVariant.variantId, {
          variantName: formData.variantName,
          attributeValue: formData.attributeValue,
          additionalPrice: formData.additionalPrice,
          active: formData.active,
        });
        success('Variant Updated', `${formData.variantName} has been modified.`);
      } else {
        await productApi.addVariant(formData.productId, {
          variantName: formData.variantName,
          attributeValue: formData.attributeValue,
          additionalPrice: formData.additionalPrice,
          active: formData.active,
        });
        success('Variant Created', `${formData.variantName} added to product.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save variant', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await productApi.deleteVariant(deleteTarget.productId, deleteTarget.variantId);
      success('Variant Removed', `${deleteTarget.name} has been deleted.`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || err.message);
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

  const filtered = flatVariants.filter((v) => {
    const matchesSearch =
      v.variantName.toLowerCase().includes(search.toLowerCase()) ||
      v.parentProductName.toLowerCase().includes(search.toLowerCase()) ||
      v.attributeValue.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = productFilter ? String(v.productId) === productFilter : true;
    return matchesSearch && matchesProduct;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Product Variants & Add-ons</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Dynamic pricing formula, attribute matrices (seats, storage, editions), and incremental price deltas.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Add Product Variant
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
              placeholder="Search variants, parent product, attributes..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] focus:outline-none focus:border-[#4F83CC]"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName}
                </option>
              ))}
            </select>
            <div className="text-xs text-[#929DAB] font-medium whitespace-nowrap">
              Total Variants: <span className="font-semibold text-[#E8EDF3]">{filtered.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No product variants found"
            description="Add tiered configurations, regional pricing deltas, or capacity options to software products."
            actionText="Add Variant"
            onAction={handleOpenAdd}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>Variant ID</TableHeaderCell>
                <TableHeaderCell>Variant Name</TableHeaderCell>
                <TableHeaderCell>Parent Product</TableHeaderCell>
                <TableHeaderCell>Attribute Specification</TableHeaderCell>
                <TableHeaderCell>Base Price</TableHeaderCell>
                <TableHeaderCell>Delta (+₹)</TableHeaderCell>
                <TableHeaderCell>Effective Price</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((v) => {
                const effective = v.parentSalesPrice + v.additionalPrice;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {`${v.parentProductCode}-V${v.id}`}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{v.variantName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-[#E8EDF3]">
                        <Package className="w-3.5 h-3.5 text-[#687586]" />
                        <span>{v.parentProductName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#929DAB]">
                        {v.attributeValue}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#929DAB] text-xs">
                      {formatCurrency(v.parentSalesPrice)}
                    </TableCell>
                    <TableCell className="font-medium text-[#3FA77A] text-xs">
                      +{formatCurrency(v.additionalPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#E8EDF3]">{formatCurrency(effective)}</span>
                        <span title="Calculated as Base Price + Delta">
                          <Calculator className="w-3 h-3 text-[#4F83CC]" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={v.active ? 'ACTIVE' : 'INACTIVE'}>
                        {v.active ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(v)}
                          title="Edit Variant"
                        >
                          <Edit2 className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ productId: v.productId, variantId: v.id, name: v.variantName })}
                          title="Delete Variant"
                        >
                          <Trash2 className="w-4 h-4 text-[#D65B65] hover:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Variant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVariant ? 'Edit Product Variant' : 'Add Product Variant'}
        description="Configure attribute options and additional price surcharge over product base rate"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <Select
            label="Target Software Product"
            required
            disabled={!!editingVariant}
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.productName} (Base: ${formatCurrency(p.salesPrice)})`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Variant Title / Label"
              required
              value={formData.variantName}
              onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
              placeholder="e.g. Enterprise 100 Seats"
            />
            <Input
              label="Attribute Specification"
              required
              value={formData.attributeValue}
              onChange={(e) => setFormData({ ...formData, attributeValue: e.target.value })}
              placeholder="e.g. 500 GB Storage or 50 Seats"
            />
          </div>

          <Input
            label="Additional Price Delta (+₹)"
            type="number"
            step="0.01"
            required
            value={formData.additionalPrice}
            onChange={(e) => setFormData({ ...formData, additionalPrice: Number(e.target.value) })}
            helperText="Incremental amount added onto parent product base sales price"
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
              {editingVariant ? 'Save Changes' : 'Create Variant'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteVariant}
        title="Remove Product Variant"
        message={`Are you sure you want to delete ${deleteTarget?.name}? Existing quotations locked to this variant will retain historical pricing snapshots.`}
        confirmText="Delete Variant"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ProductVariantsPage;
