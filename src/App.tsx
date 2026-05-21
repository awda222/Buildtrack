/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext, lazy, Suspense, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, signOut, db } from './lib/firebase';
import { UserProfile, Project, TabType, Role } from './types';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from './hooks/useNotifications';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const AssistantView = lazy(() => import('./components/AssistantView'));
const LoginView = lazy(() => import('./components/LoginView'));

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<TabType | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'dashboard' | 'sites' | 'community' | 'assistant'>('dashboard');
  const { notifications, unreadCount, markAllAsRead, lastAlert } = useNotifications(user);

  useEffect(() => {
    const handleAuth = async (user: User | null) => {
      const isLocal = localStorage.getItem('local_guest') === 'true';
      if (isLocal) {
        const pendingRole = localStorage.getItem('pendingRoleSelection') as Role | null;
        setUser({ uid: 'local-guest-123', email: 'guest@buildtrack.demo', displayName: 'Guest User' } as User);
        setProfile({
            uid: 'local-guest-123',
            email: 'guest@buildtrack.demo',
            displayName: 'Guest User',
            role: pendingRole || 'builder',
            photoURL: '',
            createdAt: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const pendingRole = localStorage.getItem('pendingRoleSelection') as Role | null;
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'user@buildtrack.demo',
              displayName: user.displayName || 'User',
              role: pendingRole || 'builder',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString()
            };
            localStorage.removeItem('pendingRoleSelection');
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
            console.error("Firestore error while getting user:", e);
            // Fallback to local profile if DB fails
            setProfile({
              uid: user.uid,
              email: user.email || 'user@buildtrack.demo',
              displayName: user.displayName || 'User',
              role: 'builder',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString()
            });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuth);
    
    const onLocalAuthChange = () => handleAuth(auth.currentUser);
    window.addEventListener('authChange', onLocalAuthChange);
    
    // Initial check
    if (localStorage.getItem('local_guest') === 'true') {
        handleAuth(null);
    }

    return () => {
        unsubscribe();
        window.removeEventListener('authChange', onLocalAuthChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-stone-50">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      }>
        <LoginView 
          onSignInCalled={(role) => {
            localStorage.setItem('pendingRoleSelection', role);
          }} 
        />
      </Suspense>
    );
  }

  const handleSelectProject = (id: string, tab?: TabType) => {
    setSelectedProjectId(id);
    setInitialTab(tab);
  };

  const handleNavigate = (view: 'sites' | 'community' | 'assistant' | 'dashboard') => {
    setSelectedProjectId(null);
    setInitialTab(undefined);
    setCurrentView(view);
  };

  const authValue = useMemo(() => ({ user, profile, loading }), [user, profile, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      <Layout 
        onHome={() => handleNavigate('dashboard')}
        onSites={() => handleNavigate('sites')}
        onCommunity={() => handleNavigate('community')}
        onAssistant={() => handleNavigate('assistant')}
        activeView={selectedProjectId ? 'project' : currentView}
        onSignOut={signOut}
        profile={profile}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markAllAsRead}
        lastAlert={lastAlert}
      >
        <Suspense fallback={
          <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-stone-50">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        }>
          <AnimatePresence mode="wait">
            {selectedProjectId ? (
              <motion.div
                key="project"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProjectDetail 
                  projectId={selectedProjectId} 
                  initialTab={initialTab}
                  onBack={() => {
                    setSelectedProjectId(null);
                    setInitialTab(undefined);
                  }} 
                />
              </motion.div>
            ) : currentView === 'sites' ? (
              <motion.div
                key="sites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Dashboard onSelectProject={handleSelectProject} displayMode="sites" onNavigate={handleNavigate} />
              </motion.div>
            ) : currentView === 'community' ? (
              <motion.div
                key="community"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CommunityView />
              </motion.div>
            ) : currentView === 'assistant' ? (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AssistantView />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Dashboard onSelectProject={handleSelectProject} displayMode="dashboard" onNavigate={handleNavigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </Layout>
    </AuthContext.Provider>
  );
}

