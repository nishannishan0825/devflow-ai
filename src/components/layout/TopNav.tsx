import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Search,
  Zap,
  Timer,
  CheckCircle2,
  Code2,
  BookOpen,
  Mic,
  Database,
  Cloud,
  RefreshCw,
  LogOut,
  LogIn,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import VoiceCommandModal from '../voice/VoiceCommandModal';
import SupabaseSetupModal from '../auth/SupabaseSetupModal';
import Badge from '../ui/Badge';

interface TopNavProps {
  onMenuClick: () => void;
  onMobileMenuClick: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your learning overview' },
  '/study-planner': { title: 'Study Planner', subtitle: 'Organize your sessions' },
  '/dsa-practice': { title: 'DSA Practice', subtitle: 'Sharpen your skills' },
  '/markdown-focus': { title: 'Markdown Focus', subtitle: 'Distraction-free writing' },
  '/voice-assistant': { title: 'Voice Command Center', subtitle: 'AI-powered voice actions & copilot' },
  '/analytics': { title: 'Analytics', subtitle: 'Track your progress' },
  '/settings': { title: 'Settings', subtitle: 'Customize your experience' },
};

export default function TopNav({ onMenuClick, onMobileMenuClick }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    settings,
    activities,
    pomodoroIsRunning,
    pomodoroSecondsLeft,
    pomodoroMode,
    isSyncing,
    cloudSyncStatus,
    syncWithCloud,
    isSetupModalOpen,
    setIsSetupModalOpen,
  } = useApp();
  const { user, profile, isAuthenticated, isGuest, isConfigured, signOut } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const page = pageTitles[location.pathname] ?? { title: 'DevFlow AI', subtitle: '' };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens voice command center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsVoiceModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/dsa-practice?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 bg-dark-800/80 backdrop-blur-sm border-b border-dark-600 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0 z-20 sticky top-0">
        {/* Desktop menu toggle */}
        <button
          onClick={onMenuClick}
          className="hidden lg:flex p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
          title="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div className="hidden sm:block">
          <h2 className="text-base font-semibold text-white">{page.title}</h2>
          <p className="text-xs text-gray-500">{page.subtitle}</p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Cloud Sync Status Indicator */}
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            cloudSyncStatus === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title={isConfigured ? 'Supabase Database Connected' : 'Running in Local Storage Mode (Click for Cloud Setup)'}
        >
          {isSyncing ? (
            <RefreshCw size={12} className="animate-spin text-purple-400" />
          ) : cloudSyncStatus === 'connected' ? (
            <Cloud size={13} className="text-emerald-400" />
          ) : (
            <Database size={13} className="text-amber-400" />
          )}
          <span>{cloudSyncStatus === 'connected' ? 'Cloud Synced' : 'Local Storage'}</span>
        </button>

        {/* Running Pomodoro pill indicator */}
        {pomodoroIsRunning && (
          <button
            onClick={() => navigate('/markdown-focus')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 animate-pulse-slow hover:bg-purple-500/25 transition-all text-xs font-mono"
          >
            <Timer size={13} className="text-purple-400 animate-spin" />
            <span>{pomodoroMode === 'focus' ? 'Focus' : 'Break'}: {formatTimer(pomodoroSecondsLeft)}</span>
          </button>
        )}

        {/* Global Voice Command Trigger Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-xs font-semibold cursor-pointer shadow-sm shadow-purple-950/20"
          title="Quick Voice Command Center (⌘K)"
        >
          <Mic size={14} className="text-purple-400 animate-pulse" />
          <span className="hidden md:inline">Voice Actions</span>
          <kbd className="hidden md:inline-flex items-center text-[10px] text-gray-400 bg-dark-700 px-1 rounded font-mono">⌘K</kbd>
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 w-44 lg:w-56">
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search problems / notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none flex-1 min-w-0"
          />
          <kbd className="hidden lg:inline-flex items-center text-xs text-gray-600 bg-dark-600 px-1.5 py-0.5 rounded font-mono">↵</kbd>
        </div>

        {/* AI Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1.5">
          <Zap size={12} className="text-purple-400" />
          <span className="text-xs font-medium text-purple-300">{settings.ai.model} AI</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
          >
            <Bell size={18} />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-2 border border-dark-500 rounded-2xl shadow-2xl z-50 p-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-dark-600/60 mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                <span className="text-[11px] text-purple-400">{activities.length} recent</span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {activities.slice(0, 5).map(act => (
                  <div key={act.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-dark-800/60 text-xs">
                    <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                      {act.type === 'problem_solved' ? <Code2 size={12} /> : act.type === 'task_completed' ? <CheckCircle2 size={12} /> : <BookOpen size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-200 truncate">{act.title}</p>
                      <p className="text-[11px] text-gray-500">{act.subtitle}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Account Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 group text-left cursor-pointer rounded-xl p-1 hover:bg-dark-700/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-950/40">
              {profile?.avatarText || settings.profile.avatarText || 'D'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">
                {profile?.name || settings.profile.name}
              </p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <span>{user ? 'Cloud User' : isGuest ? 'Guest User' : 'Local Demo'}</span>
              </p>
            </div>
            <ChevronDown size={13} className="text-gray-500 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-2 border border-dark-500 rounded-2xl shadow-2xl z-50 p-3 animate-scaleUp">
              <div className="pb-3 border-b border-dark-600/60 mb-2 px-1">
                <p className="text-xs font-bold text-white truncate">{profile?.name || settings.profile.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || profile?.email || 'guest@local.dev'}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant={cloudSyncStatus === 'connected' ? 'emerald' : 'amber'} size="sm">
                    {cloudSyncStatus === 'connected' ? 'Supabase Connected' : 'Local Storage'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                {user && (
                  <button
                    onClick={() => {
                      syncWithCloud();
                      setShowUserMenu(false);
                    }}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-colors text-left"
                  >
                    <RefreshCw size={14} className={`text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync with Cloud</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsSetupModalOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-colors text-left"
                >
                  <Database size={14} className="text-blue-400" />
                  <span>Supabase Cloud Setup &amp; SQL</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700 transition-colors text-left"
                >
                  <Sliders size={14} className="text-gray-400" />
                  <span>Settings &amp; Workspace</span>
                </button>

                <div className="pt-2 border-t border-dark-600/60 mt-1">
                  {isAuthenticated && !isGuest ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/login');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-colors text-left font-semibold"
                    >
                      <LogIn size={14} />
                      <span>Sign In / Connect Account</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Voice Command Modal */}
      <VoiceCommandModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Supabase Cloud Setup & SQL Schema Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </>
  );
}
