import { useState, useEffect } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type SyncState = 'online' | 'offline' | 'syncing';

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // This listener fires when all current snapshots are in sync with the backend
    const unsubscribe = onSnapshotsInSync(db, () => {
      // If we were syncing, we are potentially done
      // However, Firestore doesn't provide a direct "is syncing now" flag
      // We rely on this to know when the current local state matches remote
      setIsSyncing(false);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // For UI purposes, we consider "syncing" to be when we are online but have pending writes.
  // Unfortunately, checking pending writes globally is hard without wrapping every operation.
  // Instead, we will use a global "pending writes" counter or similar, but for now
  // let's stick to the simplest signal.

  const syncState: SyncState = !isOnline ? 'offline' : (isSyncing ? 'syncing' : 'online');

  return { isOnline, isSyncing, syncState, setIsSyncing };
}
