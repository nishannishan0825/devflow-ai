import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  padding = true,
}: CardProps) {
  return (
    <div className={`bg-surface border border-dark-600 rounded-2xl card-glow ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between ${padding ? 'px-5 pt-5 pb-4' : 'px-5 py-4'} border-b border-dark-600/50`}>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Icon size={14} className="text-purple-400" />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
