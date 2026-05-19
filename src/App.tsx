/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, signIn, signOut, db } from './lib/firebase';
import { UserProfile, Project } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import { Layout } from './components/Layout';
import { LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user defaults to 'builder' for demo purposes
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || 'User',
            role: 'builder',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-stone-200/50"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900">BuildTrack</h1>
            <p className="mt-2 text-stone-500">Site management for SMB builders</p>
          </div>
          
          <button
            onClick={() => signIn()}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-4 py-4 text-white hover:bg-orange-700 transition-all font-medium shadow-lg shadow-orange-200"
          >
            <LogIn className="h-5 w-5" />
            Sign in with Google
          </button>
          
          <div className="text-center">
            <p className="text-xs text-stone-400">
              Smartphone-first • Works on 4G • Site-Aware AI
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Layout 
        onHome={() => setSelectedProjectId(null)}
        onSignOut={signOut}
        profile={profile}
      >
        <AnimatePresence mode="wait">
          {!selectedProjectId ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Dashboard onSelectProject={setSelectedProjectId} />
            </motion.div>
          ) : (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ProjectDetail 
                projectId={selectedProjectId} 
                onBack={() => setSelectedProjectId(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </AuthContext.Provider>
  );
}

