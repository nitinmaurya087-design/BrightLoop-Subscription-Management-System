import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-[#0B0F14] disabled:opacity-40 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'text-xs h-8 px-2.5 gap-1.5',
      md: 'text-sm h-9 px-3.5 gap-2',
      lg: 'text-sm h-10 px-4.5 gap-2.5',
    };

    const variantStyles = {
      primary: 'bg-[#4F83CC] hover:bg-[#3E6EB5] active:bg-[#355F9E] text-white focus:ring-[#4F83CC] border border-[#4F83CC]/40',
      secondary: 'bg-[#1B2430] hover:bg-[#222D3D] active:bg-[#273446] text-[#E8EDF3] border border-[#273241] focus:ring-[#273241]',
      outline: 'bg-transparent hover:bg-[#1B2430] active:bg-[#222D3D] text-[#E8EDF3] border border-[#273241] focus:ring-[#4F83CC]',
      danger: 'bg-[#D65B65]/15 hover:bg-[#D65B65]/25 active:bg-[#D65B65]/35 text-[#D65B65] border border-[#D65B65]/30 focus:ring-[#D65B65]',
      ghost: 'bg-transparent hover:bg-[#1B2430] active:bg-[#222D3D] text-[#929DAB] hover:text-[#E8EDF3] focus:ring-[#273241]',
      subtle: 'bg-[#4F83CC]/10 hover:bg-[#4F83CC]/20 active:bg-[#4F83CC]/25 text-[#4F83CC] border border-[#4F83CC]/25 focus:ring-[#4F83CC]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
