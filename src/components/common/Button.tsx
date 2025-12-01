import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'success' | 'error' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-600 active:bg-blue-700',
    success: 'bg-success text-white hover:bg-green-600 active:bg-green-700',
    error: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent text-primary hover:bg-gray-100 active:bg-gray-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;