 import { Check, Copy, Percent, Sliders, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
    
    export default function FlagCard({ flag, onToggle, onEdit, onDelete }) {
      const [copied, setCopied] = useState(false);
      const [toggling, setToggling] = useState(false);
    
         const handleCopy = () => {
        navigator.clipboard.writeText(flag.key);
        setCopied(true);
        toast.success(`Copied "${flag.key}" to clipboard!`, { id: `copy-${flag._id}` });
        setTimeout(() => setCopied(false), 2000);
      };
      const handleToggleClick = async () => {
        setToggling(true);
        try {
          await onToggle(flag._id);
        } finally {
          setToggling(false);
        }
      };
    
      return (
      <div className="card bg-base-100 border border-base-300 shadow-md hover:border-primary/40 hover:shadow-lg transition-all duration-200">
        <div className="card-body p-5">
          {/* Card Header: Name, Master Toggle, Status Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-white tracking-tight">{flag.name}</h3>
                <span
                  className={`badge badge-sm font-bold border ${
                    flag.isEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {flag.isEnabled ? 'LIVE' : 'OFF'}
                </span>
              </div>

              {/* Key Copy Pill */}
              <div className="inline-flex items-center gap-1.5 bg-purple-950/40 border border-purple-800/40 px-2.5 py-0.5 rounded text-xs font-mono text-purple-300 group">
                <span>{flag.key}</span>
                <button
                  onClick={handleCopy}
                  title="Copy flag key"
                  className="btn btn-ghost btn-xs p-0.5 h-auto min-h-0 text-purple-300/70 hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Master Switch Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-md"
                  checked={flag.isEnabled}
                  onChange={handleToggleClick}
                  disabled={toggling}
                />
              </div>
            </div>

            {/* Description */}
            {flag.description && (
              <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                {flag.description}
              </p>
            )}

            {/* Divider */}
            <div className="divider my-2 opacity-20"></div>

            {/* Rollout Percentage (Full Width) */}
            <div className="bg-base-200/80 p-2.5 rounded-lg border border-base-300 flex flex-col gap-1.5 text-xs w-full">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Percent className="w-3.5 h-3.5 text-primary" /> Rollout
                </span>
                <span className="font-bold text-white text-sm">{flag.rolloutPercentage}%</span>
              </div>
              {/* Progress bar */}
              <progress
                className="progress progress-primary w-full h-2"
                value={flag.rolloutPercentage}
                max="100"
              ></progress>
            </div>

            {/* Card Footer: Edit on Left, Delete on Right */}
            <div className="card-actions justify-between items-center mt-2 pt-2">
              <button
                onClick={() => onEdit(flag)}
                className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1.5 font-medium px-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                Edit / Rollout
              </button>
              <button
                onClick={() => onDelete(flag._id, flag.name)}
                className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1 font-medium px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    }
