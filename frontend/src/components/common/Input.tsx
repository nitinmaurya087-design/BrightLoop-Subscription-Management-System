import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#929DAB] mb-1.5">
            {label}
            {props.required && <span className="text-[#D65B65] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-md shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687586]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded-md border text-sm transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#4F83CC]/30 disabled:bg-[#10151D] disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${rightIcon ? 'pr-9' : 'pr-3'} py-2 ${
              error
                ? 'border-[#D65B65] focus:border-[#D65B65] text-[#D65B65] placeholder-[#D65B65]/40 bg-[#111720]'
                : 'border-[#273241] focus:border-[#4F83CC] text-[#E8EDF3] bg-[#10151D] placeholder-[#687586]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#687586]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-[#D65B65] font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-[#687586]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#929DAB] mb-1.5">
            {label}
            {props.required && <span className="text-[#D65B65] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-md border text-sm py-2 px-3 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#4F83CC]/30 bg-[#10151D] disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-[#D65B65] focus:border-[#D65B65] text-[#D65B65]'
              : 'border-[#273241] focus:border-[#4F83CC] text-[#E8EDF3]'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#151C26] text-[#E8EDF3]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-[#D65B65] font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-[#687586]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-[#929DAB] mb-1.5">
            {label}
            {props.required && <span className="text-[#D65B65] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={`block w-full rounded-md border text-sm py-2 px-3 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#4F83CC]/30 bg-[#10151D] disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-[#D65B65] focus:border-[#D65B65] text-[#D65B65] placeholder-[#D65B65]/40'
              : 'border-[#273241] focus:border-[#4F83CC] text-[#E8EDF3] placeholder-[#687586]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#D65B65] font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-[#687586]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
