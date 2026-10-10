interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const variantClasses = {
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  red: 'bg-red-500/10 text-red-300 border-red-500/20',
  gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function Badge({ children, variant = 'purple', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${variantClasses[variant]} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {children}
    </span>
  );
}
