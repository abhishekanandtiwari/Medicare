import React, { useState } from 'react';
import { X, HeartPulse, Droplets, Moon, Scale, Flame, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function QuickLogVitalsModal({ isOpen, onClose, onMetricAdded }) {
  if (!isOpen) return null;

  const [metricType, setMetricType] = useState('heart_rate');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState(''); // for BP diastolic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const metricConfigs = {
    heart_rate: { label: 'Heart Rate', unit: 'bpm', icon: HeartPulse, placeholder: '72', min: 40, max: 220 },
    bp: { label: 'Blood Pressure', unit: 'mmHg', icon: Activity, placeholderSys: '120', placeholderDia: '80' },
    blood_glucose: { label: 'Blood Glucose', unit: 'mg/dL', icon: Flame, placeholder: '95', min: 40, max: 500 },
    temperature: { label: 'Body Temperature', unit: '°F', icon: Flame, placeholder: '98.6', min: 94, max: 106 },
    water_ml: { label: 'Water Intake', unit: 'ml', icon: Droplets, placeholder: '250', min: 50, max: 5000 },
    sleep_hours: { label: 'Sleep Duration', unit: 'hours', icon: Moon, placeholder: '7.5', min: 1, max: 18 },
    weight: { label: 'Body Weight', unit: 'kg', icon: Scale, placeholder: '70.5', min: 20, max: 300 },
    steps: { label: 'Daily Steps', unit: 'steps', icon: Flame, placeholder: '5000', min: 100, max: 50000 },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (metricType === 'bp') {
        const sys = parseFloat(val1);
        const dia = parseFloat(val2);
        if (!sys || !dia) throw new Error('Please enter both Systolic and Diastolic values.');
        await api.recordHealthMetric({ metric_type: 'bp_systolic', value: sys, unit: 'mmHg' });
        await api.recordHealthMetric({ metric_type: 'bp_diastolic', value: dia, unit: 'mmHg' });
      } else {
        const num = parseFloat(val1);
        if (isNaN(num)) throw new Error('Please enter a valid numeric value.');
        const cfg = metricConfigs[metricType];
        await api.recordHealthMetric({ metric_type: metricType, value: num, unit: cfg.unit });
      }

      // Trigger gamification points
      await api.logGamificationAction('vital_log', 10);

      onMetricAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record metric.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Health Vital</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Metric Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Vital Metric</label>
            <select
              value={metricType}
              onChange={(e) => { setMetricType(e.target.value); setVal1(''); setVal2(''); }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="heart_rate">Heart Rate (bpm)</option>
              <option value="bp">Blood Pressure (Systolic / Diastolic)</option>
              <option value="blood_glucose">Blood Glucose (mg/dL)</option>
              <option value="temperature">Temperature (°F)</option>
              <option value="water_ml">Water Intake (ml)</option>
              <option value="sleep_hours">Sleep Duration (hours)</option>
              <option value="weight">Body Weight (kg)</option>
              <option value="steps">Daily Steps</option>
            </select>
          </div>

          {/* Input Values */}
          {metricType === 'bp' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Systolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={val1}
                  onChange={(e) => setVal1(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Diastolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="80"
                  value={val2}
                  onChange={(e) => setVal2(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {metricConfigs[metricType]?.label} ({metricConfigs[metricType]?.unit})
              </label>
              <input
                type="number"
                step="any"
                placeholder={metricConfigs[metricType]?.placeholder}
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          {/* Gamification bonus reminder */}
          <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✨ Earn +10 Health Points & maintain your tracking streak!
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Reading'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
