import { Monitor, PingLog } from "../types";
import { Play, Pause, Trash2, Globe, CheckCircle2, AlertTriangle, Clock, Server, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface MonitorListProps {
  monitors: Monitor[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MonitorList({ monitors, onToggle, onDelete }: MonitorListProps) {
  
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusColor = (status: Monitor["status"]) => {
    switch (status) {
      case "up": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "down": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "paused": return "text-slate-400 bg-slate-500/10 border-slate-500/30";
      default: return "text-sky-400 bg-sky-500/10 border-sky-500/30";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">HTTP Uptime Monitors</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {monitors.length} monitor(s) configured
        </span>
      </div>

      {monitors.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-base font-medium text-slate-300">No HTTP monitors added yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add standard HTTP endpoints above to start checking their latency and availability from our server every interval.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {monitors.map((monitor) => (
            <div key={monitor.id} id={`monitor-${monitor.id}`} className="p-6 hover:bg-slate-900/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Side: Monitor Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">
                      {monitor.name}
                    </h3>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(monitor.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${monitor.status === "up" ? "bg-emerald-400 animate-pulse" : monitor.status === "down" ? "bg-rose-400" : monitor.status === "paused" ? "bg-slate-400" : "bg-sky-400 animate-pulse"}`} />
                      {monitor.status.toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-500 font-mono">
                      Interval: {monitor.interval}s
                    </span>
                  </div>

                  <div className="mt-1 flex items-center space-x-1 text-xs text-slate-400 group">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <a 
                      href={monitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="truncate hover:text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      {monitor.url}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                {/* Middle: Performance Logs */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-10">
                  <div className="flex items-center gap-8">
                    {/* Latency */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Response Time
                      </div>
                      <div className="text-sm font-semibold text-white font-mono">
                        {monitor.status === "paused" ? "--" : `${monitor.avgResponseTime || "--"} ms`}
                      </div>
                    </div>

                    {/* Uptime */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Uptime Ratio
                      </div>
                      <div className="text-sm font-semibold text-white font-mono">
                        {monitor.uptimeRatio}%
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline Bar Chart (Last 30 Pings) */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Uptime History (Last 30 Checks)</span>
                    <div className="flex items-center space-x-[2px] h-6">
                      {monitor.history.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">Awaiting first check...</span>
                      ) : (
                        // Pad/reverse history to show oldest first (left to right)
                        [...monitor.history].reverse().map((log, idx) => (
                          <div
                            key={idx}
                            className={`w-[6px] h-full rounded-[1px] transition-all relative group ${
                              log.status === "up" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-rose-500 hover:bg-rose-400"
                            }`}
                          >
                            {/* Hover tooltip */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-slate-200 border border-slate-800 text-[10px] rounded-md px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10 shadow-xl font-mono leading-relaxed">
                              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1 mb-1">
                                <span className={log.status === "up" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                  {log.status.toUpperCase()}
                                </span>
                                <span className="text-slate-500">{formatTime(log.timestamp)}</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span>Latency: {log.responseTime}ms</span>
                                <span>Code: {log.statusCode || "Timeout/Error"}</span>
                                {log.error && <span className="text-rose-400 max-w-[150px] truncate">{log.error}</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Controls */}
                <div className="flex items-center space-x-2 border-t border-slate-800 pt-4 lg:border-t-0 lg:pt-0">
                  <button
                    onClick={() => onToggle(monitor.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      monitor.status === "paused"
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/40"
                        : "text-amber-400 bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/40"
                    }`}
                    title={monitor.status === "paused" ? "Resume Checks" : "Pause Checks"}
                  >
                    {monitor.status === "paused" ? (
                      <Play className="w-4 h-4 fill-emerald-400/10" />
                    ) : (
                      <Pause className="w-4 h-4 fill-amber-400/10" />
                    )}
                  </button>

                  <button
                    onClick={() => onDelete(monitor.id)}
                    className="p-2 rounded-lg border text-rose-400 bg-rose-950/20 border-rose-800/40 hover:bg-rose-950/40 transition-all"
                    title="Delete Monitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
