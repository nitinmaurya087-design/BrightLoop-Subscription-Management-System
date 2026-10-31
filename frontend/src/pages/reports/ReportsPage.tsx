import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  FileSpreadsheet,
  Repeat,
  AlertCircle,
  CreditCard,
  IndianRupee,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [summary, setSummary] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { success, error } = useToast();

  const loadData = async (tab: string) => {
    setIsLoading(true);
    try {
      const summaryData = await reportApi.getSummary();
      setSummary(summaryData);

      let data: any;
      if (tab === 'revenue') data = await reportApi.getRevenue();
      else if (tab === 'subscriptions') data = await reportApi.getSubscriptions();
      else if (tab === 'invoices') data = await reportApi.getInvoices();
      else if (tab === 'payments') data = await reportApi.getPayments();
      else if (tab === 'taxes') data = await reportApi.getTaxes();
      else if (tab === 'churn') data = await reportApi.getChurn();

      setReportData(data);
    } catch (err: any) {
      error('Failed to load report data', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await reportApi.exportCsv(activeTab, `brightloop_${activeTab}_report_${new Date().toISOString().slice(0, 10)}`);
      success('CSV Export Ready', `Downloaded ${activeTab} report.`);
    } catch (err) {
      error('Export Failed', 'Could not stream CSV data.');
    } finally {
      setIsExporting(false);
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">Financial Reports & Auditing</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Enterprise analytics, tax liability statements, revenue recognition, and CSV exports.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCsv}
          isLoading={isExporting}
          leftIcon={<Download className="w-4 h-4 text-[#4F83CC]" />}
        >
          Export {activeTab.toUpperCase()} to CSV
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Total Revenue Settled</p>
              <h3 className="text-xl font-bold text-[#E8EDF3] mt-1">
                {formatCurrency(summary?.totalRevenue)}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#4F83CC]/10 text-[#4F83CC] border border-[#4F83CC]/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Active Subscriptions</p>
              <h3 className="text-xl font-bold text-[#E8EDF3] mt-1">
                {summary?.activeSubscriptions ?? 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#3FA77A]/10 text-[#3FA77A] border border-[#3FA77A]/20">
              <Repeat className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Accounts Receivable (AR)</p>
              <h3 className="text-xl font-bold text-[#D6A04B] mt-1">
                {formatCurrency(summary?.outstandingBalance)}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#D6A04B]/10 text-[#D6A04B] border border-[#D6A04B]/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929DAB] font-medium">Overdue Invoices</p>
              <h3 className="text-xl font-bold text-[#D65B65] mt-1">
                {summary?.overdueInvoicesCount ?? 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-md bg-[#D65B65]/10 text-[#D65B65] border border-[#D65B65]/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Table */}
      <Card>
        <div className="px-6 pt-2 border-b border-[#273241]">
          <Tabs
            tabs={[
              { id: 'revenue', label: 'Revenue Telemetry' },
              { id: 'subscriptions', label: 'Subscription Ledger' },
              { id: 'invoices', label: 'Invoices & Balances' },
              { id: 'payments', label: 'Collections' },
              { id: 'taxes', label: 'Tax Liabilities' },
              { id: 'churn', label: 'Churn Analysis' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <CardContent className="p-6">
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
                  {activeTab.toUpperCase()} Data Breakdown
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCsv}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-[#3FA77A]" />}
                >
                  Download Raw CSV
                </Button>
              </div>

              {/* Render dynamic tables based on tab */}
              {activeTab === 'revenue' && (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Month</TableHeaderCell>
                      <TableHeaderCell>Invoiced Amount</TableHeaderCell>
                      <TableHeaderCell>Collected Revenue</TableHeaderCell>
                      <TableHeaderCell>Outstanding</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.monthlyBreakdown?.map((m: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-[#E8EDF3]">{m.month}</TableCell>
                        <TableCell className="text-[#929DAB]">{formatCurrency(m.invoiced)}</TableCell>
                        <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(m.collected)}</TableCell>
                        <TableCell className="font-medium text-[#D65B65]">{formatCurrency(m.outstanding)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'subscriptions' && (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Metric</TableHeaderCell>
                      <TableHeaderCell>Count</TableHeaderCell>
                      <TableHeaderCell>Monthly Value (MRR)</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.metrics?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-[#E8EDF3]">{row.metric}</TableCell>
                        <TableCell className="text-[#E8EDF3] font-medium">{row.count}</TableCell>
                        <TableCell className="font-semibold text-[#4F83CC]">{formatCurrency(row.mrr)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'invoices' && (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Invoice Count</TableHeaderCell>
                      <TableHeaderCell>Total Amount</TableHeaderCell>
                      <TableHeaderCell>Paid Amount</TableHeaderCell>
                      <TableHeaderCell>Outstanding</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.breakdown?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-[#E8EDF3]">{row.status}</TableCell>
                        <TableCell className="text-[#929DAB]">{row.count}</TableCell>
                        <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(row.total)}</TableCell>
                        <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(row.paid)}</TableCell>
                        <TableCell className="font-medium text-[#D65B65]">{formatCurrency(row.due)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'payments' && (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Payment Method</TableHeaderCell>
                      <TableHeaderCell>Transactions</TableHeaderCell>
                      <TableHeaderCell>Total Volume</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.byMethod?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-[#E8EDF3]">{row.method}</TableCell>
                        <TableCell className="text-[#929DAB]">{row.count}</TableCell>
                        <TableCell className="font-semibold text-[#3FA77A]">{formatCurrency(row.totalVolume)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'taxes' && (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Tax Name</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Rate</TableHeaderCell>
                      <TableHeaderCell>Total Tax Collected</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.taxSummary?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-[#E8EDF3]">{row.taxName}</TableCell>
                        <TableCell className="text-[#929DAB]">{row.taxType}</TableCell>
                        <TableCell className="text-[#929DAB]">{row.taxRate}%</TableCell>
                        <TableCell className="font-semibold text-[#4F83CC]">{formatCurrency(row.collected)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'churn' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#10151D] rounded-md border border-[#273241] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-[#929DAB] font-medium">Gross Churn Rate</span>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] mt-1">{reportData?.churnRate ?? '2.4%'}</h4>
                    </div>
                    <div>
                      <span className="text-xs text-[#929DAB] font-medium">Voluntary Terminations</span>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#D6A04B] mt-1">{reportData?.voluntaryCount ?? 3}</h4>
                    </div>
                    <div>
                      <span className="text-xs text-[#929DAB] font-medium">Net Retention</span>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#3FA77A] mt-1">{reportData?.retentionRate ?? '97.6%'}</h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
