import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Tag,
  Percent,
  BarChart3,
  History,
  UserCheck,
  Settings,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import Badge from '../common/Badge';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const { user, logout, isAdmin, isCustomer } = useAuth();

  const adminStaffNavGroups = [
    {
      group: 'Core Operations',
      items: [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Customers', to: '/customers', icon: Users },
        { name: 'Quotations', to: '/quotations', icon: FileSpreadsheet },
        { name: 'Subscriptions', to: '/subscriptions', icon: Repeat },
      ],
    },
    {
      group: 'Billing & Catalog',
      items: [
        { name: 'Products', to: '/products', icon: Package },
        { name: 'Product Variants', to: '/variants', icon: SlidersHorizontal },
        { name: 'Plans', to: '/plans', icon: Layers },
        { name: 'Invoices', to: '/invoices', icon: FileText },
        { name: 'Payments', to: '/payments', icon: CreditCard },
        { name: 'Discounts', to: '/discounts', icon: Tag },
        { name: 'Taxes', to: '/taxes', icon: Percent },
      ],
    },
    {
      group: 'System & Intelligence',
      items: [
        { name: 'Reports', to: '/reports', icon: BarChart3 },
        { name: 'Audit Logs', to: '/audit-logs', icon: History },
        ...(isAdmin ? [{ name: 'Staff Management', to: '/staff', icon: UserCheck }] : []),
        { name: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  const customerNavGroups = [
    {
      group: 'Self-Service Portal',
      items: [
        { name: 'Portal Dashboard', to: '/portal', icon: LayoutDashboard },
      ],
    },
  ];

  const navGroups = isCustomer ? customerNavGroups : adminStaffNavGroups;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#10151D] text-[#929DAB] flex flex-col transition-transform duration-200 ease-in-out border-r border-[#273241] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#273241] bg-[#10151D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#4F83CC] flex items-center justify-center text-white shadow-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18" />
                <path d="M3 12h18" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[15px] tracking-tight text-[#E8EDF3]">BrightLoop</span>
              <span className="text-[10px] font-medium text-[#4F83CC] px-1.5 py-0.2 rounded bg-[#4F83CC]/10 border border-[#4F83CC]/20">
                PRO
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[#687586] font-mono">v2.4</span>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-medium tracking-wider text-[#687586] uppercase">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-[#1B2430] text-[#E8EDF3] border-l-2 border-[#4F83CC]'
                          : 'text-[#929DAB] hover:text-[#E8EDF3] hover:bg-[#151C26]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#687586] group-hover:text-[#929DAB]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#273241] bg-[#0E131A]">
          <div className="p-2.5 rounded-md bg-[#151C26] border border-[#273241] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#1B2430] text-[#4F83CC] border border-[#273241] flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'R'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#E8EDF3] truncate">{user?.fullName || 'Rahul Sharma'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="auto" status={user?.role} className="text-[10px] px-1.5 py-0">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-[#687586] hover:text-[#D65B65] p-1 rounded hover:bg-[#1B2430] transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
