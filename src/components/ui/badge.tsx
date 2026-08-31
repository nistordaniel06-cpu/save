import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'purple' | 'subtle';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-0.5 leading-normal',
  };

  const variantClasses = {
    default: 'bg-zinc-100 text-zinc-800 border border-zinc-200/80',
    subtle: 'bg-zinc-50 text-zinc-600 border border-zinc-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    purple: 'bg-violet-50 text-violet-700 border border-violet-200/80',
    outline: 'bg-transparent text-zinc-700 border border-zinc-300',
  };

  return (
    <span
      className={twMerge(clsx(baseClasses, sizeClasses[size], variantClasses[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}

export function ProvenanceBadge({ provenance }: { provenance: string }) {
  switch (provenance) {
    case 'manually_verified':
      return <Badge variant="success" size="sm">Audit Manual SAVE</Badge>;
    case 'supplier_quote':
      return <Badge variant="info" size="sm">Ofertă Partener</Badge>;
    case 'dataset_source':
      return <Badge variant="purple" size="sm">Benchmark Piață RO</Badge>;
    case 'demo':
    default:
      return <Badge variant="default" size="sm">Dataset Demo</Badge>;
  }
}

export function ConfidenceBadge({ confidence }: { confidence: string | number }) {
  if (typeof confidence === 'number') {
    if (confidence >= 85) return <Badge variant="success" size="sm">Încredere {confidence}%</Badge>;
    if (confidence >= 70) return <Badge variant="warning" size="sm">Încredere {confidence}%</Badge>;
    return <Badge variant="danger" size="sm">Încredere {confidence}% (Revizuire)</Badge>;
  }

  switch (confidence) {
    case 'high':
      return <Badge variant="success" size="sm">Încredere Ridicată</Badge>;
    case 'medium':
      return <Badge variant="warning" size="sm">Încredere Medie</Badge>;
    case 'low':
    default:
      return <Badge variant="danger" size="sm">Încredere Scăzută</Badge>;
  }
}
