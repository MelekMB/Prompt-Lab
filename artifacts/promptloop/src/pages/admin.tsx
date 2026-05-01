import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

interface Totals {
  total_sessions: number;
  unique_users: number;
  avg_score: number;
  avg_rounds: number;
  avg_improvement: number;
}

interface DailyRow { day: string; sessions: number; users: number }
interface ScoreRow { bucket: string; count: number }
interface SessionRow {
  id: number;
  ownerSid: string;
  originalPrompt: string;
  finalScore: number;
  initialScore: number | null;
  roundCount: number;
  goal: string | null;
  createdAt: string;
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await api("/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
      onLogin();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 mb-2">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#ag1)" />
            <path d="M7 10.5L12.5 14L7 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 17.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="ag1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c0392b" /><stop offset="100%" stopColor="#e05252" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white font-bold font-mono text-base tracking-tight">Admin</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium">Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
            placeholder="Enter admin password"
            className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50 placeholder:text-white/20 transition-colors"
          />
        </div>

        {err && <p className="text-red-400 text-xs">{err}</p>}

        <button
          type="submit"
          disabled={loading || !pw}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#c0392b] to-[#e05252] text-white font-semibold text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1">
      <span className="text-xs text-white/35 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      api("/admin/stats"),
      api("/admin/sessions?limit=50"),
    ]).then(([stats, sess]) => {
      const rows = stats.totals?.rows ?? [stats.totals];
      setTotals(rows[0] ?? stats.totals);
      setDaily((stats.daily?.rows ?? stats.daily) as DailyRow[]);
      setScoreBreakdown((stats.scoreBreakdown?.rows ?? stats.scoreBreakdown) as ScoreRow[]);
      setSessions(sess as SessionRow[]);
    }).catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await api("/admin/logout", { method: "POST" }).catch(() => {});
    onLogout();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#dg1)" />
            <path d="M7 10.5L12.5 14L7 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 17.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="dg1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c0392b" /><stop offset="100%" stopColor="#e05252" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-bold font-mono text-sm">prompt labs · admin</span>
        </div>
        <button
          onClick={logout}
          className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-8">
        {err && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{err}</div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total sessions" value={totals?.total_sessions ?? 0} />
          <StatCard label="Unique users" value={totals?.unique_users ?? 0} sub="by session ID" />
          <StatCard label="Avg quality score" value={totals?.avg_score ? `${totals.avg_score}/10` : "—"} />
          <StatCard label="Avg rounds" value={totals?.avg_rounds ?? "—"} />
          <StatCard label="Avg improvement" value={totals?.avg_improvement ? `+${totals.avg_improvement}` : "—"} sub="score delta" />
        </div>

        {/* Daily sessions chart */}
        {daily.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Sessions — last 30 days</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={daily} barSize={12}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                  tickFormatter={d => d.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  itemStyle={{ color: "#e05252" }}
                />
                <Bar dataKey="sessions" fill="#c0392b" radius={[3, 3, 0, 0]}>
                  {daily.map((_, i) => (
                    <Cell key={i} fill={i === daily.length - 1 ? "#e05252" : "#c0392b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score breakdown + recent sessions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score breakdown */}
          {scoreBreakdown.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quality breakdown</h2>
              {scoreBreakdown.map(row => (
                <div key={row.bucket} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/50 flex-1">{row.bucket}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-white/10 w-24 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#c0392b] to-[#e05252]"
                        style={{ width: `${Math.min(100, (row.count / (totals?.total_sessions || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white/40 w-6 text-right">{row.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent sessions table */}
          <div className="md:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left px-5 py-2.5 text-white/30 font-medium">Prompt</th>
                    <th className="text-right px-4 py-2.5 text-white/30 font-medium">Score</th>
                    <th className="text-right px-4 py-2.5 text-white/30 font-medium">Rounds</th>
                    <th className="text-right px-5 py-2.5 text-white/30 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5 text-white/60 max-w-[260px]">
                        <span className="truncate block" title={s.originalPrompt}>
                          {s.originalPrompt.length > 60 ? s.originalPrompt.slice(0, 60) + "…" : s.originalPrompt}
                        </span>
                        {s.goal && <span className="text-white/25 block truncate">{s.goal}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <span className={`${s.finalScore >= 8 ? "text-green-400" : s.finalScore >= 6 ? "text-yellow-400" : "text-white/40"}`}>
                          {s.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-white/35 font-mono">{s.roundCount}</td>
                      <td className="px-5 py-2.5 text-right text-white/30">
                        {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-white/20">No sessions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe the stats endpoint — 401 = not logged in, 200 = already authed
    api("/admin/stats")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}
