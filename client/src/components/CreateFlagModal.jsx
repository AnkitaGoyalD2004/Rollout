import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
    
    export default function CreateFlagModal({ isOpen, onClose, onCreated }) {
      const [name, setName] = useState('');
      const [key, setKey] = useState('');
      const [description, setDescription] = useState('');
      const [isEnabled, setIsEnabled] = useState(false);
      const [rolloutPercentage, setRolloutPercentage] = useState(100);
      const [targetUsersInput, setTargetUsersInput] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
    
      if (!isOpen) return null;
    
      // Automatically create a slug key when user types a name (e.g. "New Checkout" -> "new-checkout")
      const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        // Only auto-generate key if user hasn't manually customized it yet
        const generatedKey = newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setKey(generatedKey);
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        try {
          const targetUsers = targetUsersInput
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean);
    
          await onCreated({
            name,
            key,
            description,
            isEnabled,
            rolloutPercentage: Number(rolloutPercentage),
            targetUsers,
          });
    
          // Reset form
          setName('');
          setKey('');
          setDescription('');
          setIsEnabled(false);
          setRolloutPercentage(100);
          setTargetUsersInput('');
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Create Feature Flag
              </h3>
              <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
    
            {error && (
              <div className="alert alert-error text-sm mb-4 py-2">
                <span>{error}</span>
              </div>
            )}
    
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Flag Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Display Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Redesigned Checkout Flow"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={handleNameChange}
                  required
                />
              </div>
    
              {/* Technical Key */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Flag Key (used in your code)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. redesigned-checkout-flow"
                  className="input input-bordered w-full font-mono text-sm"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase())}
                  required
                />
              </div>
    
              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  placeholder="What does this flag control?"
                  className="textarea textarea-bordered w-full text-sm"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
    
              {/* Master Switch Toggle */}
              <div className="form-control bg-base-200 p-3 rounded-lg flex-row justify-between items-
  center">
                <div>
                  <span className="font-medium text-sm block">Initial Status</span>
                  <span className="text-xs opacity-70">Turn flag ON immediately or keep OFF</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
              </div>
    
              {/* Percentage Rollout */}
              <div className="form-control bg-base-200 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Rollout Percentage</span>
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
                <div className="flex justify-between text-xs opacity-50 px-1 mt-1">
                  <span>0% (Nobody)</span>
                  <span>50%</span>
                  <span>100% (All Users)</span>
                </div>
              </div>
    
              {/* Target Users / Whitelist */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Whitelisted Users (Optional)</span>
                  <span className="label-text-alt opacity-60">Comma-separated</span>
                </label>
                <input
                  type="text"
                  placeholder="alice@example.com, bob@example.com"
                  className="input input-bordered w-full text-sm"
                  value={targetUsersInput}
                  onChange={(e) => setTargetUsersInput(e.target.value)}
                />
              </div>
    
              {/* Action Buttons */}
              <div className="modal-action mt-6">
                <button type="button" onClick={onClose} className="btn btn-ghost" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Flag'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
        </div>
      );
    }
