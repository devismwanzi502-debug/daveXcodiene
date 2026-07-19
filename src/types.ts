export interface PingLog {
  status: "up" | "down";
  responseTime: number;
  statusCode: number | null;
  error?: string;
  timestamp: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number; // in seconds
  status: "up" | "down" | "paused" | "pending";
  lastCheck: string | null;
  avgResponseTime: number;
  uptimeRatio: number; // percentage
  history: PingLog[];
}

export interface ScrollSession {
  id: string;
  url: string;
  title: string;
  interval: number;
  lastHeartbeat: string;
  scrollCount: number;
  userAgent: string;
  status: "active" | "inactive";
}
