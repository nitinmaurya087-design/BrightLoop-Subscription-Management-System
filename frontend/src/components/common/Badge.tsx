import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'auto';
  status?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'auto', status, className = '' }) => {
  let effectiveVariant = variant;

  if (variant === 'auto' && (status || typeof children === 'string')) {
    const key = (status || (children as string)).toUpperCase();
    if (['ACTIVE', 'PAID', 'CONFIRMED', 'SUCCESS'].includes(key)) {
      effectiveVariant = 'success';
    } else if (['DRAFT', 'CLOSED', 'ARCHIVED', 'INACTIVE'].includes(key)) {
      effectiveVariant = 'neutral';
    } else if (['PAUSED', 'PARTIAL', 'QUOTATION', 'PENDING'].includes(key)) {
      effectiveVariant = 'warning';
    } else if (['OVERDUE', 'CANCELLED', 'FAILED', 'EXPIRED'].includes(key)) {
      effectiveVariant = 'danger';
    } else if (['ADMIN'].includes(key)) {
      effectiveVariant = 'info';
    } else if (['STAFF'].includes(key)) {
      effectiveVariant = 'purple';
    } else if (['CUSTOMER'].includes(key)) {
      effectiveVariant = 'success';
    } else {
      effectiveVariant = 'info';
    }
  }

  const variantStyles = {
    success: 'bg-[#3FA77A]/12 text-[#3FA77A] border-[#3FA77A]/30',
    warning: 'bg-[#D6A04B]/12 text-[#D6A04B] border-[#D6A04B]/30',
    danger: 'bg-[#D65B65]/12 text-[#D65B65] border-[#D65B65]/30',
    info: 'bg-[#4F83CC]/12 text-[#4F83CC] border-[#4F83CC]/30',
    neutral: 'bg-[#1B2430] text-[#929DAB] border-[#273241]',
    purple: 'bg-[#8B9EC3]/15 text-[#A5B7DB] border-[#8B9EC3]/30',
    auto: 'bg-[#1B2430] text-[#929DAB] border-[#273241]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${variantStyles[effectiveVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-80"></span>
      {children}
    </span>
  );
};

export default Badge;
