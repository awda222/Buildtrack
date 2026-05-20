import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LayoutDashboard, LogOut, Home, User as UserIcon, Wifi, WifiOff, RefreshCw, Users, Bell, X, AlertCircle, HardHat, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { motion, AnimatePresence } from 'motion/react';
import { SiteNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  onSites: () => void;
  onCommunity: () => void;
  onAssistant: () => void;
  onSignOut: () => void;
  profile: UserProfile | null;
  activeView: 'dashboard' | 'community' | 'project' | 'assistant' | 'sites';
  notifications: SiteNotification[];
  unreadCount: number;
  onMarkRead: () => void;
  lastAlert: SiteNotification | null;
}

export function Layout({ 
  children, onHome, onSites, onCommunity, onAssistant, onSignOut, profile, activeView, 
  notifications, unreadCount, onMarkRead, lastAlert 
}: LayoutProps) {
  const { syncState } = useSyncStatus();
  const [showNotifications, setShowNotifications] = useState(false);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <HardHat className="h-4 w-4 text-blue-600" />;
      case 'low_material': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'task_completed': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      default: return <Clock className="h-4 w-4 text-stone-400" />;
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-stone-50 text-stone-900 font-sans">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 w-full glass md:hidden">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2" onClick={onHome}>
            <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center cursor-pointer shadow-lg shadow-orange-600/20">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-extrabold tracking-tight text-2xl text-green-900 font-display">BuildTrack</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => { setShowNotifications(true); onMarkRead(); }}
               className="relative p-2 text-stone-600"
             >
               <Bell className="h-6 w-6" />
               {unreadCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-orange-600 border-2 border-white" />
               )}
             </button>
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

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden h-screen w-72 border-r border-white/5 bg-green-900 md:sticky md:top-0 md:flex md:flex-col shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-black/30 pointer-events-none" />
          
          <div className="relative flex h-24 items-center gap-3 px-8">
            <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center cursor-pointer shadow-lg shadow-orange-600/30" onClick={onHome}>
              <span className="text-white font-black text-base">B</span>
            </div>
            <div className="flex flex-col cursor-pointer" onClick={onHome}>
              <span className="font-black tracking-tight text-2xl text-white font-display leading-[0.9]">BuildTrack</span>
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] mt-1">Management</span>
            </div>
          </div>
          
          <nav className="relative flex-1 space-y-1.5 p-6" aria-label="Main Navigation">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onHome}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-5 py-4 transition-all font-bold group focus:outline-none focus:ring-2 focus:ring-orange-500",
                (activeView === 'dashboard')
                  ? "bg-white/10 text-white shadow-xl shadow-black/10 ring-1 ring-white/20" 
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={(activeView === 'dashboard') ? "page" : undefined}
            >
              <LayoutDashboard aria-hidden="true" className={cn("h-5 w-5 transition-transform group-hover:scale-110", (activeView === 'dashboard') ? "text-orange-500" : "text-stone-500")} />
              Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSites}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-5 py-4 transition-all font-bold group focus:outline-none focus:ring-2 focus:ring-orange-500",
                (activeView === 'sites' || activeView === 'project')
                  ? "bg-white/10 text-white shadow-xl shadow-black/10 ring-1 ring-white/20"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={(activeView === 'sites' || activeView === 'project') ? "page" : undefined}
            >
              <Home aria-hidden="true" className={cn("h-5 w-5 transition-transform group-hover:scale-110", (activeView === 'sites' || activeView === 'project') ? "text-orange-500" : "text-stone-500")} />
              Sites
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCommunity}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-5 py-4 transition-all font-bold group focus:outline-none focus:ring-2 focus:ring-orange-500",
                activeView === 'community'
                  ? "bg-white/10 text-white shadow-xl shadow-black/10 ring-1 ring-white/20"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={activeView === 'community' ? "page" : undefined}
            >
              <Users aria-hidden="true" className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeView === 'community' ? "text-orange-500" : "text-stone-500")} />
              Community
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAssistant}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-5 py-4 transition-all font-bold group focus:outline-none focus:ring-2 focus:ring-orange-500",
                activeView === 'assistant'
                  ? "bg-white/10 text-white shadow-xl shadow-black/10 ring-1 ring-white/20"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={activeView === 'assistant' ? "page" : undefined}
            >
              <Sparkles aria-hidden="true" className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeView === 'assistant' ? "text-orange-500" : "text-stone-500")} />
              Assistant
            </motion.button>

            <div className="pt-10 pb-3 px-5" aria-hidden="true">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/20">Operations</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowNotifications(true); onMarkRead(); }}
              className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-stone-400 hover:text-white hover:bg-white/5 transition-all font-bold group focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="View notifications"
            >
              <div className="flex items-center gap-3 transition-transform group-hover:translate-x-1">
                <Bell aria-hidden="true" className="h-5 w-5 text-stone-500 group-hover:text-orange-500" />
                Live Alerts
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-lg shadow-orange-600/40 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </nav>

          <div className="relative p-6 mt-auto">
            <div className={cn(
              "mb-6 rounded-2xl p-5 border transition-all",
              syncState === 'offline' ? "bg-red-900/30 border-red-500/20" : 
              syncState === 'syncing' ? "bg-orange-900/30 border-orange-500/20" :
              "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full ring-4",
                  syncState === 'offline' ? "bg-red-500 ring-red-500/20" : 
                  syncState === 'syncing' ? "bg-orange-500 ring-orange-500/20 animate-spin" :
                  "bg-green-500 ring-green-500/20"
                )}></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                  {syncState === 'offline' ? 'Offline' : 
                   syncState === 'syncing' ? 'Syncing...' : 'Live Sync'}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-400 font-medium italic">
                {syncState === 'offline' ? 'Bridge disconnected. Buffering changes...' :
                 syncState === 'syncing' ? 'Pushing updates to central registry...' :
                 'Site telemetry is active and synchronized.'}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6 px-2">
               {profile?.photoURL ? (
                 <img src={profile.photoURL} className="h-12 w-12 rounded-2xl border-2 border-white/10 shadow-lg" alt="Avatar" />
               ) : (
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
                   <UserIcon className="h-6 w-6 text-stone-400" />
                 </div>
               )}
               <div className="overflow-hidden">
                 <p className="text-sm font-black truncate text-white leading-tight uppercase font-display">{profile?.displayName}</p>
                 <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">{profile?.role}</p>
               </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-stone-500 hover:text-red-400 transition-colors font-bold group"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs uppercase tracking-widest">Terminate Session</span>
            </motion.button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden min-h-[100dvh] w-full relative">
          <div className="max-w-7xl mx-auto p-4 pb-24 md:p-8">
            {children}
          </div>
          
          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 z-50 w-full h-[calc(4rem+env(safe-area-inset-bottom))] bg-white border-t border-stone-200 flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onHome} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                (activeView === 'dashboard') ? "text-orange-600" : "text-stone-400"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Dash</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onSites} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                (activeView === 'sites' || activeView === 'project') ? "text-orange-600" : "text-stone-400"
              )}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sites</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onCommunity} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeView === 'community' ? "text-orange-600" : "text-stone-400"
              )}
            >
              <Users className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Comm</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onAssistant} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeView === 'assistant' ? "text-orange-600" : "text-stone-400"
              )}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Assistant</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowNotifications(true); onMarkRead(); }}
              className="flex flex-col items-center gap-1 text-stone-400 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-orange-600" />
              ) }
              <span className="text-[10px] font-bold uppercase tracking-widest">Alerts</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onSignOut} 
              className="flex flex-col items-center gap-1 text-stone-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
            </motion.button>
          </nav>

          {/* Alert Toast */}
          <AnimatePresence>
            {lastAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-8 md:right-8 md:left-auto md:w-96"
              >
                <div className="flex items-start gap-4 rounded-xl bg-stone-900 p-4 shadow-2xl text-white border border-white/10">
                  <div className="rounded-lg bg-white/10 p-2">
                    {getNotifIcon(lastAlert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{lastAlert.projectName}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Live</span>
                    </div>
                    <h4 className="mt-1 text-xs font-bold uppercase tracking-tight">{lastAlert.title}</h4>
                    <p className="mt-0.5 text-[10px] text-stone-400 font-medium">{lastAlert.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification Sidebar */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 z-[70] h-full w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="flex h-20 items-center justify-between border-b border-stone-100 px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-100 p-2">
                        <Bell className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-900 uppercase tracking-tight">Active Alerts</h3>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="rounded-full p-2 hover:bg-stone-50 transition-colors">
                      <X className="h-6 w-6 text-stone-400" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="rounded-full bg-stone-50 p-6 mb-4">
                          <Bell className="h-12 w-12 text-stone-200" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-stone-400">No active alerts</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={cn(
                            "group relative rounded-xl border p-4 transition-all",
                            notif.isRead ? "border-stone-100" : "border-orange-100 bg-orange-50/10"
                          )}
                        >
                          <div className="flex gap-4">
                            <div className="rounded-lg bg-stone-50 p-2 h-fit">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">{notif.projectName}</span>
                                <span className="text-[8px] font-bold text-stone-400">{formatDate(notif.timestamp)}</span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-tight">{notif.title}</h4>
                              <p className="mt-1 text-[11px] leading-relaxed text-stone-500 font-medium">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
