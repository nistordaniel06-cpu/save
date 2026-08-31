import React from 'react';
import { Card } from './card';
import { Badge } from './badge';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'default',
  icon: Icon,
  trend,
  highlight,
  actionText,
  onAction,
  className,
}: StatCardProps) {
  return (
    <Card
      className={twMerge(
        clsx(
          'p-5 relative flex flex-col justify-between transition-all hover:border-zinc-300',
          highlight && 'ring-1 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white',
          className
        )
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-zinc-500 tracking-wide uppercase">{title}</p>
            {badgeText && (
              <Badge variant={badgeVariant} size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 tracking-tight font-mono">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/60">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || actionText) && (
        <div className="mt-4 pt-3 border-t border-zinc-100/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={clsx(
                  'font-semibold flex items-center gap-0.5',
                  trend.isPositive ? 'text-emerald-600' : 'text-zinc-600'
                )}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>

          {actionText && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-semibold text-zinc-900 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {actionText} →
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
