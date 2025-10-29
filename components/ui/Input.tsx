'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
