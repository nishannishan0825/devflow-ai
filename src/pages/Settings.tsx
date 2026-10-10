import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Code2,
  Zap,
  Download,
  Upload,
  Trash2,
  Check,
  Timer,
  RotateCcw,
  Database,
  Cloud,
  RefreshCw,
  Server,
  Lock,
  LogOut,
  FileCode2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SupabaseSetupModal from '../components/auth/SupabaseSetupModal';
import { useNavigate } from 'react-router-dom';

type SettingTab = 'profile' | 'database' | 'pomodoro' | 'appearance' | 'notifications' | 'ai' | 'privacy' | 'integrations';

const tabs: { id: SettingTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'database', label: 'Cloud & Database', icon: Database },
  { id: 'pomodoro', label: 'Focus & Timer', icon: Timer },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Copilot', icon: Zap },
  { id: 'privacy', label: 'Data & Privacy', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Code2 },
];

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${
        value ? 'gradient-bg shadow-sm' : 'bg-dark-500'
      }`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
        value ? 'translate-x-5' : ''
      }`} />
    </button>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
}

function SettingRow({ label, description, children, badge }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-dark-600/50 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-semibold text-white">{label}</p>
          {badge && <Badge variant="purple" size="sm">{badge}</Badge>}
        </div>
        {description && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const accentColors = [
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Amber', class: 'bg-amber-500' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    updateProfile,
    updatePomodoroSettings,
    resetAllDataToDefaults,
    exportDataAsJSON,
    importDataFromJSON,
    showToast,
    isSyncing,
    lastSyncedAt,
    cloudSyncStatus,
    syncWithCloud,
    migrateLocalToCloud,
    isSetupModalOpen,
    setIsSetupModalOpen,
  } = useApp();

  const { user, profile, isAuthenticated, isGuest, isConfigured, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [selectedAccent, setSelectedAccent] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);

  // Profile Form state
  const [name, setName] = useState(settings.profile.name);
  const [username, setUsername] = useState(settings.profile.username);
  const [email, setEmail] = useState(settings.profile.email);
  const [location, setLocation] = useState(settings.profile.location);
  const [bio, setBio] = useState(settings.profile.bio);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Dev User',
      username: username.trim() || 'devuser',
      email: email.trim() || 'dev@example.com',
      location: location.trim(),
      bio: bio.trim(),
      avatarText: name.trim().charAt(0).toUpperCase() || 'D',
    });
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    await migrateLocalToCloud();
    setIsMigrating(false);
  };

  const handleExportData = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devflow-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'Data Exported', message: 'Full JSON backup downloaded' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Customize your DevFlow AI environment, Supabase database, Pomodoro intervals &amp; profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs navigation sidebar */}
        <div className="bg-surface border border-dark-600 rounded-2xl p-2.5 card-glow h-fit space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'sidebar-item-active text-purple-400 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-xs sm:text-sm">{tab.label}</span>
              {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <Card title="Developer Profile" subtitle="Your identity and public credentials" icon={User}>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Avatar Banner */}
                  <div className="flex items-center gap-4 pb-5 border-b border-dark-600/50">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-950/40">
                      {name.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{name || 'Dev User'}</p>
                      <p className="text-xs text-gray-400">{user?.email || email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="purple" size="sm">{settings.profile.plan}</Badge>
                        <Badge variant={user ? 'emerald' : 'amber'} size="sm">
                          {user ? 'Cloud Authenticated' : isGuest ? 'Guest User' : 'Local Mode'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username Handle</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bio &amp; CS Focus</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Share your coding goals, current tech stack, and focus topics..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" size="md">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Account Actions */}
              <Card title="Account Session" subtitle="Authentication &amp; active session">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {isAuthenticated && !isGuest ? `Logged in as ${user?.email || profile?.email}` : 'Browsing in Guest Mode'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {isAuthenticated && !isGuest
                        ? 'All actions sync automatically to your PostgreSQL Supabase database.'
                        : 'Sign in to enable cloud synchronization across multiple browsers and devices.'}
                    </p>
                  </div>
                  {isAuthenticated && !isGuest ? (
                    <Button variant="danger" size="sm" onClick={() => signOut()} icon={LogOut}>
                      Sign Out
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => navigate('/login')} icon={User}>
                      Sign In / Register
                    </Button>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Cloud & Database Tab */}
          {activeTab === 'database' && (
            <>
              <Card title="Supabase Database & Cloud Synchronization" subtitle="Manage your PostgreSQL database, RLS policies, and sync" icon={Database}>
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isConfigured
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <Server size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {isConfigured ? 'Supabase Database Connected' : 'Local Storage Mode Active'}
                          </h4>
                          <Badge variant={isConfigured ? 'emerald' : 'amber'} size="sm">
                            {isConfigured ? 'Active' : 'Unconfigured'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isConfigured
                            ? `Status: ${cloudSyncStatus} · Last Synced: ${lastSyncedAt || 'Just now'}`
                            : 'Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in .env.local for full cloud sync.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsSetupModalOpen(true)}
                        icon={FileCode2}
                      >
                        Setup Guide &amp; SQL
                      </Button>
                    </div>
                  </div>

                  {/* Sync & Migration Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Cloud Sync */}
                    <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-600 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Cloud size={16} className="text-purple-400" />
                          <h5 className="text-xs sm:text-sm font-bold text-white">Cloud Data Refresh</h5>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Fetch latest tasks, DSA problems, notes, and pomodoro history from your Supabase database.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => syncWithCloud()}
                          loading={isSyncing}
                          icon={RefreshCw}
                        >
                          Sync With Cloud Now
                        </Button>
                      </div>
                    </div>

                    {/* Migrate Local to Cloud */}
                    <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-600 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Upload size={16} className="text-blue-400" />
                          <h5 className="text-xs sm:text-sm font-bold text-white">Migrate Local Data to Cloud</h5>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Upload your current local study planner tasks, DSA practice problems, and markdown notes into Supabase PostgreSQL.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleMigrate}
                          loading={isMigrating}
                          icon={Upload}
                        >
                          Upload Local Records
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Database Tables Overview */}
                  <div className="pt-4 border-t border-dark-600/50">
                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Database Tables &amp; RLS Status</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      {[
                        { table: 'public.profiles', desc: 'User credentials & preferences' },
                        { table: 'public.study_tasks', desc: 'Planner tasks & schedules' },
                        { table: 'public.coding_problems', desc: 'DSA tracker & solutions' },
                        { table: 'public.smart_notes', desc: 'Markdown notes & tags' },
                        { table: 'public.note_categories', desc: 'Category metadata' },
                        { table: 'public.focus_sessions', desc: 'Pomodoro timer history' },
                        { table: 'public.activities', desc: 'Activity audit logs' },
                      ].map((t, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-dark-700/60 border border-dark-600/60">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] text-purple-300 font-semibold">{t.table}</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <Lock size={10} /> RLS
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Pomodoro Tab */}
          {activeTab === 'pomodoro' && (
            <Card title="Focus & Pomodoro Timer Configuration" icon={Timer}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Focus Duration (mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={settings.pomodoro.focusDuration}
                      onChange={e => updatePomodoroSettings({ focusDuration: Number(e.target.value) || 25 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Short Break (mins)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={settings.pomodoro.shortBreakDuration}
                      onChange={e => updatePomodoroSettings({ shortBreakDuration: Number(e.target.value) || 5 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Long Break (mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={settings.pomodoro.longBreakDuration}
                      onChange={e => updatePomodoroSettings({ longBreakDuration: Number(e.target.value) || 15 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-700 border border-dark-500 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <SettingRow label="Audio Chimes & Sound Effects" description="Play audio cues on focus completion and break alerts">
                    <Toggle
                      value={settings.pomodoro.soundEnabled}
                      onChange={v => updatePomodoroSettings({ soundEnabled: v })}
                    />
                  </SettingRow>

                  <SettingRow label="Auto-Start Breaks" description="Automatically start break countdown when focus concludes">
                    <Toggle
                      value={settings.pomodoro.autoStartBreaks}
                      onChange={v => updatePomodoroSettings({ autoStartBreaks: v })}
                    />
                  </SettingRow>

                  <SettingRow label="Auto-Start Focus Sessions" description="Automatically start next work session after break ends">
                    <Toggle
                      value={settings.pomodoro.autoStartFocus}
                      onChange={v => updatePomodoroSettings({ autoStartFocus: v })}
                    />
                  </SettingRow>
                </div>
              </div>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card title="Interface & Theme Appearance" icon={Palette}>
              <SettingRow label="Dark Theme Mode" description="DevFlow AI optimized dark palette with neon accents">
                <Toggle
                  value={settings.appearance.darkMode}
                  onChange={v => updateSettings({ appearance: { ...settings.appearance, darkMode: v } })}
                />
              </SettingRow>

              <SettingRow label="Smooth Micro-Animations" description="Enable physics-based motion and transition effects">
                <Toggle
                  value={settings.appearance.animations}
                  onChange={v => updateSettings({ appearance: { ...settings.appearance, animations: v } })}
                />
              </SettingRow>

              <div className="py-4 border-b border-dark-600/50">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Accent Color Palette</p>
                <div className="flex items-center gap-3">
                  {accentColors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedAccent(i);
                        updateSettings({ appearance: { ...settings.appearance, accentColor: c.name } });
                      }}
                      className={`w-9 h-9 rounded-xl ${c.class} flex items-center justify-center transition-all cursor-pointer ${
                        selectedAccent === i ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    >
                      {selectedAccent === i && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow label="Font Scale" description="Adjust text readability and density">
                <select
                  value={settings.appearance.fontSize}
                  onChange={e => updateSettings({ appearance: { ...settings.appearance, fontSize: e.target.value as any } })}
                  className="px-3 py-1.5 rounded-xl bg-dark-700 border border-dark-500 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Small">Compact (Small)</option>
                  <option value="Medium">Standard (Medium)</option>
                  <option value="Large">Spacious (Large)</option>
                </select>
              </SettingRow>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card title="Notification Triggers & Alerts" icon={Bell}>
              <SettingRow label="Daily Study Reminder" description="Gentle reminder to plan today's tasks and solve DSA">
                <Toggle
                  value={settings.notifications.dailyReminder}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, dailyReminder: v } })}
                />
              </SettingRow>

              <SettingRow label="Streak Alerts" description="Alert when daily coding streak is at risk of expiring">
                <Toggle
                  value={settings.notifications.streakAlert}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, streakAlert: v } })}
                />
              </SettingRow>

              <SettingRow label="Weekly Progress Digest" description="Summary report of problems solved and study hours">
                <Toggle
                  value={settings.notifications.weeklyReport}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, weeklyReport: v } })}
                />
              </SettingRow>

              <SettingRow label="Browser Push Notifications" description="Allow native desktop toast alerts">
                <Toggle
                  value={settings.notifications.browser}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, browser: v } })}
                />
              </SettingRow>
            </Card>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <Card title="AI Copilot Preferences" icon={Zap}>
              <SettingRow label="Automated Hints & Strategy" description="Provide proactive algorithmic hints on difficult problems" badge="Pro">
                <Toggle
                  value={settings.ai.autoHints}
                  onChange={v => updateSettings({ ai: { ...settings.ai, autoHints: v } })}
                />
              </SettingRow>

              <SettingRow label="Voice Input & Speech Synthesis" description="Enable microphone recognition and audio narration" badge="Pro">
                <Toggle
                  value={settings.ai.voiceEnabled}
                  onChange={v => updateSettings({ ai: { ...settings.ai, voiceEnabled: v } })}
                />
              </SettingRow>

              <SettingRow label="Context-Aware Problem Assistance" description="AI inspects your solved bank and notes for tailored recommendations">
                <Toggle
                  value={settings.ai.contextAware}
                  onChange={v => updateSettings({ ai: { ...settings.ai, contextAware: v } })}
                />
              </SettingRow>

              <div className="pt-4 border-t border-dark-600/50">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">AI Engine Persona</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['Balanced', 'Precise', 'Creative'] as const).map(model => (
                    <button
                      key={model}
                      onClick={() => updateSettings({ ai: { ...settings.ai, model } })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.ai.model === model
                          ? 'gradient-bg border-transparent text-white shadow-md'
                          : 'bg-dark-800 border-dark-500 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{model}</span>
                        {settings.ai.model === model && <Check size={13} />}
                      </div>
                      <p className="text-[10px] opacity-80">
                        {model === 'Balanced' ? 'Optimal for general DSA & study' : model === 'Precise' ? 'Strict Big-O proofs & logic' : 'Brainstorming & architectures'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === 'privacy' && (
            <>
              <Card title="Data Management & Local Storage" subtitle="Export or backup your complete workspace state" icon={Shield}>
                <div className="space-y-3">
                  {/* Export */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                        <Download size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">Export Full Workspace</p>
                        <p className="text-[11px] text-gray-400">Download all tasks, problems, notes, and pomodoro logs as JSON</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" icon={Download} onClick={handleExportData}>
                      Download JSON
                    </Button>
                  </div>

                  {/* Import */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-dark-800/60 border border-dark-600 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">Restore from Backup</p>
                        <p className="text-[11px] text-gray-400">Upload a valid DevFlow AI JSON backup file</p>
                      </div>
                    </div>
                    <label className="inline-flex items-center justify-center rounded-xl font-medium transition-all bg-dark-600 border border-dark-400 text-gray-300 hover:text-white hover:bg-dark-500 text-xs px-3 py-1.5 gap-1.5 cursor-pointer">
                      <Upload size={13} />
                      Upload Backup
                      <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>
                  </div>

                  {/* Reset */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                        <RotateCcw size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-red-300">Reset All Data to Defaults</p>
                        <p className="text-[11px] text-gray-400">Restores initial seed tasks, problems, and notes</p>
                      </div>
                    </div>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => setIsResetConfirmOpen(true)}>
                      Reset Workspace
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <Card title="Connected Integrations" subtitle="Connect external coding and productivity tools" icon={Code2}>
              {[
                { name: 'LeetCode Sync', desc: 'Auto-sync solved problems and acceptance metrics', connected: true, icon: '🟠' },
                { name: 'GeeksforGeeks API', desc: 'Import practice problems and article bookmarks', connected: true, icon: '🟢' },
                { name: 'GitHub Repositories', desc: 'Commit solutions directly to your personal algorithms repo', connected: true, icon: '🐙' },
                { name: 'Notion Workspace', desc: 'Sync smart notes to your Notion engineering databases', connected: false, icon: '📝' },
                { name: 'Google Calendar', desc: 'Push study blocks directly to your weekly calendar', connected: false, icon: '📅' },
              ].map((integration, i) => (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-dark-600/50 last:border-0">
                  <div className="text-2xl">{integration.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white">{integration.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{integration.desc}</p>
                  </div>
                  {integration.connected ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald">Connected</Badge>
                      <Button size="sm" variant="ghost" onClick={() => showToast({ type: 'info', title: `Disconnected ${integration.name}` })}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => showToast({ type: 'success', title: `Connected ${integration.name}` })}>
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllDataToDefaults}
        title="Reset All Application Data"
        message="Are you sure you want to reset all data back to original defaults? All customized problems, tasks, and notes will be re-initialized."
        confirmText="Reset Everything"
        variant="danger"
      />

      {/* Supabase Setup & SQL Schema Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}
