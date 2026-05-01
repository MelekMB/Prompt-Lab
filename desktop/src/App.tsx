import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

type View = "idle" | "improving" | "done" | "error" | "empty" | "settings";

const LS_URL = "pl_api_url";
const LS_KEY = "pl_api_key";

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="url(#lg)" />
      <path d="M7 10.5L12.5 14L7 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 17.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#e05252" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Spinner() {
  return <div className="spinner" />;
}

export default function App() {
  const [view, setView] = useState<View>("idle");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem(LS_URL) ?? "");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) ?? "");
  const [settingsUrl, setSettingsUrl] = useState(apiUrl);
  const [settingsKey, setSettingsKey] = useState(apiKey);

  const hide = useCallback(() => getCurrentWindow().hide(), []);

  // ESC to dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hide]);

  // Listen for events from Rust
  useEffect(() => {
    const unlistenImprove = listen<void>("do-improve", async () => {
      const url = localStorage.getItem(LS_URL) ?? "";
      const key = localStorage.getItem(LS_KEY) ?? "";

      if (!url || !key) {
        setSettingsUrl(url);
        setSettingsKey(key);
        setView("settings");
        return;
      }

      setView("improving");
      setResult("");
      setError("");

      try {
        // Read clipboard — Rust already triggered Cmd+C before showing us
        const text = await invoke<string>("read_clipboard");
        if (!text?.trim()) {
          setView("empty");
          return;
        }

        const res = await fetch(`${url.replace(/\/$/, "")}/api/improve-prompt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Extension-Key": key,
          },
          body: JSON.stringify({ prompt: text, rounds: 2 }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(j.error ?? `API error ${res.status}`);
        }

        const body = await res.text();
        let finalPrompt = "";
        for (const line of body.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6)) as { type?: string; data?: { finalPrompt?: string } };
            if (evt.type === "complete" && evt.data?.finalPrompt) {
              finalPrompt = evt.data.finalPrompt;
            }
          } catch {}
        }

        if (!finalPrompt) throw new Error("No result returned from API.");

        // Write improved text to clipboard then paste it back
        await invoke("write_clipboard", { text: finalPrompt });
        setResult(finalPrompt);
        setView("done");

        // Hide window first so the paste goes to the original app
        setTimeout(async () => {
          await getCurrentWindow().hide();
          await invoke("simulate_paste");
        }, 900);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setView("error");
      }
    });

    const unlistenSettings = listen<void>("open-settings", () => {
      setSettingsUrl(localStorage.getItem(LS_URL) ?? "");
      setSettingsKey(localStorage.getItem(LS_KEY) ?? "");
      setView("settings");
    });

    return () => {
      unlistenImprove.then((f) => f());
      unlistenSettings.then((f) => f());
    };
  }, []);

  function saveSettings() {
    localStorage.setItem(LS_URL, settingsUrl.trim());
    localStorage.setItem(LS_KEY, settingsKey.trim());
    setApiUrl(settingsUrl.trim());
    setApiKey(settingsKey.trim());
    hide();
  }

  return (
    <div className="root">
      {/* Drag region — lets user move the window */}
      <div className="drag-bar" data-tauri-drag-region>
        <div className="brand" data-tauri-drag-region>
          <Logo />
          <span className="brand-name" data-tauri-drag-region>prompt labs</span>
        </div>
        <button className="close-btn" onClick={hide} title="Dismiss (Esc)">✕</button>
      </div>

      <div className="body">
        {/* IMPROVING */}
        {view === "improving" && (
          <div className="center-content">
            <Spinner />
            <p className="status-text">Improving your prompt…</p>
            <p className="sub-text">This takes 15–30 seconds</p>
          </div>
        )}

        {/* DONE */}
        {view === "done" && (
          <div className="center-content">
            <div className="check">✓</div>
            <p className="status-text done-text">Done! Pasting improved prompt…</p>
            <p className="result-preview">{result.slice(0, 120)}{result.length > 120 ? "…" : ""}</p>
          </div>
        )}

        {/* ERROR */}
        {view === "error" && (
          <div className="center-content">
            <div className="x-icon">✗</div>
            <p className="status-text error-text">Something went wrong</p>
            <p className="sub-text">{error}</p>
            <button className="btn-secondary" onClick={hide}>Dismiss</button>
          </div>
        )}

        {/* EMPTY — nothing was selected */}
        {view === "empty" && (
          <div className="center-content">
            <p className="status-text">No text selected</p>
            <p className="sub-text">Select some text first, then press ⌘⇧I</p>
            <button className="btn-secondary" onClick={hide}>Got it</button>
          </div>
        )}

        {/* IDLE */}
        {view === "idle" && (
          <div className="center-content">
            <Logo />
            <p className="status-text">Select text anywhere, then press</p>
            <div className="hotkey">⌘ I</div>
          </div>
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <div className="settings">
            <p className="settings-title">Configure Prompt Labs</p>
            <div className="field">
              <label>API URL</label>
              <input
                type="url"
                value={settingsUrl}
                onChange={(e) => setSettingsUrl(e.target.value)}
                placeholder="https://your-app.replit.app"
                autoFocus
              />
            </div>
            <div className="field">
              <label>API Key</label>
              <input
                type="password"
                value={settingsKey}
                onChange={(e) => setSettingsKey(e.target.value)}
                placeholder="Your extension API key"
              />
            </div>
            <div className="settings-actions">
              <button className="btn-secondary" onClick={hide}>Cancel</button>
              <button
                className="btn-primary"
                onClick={saveSettings}
                disabled={!settingsUrl.trim() || !settingsKey.trim()}
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
