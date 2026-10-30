import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  Droplets,
  Moon,
  Flame,
  Scale,
  CalendarCheck,
  Pill,
  Sparkles,
  Clock,
  Plus,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Stethoscope,
  ChevronRight,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import QuickLogVitalsModal from '../components/QuickLogVitalsModal';
import QRCodeModal from '../components/QRCodeModal';

export default function PatientDashboard() 
  const navigate = useNavigate();{
  const { elderlyMode, t } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedAppointmentForQR, setSelectedAppointmentForQR] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getPatientDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkMedTaken = async (medId) => {
    try {
      await api.logMedication(medId, 'taken');
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>)}
        </div>
      </div>
    );
  }

  // ELDERLY MODE SIMPLIFIED VIEW
  if (elderlyMode) {
    return (
      <div className="space-y-8">
        <MedicalDisclaimer />

        <div className="rounded-3xl border-4 border-slate-900 bg-white p-8 dark:border-sky-400 dark:bg-slate-900 shadow-xl text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            {t('elderly_greeting')}
          </h1>
          <p className="mt-3 text-2xl font-bold text-slate-600 dark:text-slate-300">
            {t('elderly_subgreeting')}
          </p>
        </div>

        {/* Big Touch Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="flex items-center gap-4 rounded-3xl border-4 border-emerald-600 bg-emerald-500/10 p-6 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 hover:bg-emerald-500/20 active:scale-98 transition text-left"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white flex-shrink-0">
              <Bot className="h-10 w-10" />
            </div>
            <div>
              <div className="text-2xl font-black">{t('elderly_btn_ai')}</div>
              <div className="text-sm font-semibold opacity-80">Ask questions using your voice</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('medications')}
            className="flex items-center gap-4 rounded-3xl border-4 border-teal-600 bg-teal-500/10 p-6 text-teal-800 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-200 hover:bg-teal-500/20 active:scale-98 transition text-left"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white flex-shrink-0">
              <Pill className="h-10 w-10" />
            </div>
            <div>
              <div className="text-2xl font-black">{t('elderly_btn_meds')}</div>
              <div className="text-sm font-semibold opacity-80">View daily pills and mark taken</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('doctors')}
            className="flex items-center gap-4 rounded-3xl border-4 border-sky-600 bg-sky-500/10 p-6 text-sky-800 dark:border-sky-400 dark:bg-sky-950/40 dark:text-sky-200 hover:bg-sky-500/20 active:scale-98 transition text-left"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-white flex-shrink-0">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div>
              <div className="text-2xl font-black">{t('elderly_btn_doctor')}</div>
              <div className="text-sm font-semibold opacity-80">Connect with licensed specialists</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="flex items-center gap-4 rounded-3xl border-4 border-rose-600 bg-rose-600 p-6 text-white hover:bg-rose-700 active:scale-98 transition text-left shadow-lg animate-pulse"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-rose-600 flex-shrink-0">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <div className="text-2xl font-black">{t('elderly_btn_sos')}</div>
              <div className="text-sm font-semibold opacity-90">Call emergency services or family</div>
            </div>
          </button>

        </div>
      </div>
    );
  }

  // STANDARD DASHBOARD VIEW
  const vitals = dashboardData?.health_cards || {};
  const upcomingApt = dashboardData?.upcoming_appointment;
  const nextMed = dashboardData?.next_medication;
  const insights = dashboardData?.ai_insights || [];
  const activities = dashboardData?.recent_activity || [];
  const game = dashboardData?.gamification || { points: 100, current_streak: 1 };

  return (
    <div className="space-y-6">
      
      {/* Safety Notice */}
      <MedicalDisclaimer />

      {/* WELCOME BANNER & GAMIFICATION STREAK */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Medicare-AI Patient Portal
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black">
              {dashboardData?.greeting || 'Welcome 👋'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-xl">
              {t('welcome_sub')}
            </p>
          </div>

          {/* Gamification Streak & Points */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md p-3 border border-white/20">
            <div className="flex items-center gap-2 pr-3 border-r border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow">
                <Flame className="h-6 w-6 fill-slate-900" />
              </div>
              <div>
                <div className="text-lg font-black leading-none">{game.current_streak} {t('gamification_streak')}</div>
                <div className="text-[10px] text-emerald-100">Tracking Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <Award className="h-6 w-6 text-amber-300" />
              <div>
                <div className="text-lg font-black leading-none">{game.points}</div>
                <div className="text-[10px] text-emerald-100">{t('health_points')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VITALS ROW WITH "+ LOG" BUTTON */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Current Health Vitals
          </h2>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('quick_log_vitals')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Heart Rate */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t('heart_rate')}</span>
              <HeartPulse className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {vitals.heart_rate?.value || 72}
              </span>
              <span className="text-xs text-slate-400 font-medium">{vitals.heart_rate?.unit || 'bpm'}</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Normal resting
            </span>
          </div>

          {/* Blood Pressure */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t('blood_pressure')}</span>
              <Activity className="h-4 w-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {vitals.blood_pressure?.systolic || 120}/{vitals.blood_pressure?.diastolic || 80}
              </span>
              <span className="text-xs text-slate-400 font-medium">mmHg</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Optimal
            </span>
          </div>

          {/* Blood Glucose */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t('glucose')}</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {vitals.blood_glucose?.value || 95}
              </span>
              <span className="text-xs text-slate-400 font-medium">mg/dL</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Fasting Normal
            </span>
          </div>

          {/* Water Intake */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t('water_intake')}</span>
              <Droplets className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {vitals.water_ml?.value || 2100}
              </span>
              <span className="text-xs text-slate-400 font-medium">ml</span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              Goal: 2,500 ml
            </span>
          </div>

        </div>
      </div>

      {/* TWO COLUMN GRID: UPCOMING APPOINTMENT + NEXT MEDICATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Appointment Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <CalendarCheck className="h-4 w-4 text-emerald-500" />
                {t('upcoming_appointment')}
              </div>
              {upcomingApt && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {upcomingApt.status}
                </span>
              )}
            </div>

            {upcomingApt ? (
              <div className="mt-4 space-y-2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {upcomingApt.doctor_name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {upcomingApt.doctor_specialization} • {upcomingApt.hospital_name}
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 mt-2">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{upcomingApt.date} at {upcomingApt.time} ({upcomingApt.consultation_type})</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No appointments scheduled.
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            {upcomingApt ? (
              <button
                onClick={() => setSelectedAppointmentForQR(upcomingApt)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <QrCode className="h-4 w-4" />
                <span>Show Appointment QR</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('doctors')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Book with a Doctor →
              </button>
            )}
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              All Appointments →
            </button>
          </div>
        </div>

        {/* Next Medication Reminder Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Pill className="h-4 w-4 text-teal-500" />
                {t('next_medication')}
              </div>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                Scheduled
              </span>
            </div>

            {nextMed ? (
              <div className="mt-4 space-y-2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {nextMed.name} ({nextMed.dosage})
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {nextMed.frequency} • {nextMed.refills_left} refills remaining
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 mt-2">
                  <Clock className="h-3.5 w-3.5 text-teal-500" />
                  <span>Due today at {nextMed.reminder_time}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No active medications scheduled.
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            {nextMed && (
              <button
                onClick={() => handleMarkMedTaken(nextMed.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t('btn_mark_taken')}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('medications')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-auto"
            >
              Medication Schedule →
            </button>
          </div>
        </div>

      </div>

      {/* AI WELLNESS INSIGHTS SECTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('ai_insights')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Non-diagnostic wellness trends and observations calculated from your vitals.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 border text-xs leading-relaxed ${
                ins.type === 'attention'
                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                  : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="font-bold text-sm mb-1">{ins.title}</div>
              <p className="opacity-90">{ins.observation}</p>
              <p className="mt-2 font-semibold">{ins.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            {t('recent_activity')}
          </h3>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            View Full Timeline →
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No recent activity recorded.</div>
          ) : (
            activities.map((act, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {act.subtitle}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QUICK LOG VITALS MODAL */}
      <QuickLogVitalsModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onMetricAdded={fetchDashboard}
      />

      {/* QR CODE MODAL */}
      <QRCodeModal
        isOpen={!!selectedAppointmentForQR}
        onClose={() => setSelectedAppointmentForQR(null)}
        appointment={selectedAppointmentForQR}
      />

    </div>
  );
}
