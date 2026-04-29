export function LinearStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#111112", minHeight: "100vh", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, background: "linear-gradient(135deg, #fff 0%, #aaa 100%)", borderRadius: 4 }} />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.03em" }}>prompt labs</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#666" }}>
            {["Product","Leaderboard","Customers","Pricing","Changelog","Contact"].map(n => <span key={n} style={{ cursor: "pointer" }}>{n}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#666", cursor: "pointer" }}>Log in</span>
          <span style={{ width: 1, height: 14, background: "#333" }} />
          <button style={{ background: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, color: "#111", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Sign up</button>
        </div>
      </nav>

      {/* Hero — LEFT aligned, huge type, like Linear */}
      <div style={{ padding: "60px 36px 32px" }}>
        <h1 style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.04, maxWidth: 700, marginBottom: 24 }}>
          The prompt improvement<br />system for builders<br />and teams
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 700 }}>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.65, maxWidth: 420 }}>
            Purpose-built for iterative prompt refinement. Two AIs debate every version. Designed for the AI era.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1E1E20", border: "1px solid #2A2A2C", borderRadius: 100, padding: "6px 14px", whiteSpace: "nowrap" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B8BFF" }} />
            <span style={{ fontSize: 12, color: "#888" }}>Adversarial scoring</span>
            <span style={{ fontSize: 12, color: "#5B8BFF" }}>Learn more →</span>
          </div>
        </div>
      </div>

      {/* Full-width product UI mockup — Linear's signature below-fold element */}
      <div style={{ margin: "0 36px", background: "#1A1A1C", border: "1px solid #2A2A2D", borderRadius: "12px 12px 0 0", overflow: "hidden", boxShadow: "0 -2px 40px rgba(0,0,0,0.5)" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #242428", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A3A3E" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A3A3E" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A3A3E" }} />
          </div>
          <div style={{ flex: 1, background: "#242428", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#555" }}>prompt labs / optimization / cold-email-vc</div>
        </div>
        {/* Content */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 280px", height: 260 }}>
          {/* Left sidebar */}
          <div style={{ borderRight: "1px solid #242428", padding: "12px 0" }}>
            {[["★ Prompt 01 — cold email", true], ["Prompt 02 — job interview", false], ["Prompt 03 — product tweet", false], ["+ New prompt", false]].map(([label, active]) => (
              <div key={label as string} style={{ padding: "7px 14px", fontSize: 11, color: active ? "#fff" : "#555", background: active ? "#242428" : "transparent", cursor: "pointer" }}>{label as string}</div>
            ))}
          </div>
          {/* Main panel */}
          <div style={{ padding: "16px 20px", borderRight: "1px solid #242428" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#E0E0E0", marginBottom: 12 }}>Cold email to a VC</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>Final score: <span style={{ color: "#4ADE80" }}>9.2 / 10</span> · 3 rounds · +5.1 pts</div>
            <div style={{ background: "#242428", borderRadius: 8, padding: "12px", fontSize: 11, color: "#888", lineHeight: 1.6 }}>
              Role: You are an expert at writing cold emails that get replies...<br />
              Context: The sender is a YC-backed founder...<br />
              Task: Write a compelling cold email to a Series A VC...
            </div>
          </div>
          {/* Right panel */}
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Round progression</div>
            {[["Original", "2.1", "#555"], ["Round 1", "5.8", "#666"], ["Round 2", "7.4", "#888"], ["Final", "9.2", "#4ADE80"]].map(([label, score, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: "#555", width: 56, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 2, background: "#2A2A2D", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${parseFloat(score as string) * 10}%`, background: color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color, fontWeight: 500, width: 28 }}>{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
