import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SupabaseSetupModal from '../components/auth/SupabaseSetupModal';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, authError, clearError, isConfigured } = useAuth();
  const { showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const errs: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Your full name or handle is required';
    }

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

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Account Registered! 🎉',
        message: result.message || 'Welcome to DevFlow AI.',
      });
      navigate('/dashboard', { replace: true });
    }
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
            Create your account &amp; activate secure cloud synchronization
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 backdrop-blur-xl bg-surface-2/95 border-dark-600/80 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-dark-600/60 mb-6">
            <h2 className="text-base font-bold text-white">Create Developer Account</h2>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
            >
              <Database size={12} />
              <span>{isConfigured ? 'Supabase Ready' : 'Setup Cloud'}</span>
            </button>
          </div>

          {/* Alert for Auth error */}
          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="flex-1">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Full Name / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) setFormErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="e.g. Maya Chen"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-700/80 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${
                    formErrors.fullName ? 'border-red-500/60' : 'border-dark-500 hover:border-dark-400'
                  }`}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.fullName}</p>
              )}
            </div>

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
                  placeholder="maya.chen@university.edu"
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
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <ShieldCheck size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-700/80 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${
                    formErrors.confirmPassword ? 'border-red-500/60' : 'border-dark-500 hover:border-dark-400'
                  }`}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.confirmPassword}</p>
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
                Create Account &amp; Start
              </Button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-5 border-t border-dark-600/60 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
              Sign in here
            </Link>
          </div>
        </Card>

        {/* Security notice */}
        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Protected with PostgreSQL Row-Level Security policies</span>
        </div>
      </div>

      <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </div>
  );
}
