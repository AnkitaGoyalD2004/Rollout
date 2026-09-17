import { Clock, History, PlusCircle, RefreshCw, Sliders, ToggleRight, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAuditLogs } from '../api';

export default function AuditLogModal({ isOpen, company = 'all', onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAuditLogs(company);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, company]);

  if (!isOpen) return null;

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return (
          <span className="badge badge-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 gap-1">
            <PlusCircle className="w-3 h-3" /> CREATED
          </span>
        );
      case 'TOGGLED':
        return (
          <span className="badge badge-sm font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 gap-1">
            <ToggleRight className="w-3 h-3" /> TOGGLED
          </span>
        );
      case 'UPDATED':
        return (
          <span className="badge badge-sm font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 gap-1">
            <Sliders className="w-3 h-3" /> UPDATED
          </span>
        );
      case 'DELETED':
        return (
          <span className="badge badge-sm font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 gap-1">
            <Trash2 className="w-3 h-3" /> DELETED
          </span>
        );
      default:
        return <span className="badge badge-sm badge-ghost">{action}</span>;
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Activity & Audit Log</h3>
              </div>
              <p className="text-xs text-slate-400">History of all flag changes for this workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="btn btn-ghost btn-xs btn-circle"
              title="Refresh logs"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error text-xs p-3 my-3">
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && logs.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <span className="text-xs">Loading audit trail...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-slate-300">No activity recorded yet</p>
            <p className="text-xs opacity-60">Toggle, create, or update a flag to see history here.</p>
          </div>
        )}

        {/* Activity Timeline List */}
        {logs.length > 0 && (
          <div className="mt-4 max-h-96 overflow-y-auto space-y-3 pr-1">
            {logs.map((log) => (
              <div
                key={log._id}
                className="p-3 rounded-xl bg-base-200/80 border border-base-300 flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-sm text-white">{log.flagName}</span>
                    <span className="font-mono text-xs text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30">
                      {log.flagKey}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-base-300/60">
                  <span className="text-slate-300 font-medium">{log.details}</span>
                  <span className="text-[11px] text-slate-400 italic font-mono">
                    by {log.performedBy || 'Admin'} • {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="modal-action mt-4 pt-3 border-t border-base-300 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">Showing latest {logs.length} events</span>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
    </div>
  );
}
