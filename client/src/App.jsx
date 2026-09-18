import { Building2, CheckCircle, Flag, Gauge, History, LogOut, Plus, RefreshCw, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { createFlag, deleteFlag, getFlags, toggleFlag, updateFlag } from './api';
import AnalyticsModal from './components/AnalyticsModal';
import AuditLogModal from './components/AuditLogModal';
import AuthPage from './components/AuthPage';
import CreateFlagModal from './components/CreateFlagModal';
import EditFlagModal from './components/EditFlagModal';
import FlagCard from './components/FlagCard';
import Logo from './components/Logo';
import Simulator from './components/Simulator';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rollout_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [error, setError] = useState('');

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('rollout_token');
    localStorage.removeItem('rollout_user');
    setCurrentUser(null);
    setFlags([]);
    toast.success('Signed out successfully');
  };

  // Fetch flags for the authenticated user's company workspace
  const loadFlags = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError('');
      const data = await getFlags();
      setFlags(data);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Authentication')) {
        handleLogout();
      } else {
        setError(err.message || 'Failed to connect to backend server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFlags();
    }
  }, [currentUser]);
    
      // Toggle flag with smooth toast
      const handleToggle = async (id) => {
        try {
          const updated = await toggleFlag(id);
          setFlags((prev) => prev.map((f) => (f._id === id ? updated : f)));
          toast.success(
            <span>
              <b>{updated.name}</b> is now {updated.isEnabled ? 'LIVE' : 'OFF'}
            </span>,
            { id: `toggle-${id}` }
          );
        } catch (err) {
          toast.error('Error toggling flag: ' + err.message);
        }
      };
    
      // Create flag with success toast
      const handleCreate = async (newFlagData) => {
        const created = await createFlag(newFlagData);
        setFlags((prev) => [created, ...prev]);
        toast.success(`Flag "${created.name}" created! 🎉`);
      };

      // Update flag (Rollout %, Whitelist, Name, Description)
      const handleUpdate = async (id, updatedData) => {
        try {
          const updated = await updateFlag(id, updatedData);
          setFlags((prev) => prev.map((f) => (f._id === id ? updated : f)));
          toast.success(`Flag "${updated.name}" updated! ✨`);
        } catch (err) {
          toast.error('Failed to update: ' + err.message);
        }
      };
    
      // Sleek Delete with Toast Confirmation!
      const handleDelete = (id, name) => {
        toast(
          (t) => (
            <div className="flex items-center gap-3 text-sm">
              <span>Delete <b>{name}</b>?</span>
              <div className="flex gap-1">
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    try {
                      await deleteFlag(id);
                      setFlags((prev) => prev.filter((f) => f._id !== id));
                      toast.success(`Deleted "${name}"`, { icon: '🗑️' });
                    } catch (err) {
                      toast.error('Failed to delete: ' + err.message);
                    }
                  }}
                  className="btn btn-xs btn-error text-white font-bold"
                >
                  Delete
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="btn btn-xs btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: 'top-center',
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              padding: '12px 16px',
            },
          }
        );
      };
    
      const filteredFlags = flags.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.key.toLowerCase().includes(search.toLowerCase()) ||
          f.description?.toLowerCase().includes(search.toLowerCase())
      );
    
      const activeCount = flags.filter((f) => f.isEnabled).length;
      const inactiveCount = flags.length - activeCount;
    
  // If user is not authenticated, show AuthPage (Login / Register)
  if (!currentUser) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
        <AuthPage
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            toast.success(`Welcome to ${user.company} workspace!`);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      {/* React Hot Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />

      {/* Top Navbar */}
      <header className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8 sticky top-0 z-30 shadow-sm">
        <div className="flex-1 flex items-center gap-3">
          <Logo />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">Rollout</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Feature Flag Management</p>
          </div>

          {/* Company Workspace Badge (Strictly Locked - No switching!) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ml-2 sm:ml-4">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs text-white tracking-wide">{currentUser.company}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold ml-1 hidden sm:inline">
              Workspace
            </span>
          </div>

        </div>

        <div className="flex-none flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="btn btn-ghost btn-sm gap-1.5 text-slate-300 hover:text-white"
            title="View Activity & Audit Logs"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline font-medium">Activity Log</span>
          </button>
          <button onClick={() => { loadFlags(); toast.success('Flags refreshed!'); }} className="btn btn-ghost btn-sm btn-circle" title="Refresh Flags">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Flag</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-base-300">
            <span className="text-xs font-bold text-white hidden md:inline">{currentUser.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400 gap-1"
              title="Sign out of workspace"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline text-xs font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Flags View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
          {/* Error Banner if Backend is down */}
          {error && (
            <div className="alert alert-error shadow-lg">
              <ShieldAlert className="w-5 h-5" />
              <div>
                <h3 className="font-bold">Backend Connection Failed</h3>
                <div className="text-xs">{error}</div>
              </div>
              <button onClick={loadFlags} className="btn btn-sm">
                Retry
              </button>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="stat bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4">
              <div className="stat-figure text-purple-400">
                <Flag className="w-6 h-6 text-purple-400" />
              </div>
              <div className="stat-title text-xs font-semibold text-slate-400">Total Flags</div>
              <div className="stat-value text-2xl md:text-3xl font-extrabold text-purple-400">{flags.length}</div>
            </div>

            <div className="stat bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4">
              <div className="stat-figure text-emerald-400">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="stat-title text-xs font-semibold text-slate-400">Active (LIVE)</div>
              <div className="stat-value text-2xl md:text-3xl font-extrabold text-emerald-400">{activeCount}</div>
            </div>

            <div className="stat bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4">
              <div className="stat-figure text-slate-400">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <div className="stat-title text-xs font-semibold text-slate-400">Disabled (OFF)</div>
              <div className="stat-value text-2xl md:text-3xl font-extrabold text-slate-200">{inactiveCount}</div>
            </div>
          </div>
    
            {/* Grid Layout: Left is Flags list (2 cols), Right is Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Search and Action Bar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search flags by name, key, or description..."
                      className="input input-bordered input-sm w-full pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0 hidden sm:inline">
                    {filteredFlags.length} flag{filteredFlags.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary btn-sm gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span> New Flag</span>
                  </button>
                </div>
    
                {/* Loading State */}
                {loading && flags.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="loading loading-dots loading-lg text-primary"></span>
                    <p className="text-sm opacity-60">Loading feature flags...</p>
                  </div>
                )}
    
                {/* Empty State */}
                {!loading && filteredFlags.length === 0 && (
                  <div className="card bg-base-100 border border-base-300 border-dashed p-10 text-center
  flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center 
  text-base-content/40">
                      <Flag className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">No Feature Flags Found</h3>
                    <p className="text-sm text-base-content/60 max-w-sm">
                      {search
                        ? `No flags match "${search}". Try another keyword.`
                        : 'Get started by creating your very first feature flag!'}
                    </p>
                    {!search && (
                      <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm mt-2
  gap-2">
                        <Plus className="w-4 h-4" />
                        Create Your First Flag
                      </button>
                    )}
                  </div>
                )}

                {/* Flag Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFlags.map((flag) => (
                    <FlagCard
                      key={flag._id}
                      flag={flag}
                      onToggle={handleToggle}
                      onEdit={(f) => setEditingFlag(f)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Live Playground Simulator */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <Simulator flags={flags} company={currentUser.company} />
                </div>
              </div>
            </div>
        </main>

          {/* Create Modal Dialog */}
          <CreateFlagModal
            isOpen={isModalOpen}
            companyName={currentUser.company}
            onClose={() => setIsModalOpen(false)}
            onCreated={handleCreate}
          />

          {/* Edit Modal Dialog */}
          <EditFlagModal
            isOpen={!!editingFlag}
            flag={editingFlag}
            onClose={() => setEditingFlag(null)}
            onUpdated={handleUpdate}
          />

          {/* Audit Log / Activity Modal */}
          <AuditLogModal
            isOpen={isAuditLogOpen}
            company={currentUser.company}
            onClose={() => setIsAuditLogOpen(false)}
          />

          {/* Traffic & Evaluation Analytics Modal */}
          <AnalyticsModal
            isOpen={isAnalyticsOpen}
            flags={flags}
            company={currentUser.company}
            onClose={() => setIsAnalyticsOpen(false)}
            onRefresh={() => loadFlags(selectedEnv)}
          />
        </div>
      );
    }
