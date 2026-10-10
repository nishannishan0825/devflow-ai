import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SupabaseSetupModal from '../components/auth/SupabaseSetupModal';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loginAsDemo, continueAsGuest, authError, clearError, isConfigured } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Welcome Back!',
        message: 'Logged in successfully.',
      });
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    showToast({
      type: 'info',
      title: 'Logged in as Demo User',
      message: 'Alex Rivera · Pro Plan preview mode',
    });
    navigate(from, { replace: true });
  };

  const handleGuestMode = () => {
    continueAsGuest();
    showToast({
      type: 'info',
      title: 'Guest Mode Activated',
      message: 'Using browser local storage for state persistence.',
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg shadow-xl shadow-purple-950/50 mb-3 group transition-transform hover:scale-105">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            DevFlow <span className="gradient-text">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
            All-in-One Developer Intelligence, DSA Tracker &amp; Focus OS
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 backdrop-blur-xl bg-surface-2/95 border-dark-600/80 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-dark-600/60 mb-6">
            <h2 className="text-base font-bold text-white">Sign In to Your Workspace</h2>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
            >
              <Database size={12} />
              <span>{isConfigured ? 'Cloud Connected' : 'Supabase Setup'}</span>
            </button>
          </div>

          {/* Alert for Supabase error */}
          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="flex-1">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="alex.rivera@devflow.ai"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-700/80 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${
                    formErrors.email ? 'border-red-500/60' : 'border-dark-500 hover:border-dark-400'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast({ type: 'info', title: 'Password Reset', message: 'Check Supabase Auth settings to enable automated magic recovery links.' })}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-700/80 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${
                    formErrors.password ? 'border-red-500/60' : 'border-dark-500 hover:border-dark-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full justify-center shadow-lg shadow-purple-950/50"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-2 px-3 text-gray-500 font-semibold tracking-wider text-[10px]">
                Or Instant Preview
              </span>
            </div>
          </div>

          {/* Demo Login Button */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDemoLogin}
              className="w-full justify-center text-xs font-semibold border-purple-500/30 hover:border-purple-500/60"
              icon={Zap}
            >
              1-Click Demo Login (Alex Rivera)
            </Button>

            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2 text-center text-xs text-gray-400 hover:text-white transition-colors block cursor-pointer"
            >
              Continue as Guest (Local Storage Mode) &rarr;
            </button>
          </div>

          {/* Link to Register */}
          <div className="mt-6 pt-5 border-t border-dark-600/60 text-center text-xs text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300">
              Create an account
            </Link>
          </div>
        </Card>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Row-Level Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>PostgreSQL Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Offline Local Sync</span>
          </div>
        </div>
      </div>

      <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </div>
  );
}
