import React, { useState, useEffect } from 'react';
import { staffApi } from '../../api';
import { Staff } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  UserCheck,
  UserPlus,
  Search,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const StaffListPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    title: '',
    phone: '',
  });

  const { success, error } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffApi.list();
      setStaffList(data);
    } catch (err: any) {
      error('Failed to load staff list', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      error('Missing Information', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await staffApi.create(formData);
      success('Staff Account Created', `${created.fullName} onboarded with employee code ${created.employeeCode}.`);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        department: '',
        title: '',
        phone: '',
      });
      fetchStaff();
    } catch (err: any) {
      error('Failed to create staff', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await staffApi.toggleActive(id);
      success('Status Updated', `${updated.fullName} is now ${updated.active ? 'active' : 'deactivated'}.`);
      fetchStaff();
    } catch (err: any) {
      error('Status Update Failed', err.response?.data?.message || err.message);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(search.toLowerCase())) ||
      s.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Staff Management</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Administer internal operators, billing specialists, and support team permissions.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-[#687586]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name, email, department, code..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>
          <div className="text-xs text-[#929DAB] font-medium">
            Active Staff Operators: <span className="font-semibold text-[#E8EDF3]">{staffList.filter(s => s.active).length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredStaff.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No staff members found"
            description="Add internal teammates to manage customer quotations, subscriptions, and payments."
            actionText="Add Staff Member"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Full Name</TableHeaderCell>
                <TableHeaderCell>Role & Title</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell>Contact</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-[#4F83CC]">
                    {s.employeeCode}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[#E8EDF3]">{s.fullName}</div>
                    <div className="text-xs text-[#687586]">{s.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[#E8EDF3] text-xs">{s.title || 'Staff Operator'}</div>
                    <Badge variant="info" className="mt-0.5 text-[10px]">STAFF</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#929DAB]">
                    {s.department || 'Operations'}
                  </TableCell>
                  <TableCell className="text-xs text-[#929DAB]">
                    {s.phone || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="auto" status={s.active ? 'ACTIVE' : 'INACTIVE'}>
                      {s.active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={s.active ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleActive(s.id)}
                    >
                      {s.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Member"
        description="Create internal operator account with granular role permissions"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Vikram Seth"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Staff Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vikram@brightloop.com"
            />
            <Input
              label="Temporary Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 8 chars, uppercase, lowercase, special"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Customer Success"
            />
            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Billing Specialist"
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98111 22334"
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
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffListPage;
