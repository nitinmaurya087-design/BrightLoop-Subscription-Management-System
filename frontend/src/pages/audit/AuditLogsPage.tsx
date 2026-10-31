import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Shield,
  User,
  Clock,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  Repeat,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  details: string;
}

const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-1092',
    timestamp: '2026-10-31 11:45:12',
    actor: 'Rahul Sharma',
    actorRole: 'ADMIN',
    action: 'BILLING_CYCLE_TRIGGERED',
    entityType: 'Scheduler',
    entityId: 'EXEC-849',
    ipAddress: '103.21.124.8',
    status: 'SUCCESS',
    details: 'Manual execution of recurring billing engine; 14 subscriptions processed',
  },
  {
    id: 'LOG-1091',
    timestamp: '2026-10-31 11:20:04',
    actor: 'Priya Verma',
    actorRole: 'STAFF',
    action: 'PAYMENT_RECORDED',
    entityType: 'Payment',
    entityId: 'PMT-2026-0042',
    ipAddress: '49.36.110.42',
    status: 'SUCCESS',
    details: 'Logged ₹45,000 via NEFT for invoice INV-2026-0081 (Sharma Technologies)',
  },
  {
    id: 'LOG-1090',
    timestamp: '2026-10-31 10:55:38',
    actor: 'Rahul Sharma',
    actorRole: 'ADMIN',
    action: 'QUOTATION_CONFIRMED',
    entityType: 'Quotation',
    entityId: 'QTN-2026-019',
    ipAddress: '103.21.124.8',
    status: 'SUCCESS',
    details: 'Confirmed proposal and converted to subscription SUB-2026-0012',
  },
  {
    id: 'LOG-1089',
    timestamp: '2026-10-31 09:15:22',
    actor: 'System Scheduler',
    actorRole: 'SYSTEM',
    action: 'INVOICE_GENERATED',
    entityType: 'Invoice',
    entityId: 'INV-2026-0082',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    details: 'Nightly recurrence run auto-generated cycle invoice with 18% GST',
  },
  {
    id: 'LOG-1088',
    timestamp: '2026-10-30 18:30:11',
    actor: 'Amit Gupta',
    actorRole: 'CUSTOMER',
    action: 'PORTAL_LOGIN',
    entityType: 'AuthSession',
    entityId: 'SES-9941',
    ipAddress: '157.48.92.115',
    status: 'SUCCESS',
    details: 'Customer authenticated into self-service portal',
  },
  {
    id: 'LOG-1087',
    timestamp: '2026-10-30 16:42:09',
    actor: 'Rahul Sharma',
    actorRole: 'ADMIN',
    action: 'DISCOUNT_CREATED',
    entityType: 'Discount',
    entityId: 'FESTIVE25',
    ipAddress: '103.21.124.8',
    status: 'SUCCESS',
    details: 'Published 25% discount campaign with ₹10,000 maximum cap',
  },
  {
    id: 'LOG-1086',
    timestamp: '2026-10-30 14:10:50',
    actor: 'Priya Verma',
    actorRole: 'STAFF',
    action: 'SUBSCRIPTION_PAUSED',
    entityType: 'Subscription',
    entityId: 'SUB-2026-0008',
    ipAddress: '49.36.110.42',
    status: 'WARNING',
    details: 'Temporary hold placed on billing per customer request',
  },
  {
    id: 'LOG-1085',
    timestamp: '2026-10-30 11:02:18',
    actor: 'Rohan Mishra',
    actorRole: 'STAFF',
    action: 'CUSTOMER_CREATED',
    entityType: 'Customer',
    entityId: 'CUST-0019',
    ipAddress: '115.112.80.3',
    status: 'SUCCESS',
    details: 'Onboarded Verma Digital Solutions with GSTIN 07AAAAA0000A1Z5',
  },
  {
    id: 'LOG-1084',
    timestamp: '2026-10-29 23:45:00',
    actor: 'System Scheduler',
    actorRole: 'SYSTEM',
    action: 'RECURRING_BILLING_CHECK',
    entityType: 'Scheduler',
    entityId: 'EXEC-848',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    details: 'Idempotency check verified; 0 duplicate invoices prevented',
  },
  {
    id: 'LOG-1083',
    timestamp: '2026-10-29 17:18:44',
    actor: 'Anonymous',
    actorRole: 'PUBLIC',
    action: 'FAILED_LOGIN_ATTEMPT',
    entityType: 'AuthSession',
    entityId: 'N/A',
    ipAddress: '185.220.101.4',
    status: 'FAILURE',
    details: 'Invalid password credential entered for administrator account',
  },
];

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(SAMPLE_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search);
    const matchesAction = actionFilter ? l.action.includes(actionFilter) : true;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">System Audit Logs & Traceability</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Immutable compliance ledger recording authentication sessions, contract state machine mutations, and financial settlements.
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
              placeholder="Search audit trail by actor, IP, entity ID, action..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#10151D] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#10151D] border border-[#273241] rounded-md overflow-x-auto max-w-full">
            {['', 'BILLING', 'PAYMENT', 'SUBSCRIPTION', 'INVOICE', 'AUTH'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActionFilter(cat);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  actionFilter === cat
                    ? 'bg-[#1B2430] text-[#E8EDF3] border border-[#4F83CC]/40 shadow-xs'
                    : 'text-[#929DAB] hover:text-[#E8EDF3]'
                }`}
              >
                {cat || 'All Categories'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow hoverable={false}>
              <TableHeaderCell>Timestamp</TableHeaderCell>
              <TableHeaderCell>Actor</TableHeaderCell>
              <TableHeaderCell>Action Performed</TableHeaderCell>
              <TableHeaderCell>Entity Target</TableHeaderCell>
              <TableHeaderCell>IP Address</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Audit Description</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-xs text-[#929DAB] whitespace-nowrap">
                  {entry.timestamp}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[#E8EDF3]">{entry.actor}</div>
                  <div className="text-[10px] text-[#687586]">{entry.actorRole}</div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-[#4F83CC] font-medium">
                    {entry.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-[#929DAB] whitespace-nowrap">
                  <span className="text-[#687586]">{entry.entityType}:</span>{' '}
                  <span className="font-mono text-[#E8EDF3]">{entry.entityId}</span>
                </TableCell>
                <TableCell className="font-mono text-xs text-[#687586]">
                  {entry.ipAddress}
                </TableCell>
                <TableCell>
                  <Badge variant="auto" status={entry.status}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-[#929DAB] max-w-sm">
                  {entry.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={1}
          totalElements={filtered.length}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};

export default AuditLogsPage;
