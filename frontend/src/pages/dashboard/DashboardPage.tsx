import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Repeat,
  TrendingUp,
  AlertCircle,
  Clock,
  Package,
  Layers,
  ArrowUpRight,
  CreditCard,
  FileText,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { CardSkeleton } from '../../components/common/Skeleton';
import Tabs from '../../components/common/Tabs';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [activeActivityTab, setActiveActivityTab] = useState('subscriptions');
  const { error } = useToast();

  const fetchStats = async (selectedPeriod: string) => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getStats(selectedPeriod);
      setStats(data);
    } catch (err: any) {
      error('Failed to load dashboard', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

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

  const STATUS_COLORS = {
    ACTIVE: '#3FA77A',
    DRAFT: '#687586',
    CONFIRMED: '#4F83CC',
    PAUSED: '#D6A04B',
    CLOSED: '#273241',
    CANCELLED: '#D65B65',
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Monthly Recurring (MRR)',
      value: formatCurrency(stats?.mrr),
      subtext: `ARR: ${formatCurrency(stats?.arr)}`,
      icon: TrendingUp,
      accent: 'text-[#4F83CC]',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions ?? 0,
      subtext: '88% customer retention',
      icon: Repeat,
      accent: 'text-[#3FA77A]',
    },
    {
      title: 'Total Revenue Settled',
      value: formatCurrency(stats?.totalRevenueCollected),
      subtext: 'Collected to date',
      icon: CreditCard,
      accent: 'text-[#4F83CC]',
    },
    {
      title: 'Outstanding Receivables',
      value: formatCurrency(stats?.outstandingBalance),
      subtext: 'Uncollected invoice total',
      icon: AlertCircle,
      accent: 'text-[#D6A04B]',
    },
    {
      title: 'Registered Customers',
      value: stats?.totalCustomers ?? 0,
      subtext: 'Active enterprise accounts',
      icon: Users,
      accent: 'text-[#E8EDF3]',
    },
    {
      title: 'Overdue Invoices',
      value: stats?.overdueInvoicesCount ?? 0,
      subtext: 'Requires collection action',
      icon: AlertCircle,
      accent: 'text-[#D65B65]',
    },
    {
      title: 'Upcoming Term Renewals',
      value: stats?.upcomingRenewalsCount ?? 0,
      subtext: 'Next 30 days window',
      icon: Clock,
      accent: 'text-[#4F83CC]',
    },
    {
      title: 'Active Plans & Catalog',
      value: `${stats?.totalPlans ?? 0} Plans / ${stats?.totalProducts ?? 0} Products`,
      subtext: 'Production pricing tiers',
      icon: Layers,
      accent: 'text-[#929DAB]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Indian User Welcome and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#273241]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#E8EDF3] tracking-tight">
            Welcome back, {user?.fullName || 'Rahul Sharma'}
          </h1>
          <p className="text-xs text-[#929DAB] mt-0.5">
            Operational dashboard and subscription telemetry for BrightLoop India.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#151C26] border border-[#273241] rounded-md self-start">
          <Filter className="w-3.5 h-3.5 text-[#687586] ml-2 mr-1" />
          {[
            { label: '7D', val: '7d' },
            { label: '30D', val: '30d' },
            { label: '3M', val: '90d' },
            { label: '12M', val: '365d' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setPeriod(item.val)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                period === item.val
                  ? 'bg-[#4F83CC] text-white'
                  : 'text-[#929DAB] hover:text-[#E8EDF3] hover:bg-[#1B2430]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:border-[#323F52] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#929DAB]">{kpi.title}</span>
                  <div className="p-1.5 rounded bg-[#1B2430] text-[#929DAB] border border-[#273241]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-lg font-semibold text-[#E8EDF3] tracking-tight">{kpi.value}</h3>
                  <p className="text-[11px] text-[#687586] mt-0.5">{kpi.subtext}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Recurring Revenue Trend</CardTitle>
              <CardDescription>Billed subscriptions and settled receipts across active cycles</CardDescription>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#4F83CC]/10 text-[#4F83CC] border border-[#4F83CC]/25">
              ARR: {formatCurrency(stats?.arr)}
            </span>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.monthlyRevenue || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="darkRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F83CC" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F83CC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#273241" />
                  <XAxis dataKey="month" stroke="#687586" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#687586"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#151C26',
                      borderColor: '#273241',
                      borderRadius: '6px',
                      color: '#E8EDF3',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F83CC"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#darkRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions by Status */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Contract distribution by lifecycle state</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.subscriptionsByStatus || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(stats?.subscriptionsByStatus || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={(STATUS_COLORS as any)[entry.status] || '#4F83CC'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Subscriptions`, name]}
                    contentStyle={{
                      backgroundColor: '#151C26',
                      borderColor: '#273241',
                      borderRadius: '6px',
                      color: '#E8EDF3',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#929DAB' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Subscription Growth & Product Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Subscriber Growth</CardTitle>
              <CardDescription>Cumulative customer onboarding by calendar month</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.subscriptionGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#273241" />
                  <XAxis dataKey="month" stroke="#687586" fontSize={11} tickLine={false} />
                  <YAxis stroke="#687586" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Subscriptions`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#151C26',
                      borderColor: '#273241',
                      borderRadius: '6px',
                      color: '#E8EDF3',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4F83CC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by Offering</CardTitle>
              <CardDescription>Top revenue-generating software packages and modules</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.revenueByProduct || []}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#273241" />
                  <XAxis type="number" stroke="#687586" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <YAxis type="category" dataKey="productName" stroke="#687586" fontSize={11} tickLine={false} width={110} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#151C26',
                      borderColor: '#273241',
                      borderRadius: '6px',
                      color: '#E8EDF3',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3FA77A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Ledger */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Activity & Billing Events</CardTitle>
            <CardDescription>Audit log of latest subscription lifecycle changes and payments</CardDescription>
          </div>
        </CardHeader>
        <div className="px-5 pt-1">
          <Tabs
            tabs={[
              { id: 'subscriptions', label: 'Recent Subscriptions', badge: stats?.recentSubscriptions?.length },
              { id: 'payments', label: 'Recent Payments', badge: stats?.recentPayments?.length },
              { id: 'invoices', label: 'Recent Invoices', badge: stats?.recentInvoices?.length },
              { id: 'renewals', label: 'Upcoming Renewals', badge: stats?.upcomingRenewals?.length },
              { id: 'overdue', label: 'Overdue Invoices', badge: stats?.overdueInvoices?.length },
            ]}
            activeTab={activeActivityTab}
            onChange={setActiveActivityTab}
          />
        </div>

        <CardContent className="p-0">
          {activeActivityTab === 'subscriptions' && (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Subscription #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Cadence</TableHeaderCell>
                  <TableHeaderCell>Next Billing</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">{sub.subscriptionNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-[#E8EDF3]">{sub.customerName || 'Rahul Sharma'}</div>
                      <div className="text-xs text-[#687586]">{sub.customerEmail || 'rahul@sharmatech.in'}</div>
                    </TableCell>
                    <TableCell className="text-[#929DAB]">{sub.planName}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#1B2430] text-[#929DAB]">
                        {sub.billingFrequency}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(sub.nextBillingDate)}</TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(sub.grandTotal)}</TableCell>
                    <TableCell>
                      <Badge variant="auto" status={sub.status}>{sub.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeActivityTab === 'payments' && (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Payment #</TableHeaderCell>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Method</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentPayments?.map((pmt) => (
                  <TableRow key={pmt.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#E8EDF3]">{pmt.paymentNumber}</TableCell>
                    <TableCell className="font-mono text-xs text-[#4F83CC]">{pmt.invoiceNumber}</TableCell>
                    <TableCell className="text-[#E8EDF3]">{pmt.customerName || 'Amit Gupta'}</TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(pmt.paymentDate)}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1B2430] text-[#929DAB]">
                        {pmt.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-[#3FA77A]">{formatCurrency(pmt.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeActivityTab === 'invoices' && (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Balance Due</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentInvoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-[#E8EDF3]">{inv.customerName || 'Priya Verma'}</TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell className="text-xs text-[#929DAB]">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell className="font-medium text-[#D65B65]">{formatCurrency(inv.balanceDue)}</TableCell>
                    <TableCell>
                      <Badge variant="auto" status={inv.status}>{inv.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeActivityTab === 'renewals' && (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Subscription #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Next Billing Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.upcomingRenewals?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">{sub.subscriptionNumber}</TableCell>
                    <TableCell className="text-[#E8EDF3]">{sub.customerName || 'Sneha Patel'}</TableCell>
                    <TableCell className="text-[#929DAB]">{sub.planName}</TableCell>
                    <TableCell className="text-xs font-medium text-[#4F83CC]">{formatDate(sub.nextBillingDate)}</TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(sub.grandTotal)}</TableCell>
                    <TableCell>
                      <Badge variant="auto" status={sub.status}>{sub.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeActivityTab === 'overdue' && (
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Grand Total</TableHeaderCell>
                  <TableHeaderCell>Overdue Balance</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.overdueInvoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#4F83CC]">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-[#E8EDF3]">{inv.customerName || 'Rohan Mishra'}</TableCell>
                    <TableCell className="text-xs font-medium text-[#D65B65]">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="font-medium text-[#E8EDF3]">{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell className="font-semibold text-[#D65B65]">{formatCurrency(inv.balanceDue)}</TableCell>
                    <TableCell>
                      <Badge variant="danger" status="OVERDUE">OVERDUE</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
