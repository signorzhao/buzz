import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
      <input
        className={`w-full bg-white text-gray-900 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 px-4 py-3.5 text-[17px] placeholder-gray-400 outline-none transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
};