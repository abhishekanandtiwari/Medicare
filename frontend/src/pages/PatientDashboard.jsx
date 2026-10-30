                  {nextMed.frequency} • {nextMed.refills_left} refills remaining
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-teal-500" />
                  <span>Due today at {nextMed.reminder_time}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No active medications scheduled.</div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            {nextMed && (
              <button
                type="button"
                onClick={() => handleMarkMedTaken(nextMed.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t('btn_mark_taken')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.alert('The medication schedule is not configured as a separate page yet.')}
              className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Medication Schedule →
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('ai_insights')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Non-diagnostic wellness trends and observations calculated from your vitals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {insights.map((insight, index) => (
            <div
              key={insight.id ?? index}
              className={`rounded-2xl border p-4 text-xs leading-relaxed ${
                insight.type === 'attention'
                  ? 'border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200'
                  : 'border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200'
              }`}
            >
              <div className="mb-1 text-sm font-bold">{insight.title}</div>
              <p className="opacity-90">{insight.observation}</p>
              <p className="mt-2 font-semibold">{insight.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4 text-slate-400" />
            {t('recent_activity')}
          </h3>
          <button
            type="button"
            onClick={() => window.alert('The full activity timeline is not configured as a separate page yet.')}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            View Full Timeline →
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No recent activity recorded.</div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id ?? index} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{activity.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{activity.subtitle}</div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <QuickLogVitalsModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onMetricAdded={fetchDashboard}
      />

      <QRCodeModal
        isOpen={Boolean(selectedAppointmentForQR)}
        onClose={() => setSelectedAppointmentForQR(null)}
        appointment={selectedAppointmentForQR}
      />
    </div>
  );
}
