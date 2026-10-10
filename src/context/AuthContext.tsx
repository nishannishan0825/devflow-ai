import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatarText: string;
  plan: string;
  isDemoUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AuthUserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loginAsDemo: () => void;
  continueAsGuest: () => void;
  clearError: () => void;
  updateLocalProfile: (updates: Partial<AuthUserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUserProfile = {
  id: 'demo-user-devflow-001',
  email: 'alex.rivera@devflow.ai',
  name: 'Alex Rivera',
  avatarText: 'AR',
  plan: 'Pro Plan',
  isDemoUser: true,
};

const GUEST_STORAGE_KEY = 'devflow_guest_session';
const DEMO_AUTH_KEY = 'devflow_demo_auth_active';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Check active Supabase session
          const { data: { session: existingSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (existingSession && isMounted) {
            setSession(existingSession);
            setUser(existingSession.user);
            const userMeta = existingSession.user.user_metadata || {};
            const fullName = userMeta.full_name || existingSession.user.email?.split('@')[0] || 'Developer';
            setProfile({
              id: existingSession.user.id,
              email: existingSession.user.email || '',
              name: fullName,
              avatarText: fullName.substring(0, 2).toUpperCase(),
              plan: 'Pro Cloud Member',
              isDemoUser: false,
            });
            setIsGuest(false);
          } else if (localStorage.getItem(DEMO_AUTH_KEY) === 'true') {
            setProfile(DEMO_USER);
            setIsGuest(false);
          }
        } else {
          // Supabase credentials not provided: check demo login or guest state
          const isDemoActive = localStorage.getItem(DEMO_AUTH_KEY) === 'true';
          if (isDemoActive) {
            setProfile(DEMO_USER);
            setIsGuest(false);
          } else {
            // Default to guest mode for effortless exploration
            setIsGuest(true);
            setProfile(DEMO_USER);
          }
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Setup listener if Supabase is active
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const userMeta = newSession.user.user_metadata || {};
          const fullName = userMeta.full_name || newSession.user.email?.split('@')[0] || 'Developer';
          setProfile({
            id: newSession.user.id,
            email: newSession.user.email || '',
            name: fullName,
            avatarText: fullName.substring(0, 2).toUpperCase(),
            plan: 'Pro Cloud Member',
            isDemoUser: false,
          });
          setIsGuest(false);
          localStorage.removeItem(DEMO_AUTH_KEY);
        } else if (localStorage.getItem(DEMO_AUTH_KEY) === 'true') {
          setProfile(DEMO_USER);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Sign up with email, password, full name
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback demo registration when Supabase is not connected
        const newDemoUser: AuthUserProfile = {
          id: `user-${Date.now()}`,
          email,
          name: fullName || email.split('@')[0],
          avatarText: (fullName || email).substring(0, 2).toUpperCase(),
          plan: 'Local Member (Demo)',
          isDemoUser: true,
        };
        setProfile(newDemoUser);
        setIsGuest(false);
        localStorage.setItem(DEMO_AUTH_KEY, 'true');
        setIsLoading(false);
        return {
          success: true,
          message: 'Account created in Local Demo Mode! Configure Supabase in .env to enable Cloud Sync.',
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setProfile({
          id: data.user!.id,
          email: data.user!.email || email,
          name: fullName,
          avatarText: fullName.substring(0, 2).toUpperCase(),
          plan: 'Pro Cloud Member',
          isDemoUser: false,
        });
        setIsGuest(false);
        localStorage.removeItem(DEMO_AUTH_KEY);
      }

      setIsLoading(false);
      return {
        success: true,
        message: data.session ? 'Registration successful!' : 'Confirmation link sent to your email!',
      };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Registration failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback demo login when Supabase is not configured
        const newDemoUser: AuthUserProfile = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          avatarText: email.substring(0, 2).toUpperCase(),
          plan: 'Local Member (Demo)',
          isDemoUser: true,
        };
        setProfile(newDemoUser);
        setIsGuest(false);
        localStorage.setItem(DEMO_AUTH_KEY, 'true');
        setIsLoading(false);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      const userMeta = data.user.user_metadata || {};
      const fullName = userMeta.full_name || data.user.email?.split('@')[0] || 'Developer';
      setProfile({
        id: data.user.id,
        email: data.user.email || email,
        name: fullName,
        avatarText: fullName.substring(0, 2).toUpperCase(),
        plan: 'Pro Cloud Member',
        isDemoUser: false,
      });
      setIsGuest(false);
      localStorage.removeItem(DEMO_AUTH_KEY);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Login failed. Please check your email and password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsGuest(true);
      localStorage.removeItem(DEMO_AUTH_KEY);
      localStorage.setItem(GUEST_STORAGE_KEY, 'true');
      setIsLoading(false);
    }
  }, []);

  // Quick 1-click Demo Login
  const loginAsDemo = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(DEMO_USER);
    setIsGuest(false);
    localStorage.setItem(DEMO_AUTH_KEY, 'true');
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setAuthError(null);
  }, []);

  // Continue as Guest
  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setProfile(DEMO_USER);
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setAuthError(null);
  }, []);

  // Update profile locally
  const updateLocalProfile = useCallback((updates: Partial<AuthUserProfile>) => {
    setProfile(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const isAuthenticated = Boolean(user || (profile && !isGuest));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated,
        isGuest,
        isConfigured: isSupabaseConfigured,
        isLoading,
        authError,
        signUp,
        signIn,
        signOut,
        loginAsDemo,
        continueAsGuest,
        clearError,
        updateLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
