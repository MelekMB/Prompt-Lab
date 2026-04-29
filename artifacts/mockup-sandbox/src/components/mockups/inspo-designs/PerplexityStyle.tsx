export function PerplexityStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0C0C0C", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#20B8CD", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontSize: 13, fontWeight: 700 }}>pl</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#fff", letterSpacing: "-0.02em" }}>prompt labs</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#888" }}>
          <span style={{ cursor: "pointer" }}>Leaderboard</span>
          <span style={{ cursor: "pointer", color: "#20B8CD" }}>Try for free</span>
        </div>
      </nav>

      {/* Hero — centered, search-forward */}
      <div style={{ maxWidth: 640, margin: "80px auto 0", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#20B8CD", marginBottom: 28 }}>
          adversarial AI optimization
        </div>

        <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, color: "#fff", marginBottom: 16 }}>
          Your prompt,<br />
          <span style={{ color: "#20B8CD" }}>battle-tested.</span>
        </h1>

        <p style={{ fontSize: 16, color: "#888", lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
          Two AIs argue over your prompt until it scores 9 out of 10. Takes about 30 seconds.
        </p>

        {/* Search box */}
        <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "16px 20px", textAlign: "left", marginBottom: 12, position: "relative" }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 500 }}>Your prompt</div>
          <div style={{ fontSize: 15, color: "#444", lineHeight: 1.5 }}>Drop your rough idea here...</div>
          <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ width: 26, height: 26, borderRadius: 6, background: n === 3 ? "#20B8CD" : "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: n === 3 ? "#000" : "#666" }}>{n}</div>
            ))}
          </div>
        </div>

        <button style={{ width: "100%", background: "#20B8CD", border: "none", borderRadius: 8, padding: "13px", fontSize: 14, fontWeight: 600, color: "#000", cursor: "pointer", letterSpacing: "-0.01em" }}>
          Make it better →
        </button>

        {/* Examples */}
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {["Write a cold email to a VC", "Help me prep for a job interview", "Product launch tweet"].map(e => (
            <div key={e} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 100, padding: "5px 12px", fontSize: 12, color: "#888", cursor: "pointer" }}>
              {e}
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, paddingTop: 32, borderTop: "1px solid #1a1a1a" }}>
        {[["1,200+", "prompts improved today"], ["avg +4.2", "score jump per session"], ["9.8/10", "top leaderboard score"]].map(([stat, label]) => (
          <div key={stat} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{stat}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
