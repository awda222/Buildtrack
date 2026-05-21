import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, HardHat, Compass, Ruler, Users, Building2, PaintBucket, Building, User as UserIcon, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { Role } from '../types';
import { cn } from '../lib/utils';
import { signInWithEmail, signUpWithEmail, signInAsGuest } from '../lib/firebase';

interface LoginViewProps {
  onSignInCalled: (role: Role) => void;
}

const ROLES: { id: Role; label: string; icon: any; desc: string }[] = [
  { id: 'builder', label: 'Builder', icon: Building2, desc: 'Manage projects & resources' },
  { id: 'site_manager', label: 'Site Manager', icon: HardHat, desc: 'Oversee daily operations' },
  { id: 'architect', label: 'Architect', icon: Ruler, desc: 'Design & monitor progress' },
  { id: 'contractor', label: 'Contractor', icon: PaintBucket, desc: 'Execute specialized work' },
  { id: 'supervisor', label: 'Supervisor', icon: Compass, desc: 'Track team attendance' },
];

export default function LoginView({ onSignInCalled }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('builder');
  const [domain, setDomain] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!domain || !userId || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    // Construct email from userId and domain for Firebase auth
    const cleanDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
    const cleanUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    const email = `${cleanUserId}@${cleanDomain || 'company.com'}`;

    try {
      onSignInCalled(selectedRole);
      try {
        await signInWithEmail(email, password);
      } catch (signInErr: any) {
        // If user not found, try to sign up automatically for demo purposes
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          await signUpWithEmail(email, password);
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled. Please enable it in the Firebase Console -> Authentication -> Sign-in method.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative w-full items-center justify-center bg-stone-900 p-4 font-sans overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/40 via-stone-900 to-stone-900" />
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="blueprint-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 rounded-[2rem] bg-stone-950/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Left Panel - Branding */}
        <div className="relative p-10 md:p-14 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-900 to-stone-950 border-r border-white/5">
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="bg-orange-500 p-2.5 rounded-xl text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">BuildTrack</h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-stone-400 text-lg leading-relaxed max-w-sm"
            >
              The unified site management platform for SMB builders. Connect your team, track progress, and manage everything from structural planning to final finish.
            </motion.p>
          </div>

          <div className="relative z-10 mt-16 md:mt-10 overflow-y-auto max-h-[40vh] md:max-h-none custom-scrollbar">
            <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">
              {ROLES.map((role, idx) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group",
                      isSelected 
                        ? "bg-stone-800/80 border-orange-500 shadow-lg shadow-orange-500/10" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="activeRoleGlow"
                        className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={cn(
                      "p-2 rounded-xl mb-3 transition-colors",
                      isSelected ? "bg-orange-500 text-white" : "bg-stone-800 text-stone-400 group-hover:text-stone-300"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "font-bold text-sm mb-1",
                      isSelected ? "text-orange-50" : "text-stone-300"
                    )}>{role.label}</span>
                    <span className={cn(
                      "text-[10px] leading-tight",
                      isSelected ? "text-orange-200" : "text-stone-500"
                    )}>{role.desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Join Your Workspace</h2>
            <p className="text-stone-400 text-sm">Enter your enterprise credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Domain Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourcompany.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">User ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. jdoe01"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4 space-y-3"
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-4 py-4 text-white hover:bg-orange-500 transition-all font-bold shadow-xl shadow-orange-900/20 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                {loading ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : <LogIn className="h-5 w-5 relative z-10" />}
                <span className="relative z-10 tracking-wide">{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    onSignInCalled(selectedRole);
                    await signInAsGuest();
                  } catch (err: any) {
                    console.error(err);
                    if (err.code === 'auth/operation-not-allowed') {
                       setError('Guest authentication is disabled. Please enable "Anonymous" in Firebase Console -> Authentication -> Sign-in method.');
                    } else {
                       setError(err.message || 'Guest login failed');
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-stone-800 px-4 py-4 text-white hover:bg-stone-700 transition-all font-bold shadow-xl shadow-black/20 overflow-hidden border border-white/5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 tracking-wide">Continue as Guest</span>
              </button>
            </motion.div>
          </form>
          
          <p className="text-center text-[11px] text-stone-600 mt-6 max-w-xs mx-auto">
            By signing in, you agree to your enterprise workspace policy. Connection is secure and managed locally.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
