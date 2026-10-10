interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const colorMap = {
  purple: 'from-purple-500 to-purple-400',
  blue: 'from-blue-500 to-blue-400',
  cyan: 'from-cyan-500 to-cyan-400',
  emerald: 'from-emerald-500 to-emerald-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'purple',
  size = 'md',
  showValue = true,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          <div>
            {label && <p className="text-sm font-medium text-white">{label}</p>}
            {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
          </div>
          {showValue && (
            <span className="text-sm font-semibold text-gray-300">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-dark-600 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
