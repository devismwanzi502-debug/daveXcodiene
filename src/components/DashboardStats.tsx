import { Monitor, ScrollSession } from "../types";
import { Activity, ShieldCheck, Clock, RefreshCw } from "lucide-react";

interface DashboardStatsProps {
  monitors: Monitor[];
  scrollSessions: ScrollSession[];
}

export default function DashboardStats({ monitors, scrollSessions }: DashboardStatsProps) {
  const activeMonitors = monitors.filter((m) => m.status !== "paused");
  const upMonitors = activeMonitors.filter((m) => m.status === "up");
  const downMonitors = activeMonitors.filter((m) => m.status === "down");

  // Calculate overall uptime percentage
  const totalUptimeRatio = activeMonitors.length > 0
    ? Math.round(activeMonitors.reduce((sum, m) => sum + m.uptimeRatio, 0) / activeMonitors.length)
    : 100;

  // Calculate average response time
  const upMonitorsWithLatency = activeMonitors.filter((m) => m.status === "up" && m.avgResponseTime > 0);
  const avgResponseTime = upMonitorsWithLatency.length > 0
    ? Math.round(upMonitorsWithLatency.reduce((sum, m) => sum + m.avgResponseTime, 0) / upMonitorsWithLatency.length)
    : 0;

  const activeScrollSessions = scrollSessions.filter((s) => s.status === "active");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Overall Status */}
      <div id="stat-overall" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="w-16 h-16 text-emerald-400" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mb-1">System Health</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            {downMonitors.length > 0 ? "Degraded" : monitors.length === 0 ? "Idle" : "Operational"}
          </span>
        </div>
        <div className="mt-2 flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${downMonitors.length > 0 ? "bg-amber-500 animate-pulse" : monitors.length === 0 ? "bg-slate-500" : "bg-emerald-500 animate-ping"}`} />
          <span className="text-xs text-slate-400">
            {downMonitors.length > 0 ? `${downMonitors.length} monitor(s) down` : monitors.length === 0 ? "No monitors configured" : "All services responding"}
          </span>
        </div>
      </div>

      {/* Global Uptime */}
      <div id="stat-uptime" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-16 h-16 text-emerald-400" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mb-1">Avg. Uptime (30d)</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-white tracking-tight">{totalUptimeRatio}%</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>{upMonitors.length} of {activeMonitors.length} up</span>
          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${totalUptimeRatio}%` }} />
          </div>
        </div>
      </div>

      {/* Avg Response Time */}
      <div id="stat-latency" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Clock className="w-16 h-16 text-cyan-400" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mb-1">Avg. Response</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-white tracking-tight">
            {avgResponseTime > 0 ? `${avgResponseTime}ms` : "--"}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          <span>Measured across active checks</span>
        </div>
      </div>

      {/* Active Keep Alives */}
      <div id="stat-scrollers" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <RefreshCw className="w-16 h-16 text-sky-400 animate-spin-slow" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mb-1">Scroll Keep-Alives</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-sky-400 tracking-tight">{activeScrollSessions.length}</span>
          <span className="text-slate-400 text-sm font-medium">active</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          <span>Simulating physical page activity</span>
        </div>
      </div>
    </div>
  );
}
