import { useState, useEffect } from "react";
import { Monitor, ScrollSession } from "./types";
import DashboardStats from "./components/DashboardStats";
import MonitorList from "./components/MonitorList";
import ScrollSessionsList from "./components/ScrollSessionsList";
import BookmarkletGenerator from "./components/BookmarkletGenerator";
import AddMonitorModal from "./components/AddMonitorModal";
import { ShieldCheck, Server, RefreshCw, Cpu, Activity, Info } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [scrollSessions, setScrollSessions] = useState<ScrollSession[]>([]);
  const [activeTab, setActiveTab] = useState<"http" | "scroll">("http");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch all state from API
  const fetchData = async () => {
    try {
      const [monitorsRes, sessionsRes] = await Promise.all([
        fetch("/api/monitors"),
        fetch("/api/scroll-sessions")
      ]);

      if (!monitorsRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to communicate with monitoring service.");
      }

      const monitorsData = await monitorsRes.json();
      const sessionsData = await sessionsRes.json();

      setMonitors(monitorsData);
      setScrollSessions(sessionsData);
      setError("");
    } catch (err: any) {
      console.error("Fetch state error:", err);
      setError("Unable to sync with central engine server. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll updates every 5 seconds for absolute real-time dashboard feel
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddMonitor = async (name: string, url: string, interval: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, interval })
      });

      if (!res.ok) return false;
      
      await fetchData();
      return true;
    } catch (err) {
      console.error("Add monitor error:", err);
      return false;
    }
  };

  const handleToggleMonitor = async (id: string) => {
    try {
      const res = await fetch(`/api/monitors/${id}/toggle`, { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Toggle monitor error:", err);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this monitor? Check history will be deleted.")) return;
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Delete monitor error:", err);
    }
  };

  const handleClearInactiveSessions = async () => {
    try {
      const res = await fetch("/api/scroll-sessions/clear", { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Clear inactive sessions error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-white font-sans antialiased">
      {/* Visual cyber mesh background element */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Banner Status Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] py-1.5 px-4 font-mono text-slate-400 flex justify-between items-center relative z-10 flex-wrap gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>Core Engine: operational</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Region: Container Ingress</span>
          <span>Refresh: Live (5s)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Error Alert Bar */}
        {error && (
          <div className="mb-6 p-4 bg-amber-950/20 border border-amber-800/40 text-amber-300 text-sm rounded-xl flex items-center space-x-3 shadow-lg">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Dashboard Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Uptime Scroll Robot
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Full-stack website monitor and active client keep-alive simulator. 
              Run server-side HTTP pings to track latency, and deploy active bookmarklet agents to simulate real scroll interactions on target sites.
            </p>
          </div>
        </header>

        {/* Big Performance Summary Stats */}
        <DashboardStats monitors={monitors} scrollSessions={scrollSessions} />

        {/* Main Tab Controls */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("http")}
            className={`pb-3.5 px-4 text-sm font-semibold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "http"
                ? "border-emerald-500 text-white font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>HTTP Uptime Monitors ({monitors.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("scroll")}
            className={`pb-3.5 px-4 text-sm font-semibold tracking-wide border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "scroll"
                ? "border-sky-500 text-white font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scroll Keep-Alives ({scrollSessions.filter(s => s.status === "active").length})</span>
          </button>
        </div>

        {/* Dynamic Panel Content */}
        {loading && monitors.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-base font-semibold">Loading system configuration...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "http" ? (
              <div>
                <AddMonitorModal onAdd={handleAddMonitor} />
                <MonitorList
                  monitors={monitors}
                  onToggle={handleToggleMonitor}
                  onDelete={handleDeleteMonitor}
                />
              </div>
            ) : (
              <div>
                <BookmarkletGenerator />
                <ScrollSessionsList
                  sessions={scrollSessions}
                  onClearInactive={handleClearInactiveSessions}
                  onRefresh={fetchData}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Humility footer (Clean & un-cluttered) */}
        <footer className="mt-16 pt-6 border-t border-slate-900 flex justify-between items-center text-slate-500 text-xs">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Uptime Scroll Robot &middot; Standard & Client-Interactive Active Keep-Alives</span>
          </div>
          <span>Active Session Panel</span>
        </footer>

      </div>
    </div>
  );
}
