import { ScrollSession } from "../types";
import { Play, RotateCw, Monitor, ShieldCheck, Cpu, ExternalLink, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface ScrollSessionsListProps {
  sessions: ScrollSession[];
  onClearInactive: () => void;
  onRefresh: () => void;
}

export default function ScrollSessionsList({ sessions, onClearInactive, onRefresh }: ScrollSessionsListProps) {
  const [now, setNow] = useState<number>(Date.now());

  // Keep internal timer to show relative countdowns accurately
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (isoString: string) => {
    const elapsed = Math.round((now - new Date(isoString).getTime()) / 1000);
    if (elapsed < 5) return "Just now";
    if (elapsed < 60) return `${elapsed}s ago`;
    const mins = Math.floor(elapsed / 60);
    return `${mins}m ${elapsed % 60}s ago`;
  };

  const getStatusBadgeColor = (status: ScrollSession["status"], lastHb: string) => {
    const elapsedMs = now - new Date(lastHb).getTime();
    if (status === "inactive" || elapsedMs > 120 * 1000) {
      return "text-slate-500 bg-slate-950 border-slate-800";
    }
    return "text-sky-400 bg-sky-950/40 border-sky-800/40 animate-pulse";
  };

  const getBrowserIcon = (ua: string) => {
    const lower = ua.toLowerCase();
    if (lower.includes("chrome")) return "Chrome";
    if (lower.includes("firefox")) return "Firefox";
    if (lower.includes("safari") && !lower.includes("chrome")) return "Safari";
    if (lower.includes("edge")) return "Edge";
    return "Browser";
  };

  const activeSessions = sessions.filter(s => s.status === "active");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-semibold text-white">Active Scroll Listeners</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearInactive}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80 transition-colors"
          >
            Clear Inactive
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border text-slate-400 bg-slate-950 border-slate-800 hover:text-white transition-colors"
            title="Refresh Listeners"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-base font-medium text-slate-300">No active scroll agents detected</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you click your configured bookmarklet on any external website, it will report as active here in real-time.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/30">
                <th className="px-6 py-3">Page Title / URL</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Scroll Interval</th>
                <th className="px-6 py-3">Total Scrolls</th>
                <th className="px-6 py-3">Last Heartbeat</th>
                <th className="px-6 py-3">Agent Environment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {sessions.map((session) => {
                const isActive = session.status === "active" && (now - new Date(session.lastHeartbeat).getTime() < 120 * 1000);
                return (
                  <tr key={session.id} id={`session-${session.id}`} className="hover:bg-slate-900/40 transition-colors">
                    {/* Title / URL */}
                    <td className="px-6 py-4 max-w-[280px]">
                      <div className="text-sm font-semibold text-white truncate" title={session.title}>
                        {session.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                        <a
                          href={session.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="hover:text-cyan-400 hover:underline flex items-center gap-0.5 truncate"
                        >
                          {session.url}
                          <ExternalLink className="w-3 h-3 inline shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${getStatusBadgeColor(session.status, session.lastHeartbeat)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-sky-400 animate-ping" : "bg-slate-500"}`} />
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Scroll Interval */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">
                      Every {session.interval}s
                    </td>

                    {/* Total Scrolls */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {session.scrollCount}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">triggers</span>
                      </div>
                    </td>

                    {/* Last Heartbeat */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {getRelativeTime(session.lastHeartbeat)}
                    </td>

                    {/* Agent Environment */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                        <Cpu className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[120px]" title={session.userAgent}>
                          {getBrowserIcon(session.userAgent)}
                        </span>
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
  );
}
