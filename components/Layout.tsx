
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import UserAvatar from './UserAvatar';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
  hasConnections?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab, unreadCount, hasConnections }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return <>{children}</>;

  /* Role-based navigation */
  const navItems = user?.role === 'mentor'
    ? [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'sessions', label: 'My Sessions', icon: '📅' },
      { id: 'requests', label: 'Requests', icon: '📩' },
      { id: 'chat', label: 'Chat', icon: '💬' },
      { id: 'resource-hub', label: 'Resource Hub', icon: '📚' },
    ]
    : [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'mentors', label: 'Find Mentors', icon: '🔍' },
      { id: 'sessions', label: 'My Sessions', icon: '📅' },
      { id: 'chat', label: 'Chat', icon: '💬' },
      { id: 'resource-hub', label: 'Resource Hub', icon: '📚' },
    ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col relative z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-blue-600 flex items-center gap-3 tracking-tight">
            <span className="text-3xl bg-blue-50 p-2 rounded-xl shadow-sm border border-blue-100">🧩</span>
            MentorLink
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl ${activeTab === item.id ? 'brightness-0 invert' : ''}`}>{item.icon}</span>
                {item.label}
              </div>
              {item.id === 'chat' && unreadCount ? unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Core</p>
            <p className="text-[10px] font-bold text-blue-500">v1.2.4 Production</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-tr from-slate-50 via-white to-blue-50/30">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 md:px-8 flex justify-between items-center sticky top-0 z-10 h-28">
          <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
            {activeTab.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              {/* Date & Time display */}
              <div className="flex items-center gap-3 mb-3 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 shadow-inner">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{formattedDate}</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span className="text-[10px] font-mono font-black text-slate-600">{formattedTime}</span>
              </div>

              {/* Profile section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-3 text-right hover:bg-slate-50 p-2 rounded-2xl transition-colors cursor-pointer text-left"
                >
                  <div className="hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-none bg-slate-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">{user.role}</p>
                  </div>
                  <div className="relative">
                    <UserAvatar src={user.avatar} name={user.name} role={user.role} size={44} className="rounded-full ring-2 ring-blue-500/10 shadow-lg" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </button>

                <div className="h-10 w-px bg-slate-200"></div>

                <NotificationBell userId={user.id} />

                <div className="h-10 w-px bg-slate-200"></div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white border border-slate-100 active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl w-full mx-auto relative">
          {/* Subtle background decoration in content area */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          <div className="relative z-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
