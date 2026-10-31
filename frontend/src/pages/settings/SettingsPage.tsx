import React, { useState, useEffect } from 'react';
import { taxApi, billingApi } from '../../api';
import { Tax, BillingExecution } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Play,
  Edit2,
  Zap,
  Server,
  Mail,
  CheckCircle,
} from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { TableSkeleton } from '../../components/common/Skeleton';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('taxes');
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [executions, setExecutions] = useState<BillingExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningBilling, setIsRunningBilling] = useState(false);

  // Tax Modal State
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxForm, setTaxForm] = useState<{
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [taxList, execList] = await Promise.all([
        taxApi.list(false),
        billingApi.getExecutions(),
      ]);
      setTaxes(taxList);
      setExecutions(execList);
    } catch (err: any) {
      error('Failed to load settings', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddTax = () => {
    setEditingTax(null);
    setTaxForm({
      taxName: '',
      taxType: 'PERCENTAGE',
      taxRate: 18,
      taxDescription: '',
      active: true,
    });
    setIsTaxModalOpen(true);
  };

  const handleOpenEditTax = (t: Tax) => {
    setEditingTax(t);
    setTaxForm({
      taxName: t.taxName,
      taxType: t.taxType,
      taxRate: t.taxRate,
      taxDescription: t.taxDescription || '',
      active: t.active,
    });
    setIsTaxModalOpen(true);
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTax) {
        await taxApi.update(editingTax.id, taxForm);
        success('Tax Rule Updated', `${taxForm.taxName} has been modified.`);
      } else {
        await taxApi.create(taxForm);
        success('Tax Rule Created', `${taxForm.taxName} is now active.`);
      }
      setIsTaxModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save tax', err.response?.data?.message || err.message);
    }
  };

  const handleRunBillingNow = async () => {
    setIsRunningBilling(true);
    try {
      const res = await billingApi.runBilling();
      success(
        'Billing Execution Complete',
        `Processed ${res.subscriptionsProcessed} subscriptions. Generated ${res.invoicesGenerated} invoices.`
      );
      loadData();
    } catch (err: any) {
      error('Execution Failed', err.response?.data?.message || err.message);
    } finally {
      setIsRunningBilling(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E8EDF3] tracking-tight">System & Tax Settings</h1>
          <p className="text-xs sm:text-sm text-[#929DAB] mt-1">
            Tax rates, recurring billing scheduler engine, and environment integrations.
          </p>
        </div>
        {activeTab === 'taxes' && (
          <Button variant="primary" onClick={handleOpenAddTax} leftIcon={<Plus className="w-4 h-4" />}>
            Add Tax Rule
          </Button>
        )}
      </div>

      <Card>
        <div className="px-6 pt-2 border-b border-[#273241]">
          <Tabs
            tabs={[
              { id: 'taxes', label: 'Tax Rules & GST' },
              { id: 'scheduler', label: 'Recurring Billing Scheduler', badge: executions.length },
              { id: 'system', label: 'System & Email Configuration' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <CardContent className="p-6">
          {/* Tax Management Tab */}
          {activeTab === 'taxes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
                    Configured Tax Rates
                  </h4>
                  <p className="text-xs text-[#687586] mt-0.5">
                    Taxes are automatically calculated and locked into invoice line snapshots during billing.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow hoverable={false}>
                      <TableHeaderCell>Tax Name</TableHeaderCell>
                      <TableHeaderCell>Calculation Type</TableHeaderCell>
                      <TableHeaderCell>Rate</TableHeaderCell>
                      <TableHeaderCell>Description</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell className="text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taxes.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-[#E8EDF3]">{t.taxName}</TableCell>
                        <TableCell>
                          <Badge variant="neutral">
                            {t.taxType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-[#4F83CC]">
                          {t.taxType === 'PERCENTAGE' ? `${t.taxRate}%` : `₹${t.taxRate}`}
                        </TableCell>
                        <TableCell className="text-xs text-[#929DAB]">{t.taxDescription || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="auto" status={t.active ? 'ACTIVE' : 'INACTIVE'}>
                            {t.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditTax(t)}
                          >
                            <Edit2 className="w-4 h-4 text-[#929DAB] hover:text-[#E8EDF3]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Scheduler Tab */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              {/* Manual Billing Trigger Banner */}
              <div className="p-5 bg-[#10151D] rounded-md border border-[#273241] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#4F83CC]" />
                    <h3 className="text-sm font-semibold text-[#E8EDF3]">
                      Automated Recurring Billing Engine
                    </h3>
                  </div>
                  <p className="text-xs text-[#929DAB] mt-1 max-w-xl">
                    Executes nightly (and on-demand). Inspects all active subscriptions due for billing, verifies idempotency to prevent duplicate invoices, advances next billing dates, and generates OpenPDF invoices.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleRunBillingNow}
                  isLoading={isRunningBilling}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Run Billing Now
                </Button>
              </div>

              {/* Execution History Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#929DAB] uppercase tracking-wider">
                  Billing Execution History Log
                </h4>
                {executions.length === 0 ? (
                  <p className="text-xs text-[#687586] italic">No previous executions recorded.</p>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow hoverable={false}>
                        <TableHeaderCell>Execution Time</TableHeaderCell>
                        <TableHeaderCell>Triggered By</TableHeaderCell>
                        <TableHeaderCell>Subscriptions Processed</TableHeaderCell>
                        <TableHeaderCell>Invoices Generated</TableHeaderCell>
                        <TableHeaderCell>Expired</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {executions.map((ex) => (
                        <TableRow key={ex.id}>
                          <TableCell className="text-xs text-[#929DAB] font-mono">{formatDate(ex.executionDate)}</TableCell>
                          <TableCell>
                            <Badge variant="neutral">
                              {ex.triggeredBy}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-[#E8EDF3]">{ex.subscriptionsProcessed}</TableCell>
                          <TableCell className="font-semibold text-[#3FA77A]">{ex.invoicesGenerated}</TableCell>
                          <TableCell className="text-[#929DAB] text-xs">{ex.subscriptionsExpired}</TableCell>
                          <TableCell>
                            <Badge variant="auto" status={ex.status}>{ex.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 bg-[#10151D] rounded-md border border-[#273241] space-y-3 text-xs text-[#929DAB]">
                <div className="flex items-center gap-2 font-semibold text-[#E8EDF3] text-sm">
                  <Server className="w-4 h-4 text-[#4F83CC]" />
                  <span>Platform Diagnostics</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#687586] block">Backend Framework:</span>
                    <span className="font-medium text-[#E8EDF3]">Spring Boot 3.3.4 (Java 25)</span>
                  </div>
                  <div>
                    <span className="text-[#687586] block">Database Architecture:</span>
                    <span className="font-medium text-[#E8EDF3]">MySQL 8 / H2 Compatibility with Flyway V1 & V2</span>
                  </div>
                  <div>
                    <span className="text-[#687586] block">PDF Generation Engine:</span>
                    <span className="font-medium text-[#E8EDF3]">OpenPDF (LibrePDF 1.3.40)</span>
                  </div>
                  <div>
                    <span className="text-[#687586] block">Authentication Protocol:</span>
                    <span className="font-medium text-[#E8EDF3]">Stateless JWT + BCrypt (Spring Security 6)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#10151D] rounded-md border border-[#273241] space-y-3 text-xs text-[#929DAB]">
                <div className="flex items-center gap-2 font-semibold text-[#E8EDF3] text-sm">
                  <Mail className="w-4 h-4 text-[#4F83CC]" />
                  <span>SMTP Notification Integration</span>
                </div>
                <p className="text-[#929DAB]">
                  Configured with automatic fallback: when SMTP host is specified, real emails are dispatched. In development mode without credentials, notifications and tokens log safely to the application logger.
                </p>
                <div className="flex items-center gap-2 text-[#3FA77A] font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Email Dispatch Service Ready</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Tax Modal */}
      <Modal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        title={editingTax ? 'Edit Tax Rule' : 'Add Tax Rule'}
        description="Configure tax rates applied during recurring invoice calculations"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTax} className="space-y-4">
          <Input
            label="Tax Name"
            required
            value={taxForm.taxName}
            onChange={(e) => setTaxForm({ ...taxForm, taxName: e.target.value })}
            placeholder="e.g. GST 18% or IGST 18%"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tax Type"
              required
              value={taxForm.taxType}
              onChange={(e) =>
                setTaxForm({ ...taxForm, taxType: e.target.value as 'PERCENTAGE' | 'FIXED' })
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
              value={taxForm.taxRate}
              onChange={(e) => setTaxForm({ ...taxForm, taxRate: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Description"
            value={taxForm.taxDescription}
            onChange={(e) => setTaxForm({ ...taxForm, taxDescription: e.target.value })}
            placeholder="e.g. Standard Integrated GST rate for SaaS services"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#273241]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTaxModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Tax Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
