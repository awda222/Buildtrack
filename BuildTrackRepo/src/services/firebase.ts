/**
 * Firebase initialization — only connects when configured
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { ENV, isFirebaseConfigured } from '../config/env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase SDK if credentials are present
 */
export function initFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
} {
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, db: null, storage: null };
  }

  if (!getApps().length) {
    app = initializeApp(ENV.firebase);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  return { app, auth, db, storage };
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) initFirebase();
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!db) initFirebase();
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!storage) initFirebase();
  return storage;
}
