export function VercelStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#000", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav — ultra minimal */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid #111" }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.03em" }}>prompt labs</span>
        <div style={{ display: "flex", gap: 32, fontSize: 13, color: "#777" }}>
          <span>Leaderboard</span>
          <span style={{ color: "#fff", background: "#fff", color: "#000", padding: "5px 14px", borderRadius: 5, fontWeight: 500, fontSize: 12 }}>Start →</span>
        </div>
      </nav>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 53px)" }}>

        {/* Left — headline + form */}
        <div style={{ padding: "60px 40px", borderRight: "1px solid #111", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20, fontWeight: 500 }}>
            Adversarial prompt optimization
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.02, marginBottom: 32 }}>
            Your prompt,<br />
            battle-tested<br />
            <span style={{ color: "#555" }}>by two AIs.</span>
          </h1>

          <div style={{ borderTop: "1px solid #111", paddingTop: 28, marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Prompt</div>
            <textarea
              readOnly
              placeholder="Drop your rough idea here..."
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#777", resize: "none", lineHeight: 1.6, height: 80, fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ background: "#fff", border: "none", borderRadius: 5, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#000", cursor: "pointer" }}>
              Make it better →
            </button>
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ width: 28, height: 30, border: `1px solid ${n === 3 ? "#fff" : "#222"}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: n === 3 ? "#fff" : "#444" }}>{n}</div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Write a cold email to a VC", "Job interview prep", "Product launch tweet"].map(e => (
              <div key={e} style={{ border: "1px solid #1a1a1a", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#555", cursor: "pointer" }}>{e}</div>
            ))}
          </div>
        </div>

        {/* Right — data display */}
        <div style={{ padding: "60px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Score grid */}
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>Score trace</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#111", border: "1px solid #111", borderRadius: 6, overflow: "hidden", marginBottom: 32 }}>
            {[
              ["Original", "2.0", "#555"],
              ["Round 1", "5.3", "#777"],
              ["Round 2", "7.1", "#aaa"],
              ["Final", "9.2", "#fff"],
            ].map(([label, score, color]) => (
              <div key={label} style={{ background: "#000", padding: "20px 20px" }}>
                <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color }}>{score}</div>
                <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>out of 10</div>
              </div>
            ))}
          </div>

          {/* Process */}
          <div style={{ borderTop: "1px solid #111", paddingTop: 24 }}>
            {[
              ["01", "OpenAI rewrites the prompt with structure, role, and constraints"],
              ["02", "Gemini critiques the result across 10 evaluation dimensions"],
              ["03", "Repeat until the score can't improve or rounds are exhausted"],
            ].map(([n, desc]) => (
              <div key={n} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: "#333", fontWeight: 600, fontVariantNumeric: "tabular-nums", flexShrink: 0, marginTop: 1 }}>{n}</span>
                <span style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{desc}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #111", paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#333" }}>
            <span>🏆 Leaderboard</span>
            <span>avg improvement: +4.2 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
