import React, { useState, useEffect } from 'react';
import {
  ActivitySquare,
  Search,
  Plus,
  X,
  AlertTriangle,
  Stethoscope,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function SymptomAnalyzerPage({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Fever']);
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState('Moderate');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Trie-based autocomplete as user types
  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      api.autocompleteSymptoms(searchTerm)
        .then((res) => {
          setSuggestions(res.suggestions || []);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const addSymptom = (name) => {
    if (!selectedSymptoms.includes(name)) {
      setSelectedSymptoms([...selectedSymptoms, name]);
    }
    setSearchTerm('');
    setSuggestions([]);
  };

  const removeSymptom = (name) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== name));
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to assess.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await api.analyzeSymptoms({
        symptoms: selectedSymptoms,
        duration,
        severity
      });
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const popularSymptoms = [
    'Headache', 'Fever', 'Cough (dry)', 'Sore throat',
    'Abdominal pain', 'Shortness of breath', 'Chest pain', 'Dizziness', 'Joint pain'
  ];

  return (
    <div className="space-y-6">
      
      <MedicalDisclaimer />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ActivitySquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Symptom Assessment Engine
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated with Trie prefix matching, Medical Knowledge Graph, and clinical triage rules.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INPUT COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            
            {/* Search Input with Trie Autocomplete */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Search Symptoms (Trie-Powered)
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type e.g. head, chest, cough..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="mt-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-800">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addSymptom(s.name)}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-xs text-left hover:bg-emerald-50 dark:hover:bg-slate-700"
                    >
                      <span className="font-semibold text-slate-800 dark:text-white">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Symptoms Badges */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Selected Symptoms ({selectedSymptoms.length})
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2 min-h-12 rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                {selectedSymptoms.length === 0 ? (
                  <span className="text-xs text-slate-400">No symptoms added yet.</span>
                ) : (
                  selectedSymptoms.map((sym, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      <span>{sym}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(sym)}
                        className="rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Quick Add Popular Symptoms */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Commonly Selected:</div>
              <div className="flex flex-wrap gap-1.5">
                {popularSymptoms.map((ps, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addSymptom(ps)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    + {ps}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option>Less than 24 hours</option>
                <option>1-2 days</option>
                <option>3-5 days</option>
                <option>Over a week</option>
                <option>More than 2 weeks</option>
              </select>
            </div>

            {/* Severity Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {['Mild', 'Moderate', 'Severe'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      severity === sev
                        ? sev === 'Severe'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600 font-semibold dark:bg-rose-950/40 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <span>{loading ? 'Evaluating Symptoms...' : 'Analyze Health Concerns'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* RESULTS COLUMN (7 COLS) */}
        <div className="lg:col-span-7">
          {analysisResult ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 animate-slide-up">
              
              {/* Risk Level Category Banner */}
              <div className={`rounded-2xl p-4 border ${
                analysisResult.risk_level === 'Urgent'
                  ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200'
                  : analysisResult.risk_level === 'Moderate'
                  ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider">Clinical Guidance Category</div>
                  <span className="rounded-full bg-white/80 dark:bg-black/40 px-3 py-1 text-xs font-black uppercase">
                    {analysisResult.risk_level} Priority
                  </span>
                </div>
                <div className="mt-2 text-xl font-black">{analysisResult.category}</div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{analysisResult.summary}</p>
              </div>

              {/* Red Flags if any */}
              {analysisResult.red_flags?.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 text-rose-600 mb-1">
                    <AlertTriangle className="h-4 w-4" /> Potential Urgent Indicators:
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.red_flags.map((rf, i) => (
                      <span key={i} className="rounded-md bg-rose-200/80 dark:bg-rose-900/60 px-2 py-0.5 font-bold">
                        {rf}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Differential Possibilities from Clinical Graph */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Potential Conditions for Clinical Discussion
                </h3>
                <div className="space-y-2">
                  {analysisResult.possible_explanations?.map((cond, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <span className="font-semibold text-slate-800 dark:text-white">{cond.name}</span>
                      <span className="text-[11px] text-slate-400">Knowledge Graph Score: {cond.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Medical Specialties */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recommended Specialist Consultations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.recommended_specialties?.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      <Stethoscope className="h-4 w-4 text-emerald-600" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to Ask Your Doctor */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  Suggested Questions For Your Doctor
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {analysisResult.questions_for_doctor?.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-500">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Step Action */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onNavigate('doctors')}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Book Recommended Doctor Consultation</span>
                </button>
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Discuss with AI Assistant →
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 h-full">
              <ActivitySquare className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                No Assessment Yet
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Select your symptoms, specify duration and severity, then click "Analyze Health Concerns" to view categorical clinical guidance.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
