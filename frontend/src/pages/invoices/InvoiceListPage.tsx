import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../api';
import { Invoice } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Search,
  Eye,
  Download,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchInvoices = async (page: number, searchKeyword: string, status: string) => {
    setIsLoading(true);
    try {
      const data = await invoiceApi.list({
        page,
        size: 10,
        search: searchKeyword,
        status: status || undefined,
      });
      setInvoices(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      error('Failed to load invoices', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage, search, statusFilter);
  }, [currentPage, search, statusFilter]);

  const handleDownloadPdf = async (id: number, invoiceNumber: string) => {
    try {
      await invoiceApi.downloadPdf(id, invoiceNumber);
      success('Download Started', `Saved ${invoiceNumber}.pdf`);
    } catch (err) {
      error('Download Failed', 'Could not render invoice PDF.');
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Invoices & Billing</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Customer billing invoices, historical pricing snapshots, tax lines, and payment balances.
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
              placeholder="Search invoice #, customer name, subscription..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#10151D] border border-[#273241] rounded-md overflow-x-auto max-w-full">
            {['', 'DRAFT', 'CONFIRMED', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'].map((st) => (
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
                {st || 'All Invoices'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Recurring billing invoices will appear here once generated by the billing engine."
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Invoice Date</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Grand Total</TableHeaderCell>
                  <TableHeaderCell>Paid</TableHeaderCell>
                  <TableHeaderCell>Balance Due</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-[#4F83CC]">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{inv.customerName}</div>
                      <div className="text-xs text-[#687586]">{inv.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell className={`text-xs font-medium ${inv.status === 'OVERDUE' ? 'text-[#D65B65]' : 'text-[#929DAB]'}`}>
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="font-semibold text-[#E8EDF3]">{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(inv.amountPaid)}</TableCell>
                    <TableCell className={`font-semibold ${inv.balanceDue > 0 ? 'text-[#D65B65]' : 'text-[#929DAB]'}`}>
                      {formatCurrency(inv.balanceDue)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="auto" status={inv.status}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          title="Download Invoice PDF"
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
    </div>
  );
};

export default InvoiceListPage;
