import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect users according to their role.
  const redirectByRole = (loggedInUser) => {
    const role = String(loggedInUser?.role || '').toLowerCase();

    switch (role) {
      case 'patient':
        navigate('/dashboard');
        break;

      case 'doctor':
        navigate('/doctor-dashboard');
        break;

      case 'admin':
        navigate('/admin-dashboard');
        break;

      default:
        setError(
          `Login succeeded, but the user role "${role || 'unknown'}" is not recognized.`
        );
        break;
    }
  };

  // Handle email and password login.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      redirectByRole(loggedInUser);
    } catch (err) {
      setError(
        err?.message || 'Login failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle demo account login.
  const handleDemo = async (role) => {
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await demoLogin(role);
      redirectByRole(loggedInUser);
    } catch (err) {
      setError(
        err?.message || 'Demo login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo and heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Return to Medicare AI homepage"
          className="flex justify-center items-center gap-2 cursor-pointer mb-3 mx-auto"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md">
            <HeartPulse className="h-7 w-7" />
          </div>

          <span className="text-2xl font-black text-slate-900 dark:text-white">
            Medicare<span className="text-emerald-500">AI</span>
          </span>
        </button>

        <h2 className="text-center text-2xl font-extrabold text-slate-900 dark:text-white">
          Sign In to Your Health Portal
        </h2>

        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Or{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-semibold text-emerald-600 hover:underline"
          >
            create a new patient account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <MedicalDisclaimer compact />

        {/* Demo login buttons */}
        <div className="mb-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2.5 text-center">
            ⚡ Quick 1-Click Demo Login
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('patient')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-emerald-700 shadow-sm hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('doctor')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-teal-700 shadow-sm hover:bg-teal-100 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('admin')}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-[11px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>

              <div className="relative mt-1">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative mt-1">
                <Lock
                  aria-hidden="true"
                  className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <span>
                {loading ? 'Authenticating...' : 'Sign In'}
              </span>

              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
