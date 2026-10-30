import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [specialization, setSpecialization] = useState('Cardiology');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!normalizedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Validate patient age before submitting.
    if (role === 'patient') {
      const numericAge = Number(age);

      if (
        age.trim() === '' ||
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        setError('Please enter a valid age between 1 and 120.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: trimmedName,
        email: normalizedEmail,
        password,
        role,
        ...(role === 'patient'
          ? {
              age: Number(age),
              gender,
              blood_group: bloodGroup
            }
          : {
              specialization
            })
      };

      const registeredUser = await register(payload);

      const registeredRole = String(
        registeredUser?.role || role
      ).toLowerCase();

      // Redirect according to the registered user's role.
      if (registeredRole === 'doctor') {
        navigate('/doctor-dashboard', { replace: true });
      } else if (registeredRole === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);

      setError(
        err?.message ||
          'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
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
          Create Your Health Account
        </h2>

        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-emerald-600 hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Registration Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">

        <MedicalDisclaimer compact />

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Role Selection */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                setError('');
              }}
              aria-pressed={role === 'patient'}
              className={`w-1/2 rounded-lg py-2 text-xs font-bold transition ${
                role === 'patient'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Patient Registration
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('doctor');
                setError('');
              }}
              aria-pressed={role === 'doctor'}
              className={`w-1/2 rounded-lg py-2 text-xs font-bold transition ${
                role === 'doctor'
                  ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Doctor Registration
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Full Name
              </label>

              <div className="relative mt-1">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

                <input
                  id="register-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

                <input
                  id="register-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={6}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Patient Information */}
            {role === 'patient' ? (
              <>
                <div>
                  <label
                    htmlFor="register-age"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Age
                  </label>

                  <input
                    id="register-age"
                    type="number"
                    min="1"
                    max="120"
                    step="1"
                    required
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="register-gender"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Gender
                    </label>

                    <select
                      id="register-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="register-blood"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Blood Group
                    </label>

                    <select
                      id="register-blood"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* Doctor Information */
              <div>
                <label
                  htmlFor="register-specialization"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Specialization
                </label>

                <select
                  id="register-specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Doctor accounts may require verification before accessing clinical features.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </span>

              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
