import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  gradient?: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-purple-400',
  gradient = 'from-purple-500/10 to-blue-500/10',
  subtitle,
}: StatCardProps) {
  return (
    <div className={`bg-surface border border-dark-600 rounded-2xl p-5 card-glow card-glow-hover transition-all duration-300 cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up'
              ? 'text-emerald-400 bg-emerald-400/10'
              : trend === 'down'
              ? 'text-red-400 bg-red-400/10'
              : 'text-gray-400 bg-gray-400/10'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
