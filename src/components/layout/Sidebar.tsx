import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Code2,
  FileText,
  Mic,
  BarChart3,
  Settings,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/study-planner', icon: CalendarDays, label: 'Study Planner' },
  { to: '/dsa-practice', icon: Code2, label: 'DSA Practice' },
  { to: '/markdown-focus', icon: FileText, label: 'Markdown Focus' },
  { to: '/voice-assistant', icon: Mic, label: 'Voice Assistant' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-16'
        } bg-dark-800 border-r border-dark-600 relative z-30 flex-shrink-0`}
      >
        <SidebarContent isOpen={isOpen} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <Logo />
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} showLabel={true} onClick={onMobileClose} />
          ))}
        </nav>
        <SidebarFooter showLabel={true} />
      </aside>
    </>
  );
}

function SidebarContent({ isOpen }: { isOpen: boolean }) {
  return (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-dark-600 ${!isOpen && 'justify-center'}`}>
        <Logo />
        {isOpen && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold gradient-text whitespace-nowrap">DevFlow AI</h1>
            <p className="text-xs text-gray-500 whitespace-nowrap">Smart Dev Toolkit</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className={`px-2 mb-2 ${isOpen ? 'block' : 'hidden'}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Main</p>
        </div>
        {navItems.slice(0, 5).map((item) => (
          <NavItem key={item.to} {...item} showLabel={isOpen} />
        ))}
        <div className={`px-2 my-2 ${isOpen ? 'block' : 'hidden'}`}>
          <div className="border-t border-dark-600 my-2" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mt-3">Insights</p>
        </div>
        {!isOpen && <div className="border-t border-dark-600 my-2 mx-2" />}
        {navItems.slice(5).map((item) => (
          <NavItem key={item.to} {...item} showLabel={isOpen} />
        ))}
      </nav>

      <SidebarFooter showLabel={isOpen} />
    </>
  );
}

function Logo() {
  return (
    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-900/40">
      <Zap size={16} className="text-white" />
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  showLabel: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, showLabel, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={!showLabel ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group relative ${
          isActive
            ? 'sidebar-item-active text-purple-400 font-semibold'
            : 'text-gray-400 hover:text-white hover:bg-dark-600'
        } ${!showLabel ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-purple-400' : 'group-hover:text-white'}`} />
          {showLabel && <span className="text-sm">{label}</span>}
          {isActive && showLabel && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarFooter({ showLabel }: { showLabel: boolean }) {
  const { settings, stats } = useApp();

  return (
    <div className={`p-4 border-t border-dark-600 ${!showLabel && 'flex justify-center'}`}>
      {showLabel ? (
        <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-white">{settings.profile.plan}</span>
          </div>
          <p className="text-[11px] text-gray-400">{stats.totalProblemsSolved} problems solved · {stats.totalStudyHours}h focus</p>
          <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <div className="h-full progress-bar rounded-full" style={{ width: `${Math.min(100, stats.accuracyRate)}%` }} />
          </div>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center" title={settings.profile.plan}>
          <Sparkles size={14} className="text-purple-400" />
        </div>
      )}
    </div>
  );
}
