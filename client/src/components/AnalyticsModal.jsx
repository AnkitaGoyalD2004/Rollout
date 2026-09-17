import { BarChart3, CheckCircle2, RefreshCw, X, Zap } from 'lucide-react';

export default function AnalyticsModal({ isOpen, flags, company, onClose, onRefresh }) {
  if (!isOpen) return null;

  const totalEvaluations = flags.reduce((sum, f) => sum + (f.evaluationCount || 0), 0);
  const activeFlagsCount = flags.filter((f) => f.isEnabled).length;

  // Sort flags by traffic
  const sortedByTraffic = [...flags].sort((a, b) => (b.evaluationCount || 0) - (a.evaluationCount || 0));

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl bg-base-100 border border-base-300 shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-start pb-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Traffic & Evaluation Analytics</h3>
              </div>
              <p className="text-xs text-slate-400">Real-time usage metrics and request volume for this workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="btn btn-ghost btn-xs btn-circle"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Total Evaluations */}
          <div className="bg-base-200/90 p-4 rounded-xl border border-base-300 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Total Requests</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-extrabold text-amber-400">{totalEvaluations}</span>
            <span className="text-[11px] text-slate-400">API evaluations served</span>
          </div>

          {/* Active Features */}
          <div className="bg-base-200/90 p-4 rounded-xl border border-base-300 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Active Features</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-400">{activeFlagsCount}</span>
            <span className="text-[11px] text-slate-400">Currently LIVE in production</span>
          </div>
        </div>

        {/* Traffic Breakdown Table */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Per-Flag Traffic Breakdown
          </h4>

          {flags.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No feature flags created yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-200/50">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-300 text-slate-400 text-xs font-semibold bg-base-200/80">
                    <th>Feature Flag</th>
                    <th>Status</th>
                    <th className="text-right">Traffic (Requests)</th>
                    <th className="text-right">Traffic Share</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByTraffic.map((f) => {
                    const count = f.evaluationCount || 0;
                    const percent = totalEvaluations > 0 ? Math.round((count / totalEvaluations) * 100) : 0;

                    return (
                      <tr key={f._id} className="border-b border-base-300/60 hover:bg-base-200/80 transition-colors">
                        <td>
                          <span className="font-bold text-sm text-white block">{f.name}</span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm font-bold border ${
                              f.isEnabled
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {f.isEnabled ? 'LIVE' : 'OFF'}
                          </span>
                        </td>
                        <td className="text-right font-mono font-bold text-sm text-white">
                          <span className="text-amber-400">⚡ {count}</span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-mono text-slate-400">{percent}%</span>
                            <progress
                              className="progress progress-warning w-16 h-1.5"
                              value={percent}
                              max="100"
                            ></progress>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action mt-6 pt-3 border-t border-base-300 flex justify-between items-center">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
    </div>
  );
}
