import React from 'react';
import clsx from 'clsx';

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
}) => {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-text">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={clsx(
          'px-4 py-3 rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'resize-none',
          error ? 'border-error' : 'border-gray-300',
          disabled && 'bg-gray-100 cursor-not-allowed',
          'w-full'
        )}
      />
      <div className="flex justify-between items-center">
        {error && <span className="text-sm text-error">{error}</span>}
        {maxLength && (
          <span className="text-sm text-gray-500 ml-auto">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default Textarea;