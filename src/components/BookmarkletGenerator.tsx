import { useState, useEffect } from "react";
import { Link2, HelpCircle, Check, Copy, ExternalLink, RefreshCw, Layers } from "lucide-react";

export default function BookmarkletGenerator() {
  const [intervalSec, setIntervalSec] = useState<number>(60);
  const [scrollAmount, setScrollAmount] = useState<number>(300);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [appUrl, setAppUrl] = useState<string>("");

  useEffect(() => {
    // Detect the backend/frontend base URL to inject into the bookmarklet
    const origin = window.location.origin;
    setAppUrl(origin);
  }, []);

  // Construct bookmarklet javascript payload
  const buildBookmarkletCode = () => {
    if (!appUrl) return "";

    const rawScript = `(function(){
      var API_HOST = "${appUrl}";
      var INTERVAL_SEC = ${intervalSec};
      var SCROLL_DIST = ${scrollAmount};
      var SHOW_UI = ${showOverlay};
      var sessionId = "sc-" + Math.random().toString(36).substring(2, 9);
      var scrollCount = 0;
      var nextScrollTime = Date.now() + (INTERVAL_SEC * 1000);
      
      function sendHeartbeat() {
        fetch(API_HOST + "/api/scroll-sessions/heartbeat", {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sessionId,
            url: window.location.href,
            title: document.title || window.location.host,
            interval: INTERVAL_SEC,
            scrollCount: scrollCount
          })
        }).catch(function(e){ console.error("Keep-Alive Heartbeat error", e); });
      }
      
      function triggerScroll() {
        scrollCount++;
        window.scrollBy({ top: SCROLL_DIST, behavior: "smooth" });
        setTimeout(function() {
          window.scrollBy({ top: -SCROLL_DIST, behavior: "smooth" });
        }, 1500);
        sendHeartbeat();
      }
      
      sendHeartbeat();
      var hInterval = setInterval(sendHeartbeat, 30000);
      
      var scrollTimer = setInterval(function() {
        nextScrollTime = Date.now() + (INTERVAL_SEC * 1000);
        triggerScroll();
      }, INTERVAL_SEC * 1000);
      
      if (SHOW_UI) {
        var div = document.createElement("div");
        div.id = "uptime-keeper-overlay-" + sessionId;
        div.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999999;background:#0f172a;color:#f1f5f9;padding:14px;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,\\"Segoe UI\\",Roboto,sans-serif;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);border:1px solid #0284c7;width:220px;box-sizing:border-box;font-size:12px;";
        
        var head = document.createElement("div");
        head.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:bold;color:#38bdf8;border-bottom:1px solid #1e293b;padding-bottom:6px;";
        head.innerHTML = "<span>â†—ï¸Ž Keep-Alive Active</span>";
        
        var close = document.createElement("button");
        close.innerHTML = "Ã—";
        close.style.cssText = "background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:0;line-height:1;font-weight:bold;";
        
        var content = document.createElement("div");
        
        var statTimer = document.createElement("div");
        statTimer.style.cssText = "margin-bottom:6px;display:flex;justify-content:space-between;";
        statTimer.innerHTML = "<span>Next Scroll:</span><span id=\\"ut-countdown-\\"+sessionId+\\"\\" style=\\"font-family:monospace;color:#38bdf8;font-weight:bold;\\">--</span>";
        
        var statCount = document.createElement("div");
        statCount.style.cssText = "margin-bottom:10px;display:flex;justify-content:space-between;";
        statCount.innerHTML = "<span>Scrolls:</span><span id=\\"ut-count-\\"+sessionId+\\"\\" style=\\"font-family:monospace;color:#34d399;font-weight:bold;\\">0</span>";
        
        var actions = document.createElement("div");
        actions.style.cssText = "display:flex;gap:6px;";
        
        var btnScroll = document.createElement("button");
        btnScroll.innerHTML = "Scroll Now";
        btnScroll.style.cssText = "flex:1;background:#0284c7;color:#fff;border:none;border-radius:6px;padding:6px;cursor:pointer;font-weight:500;font-size:11px;";
        btnScroll.onclick = function() { triggerScroll(); };
        
        var btnStop = document.createElement("button");
        btnStop.innerHTML = "Stop";
        btnStop.style.cssText = "background:#ef4444;color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-weight:500;font-size:11px;";
        btnStop.onclick = function() {
          clearInterval(scrollTimer);
          clearInterval(hInterval);
          if (div.parentNode) div.parentNode.removeChild(div);
        };
        
        actions.appendChild(btnScroll);
        actions.appendChild(btnStop);
        content.appendChild(statTimer);
        content.appendChild(statCount);
        content.appendChild(actions);
        
        head.appendChild(close);
        div.appendChild(head);
        div.appendChild(content);
        document.body.appendChild(div);
        
        close.onclick = function() {
          clearInterval(scrollTimer);
          clearInterval(hInterval);
          if (div.parentNode) div.parentNode.removeChild(div);
        };
        
        setInterval(function() {
          var remaining = Math.max(0, Math.round((nextScrollTime - Date.now()) / 1000));
          var countEl = document.getElementById("ut-countdown-"+sessionId);
          if (countEl) countEl.innerHTML = remaining + "s";
          var scrollCountEl = document.getElementById("ut-count-"+sessionId);
          if (scrollCountEl) scrollCountEl.innerHTML = scrollCount;
        }, 1000);
      }
    })();`;

    // Minify script slightly for bookmarklet URL
    return `javascript:${encodeURIComponent(rawScript.replace(/\s+/g, " "))}`;
  };

  const handleCopyCode = () => {
    const code = buildBookmarkletCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-3">
        <Layers className="w-5 h-5 text-sky-400" />
        <h2 className="text-lg font-semibold text-white">Active Scroll Keep-Alive Agent</h2>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6">
        Standard Uptime checkers only perform simple HTTP request pings. 
        Some cloud containers, Colab notebooks, or interactive dashboards require 
        <strong> real client-side user activity</strong> (like physical scrolling) to remain awake. 
        Use our interactive Bookmarklet tool on any web page to prevent timeouts, and monitor its real-time activity here!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Setup controls */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Configure Keep-Alive</h3>
          
          {/* Scroll Interval */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Scroll Interval (Seconds)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="10"
                max="3600"
                value={intervalSec}
                onChange={(e) => setIntervalSec(Math.max(10, parseInt(e.target.value, 10) || 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                ({Math.round((intervalSec / 60) * 10) / 10} min)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              The frequency at which the target page will trigger a scrolling activity.
            </p>
          </div>

          {/* Scroll Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Scroll Distance (Pixels)
            </label>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={scrollAmount}
              onChange={(e) => setScrollAmount(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Short (100px)</span>
              <span className="font-semibold text-sky-400 font-mono">{scrollAmount}px</span>
              <span>Long (1500px)</span>
            </div>
          </div>

          {/* Overlay visibility */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-slate-300">Show Floating Control Overlay</p>
              <p className="text-[10px] text-slate-500">Render widget showing the countdown in target page</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showOverlay} 
                onChange={(e) => setShowOverlay(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white" />
            </label>
          </div>
        </div>

        {/* Right column: Action / Drag / Copy */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Install & Run</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-sky-950 text-sky-400 font-semibold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">1</div>
                <p className="text-xs text-slate-300">
                  Drag the blue button below directly to your <strong>Bookmarks Bar</strong>.
                </p>
              </div>

              {/* DRAG BUTTON CONTAINER */}
              <div className="py-4 flex justify-center">
                <a
                  href={buildBookmarkletCode()}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold text-xs py-3 px-6 rounded-lg shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all cursor-move select-none border border-sky-400/20"
                >
                  <Link2 className="w-4 h-4" />
                  <span>â†—ï¸Ž Keep-Alive Scroll</span>
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-sky-950 text-sky-400 font-semibold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">2</div>
                <p className="text-xs text-slate-300">
                  Navigate to your target website, then click the bookmarklet to boot the agent!
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-sky-950 text-sky-400 font-semibold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">3</div>
                <p className="text-xs text-slate-300">
                  The page will smoothly scroll down and back up at your set interval, and register as active below.
                </p>
              </div>
            </div>
          </div>

          {/* Copy Alternative */}
          <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Bookmarks hidden? Copy code instead
            </span>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors bg-sky-950/20 px-2.5 py-1 rounded border border-sky-800/40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
