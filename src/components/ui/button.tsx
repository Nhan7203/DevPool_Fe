import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-xl font-medium transition-all duration-150 focus:outline-none';

  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
