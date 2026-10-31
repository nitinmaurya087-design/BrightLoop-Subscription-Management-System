import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = totalElements ? Math.min((currentPage + 1) * pageSize, totalElements) : (currentPage + 1) * pageSize;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#111720] border-t border-[#273241]">
      <div className="text-xs text-[#929DAB]">
        {totalElements !== undefined ? (
          <>
            Showing <span className="font-medium text-[#E8EDF3]">{startItem}</span> to{' '}
            <span className="font-medium text-[#E8EDF3]">{endItem}</span> of{' '}
            <span className="font-medium text-[#E8EDF3]">{totalElements}</span> entries
          </>
        ) : (
          <>
            Page <span className="font-medium text-[#E8EDF3]">{currentPage + 1}</span> of{' '}
            <span className="font-medium text-[#E8EDF3]">{totalPages}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="text-xs font-medium text-[#929DAB] px-1.5">
          {currentPage + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
