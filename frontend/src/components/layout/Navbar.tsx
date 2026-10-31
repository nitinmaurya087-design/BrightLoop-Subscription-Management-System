import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { billingApi } from '../../api';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Play,
  LogOut,
  Zap,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const { success, error } = useToast();
  const [isRunningBilling, setIsRunningBilling] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleRunBilling = async () => {
    setIsRunningBilling(true);
    try {
      const res = await billingApi.runBilling();
      success(
        'Billing Executed',
        `Processed ${res.subscriptionsProcessed} subscriptions. Generated ${res.invoicesGenerated} invoices.`
      );
    } catch (err: any) {
      error('Billing Execution Failed', err.response?.data?.message || err.message);
    } finally {
      setIsRunningBilling(false);
    }
  };

  return (
    <header className="h-14 bg-[#111720] border-b border-[#273241] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center gap-3.5 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-[#929DAB] hover:text-[#E8EDF3] rounded-md hover:bg-[#1B2430]"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative max-w-sm w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687586]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search customers, subscriptions, invoices..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-[#151C26] border border-[#273241] rounded-md text-[#E8EDF3] placeholder-[#687586] focus:outline-none focus:border-[#4F83CC] focus:ring-1 focus:ring-[#4F83CC]/25 transition-colors"
          />
        </div>
      </div>

      {/* Right section: Quick actions, notifications, role pill, profile */}
      <div className="flex items-center gap-2.5">
        {(isAdmin || isStaff) && (
          <Button
            variant="subtle"
            size="sm"
            onClick={handleRunBilling}
            isLoading={isRunningBilling}
            leftIcon={<Zap className="w-3.5 h-3.5 text-[#4F83CC]" />}
            className="hidden md:inline-flex text-xs font-medium"
          >
            Run Billing
          </Button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
            }}
            className="relative p-2 text-[#929DAB] hover:text-[#E8EDF3] hover:bg-[#1B2430] rounded-md transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4F83CC]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#151C26] rounded-md shadow-2xl border border-[#273241] py-2.5 z-50">
              <div className="px-4 pb-2 border-b border-[#273241] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E8EDF3] uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] bg-[#4F83CC]/15 text-[#4F83CC] font-medium px-1.5 py-0.2 rounded">3 New</span>
              </div>
              <div className="divide-y divide-[#273241] max-h-72 overflow-y-auto">
                <div className="px-4 py-2.5 hover:bg-[#1B2430] transition-colors">
                  <p className="text-xs font-medium text-[#E8EDF3]">Recurring billing executed</p>
                  <p className="text-[11px] text-[#929DAB] mt-0.5">Automated scheduler generated 4 renewed invoices.</p>
                  <span className="text-[10px] text-[#687586] mt-1 block">15 minutes ago</span>
                </div>
                <div className="px-4 py-2.5 hover:bg-[#1B2430] transition-colors">
                  <p className="text-xs font-medium text-[#E8EDF3]">Payment received from Sharma Technologies</p>
                  <p className="text-[11px] text-[#929DAB] mt-0.5">₹2,560 recorded against invoice INV-2026-0001.</p>
                  <span className="text-[10px] text-[#687586] mt-1 block">1 hour ago</span>
                </div>
                <div className="px-4 py-2.5 hover:bg-[#1B2430] transition-colors">
                  <p className="text-xs font-medium text-[#E8EDF3]">Quotation confirmed</p>
                  <p className="text-[11px] text-[#929DAB] mt-0.5">Quotation QT-2026-0002 confirmed for TechNova Solutions.</p>
                  <span className="text-[10px] text-[#687586] mt-1 block">3 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
            }}
            className="p-2 text-[#929DAB] hover:text-[#E8EDF3] hover:bg-[#1B2430] rounded-md transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {showHelp && (
            <div className="absolute right-0 mt-2 w-72 bg-[#151C26] rounded-md shadow-2xl border border-[#273241] p-4 z-50">
              <h4 className="text-xs font-semibold text-[#E8EDF3] mb-1">BrightLoop Help</h4>
              <p className="text-xs text-[#929DAB] mb-3 leading-relaxed">
                Enterprise recurring billing, GST tax line snapshots, quotations, and automated subscription reconciliation.
              </p>
              <div className="space-y-1 text-xs text-[#4F83CC] font-medium">
                <div>• Idempotent daily recurring billing</div>
                <div>• OpenPDF invoice & quotation export</div>
                <div>• Indian GST and currency formatting</div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[#273241] mx-1" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-[#E8EDF3] leading-tight">{user?.fullName || 'Rahul Sharma'}</p>
            <span className="text-[10px] text-[#687586]">{user?.email || 'admin@brightloop.com'}</span>
          </div>
          <Badge variant="auto" status={user?.role}>
            {user?.role}
          </Badge>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-[#929DAB] hover:text-[#D65B65] hover:bg-[#1B2430] rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
