import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  const sizeStyles = "px-4 py-3.5 text-[17px]"; // iOS standard tap target sizeish
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-blue-600 text-white shadow-sm hover:bg-blue-700";
      break;
    case 'secondary':
      variantStyles = "bg-gray-200 text-gray-900 hover:bg-gray-300";
      break;
    case 'danger':
      variantStyles = "bg-red-500 text-white hover:bg-red-600";
      break;
    case 'ghost':
      variantStyles = "bg-transparent text-blue-600 hover:bg-blue-50";
      break;
  }

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyles} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};