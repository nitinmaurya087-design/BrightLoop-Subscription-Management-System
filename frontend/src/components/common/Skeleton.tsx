import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-[#1B2430] rounded-sm ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151C26] rounded-lg border border-[#273241] p-5 space-y-3">
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-2.5 p-4 bg-[#151C26] rounded-lg border border-[#273241]">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
};

export default Skeleton;
