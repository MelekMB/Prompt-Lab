export function LinearStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F0F10", minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes drift { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
      `}</style>

      {/* Purple gradient orb — Linear signature */}
      <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(120,87,255,0.18) 0%, rgba(82,54,212,0.08) 50%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 40, right: 80, width: 200, height: 200, background: "radial-gradient(circle, rgba(100,72,255,0.12) 0%, transparent 70%)", borderRadius: "50%", animation: "drift 8s ease-in-out infinite", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 20, background: "linear-gradient(135deg, #7C5CFC, #4F35D0)", borderRadius: 5 }} />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.03em" }}>prompt labs</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#666" }}>
            <span>Changelog</span><span>Docs</span><span>Leaderboard</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "transparent", border: "1px solid #222", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#888", cursor: "pointer" }}>Log in</button>
          <button style={{ background: "linear-gradient(135deg, #7C5CFC, #5B3FD4)", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#fff", fontWeight: 500, cursor: "pointer" }}>Get started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 32px 48px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#9B7FFC", marginBottom: 28 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7C5CFC" }} />
          Adversarial prompt optimization
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.04, marginBottom: 18 }}>
          Your prompt,
          <br />
          <span style={{ background: "linear-gradient(90deg, #9B7FFC, #7C5CFC, #5B8BFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            battle-tested.
          </span>
        </h1>

        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 36px" }}>
          Two AIs argue over your prompt until it scores 9 out of 10.<br />Every version is tracked. Best one wins.
        </p>

        {/* Input */}
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ background: "#161618", border: "1px solid #252528", borderRadius: 10, padding: "14px 16px", textAlign: "left", marginBottom: 10, boxShadow: "0 0 0 1px rgba(124,92,252,0.08), 0 4px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Your prompt</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>Drop your rough idea here...</div>
            <div style={{ display: "flex", gap: 4, marginTop: 12, justifyContent: "flex-end" }}>
              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 26, height: 26, background: n === 3 ? "rgba(124,92,252,0.2)" : "#1E1E21", border: `1px solid ${n === 3 ? "rgba(124,92,252,0.5)" : "#2A2A2D"}`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: n === 3 ? "#9B7FFC" : "#555" }}>{n}</div>)}
            </div>
          </div>
          <button style={{ width: "100%", background: "linear-gradient(135deg, #7C5CFC, #5B3FD4)", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 0 24px rgba(124,92,252,0.3)" }}>
            Make it better →
          </button>
        </div>
      </div>

      {/* Stats grid — Linear data aesthetic */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a1a1d", borderRadius: 8, overflow: "hidden", border: "1px solid #222" }}>
          {[["1,200+", "prompts today"], ["+4.2pts", "avg improvement"], ["9.8/10", "top score"]].map(([val, label]) => (
            <div key={val} style={{ background: "#0F0F10", padding: "16px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: 3 }}>{val}</div>
              <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
