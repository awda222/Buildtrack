/**
 * Authentication service — Firebase Auth + demo mode fallback
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import { isFirebaseConfigured } from '../config/env';
import { DEMO_CREDENTIALS, DEMO_USER } from '../constants/demoData';
import type { UserProfile, UserRole } from '../types';

const DEMO_SESSION_KEY = '@buildtrack_demo_session';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  company?: string;
}

/**
 * Sign in with email/password
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserProfile> {
  // Demo mode authentication
  if (!isFirebaseConfigured()) {
    const isAdmin =
      email === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;
    const isSupervisor =
      email === DEMO_CREDENTIALS.supervisorEmail &&
      password === DEMO_CREDENTIALS.supervisorPassword;

    if (!isAdmin && !isSupervisor) {
      throw new Error('Invalid credentials. Use demo credentials from README.');
    }

    const profile: UserProfile = {
      ...DEMO_USER,
      email,
      displayName: isSupervisor ? 'Maria Chen' : DEMO_USER.displayName,
      role: isSupervisor ? 'supervisor' : 'builder',
    };

    await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile));
    return profile;
  }

  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not initialized');

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(credential.user);
}

/**
 * Register new user with role
 */
export async function signUp(data: SignUpData): Promise<UserProfile> {
  if (!isFirebaseConfigured()) {
    const profile: UserProfile = {
      id: `demo-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      company: data.company,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile));
    return profile;
  }

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error('Firebase not initialized');

  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  await updateProfile(credential.user, { displayName: data.displayName });

  const profile: UserProfile = {
    id: credential.user.uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    company: data.company,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);
  return profile;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured()) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  const auth = getFirebaseAuth();
  if (auth) await firebaseSignOut(auth);
}

/**
 * Get current session user profile
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) {
    const stored = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    return stored ? (JSON.parse(stored) as UserProfile) : null;
  }

  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;

  return getUserProfile(auth.currentUser);
}

/**
 * Fetch user profile from Firestore
 */
async function getUserProfile(user: User): Promise<UserProfile> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  return {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'User',
    role: 'builder',
    createdAt: new Date().toISOString(),
  };
}
