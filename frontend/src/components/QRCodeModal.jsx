import React from 'react';
import { X, QrCode, Download, ShieldCheck, Calendar, Clock, User, Stethoscope } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, appointment }) {
  if (!isOpen || !appointment) return null;

  const handleDownload = () => {
    if (!appointment.qr_code_data) return;
    const link = document.createElement('a');
    link.href = appointment.qr_code_data;
    link.download = `Appointment_${appointment.appointment_code || 'QR'}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-slide-up text-center">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <QrCode className="h-6 w-6" />
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          Appointment Verification QR
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Present this secure QR code at the clinic reception for instant check-in.
        </p>

        {/* QR Code Graphic */}
        <div className="my-4 flex justify-center">
          <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 p-3 bg-white shadow-inner">
            {appointment.qr_code_data ? (
              <img
                src={appointment.qr_code_data}
                alt="Appointment QR Code"
                className="h-48 w-48 object-contain"
              />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-xl bg-slate-50 p-3 text-left text-xs dark:bg-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between font-mono font-bold text-emerald-700 dark:text-emerald-400">
            <span>Pass Code:</span>
            <span>{appointment.appointment_code}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
            <span>{appointment.doctor_name || 'Dr. Specialist'} ({appointment.doctor_specialization || 'Clinical'})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span>{appointment.appointment_date} at {appointment.appointment_time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Status: <strong className="capitalize">{appointment.status}</strong></span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Download QR Pass
          </button>
        </div>

      </div>
    </div>
  );
}
