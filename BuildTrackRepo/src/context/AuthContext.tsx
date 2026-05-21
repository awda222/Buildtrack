/**
 * Authentication context — manages user session state
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as authService from '../services/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    company?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  isBuilder: boolean;
  isSupervisor: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let active = true;
    const guardTimer = setTimeout(() => {
      if (active) setLoading(false);
    }, 2500);

    authService
      .getCurrentUser()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        clearTimeout(guardTimer);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(guardTimer);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await authService.signIn(email, password);
    setUser(profile);
  }, []);

  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      displayName: string;
      role: UserRole;
      company?: string;
    }) => {
      const profile = await authService.signUp(data);
      setUser(profile);
    },
    []
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isBuilder: user?.role === 'builder',
        isSupervisor: user?.role === 'supervisor',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
