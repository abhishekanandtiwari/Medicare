import React, { useState } from 'react';
import {
  HeartPulse,
  Bell,
  Sun,
  Moon,
  AlertTriangle,
  Globe,
  User as UserIcon,
  LogOut,
  Accessibility,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ onNavigate, currentTab }) {
  const {
    user,
    role,
    logout,
    theme,
    toggleTheme,
    language,
    setLanguage,
    elderlyMode,
    toggleElderlyMode,
    notifications,
    unreadCount,
    fetchNotifications,
    t
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Platform Name */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-102"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Medicare<span className="text-emerald-500">AI</span>
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Smart Health
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency SOS Button */}
          <button
            onClick={() => onNavigate('emergency')}
            className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition hover:bg-rose-700 active:scale-95 animate-pulse sm:px-4 sm:py-2 sm:text-sm"
            title="Immediate Emergency Assistance"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{t('nav_emergency')}</span>
          </button>

          {/* Elderly Mode Switch */}
          <button
            onClick={toggleElderlyMode}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
              elderlyMode
                ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Toggle Large-Text High-Contrast Elderly Accessibility Mode"
          >
            <Accessibility className="h-4 w-4" />
            <span className="hidden md:inline">{elderlyMode ? t('elderly_mode_on') : t('elderly_mode_title')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:text-sm"
            title="Switch Language (English / हिंदी)"
          >
            <Globe className="h-4 w-4 text-emerald-500" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-white">Notifications</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-emerald-600 hover:underline dark:text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800/60 mt-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 text-xs transition rounded-lg ${
                          n.is_read ? 'opacity-70' : 'bg-emerald-50/50 dark:bg-emerald-950/20 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                          {!n.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="Mark Read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">{n.message}</p>
                        <span className="mt-1 block text-[10px] text-slate-400">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-800 sm:pl-3">
              <div
                onClick={() => onNavigate('profile')}
                className="flex cursor-pointer items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                title={t('btn_logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              {t('btn_login')}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
