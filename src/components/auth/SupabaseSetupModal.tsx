import { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileCode2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseSetupModal({ isOpen, onClose }: SupabaseSetupModalProps) {
  const { showToast } = useApp();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'sql' | 'env'>('guide');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const envTemplate = `# Add to your .env or .env.local in project root:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const sqlSchemaSnippet = `-- Run this in Supabase Dashboard -> SQL Editor
-- Tables: profiles, study_tasks, coding_problems, smart_notes, note_categories, focus_sessions, activities
-- Plus Row-Level Security (RLS) policies for complete data isolation.

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Developer',
  username TEXT,
  email TEXT,
  location TEXT DEFAULT 'Remote',
  bio TEXT DEFAULT 'Full-Stack Developer & CS Enthusiast',
  avatar_text TEXT DEFAULT 'DEV',
  plan TEXT DEFAULT 'Pro Plan',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Study Tasks
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  duration_label TEXT NOT NULL DEFAULT '1.0h',
  day TEXT NOT NULL DEFAULT 'Mon',
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Study',
  priority TEXT NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Coding Problems
CREATE TABLE IF NOT EXISTS public.coding_problems (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'LeetCode',
  url TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  topic TEXT NOT NULL DEFAULT 'Algorithms',
  status TEXT NOT NULL DEFAULT 'unsolved',
  acceptance NUMERIC DEFAULT 50.0,
  notes TEXT DEFAULT '',
  code TEXT DEFAULT '',
  language TEXT DEFAULT 'typescript',
  starred BOOLEAN NOT NULL DEFAULT false,
  solved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Smart Notes
CREATE TABLE IF NOT EXISTS public.smart_notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  tags JSONB DEFAULT '[]'::jsonb,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Note Categories
CREATE TABLE IF NOT EXISTS public.note_categories (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'purple',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Focus Sessions
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'focus',
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  task_title TEXT DEFAULT 'Deep Work Session',
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Activities
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  tag TEXT,
  tag_variant TEXT DEFAULT 'purple',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own coding problems" ON public.coding_problems FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own smart notes" ON public.smart_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own note categories" ON public.note_categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own focus sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own activities" ON public.activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`;

  const copyToClipboard = (text: string, type: 'env' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
    showToast({ type: 'success', title: 'Copied to Clipboard! 📋' });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setTestResult({
          success: false,
          message: 'Missing environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env or .env.local and restart Vite dev server.',
        });
        return;
      }

      const { error } = await supabase.from('study_tasks').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        if (error.message.includes('relation "public.study_tasks" does not exist')) {
          setTestResult({
            success: true,
            message: 'Connected to Supabase! Note: Please run the SQL schema script in Supabase SQL Editor to create tables.',
          });
        } else {
          setTestResult({
            success: false,
            message: `Supabase returned: ${error.message}`,
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Connection successful! Supabase client is connected and ready.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to Supabase.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supabase Cloud & Database Integration" maxWidth="xl">
      <div className="space-y-6">
        {/* Status Header */}
        <div className={`p-4 rounded-2xl border flex items-start sm:items-center justify-between gap-4 ${
          isSupabaseConfigured
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {isSupabaseConfigured ? 'Supabase Credentials Configured' : 'Running in Local Storage Mode'}
                </h4>
                <Badge variant={isSupabaseConfigured ? 'emerald' : 'amber'} size="sm">
                  {isSupabaseConfigured ? 'Cloud Active' : 'Local Fallback'}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSupabaseConfigured
                  ? 'Your app is configured with Supabase credentials. Cloud sync and auth are active.'
                  : 'To enable cross-device cloud persistence and PostgreSQL storage, follow the 3 quick steps below.'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            loading={testingConnection}
            icon={RefreshCw}
          >
            Test Connection
          </Button>
        </div>

        {/* Test Result alert */}
        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {testResult.success ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
            <p className="flex-1 leading-relaxed">{testResult.message}</p>
          </div>
        )}

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-dark-600 pb-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            3-Step Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode2 size={13} />
            SQL Schema &amp; RLS Policies
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'env'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Environment Variables (.env)
          </button>
        </div>

        {/* Content by Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-dark-700/60 border border-dark-600/60 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center mb-2.5">
                    1
                  </div>
                  <h5 className="font-semibold text-white mb-1">Create Free Project</h5>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    Go to Supabase.com and click &quot;New Project&quot;. Choose your database region and create a password.
                  </p>
                </div>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3.5 inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                >
                  Open Supabase <ExternalLink size={12} />
                </a>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-dark-700/60 border border-dark-600/60 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center mb-2.5">
                    2
                  </div>
                  <h5 className="font-semibold text-white mb-1">Copy API Keys</h5>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    In Supabase Dashboard, go to <strong>Project Settings &gt; API</strong> and copy your Project URL &amp; anon public key into <code className="text-purple-300 bg-dark-800 px-1 py-0.5 rounded">.env.local</code>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('env')}
                  className="mt-3.5 text-left inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  View .env format &rarr;
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-dark-700/60 border border-dark-600/60 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center mb-2.5">
                    3
                  </div>
                  <h5 className="font-semibold text-white mb-1">Run SQL Schema</h5>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    Open <strong>SQL Editor</strong> in Supabase, paste the ready-to-run schema script with RLS policies, and click <strong>Run</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('sql')}
                  className="mt-3.5 text-left inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  Copy SQL Schema &rarr;
                </button>
              </div>
            </div>

            {/* RLS Security badge */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
              <ShieldCheck size={20} className="text-purple-400 flex-shrink-0" />
              <div className="text-[11px]">
                <span className="font-bold text-white">Row-Level Security (RLS) Enforced: </span>
                <span className="text-gray-400">Every user query is sandboxed at the PostgreSQL kernel level. Users can never view, mutate, or query other students&apos; tasks, notes, or DSA history.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Complete SQL Schema with RLS Policies &amp; Triggers:</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(sqlSchemaSnippet, 'sql')}
                icon={copiedSql ? Check : Copy}
              >
                {copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-dark-900 border border-dark-600 text-xs font-mono text-gray-300 max-h-72 overflow-y-auto leading-relaxed scrollbar-thin">
              {sqlSchemaSnippet}
            </pre>
          </div>
        )}

        {activeTab === 'env' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">File location: <code className="text-purple-300">.env.local</code> in project root</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(envTemplate, 'env')}
                icon={copiedEnv ? Check : Copy}
              >
                {copiedEnv ? 'Copied Template!' : 'Copy .env Template'}
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-dark-900 border border-dark-600 text-xs font-mono text-gray-300 leading-relaxed">
              {envTemplate}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-600">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Zap size={13} className="text-purple-400" />
            <span>Works seamlessly in offline/local storage mode without configuration.</span>
          </div>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
