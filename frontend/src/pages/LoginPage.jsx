import React, { useState } from 'react';
import { HeartPulse, Lock, Mail, ArrowRight, UserCheck, Stethoscope, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function LoginPage({ onNavigate }) {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          onClick={() => onNavigate('landing')}
          className="flex justify-center items-center gap-2 cursor-pointer mb-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md">
            <HeartPulse className="h-7 w-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            Medicare<span className="text-emerald-500">AI</span>
          </span>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-slate-900 dark:text-white">
          Sign In to Your Health Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Or <button onClick={() => onNavigate('register')} className="font-semibold text-emerald-600 hover:underline">create a new patient account</button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        <MedicalDisclaimer compact />

        {/* Demo Fast Login Buttons */}
        <div className="mb-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2.5 text-center">
            ⚡ Quick 1-Click Demo Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('patient')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-emerald-700 shadow-sm hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 transition"
            >
              <UserCheck className="h-4 w-4" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('doctor')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-teal-700 shadow-sm hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700 transition"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
