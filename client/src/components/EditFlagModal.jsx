import { Percent, Sliders, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EditFlagModal({ isOpen, flag, onClose, onUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rolloutPercentage, setRolloutPercentage] = useState(100);
  const [targetUsersInput, setTargetUsersInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load current flag data when modal opens
  useEffect(() => {
    if (flag) {
      setName(flag.name || '');
      setDescription(flag.description || '');
      setRolloutPercentage(flag.rolloutPercentage !== undefined ? flag.rolloutPercentage : 100);
      setTargetUsersInput((flag.targetUsers || []).join(', '));
      setError('');
    }
  }, [flag, isOpen]);

  if (!isOpen || !flag) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const targetUsers = targetUsersInput
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      await onUpdated(flag._id, {
        name,
        description,
        rolloutPercentage: Number(rolloutPercentage),
        targetUsers,
        isEnabled: flag.isEnabled, // Keep existing toggle status
      });

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg bg-base-100 border border-base-300 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Edit Feature Flag
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold">
            🏢 {flag.company}
          </span>
        </div>

        {error && (
          <div className="alert alert-error text-sm mb-4 py-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Flag Key (Read Only) */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold opacity-70">Flag Key (Permanent)</span>
            </label>
            <input
              type="text"
              disabled
              className="input input-bordered input-sm w-full font-mono text-xs opacity-60 bg-base-200"
              value={flag.key}
            />
          </div>

          {/* Display Name */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold">Display Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full text-xs"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Rollout Percentage Slider */}
          <div className="form-control bg-base-200 p-3.5 rounded-xl border border-base-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-xs flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-primary" />
                Rollout Percentage
              </span>
              <span className="badge badge-primary font-bold">{rolloutPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="range range-primary range-sm"
              value={rolloutPercentage}
              onChange={(e) => setRolloutPercentage(e.target.value)}
            />
            <div className="flex justify-between text-[11px] opacity-60 px-1 mt-1 font-mono">
              <button type="button" onClick={() => setRolloutPercentage(0)} className="hover:underline">0%</button>
              <button type="button" onClick={() => setRolloutPercentage(25)} className="hover:underline">25%</button>
              <button type="button" onClick={() => setRolloutPercentage(50)} className="hover:underline">50%</button>
              <button type="button" onClick={() => setRolloutPercentage(75)} className="hover:underline">75%</button>
              <button type="button" onClick={() => setRolloutPercentage(100)} className="hover:underline">100%</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action mt-6">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
    </div>
  );
}
