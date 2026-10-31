import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#151C26] rounded-lg border border-dashed border-[#273241]">
      <div className="w-10 h-10 rounded-md bg-[#1B2430] flex items-center justify-center text-[#929DAB] mb-3 border border-[#273241]">
        <Icon className="w-5 h-5 text-[#4F83CC]" />
      </div>
      <h3 className="text-sm font-semibold text-[#E8EDF3] mb-1">{title}</h3>
      <p className="text-xs text-[#929DAB] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
