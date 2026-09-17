import { ArrowRight, Building2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { loginUser, registerUser } from '../api';
import Logo from './Logo';

export default function AuthPage({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !company.trim() || !email.trim() || !password) {
          throw new Error('Please fill in all fields');
        }
        const data = await registerUser({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          password,
        });
        localStorage.setItem('rollout_token', data.token);
        localStorage.setItem('rollout_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password');
        }
        const data = await loginUser({
          email: email.trim(),
          password,
        });
        localStorage.setItem('rollout_token', data.token);
        localStorage.setItem('rollout_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <Logo size="lg" />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Rollout
          </h1>
          <p className="text-xs text-slate-400 font-medium">Enterprise Feature Flag & Canary Platform</p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-2xl">
        <div className="card-body p-6 sm:p-8">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1 mb-6 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`tab flex-1 font-bold text-xs transition-all ${
                !isRegister ? 'tab-active text-white' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`tab flex-1 font-bold text-xs transition-all ${
                isRegister ? 'tab-active text-white' : 'text-slate-400'
              }`}
            >
              Create Workspace
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">
              {isRegister ? 'Create Your Company Workspace' : 'Sign in to Your Workspace'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegister
                ? 'Register your organization to safely control features in production'
                : 'Enter your credentials to access your private company feature flags'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error text-xs py-2.5 mb-4 rounded-xl">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Full Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-slate-300">Your Full Name</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Smith"
                      className="input input-bordered input-sm w-full pl-10 bg-base-200 text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-slate-300">Company / Organization</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Your Company Name"
                      className="input input-bordered input-sm w-full pl-10 bg-base-200 text-white font-medium"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                  <label className="label py-0.5">
                    <span className="label-text-alt text-[11px] text-slate-400">
                      Your team and data will be isolated under this workspace
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-slate-300">Work Email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="input input-bordered input-sm w-full pl-10 bg-base-200 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-slate-300">Password</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered input-sm w-full pl-10 bg-base-200 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {isRegister && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-[11px] text-slate-400">At least 6 characters</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm w-full gap-2 mt-2 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Workspace & Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-base-300 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Cross-Company Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
