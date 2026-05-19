import React from 'react';
import { UserProfile } from '../types';
import { LayoutDashboard, LogOut, Home, User as UserIcon, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSyncStatus } from '../hooks/useSyncStatus';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  onSignOut: () => void;
  profile: UserProfile | null;
}

export function Layout({ children, onHome, onSignOut, profile }: LayoutProps) {
  const { syncState } = useSyncStatus();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-100 bg-white/80 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2" onClick={onHome}>
            <div className="h-8 w-8 rounded bg-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">BT</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-green-900">BuildTrack</span>
          </div>
          <div className="flex items-center gap-4">
             {syncState === 'offline' && <WifiOff className="h-4 w-4 text-red-500" />}
             {syncState === 'syncing' && <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />}
             {profile?.photoURL ? (
               <img src={profile.photoURL} className="h-8 w-8 rounded-full border border-stone-200" alt="Avatar" />
             ) : (
               <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center">
                 <UserIcon className="h-4 w-4 text-stone-500" />
               </div>
             )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden h-screen w-64 border-r border-stone-300 bg-green-900 md:sticky md:top-0 md:flex md:flex-col">
          <div className="flex h-20 items-center gap-2 px-6">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-xl text-white">BuildTrack</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest leading-none">Management</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            <button
              onClick={onHome}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 bg-green-800 text-white transition-colors font-medium border border-green-700/50"
            >
              <LayoutDashboard className="h-5 w-5" />
              Overview
            </button>
            <button
              onClick={onHome}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-stone-300 hover:bg-green-800 transition-colors font-medium"
            >
              <Home className="h-5 w-5" />
              Sites
            </button>
          </nav>

          <div className="p-4 mt-auto">
            <div className={cn(
              "mb-4 rounded-xl p-4 border transition-all",
              syncState === 'offline' ? "bg-red-900/20 border-red-800/50" : 
              syncState === 'syncing' ? "bg-orange-900/20 border-orange-800/50" :
              "bg-green-800 border-green-700/50"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  syncState === 'offline' ? "bg-red-500" : 
                  syncState === 'syncing' ? "bg-orange-500 animate-spin" :
                  "bg-green-400 animate-pulse"
                )}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-200">
                  {syncState === 'offline' ? 'Offline Mode' : 
                   syncState === 'syncing' ? 'Syncing Changes' : 'Site Connected'}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-400">
                {syncState === 'offline' ? 'Changes saved locally. Syncing on reconnect.' :
                 syncState === 'syncing' ? 'Uploading queued data to secure servers...' :
                 'All site changes are synchronized in real-time.'}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-4 px-2">
               {profile?.photoURL ? (
                 <img src={profile.photoURL} className="h-10 w-10 rounded-full border border-green-800" alt="Avatar" />
               ) : (
                 <div className="h-10 w-10 rounded-full bg-green-800 flex items-center justify-center">
                   <UserIcon className="h-5 w-5 text-white" />
                 </div>
               )}
               <div className="overflow-hidden">
                 <p className="text-sm font-semibold truncate text-white">{profile?.displayName}</p>
                 <p className="text-xs text-stone-400 capitalize">{profile?.role}</p>
               </div>
            </div>
            <button
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-stone-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden min-h-screen w-full relative">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
          
          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-stone-200 flex items-center justify-around px-4 md:hidden">
            <button onClick={onHome} className="flex flex-col items-center gap-1 text-orange-600">
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
            </button>
            <button onClick={onSignOut} className="flex flex-col items-center gap-1 text-stone-400">
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
}
