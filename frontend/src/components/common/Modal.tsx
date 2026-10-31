import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative bg-[#151C26] rounded-lg shadow-2xl border border-[#273241] w-full ${maxWidths[maxWidth]} my-8 overflow-hidden z-10`}
      >
        <div className="px-5 py-3.5 border-b border-[#273241] flex items-center justify-between bg-[#111720]">
          <div>
            <h3 className="text-sm font-semibold text-[#E8EDF3]">{title}</h3>
            {description && <p className="text-xs text-[#929DAB] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#929DAB] hover:text-[#E8EDF3] p-1 rounded-md hover:bg-[#1B2430] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-7rem)] overflow-y-auto p-5 text-[#E8EDF3]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
