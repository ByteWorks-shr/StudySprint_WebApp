import React, { useState } from 'react';
import {
  Flame,
  Search,
  Mic,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
  FileText,
  Brain,
  Menu,
  X,
  LogIn,
  LogOut,
  ArrowLeft,
  User as UserIcon,
  GraduationCap,
} from 'lucide-react';
import { ViewTab, UserStats } from '../types';
import { loginWithGoogle, logoutUser } from '../firebase';
import type { User } from 'firebase/auth';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  stats: UserStats | null;
  currentUser: User | null;
  onOpenSearch: () => void;
  onOpenMic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  currentUser,
  onOpenSearch,
  onOpenMic,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'syllabus', label: 'Understand My Syllabus', icon: GraduationCap },
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'pdfs', label: 'PDF Library', icon: BookOpen },
    { id: 'smart-plan', label: 'Smart Plan', icon: Brain },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'chat', label: 'AI Tutor', icon: Sparkles },
  ];

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  StudySprint
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Smart Study & Materials Hub
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Study Streak Badge */}
            <div
              title={`${stats?.currentStreak || 1} day study streak!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-xs"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>{stats?.currentStreak || 1}d</span>
              <span className="hidden md:inline text-[10px] text-amber-400/80 font-normal">Streak</span>
            </div>

            {/* Quick Search Bar with Back, Search, Mic, and Cross symbols */}
            <div className="flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-1.5 py-0.5 transition shadow-xs gap-1">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs transition"
                title="Search materials, PDFs, topics, tasks"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Search</span>
                <kbd className="hidden lg:inline text-[10px] text-slate-500 bg-slate-900 px-1 rounded border border-slate-700">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={onOpenMic}
                className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition"
                title="Voice search / transcribe"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenSearch}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition"
                title="Clear / Close Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition focus:outline-hidden"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">
                        {currentUser.displayName || 'Student'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Cloud Sync</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await logoutUser();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithGoogle()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs shadow-indigo-600/30 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
