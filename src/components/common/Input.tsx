import React from 'react';
import clsx from 'clsx';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-text">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={clsx(
          'px-4 py-3 rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          error ?  'border-error' : 'border-gray-300',
          disabled && 'bg-gray-100 cursor-not-allowed',
          'w-full'
        )}
      />
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  );
};

export default Input;