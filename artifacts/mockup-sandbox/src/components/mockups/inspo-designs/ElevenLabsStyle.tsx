export function ElevenLabsStyle() {
  const voices = [
    { name: "Characters", desc: "Playful and engaging", gradient: "linear-gradient(135deg, #C084FC, #818CF8, #60A5FA)" },
    { name: "Narration", desc: "Expressive, audiobooks", gradient: "linear-gradient(135deg, #FB923C, #F87171, #C084FC)", featured: true },
    { name: "Conversational", desc: "Natural, informal", gradient: "linear-gradient(135deg, #34D399, #60A5FA, #818CF8)" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fff", minHeight: "100vh", color: "#111" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em" }}>||prompt labs</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#555" }}>
          {["Products","Leaderboard","Resources","Pricing"].map(n => <span key={n} style={{ cursor: "pointer" }}>{n}</span>)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "transparent", border: "none", fontSize: 13, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Log in</button>
          <button style={{ background: "#111", border: "none", borderRadius: 100, padding: "8px 20px", fontSize: 13, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Sign up</button>
        </div>
      </nav>

      {/* Hero — left aligned, two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "60px 36px 40px", alignItems: "start" }}>
        <div>
          <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 28 }}>
            Your prompt,<br />battle-tested.
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ background: "#111", border: "none", borderRadius: 100, padding: "11px 24px", fontSize: 14, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Make it better →</button>
            <button style={{ background: "transparent", border: "1.5px solid #E0E0E0", borderRadius: 100, padding: "11px 22px", fontSize: 14, color: "#333", cursor: "pointer", fontFamily: "inherit" }}>See leaderboard</button>
          </div>
        </div>
        <div style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>
            Powering the most effective AI prompts. From adversarial rewrites to Gemini scoring — two AIs argue over your input until it scores 9 out of 10.
          </p>
        </div>
      </div>

      {/* Product card — tabbed showcase, like ElevenLabs */}
      <div style={{ margin: "0 36px", background: "#F7F7F7", borderRadius: 16, padding: "20px 20px 0", overflow: "hidden" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["🔴 Round 1", true], ["🟡 Round 2", false], ["🟢 Final", false]].map(([label, active]) => (
            <div key={label as string} style={{ background: active ? "#fff" : "transparent", border: active ? "1px solid #E8E8E8" : "none", borderRadius: 100, padding: "5px 14px", fontSize: 13, color: active ? "#111" : "#888", cursor: "pointer", fontWeight: active ? 500 : 400, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{label as string}</div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 13, color: "#888", paddingTop: 5 }}>Score: 9.2 / 10</div>
        </div>

        {/* Voice orbs row — adapted as "prompt types" */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", padding: "20px 0 0" }}>
          {voices.map(v => (
            <div key={v.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{ width: v.featured ? 140 : 110, height: v.featured ? 140 : 110, borderRadius: "50%", background: v.gradient, boxShadow: v.featured ? "0 8px 32px rgba(0,0,0,0.15)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {v.featured && <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18 }}>▶</span></div>}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: v.featured ? 600 : 400, color: "#111" }}>{v.name} {v.featured ? "↗" : ""}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #EBEBEB", marginTop: 20, padding: "14px 0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["Cold email", "Job prep", "Tweet", "Voice clone"].map((t, i) => (
              <div key={t} style={{ background: i === 0 ? "#111" : "transparent", border: "1px solid #E0E0E0", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: i === 0 ? "#fff" : "#666", cursor: "pointer" }}>{t}</div>
            ))}
          </div>
          <button style={{ background: "#111", border: "none", borderRadius: 100, padding: "7px 18px", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Sign up</button>
        </div>
      </div>
    </div>
  );
}
