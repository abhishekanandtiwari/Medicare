import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MedicalDisclaimer({ compact = false }) {
  const { t } = useAuth();

  return (
    <div className={`rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 ${compact ? 'text-xs py-2 px-3' : 'text-sm mb-6'}`}>
      <div className="flex items-start gap-2.5">
        <AlertCircle className={`flex-shrink-0 text-amber-600 dark:text-amber-400 ${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'}`} />
        <div className="flex-1 leading-relaxed">
          <span className="font-semibold">{t('brand_name')} Notice: </span>
          {t('medical_disclaimer')}
        </div>
      </div>
    </div>
  );
}
