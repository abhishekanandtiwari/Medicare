import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function MedicalReportAIPage({ onNavigate }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('lab_report');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryData, setSummaryData] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or image file to upload.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);

    try {
      const resp = await api.uploadHealthRecord(formData);
      if (resp.ai_summary) {
        setSummaryData(JSON.parse(resp.ai_summary));
      }
    } catch (err) {
      setError(err.message || 'Report upload or AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <MedicalDisclaimer />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Medical Report AI Summarizer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload blood tests, lipid profiles, or clinical notes for biomarker extraction and plain-language explanation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* UPLOAD FORM (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Upload Diagnostic Report
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600 font-semibold dark:bg-rose-950/40 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              
              {/* Drag and Drop Zone */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {file ? file.name : 'Click or Drag PDF / Image file here'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, PNG, JPG, TXT up to 15MB
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Blood Work & Lipid Panel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="lab_report">Laboratory / Blood Test</option>
                  <option value="prescription">Doctor Prescription</option>
                  <option value="imaging">Imaging (X-Ray / MRI / Ultrasound)</option>
                  <option value="vaccination">Vaccination Record</option>
                  <option value="certificate">Medical Certificate</option>
                  <option value="other">Other Clinical Document</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Extracting & Summarizing...' : 'Process Report with AI'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* AI SUMMARY COLUMN (7 COLS) */}
        <div className="lg:col-span-7">
          {summaryData ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 animate-slide-up">
              
              {/* Document Overview */}
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    {summaryData.document_type}
                  </span>
                  <span className="text-xs text-slate-400">Processed by Medicare-AI</span>
                </div>
                <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                  {summaryData.document_title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {summaryData.important_information}
                </p>
              </div>

              {/* Extracted Biomarkers Table */}
              {summaryData.biomarkers?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Identified Laboratory Biomarkers ({summaryData.biomarkers.length})
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Biomarker</th>
                          <th className="p-3">Observed Value</th>
                          <th className="p-3">Reference Range</th>
                          <th className="p-3">System</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {summaryData.biomarkers.map((b, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-slate-800 dark:text-white">{b.marker}</td>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              {b.observed_value} {b.unit}
                            </td>
                            <td className="p-3 text-slate-500">{b.reference_range} {b.unit}</td>
                            <td className="p-3 text-slate-400">{b.system}</td>
                            <td className="p-3">
                              <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                b.status === 'Normal'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : b.status === 'Elevated'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Plain Language Explanation */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                  <Sparkles className="h-4 w-4" /> Plain-Language Clinical Explanation
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {summaryData.plain_language_explanation}
                </p>
              </div>

              {/* Values Requiring Discussion */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Discussion Points for Healthcare Provider
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {summaryData.requiring_discussion?.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Your Doctor */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-emerald-500" /> Questions to Ask Your Doctor
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {summaryData.questions_to_ask_doctor?.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('records')}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                >
                  View in Digital Health Records →
                </button>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  Schedule Doctor Consultation →
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 h-full">
              <FileCheck className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                No Report Analyzed
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Upload a blood test, prescription, or clinical lab document to preview extracted biomarkers and conversational medical insights.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
