import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  QrCode,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  User,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import QRCodeModal from '../components/QRCodeModal';
import { useAuth } from '../context/AuthContext';

export default function AppointmentsPage({ onNavigate }) {
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [loading, setLoading] = useState(true);
  const [selectedQRAppointment, setSelectedQRAppointment] = useState(null);
  
  // Doctor Verification Scanner state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const list = await api.getAppointments();
      setAppointments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you wish to cancel this appointment?")) return;
    try {
      await api.updateAppointment(id, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const handleVerifyQR = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyResult(null);
    try {
      const res = await api.verifyAppointmentQR(verifyCode);
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err.message || 'QR verification failed.');
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredAppointments = appointments.filter((apt) => {
    if (tab === 'upcoming') {
      return apt.appointment_date >= todayStr && (apt.status === 'confirmed' || apt.status === 'pending');
    } else if (tab === 'past') {
      return apt.appointment_date < todayStr || apt.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <MedicalDisclaimer />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Appointment Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track clinical schedules, QR passes, and doctor consultation notes.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('doctors')}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
        >
          + Book New Consultation
        </button>
      </div>

      {/* DOCTOR / RECEPTION SCANNER PANEL */}
      {(role === 'doctor' || role === 'admin') && (
        <div className="rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
            <QrCode className="h-4 w-4" /> QR Appointment Check-In Scanner
          </div>
          <form onSubmit={handleVerifyQR} className="flex gap-2">
            <input
              type="text"
              placeholder="Scan or enter Appointment Pass Code (e.g. APT-B31F98A1)..."
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              Verify Pass
            </button>
          </form>

          {verifyResult && (
            <div className="mt-3 rounded-xl bg-white p-4 shadow-sm border border-emerald-200 dark:bg-slate-900 dark:border-slate-800 text-xs text-slate-800 dark:text-white space-y-1">
              <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> PASS VERIFIED AUTHENTIC
              </div>
              <div>Patient: <strong>{verifyResult.patient_name}</strong></div>
              <div>Doctor: {verifyResult.doctor_name}</div>
              <div>Date & Time: {verifyResult.date} at {verifyResult.time} ({verifyResult.status})</div>
            </div>
          )}

          {verifyError && (
            <div className="mt-2 text-xs text-rose-600 font-semibold">{verifyError}</div>
          )}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 w-fit">
        {[
          { id: 'upcoming', label: 'Upcoming Consultations' },
          { id: 'past', label: 'Past & Completed' },
          { id: 'all', label: 'All Records' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              tab === t.id
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* APPOINTMENT CARDS LIST */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          No {tab} appointments found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {apt.appointment_code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    apt.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : apt.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : apt.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {apt.status}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {apt.consultation_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {apt.doctor_name} • <span className="text-sm font-semibold text-slate-500">{apt.doctor_specialization}</span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    {apt.appointment_date}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    {apt.appointment_time}
                  </span>
                </div>

                {apt.reason && (
                  <div className="text-xs text-slate-500 italic">
                    Reason: "{apt.reason}"
                  </div>
                )}

                {apt.doctor_notes && (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 mt-2">
                    <strong className="text-emerald-600 block mb-0.5">Doctor Consultation Notes:</strong>
                    {apt.doctor_notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedQRAppointment(apt)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                >
                  <QrCode className="h-4 w-4 text-emerald-500" />
                  <span>View QR Code</span>
                </button>

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelAppointment(apt.id)}
                    className="rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* QR MODAL */}
      <QRCodeModal
        isOpen={!!selectedQRAppointment}
        onClose={() => setSelectedQRAppointment(null)}
        appointment={selectedQRAppointment}
      />

    </div>
  );
}
