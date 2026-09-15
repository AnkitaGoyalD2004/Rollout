import { CheckCircle, Flag, Plus, RefreshCw, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { createFlag, deleteFlag, getFlags, toggleFlag, updateFlag } from './api';
import CreateFlagModal from './components/CreateFlagModal';
import EditFlagModal from './components/EditFlagModal';
import FlagCard from './components/FlagCard';
import Simulator from './components/Simulator';
    
    export default function App() {
      const [flags, setFlags] = useState([]);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingFlag, setEditingFlag] = useState(null);
      const [error, setError] = useState('');
    
      // Fetch flags on page load
      const loadFlags = async () => {
        try {
          setLoading(true);
          setError('');
          const data = await getFlags();
          setFlags(data);
        } catch (err) {
          setError(err.message || 'Failed to connect to backend server');
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        loadFlags();
      }, []);
    
      // Toggle flag with smooth toast
      const handleToggle = async (id) => {
        try {
          const updated = await toggleFlag(id);
          setFlags((prev) => prev.map((f) => (f._id === id ? updated : f)));
          toast.success(
            <span>
              <b>{updated.name}</b> is now {updated.isEnabled ? '🟢 LIVE' : '⚪ OFF'}
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
        toast.success(`Flag "${created.name}" created successfully! 🎉`);
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
          <header className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8 sticky top-0 z-30
  shadow-sm">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-
  content font-black text-xl shadow-md">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">Rollout</h1>
                </div>
                <p className="text-xs text-base-content/60 hidden sm:block">Feature Flag Management</p>
              </div>
            </div>
    
            <div className="flex-none flex items-center gap-3">
              <button onClick={() => { loadFlags(); toast.success('Flags refreshed!'); }} className="btn 
  btn-ghost btn-sm btn-circle" title="Refresh Flags">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Flag</span>
              </button>
            </div>
          </header>
    
          {/* Main Content Area */}
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
                <div className="stat-figure text-primary">
                  <Flag className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-medium">Total Flags</div>
                <div className="stat-value text-2xl md:text-3xl text-primary">{flags.length}</div>
              </div>
    
              <div className="stat bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4">
                <div className="stat-figure text-success">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-medium">Active (LIVE)</div>
                <div className="stat-value text-2xl md:text-3xl text-success">{activeCount}</div>
              </div>
    
              <div className="stat bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4">
                <div className="stat-figure text-base-content/40">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-medium">Disabled (OFF)</div>
                <div className="stat-value text-2xl md:text-3xl opacity-60">{inactiveCount}</div>
              </div>
            </div>
    
            {/* Grid Layout: Left is Flags list (2 cols), Right is Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Search and Filters Bar */}
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
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary btn-sm gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Flag</span>
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
                  <Simulator flags={flags} />
                </div>
              </div>
            </div>
          </main>

          {/* Create Modal Dialog */}
          <CreateFlagModal
            isOpen={isModalOpen}
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
        </div>
      );
    }
