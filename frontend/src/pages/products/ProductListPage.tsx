import React, { useState, useEffect } from 'react';
import { productApi } from '../../api';
import { Product, ProductVariant } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select, Textarea } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product Form
  const [productForm, setProductForm] = useState<{
    productName: string;
    productType: 'RECURRING' | 'ONE_TIME';
    salesPrice: number;
    costPrice: number;
    description: string;
    notes: string;
  }>({
    productName: '',
    productType: 'RECURRING',
    salesPrice: 0,
    costPrice: 0,
    description: '',
    notes: '',
  });

  // Variant Form
  const [variantForm, setVariantForm] = useState<{
    variantName: string;
    attributeValue: string;
    additionalPrice: number;
  }>({
    variantName: 'Edition',
    attributeValue: '',
    additionalPrice: 0,
  });

  const { success, error } = useToast();

  const fetchProducts = async (page: number, searchKeyword: string) => {
    setIsLoading(true);
    try {
      const data = await productApi.list({ page, size: 10, search: searchKeyword });
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load products', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(currentPage, search);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, search]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      productName: '',
      productType: 'RECURRING',
      salesPrice: 0,
      costPrice: 0,
      description: '',
      notes: '',
    });
    setIsAddProductModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      productName: prod.productName,
      productType: prod.productType,
      salesPrice: prod.salesPrice,
      costPrice: prod.costPrice || 0,
      description: prod.description || '',
      notes: prod.notes || '',
    });
    setIsAddProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, productForm);
        success('Product Updated', `${productForm.productName} updated.`);
      } else {
        await productApi.create(productForm);
        success('Product Created', `${productForm.productName} added to catalog.`);
      }
      setIsAddProductModalOpen(false);
      fetchProducts(currentPage, search);
    } catch (err: any) {
      error('Failed to save product', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await productApi.delete(deleteTarget.id);
      success('Product Removed', `${deleteTarget.productName} deleted.`);
      setDeleteTarget(null);
      fetchProducts(currentPage, search);
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || 'Product is linked to active plans.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantsProduct) return;
    setIsSubmitting(true);
    try {
      await productApi.addVariant(variantsProduct.id, {
        ...variantForm,
        active: true,
      });
      success('Variant Configured', `${variantForm.variantName}: ${variantForm.attributeValue} saved.`);
      setVariantForm({ variantName: 'Edition', attributeValue: '', additionalPrice: 0 });
      const updated = await productApi.get(variantsProduct.id);
      setVariantsProduct(updated);
      fetchProducts(currentPage, search);
    } catch (err: any) {
      error('Failed to add variant', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!variantsProduct) return;
    try {
      await productApi.deleteVariant(variantsProduct.id, variantId);
      success('Variant Removed', 'Variant detached from product.');
      const updated = await productApi.get(variantsProduct.id);
      setVariantsProduct(updated);
      fetchProducts(currentPage, search);
    } catch (err: any) {
      error('Failed to delete variant', err.response?.data?.message || err.message);
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#273241]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#E8EDF3] tracking-tight">Software Products & Offerings</h1>
          <p className="text-xs text-[#929DAB] mt-0.5">
            Manage software SKU catalog, base pricing, and configurable dynamic product variants.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      {/* Search & Info Banner */}
      <Card>
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 left-3 my-auto text-[#687586]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search products by code or title..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]/25 transition-colors"
            />
          </div>
          <div className="text-xs text-[#929DAB]">
            Dynamic Pricing Formula:{' '}
            <span className="font-medium text-[#4F83CC]">Base Price + Variant Additional Price = Final Unit Price</span>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products configured"
            description="Create software packages or one-time items to configure subscription tiers."
            actionText="Add Product"
            onAction={handleOpenAdd}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>SKU Code</TableHeaderCell>
                  <TableHeaderCell>Product Title</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Base Sales Price</TableHeaderCell>
                  <TableHeaderCell>Cost Price</TableHeaderCell>
                  <TableHeaderCell>Configured Variants</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">
                      {p.productCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{p.productName}</div>
                      {p.description && (
                        <div className="text-xs text-[#687586] line-clamp-1">{p.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={p.productType}>
                        {p.productType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">
                      {formatCurrency(p.salesPrice)}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">
                      {p.costPrice ? formatCurrency(p.costPrice) : '—'}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setVariantsProduct(p)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#1B2430] text-[#4F83CC] hover:bg-[#222D3D] transition-colors border border-[#273241]"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#4F83CC]" />
                        <span>{p.variants?.length || 0} Variants</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={p.active ? 'ACTIVE' : 'INACTIVE'}>
                        {p.active ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#929DAB]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(p)}
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#D65B65]" />
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title={editingProduct ? 'Edit Software Product' : 'Add Software Product'}
        description="Configure software catalog SKU and base pricing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-3.5">
          <Input
            label="Product Name"
            required
            value={productForm.productName}
            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
            placeholder="e.g. Business Software Core"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Type"
              required
              value={productForm.productType}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  productType: e.target.value as 'RECURRING' | 'ONE_TIME',
                })
              }
              options={[
                { value: 'RECURRING', label: 'Recurring Subscription' },
                { value: 'ONE_TIME', label: 'One-Time Charge' },
              ]}
            />
            <Input
              label="Base Sales Price (₹)"
              type="number"
              step="0.01"
              required
              value={productForm.salesPrice}
              onChange={(e) => setProductForm({ ...productForm, salesPrice: Number(e.target.value) })}
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              step="0.01"
              value={productForm.costPrice}
              onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            placeholder="Key features and license details..."
          />

          <Input
            label="Internal SKU Notes"
            value={productForm.notes}
            onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
            placeholder="Deployment details or vendor SKU"
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddProductModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Variants Manager Modal */}
      <Modal
        isOpen={!!variantsProduct}
        onClose={() => setVariantsProduct(null)}
        title={`Variants: ${variantsProduct?.productName}`}
        description={`Base Product Price: ${formatCurrency(variantsProduct?.salesPrice)}. Manage editions, tiers, or custom add-ons.`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Add Variant Form */}
          <form onSubmit={handleAddVariant} className="p-3.5 bg-[#10151D] rounded-md border border-[#273241] space-y-3">
            <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
              Add New Product Variant
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Variant Type"
                required
                value={variantForm.variantName}
                onChange={(e) => setVariantForm({ ...variantForm, variantName: e.target.value })}
                options={[
                  { value: 'Edition', label: 'Edition (e.g. Standard, Odoo)' },
                  { value: 'Brand', label: 'Brand' },
                  { value: 'Package', label: 'Package' },
                  { value: 'Custom', label: 'Custom Attribute' },
                ]}
              />
              <Input
                label="Attribute Value"
                required
                value={variantForm.attributeValue}
                onChange={(e) => setVariantForm({ ...variantForm, attributeValue: e.target.value })}
                placeholder="e.g. Odoo or Enterprise"
              />
              <Input
                label="Additional Price (₹)"
                type="number"
                step="0.01"
                required
                value={variantForm.additionalPrice}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, additionalPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-[#929DAB]">
                Final Unit Price:{' '}
                <span className="font-semibold text-[#4F83CC]">
                  {formatCurrency((variantsProduct?.salesPrice || 0) + Number(variantForm.additionalPrice))}
                </span>
              </div>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Variant
              </Button>
            </div>
          </form>

          {/* Existing Variants Table */}
          <div>
            <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider mb-2">
              Configured Variants ({variantsProduct?.variants?.length || 0})
            </h4>
            {variantsProduct?.variants?.length === 0 ? (
              <p className="text-xs text-[#687586] italic py-2">
                No variants configured for this product. Default base price applies.
              </p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow hoverable={false}>
                    <TableHeaderCell>Variant Group</TableHeaderCell>
                    <TableHeaderCell>Attribute Value</TableHeaderCell>
                    <TableHeaderCell>Additional Price</TableHeaderCell>
                    <TableHeaderCell>Final Unit Price</TableHeaderCell>
                    <TableHeaderCell className="text-right">Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variantsProduct?.variants?.map((v) => {
                    const finalPrice = (variantsProduct?.salesPrice || 0) + (v.additionalPrice || 0);
                    return (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium text-[#E8EDF3]">{v.variantName}</TableCell>
                        <TableCell className="font-medium text-[#4F83CC]">{v.attributeValue}</TableCell>
                        <TableCell className="text-[#929DAB]">+{formatCurrency(v.additionalPrice)}</TableCell>
                        <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(finalPrice)}</TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => v.id && handleDeleteVariant(v.id)}
                            className="text-[#687586] hover:text-[#D65B65] p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete ${deleteTarget?.productName}? Products linked to active plans or subscriptions cannot be removed.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ProductListPage;
