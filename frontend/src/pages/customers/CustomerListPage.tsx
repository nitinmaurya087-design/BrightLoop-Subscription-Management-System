import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../api';
import { Customer } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  Building,
  Mail,
  Phone,
  MapPin,
  Eye,
  Trash2,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state with Indian defaults
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    billingAddress: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    taxIdentificationNumber: '',
  });

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchCustomers = async (page: number, searchKeyword: string) => {
    setIsLoading(true);
    try {
      const data = await customerApi.list({ page, size: 10, search: searchKeyword });
      setCustomers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load customers', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(currentPage, search);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newCustomer = await customerApi.create(formData);
      success('Customer Added', `${newCustomer.fullName} registered successfully.`);
      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        billingAddress: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        taxIdentificationNumber: '',
      });
      fetchCustomers(0, '');
    } catch (err: any) {
      error('Failed to create customer', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await customerApi.delete(deleteTarget.id);
      success('Customer Archived', `${deleteTarget.fullName} has been archived.`);
      setDeleteTarget(null);
      fetchCustomers(currentPage, search);
    } catch (err: any) {
      error('Cannot Archive Customer', err.response?.data?.message || 'Customer has active subscriptions or invoices.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#273241]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#E8EDF3] tracking-tight">Customer Accounts</h1>
          <p className="text-xs text-[#929DAB] mt-0.5">
            Client directories, GST tax profiles, subscriptions, and billing ledgers.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search by client name, company, or email..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]/25 transition-colors"
            />
          </div>
          <div className="text-xs text-[#929DAB]">
            Showing <span className="font-medium text-[#E8EDF3]">{customers.length}</span> of{' '}
            <span className="font-medium text-[#E8EDF3]">{totalElements}</span> registered enterprise accounts
          </div>
        </CardContent>
      </Card>

      {/* Customer List Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Register client accounts to issue quotations and configure recurring billing."
            actionText="Add Customer"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Account ID</TableHeaderCell>
                  <TableHeaderCell>Customer Name</TableHeaderCell>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Contact</TableHeaderCell>
                  <TableHeaderCell>Location</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">
                      {c.customerNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{c.fullName}</div>
                      <div className="text-xs text-[#687586]">{c.email}</div>
                    </TableCell>
                    <TableCell>
                      {c.companyName ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#929DAB]">
                          <Building className="w-3.5 h-3.5 text-[#687586]" />
                          <span>{c.companyName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#687586]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">
                      {c.phone || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#687586]" />
                        <span>{c.city}, {c.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={c.active ? 'ACTIVE' : 'INACTIVE'}>
                        {c.active ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customers/${c.id}`)}
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#929DAB]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(c)}
                          title="Archive Customer"
                          disabled={!c.active}
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

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Customer Account"
        description="Add a new Indian enterprise client for subscription billing"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Sharma Technologies Pvt Ltd"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rahul@sharmatech.in"
            />
            <Input
              label="Mobile Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <Input
            label="Billing Address"
            required
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            placeholder="Plot 42, Cyber City, Phase 2"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Gurugram"
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Haryana"
            />
            <Input
              label="Country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="India"
            />
            <Input
              label="PIN Code"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="122002"
            />
          </div>

          <Input
            label="GSTIN / Tax ID"
            value={formData.taxIdentificationNumber}
            onChange={(e) => setFormData({ ...formData, taxIdentificationNumber: e.target.value })}
            placeholder="07AAAAA0000A1Z5 (Optional)"
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete/Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCustomer}
        title="Archive Customer"
        message={`Are you sure you want to archive ${deleteTarget?.fullName}? The account cannot be archived if it holds active subscriptions.`}
        confirmText="Archive Customer"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CustomerListPage;
