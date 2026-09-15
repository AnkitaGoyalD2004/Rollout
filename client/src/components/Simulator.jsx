import { CheckCircle2, Play, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { evaluateFlag } from '../api';
    
    export default function Simulator({ flags }) {
      const [selectedFlagKey, setSelectedFlagKey] = useState('');
      const [userId, setUserId] = useState('alice@company.com');
      const [result, setResult] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
    
      // Default to first flag if available and none selected
      const activeKey = selectedFlagKey || (flags.length > 0 ? flags[0].key : '');
    
      const handleSimulate = async (e) => {
        e.preventDefault();
        if (!activeKey) return;
    
        setError('');
        setLoading(true);
        try {
          const res = await evaluateFlag(activeKey, userId);
          setResult(res);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <div className="card bg-base-100 border border-base-300 shadow-md">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <h2 className="card-title text-base font-bold">Flag Evaluation Playground</h2>
            </div>
            <p className="text-xs text-base-content/70 mb-4">
              Test in real-time how your backend evaluates a flag for a given user ID.
            </p>
    
            {flags.length === 0 ? (
              <div className="text-center py-6 text-sm opacity-60">
                Create a flag above to start testing!
              </div>
            ) : (
              <form onSubmit={handleSimulate} className="space-y-3">
                {/* Select Flag */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">Select Feature Flag</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-xs font-mono"
                    value={activeKey}
                    onChange={(e) => {
                      setSelectedFlagKey(e.target.value);
                      setResult(null);
                    }}
                  >
                    {flags.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.name} ({f.key})
                      </option>
                    ))}
                  </select>
                </div>
    
                {/* Enter User ID */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">User Identifier</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full text-xs font-mono"
                    placeholder="e.g. user_123 or email"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
    
                {/* Evaluate Button */}
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm w-full gap-2 mt-2"
                  disabled={loading || !activeKey}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Evaluate Flag
                    </>
                  )}
                </button>
              </form>
            )}
    
            {/* Error Alert */}
            {error && (
              <div className="alert alert-error text-xs p-2 mt-3">
                <span>{error}</span>
              </div>
            )}
    
            {/* Evaluation Output Result */}
            {result && (
              <div
                className={`mt-4 p-4 rounded-xl border transition-all ${
                  result.enabled
                    ? 'bg-success/10 border-success/30 text-success-content'
                    : 'bg-base-200 border-base-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.enabled ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <XCircle className="w-6 h-6 text-error" />
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      {result.enabled ? 'Feature Enabled' : 'Feature Disabled'}
                    </span>
                    <span className="text-sm font-semibold">
                      {result.enabled ? 'User sees the new feature ' : 'User sees standard experience'}
                    </span>
                  </div>
                </div>
    
                <div className="divider my-1.5 opacity-40"></div>
    
                <div className="text-xs font-mono space-y-1 opacity-85">
                  <div className="flex justify-between">
                    <span className="opacity-70">Evaluation Reason:</span>
                    <span className="badge badge-sm badge-neutral">{result.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Evaluated Flag:</span>
                    <span className="font-semibold">{result.flagKey}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
