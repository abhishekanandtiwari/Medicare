import React from 'react';
import {
  LayoutDashboard,
  Bot,
  ActivitySquare,
  Stethoscope,
  CalendarCheck,
  Pill,
  FileText,
  BarChart3,
  Clock,
  AlertTriangle,
  UserCog,
  ShieldCheck,
  Cpu,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, onSelectTab }) {
  const { role, t } = useAuth();

  const patientNav = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'ai-assistant', label: t('nav_ai_assistant'), icon: Bot, badge: 'Smart AI' },
    { id: 'symptoms', label: t('nav_symptoms'), icon: ActivitySquare },
    { id: 'doctors', label: t('nav_doctors'), icon: Stethoscope },
    { id: 'appointments', label: t('nav_appointments'), icon: CalendarCheck },
    { id: 'medications', label: t('nav_medications'), icon: Pill },
    { id: 'records', label: t('nav_records'), icon: FileText },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3 },
    { id: 'timeline', label: t('nav_timeline'), icon: Clock },
    { id: 'emergency', label: t('nav_emergency'), icon: AlertTriangle, highlight: true },
    { id: 'profile', label: t('nav_profile'), icon: UserCog },
  ];

  const doctorNav = [
    { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'My Appointments', icon: CalendarCheck },
    { id: 'records', label: 'Patient Medical Records', icon: FileText },
    { id: 'profile', label: 'Profile & Schedule', icon: UserCog },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'System Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users & Doctors', icon: ShieldCheck },
    { id: 'admin-logs', label: 'Security Audit Logs', icon: ClipboardList },
    { id: 'admin-dsa', label: 'DSA Diagnostics', icon: Cpu, badge: 'Live Metrics' },
  ];

  let items = patientNav;
  if (role === 'doctor') {
    items = doctorNav;
  } else if (role === 'admin') {
    items = adminNav;
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 flex flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white/70 p-3 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 shadow-sm">
        
        {/* Navigation Items */}
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500'
                    : item.highlight
                    ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-rose-500' : 'text-slate-400 group-hover:text-emerald-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clinical Assurance Tag */}
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60 px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DSA & AI Decision Engine
          </div>
          <p className="mt-1 text-[10px] leading-relaxed">
            Trie autocomplete, Medical Graph BFS, and Max-Heap Triage operational.
          </p>
        </div>

      </div>
    </aside>
  );
}
