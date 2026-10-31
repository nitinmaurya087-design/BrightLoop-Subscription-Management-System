import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../../api';
import { Subscription } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Repeat,
  Search,
  Eye,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const SubscriptionListPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { error } = useToast();
  const navigate = useNavigate();

  const fetchSubscriptions = async (page: number, searchKeyword: string, status: string) => {
    setIsLoading(true);
    try {
      const data = await subscriptionApi.list({
        page,
        size: 10,
        search: searchKeyword,
        status: status || undefined,
      });
      setSubscriptions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load subscriptions', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(currentPage, search, statusFilter);
  }, [currentPage, search, statusFilter]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Active Subscriptions</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Automated recurring contracts, billing cycles, pause/resume transitions, and term renewals.
          </p>
        </div>
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
              placeholder="Search subscription #, customer, plan..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#10151D] border border-[#273241] rounded-md overflow-x-auto max-w-full">
            {['', 'ACTIVE', 'PAUSED', 'CONFIRMED', 'CLOSED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1B2430] text-[#E8EDF3] border border-[#4F83CC]/40 shadow-xs'
                    : 'text-[#929DAB] hover:text-[#E8EDF3]'
                }`}
              >
                {st || 'All States'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions found"
            description="Convert confirmed quotations into active subscriptions to begin recurring billing."
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Subscription #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Frequency</TableHeaderCell>
                  <TableHeaderCell>Start Date</TableHeaderCell>
                  <TableHeaderCell>Next Billing Date</TableHeaderCell>
                  <TableHeaderCell>Cycle Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((s) => (
                  <TableRow
                    key={s.id}
                    onClick={() => navigate(`/subscriptions/${s.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {s.subscriptionNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{s.customerName}</div>
                      <div className="text-xs text-[#687586]">{s.customerCompany || s.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-[#929DAB] font-medium text-xs">{s.planName}</TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {s.billingFrequency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(s.startDate)}</TableCell>
                    <TableCell className="text-xs font-medium text-[#4F83CC]">
                      {formatDate(s.nextBillingDate)}
                    </TableCell>
                    <TableCell className="font-semibold text-[#E8EDF3]">
                      {formatCurrency(s.grandTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={s.status}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/subscriptions/${s.id}`)}
                        title="View Subscription"
                      >
                        <Eye className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
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
    </div>
  );
};

export default SubscriptionListPage;
