import { useState, FormEvent } from "react";
import { Plus, Globe, Clock, AlertCircle } from "lucide-react";

interface AddMonitorModalProps {
  onAdd: (name: string, url: string, interval: number) => Promise<boolean>;
}

export default function AddMonitorModal({ onAdd }: AddMonitorModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [interval, setIntervalVal] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError("Name and URL are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await onAdd(name, url, interval);
      if (success) {
        setName("");
        setUrl("");
        setIntervalVal(60);
        setIsOpen(false);
      } else {
        setError("Failed to add monitor. Please check parameters.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-6 py-4 flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-950/40 transition-all text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-800/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm">Add New HTTP Monitor</span>
              <p className="text-[11px] text-slate-500">Add URLs to ping periodically from our server</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            New Monitor
          </span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
            <h3 className="font-semibold text-white text-base">Create New Uptime Monitor</h3>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Monitor Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Monitor Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Portfolio Webpage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <Globe className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. https://myapi.com/health"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <Globe className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Check Interval
              </label>
              <div className="relative">
                <select
                  value={interval}
                  onChange={(e) => setIntervalVal(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 60 seconds (1m)</option>
                  <option value="120">Every 2 minutes</option>
                  <option value="300">Every 5 minutes</option>
                  <option value="600">Every 10 minutes</option>
                </select>
                <Clock className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-950 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-400 hover:to-emerald-500 shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Monitor"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
