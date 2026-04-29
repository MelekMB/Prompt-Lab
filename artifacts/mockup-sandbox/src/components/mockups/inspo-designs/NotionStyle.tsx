export function NotionStyle() {
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#FFFEF9", minHeight: "100vh", color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: 'Inter', system-ui, sans-serif; }
        .serif { font-family: 'Lora', Georgia, serif; }
      `}</style>

      {/* Nav — Notion ultra clean */}
      <nav className="sans" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid #EEEAE0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.01em" }}>prompt labs</span>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#888" }}>
            <span>Leaderboard</span><span>Docs</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "transparent", border: "1px solid #DDD9D0", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Log in</button>
          <button style={{ background: "#1A1A1A", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 12, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Get started free</button>
        </div>
      </nav>

      {/* Hero — editorial, centered, Notion style */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "72px 40px 48px", textAlign: "center" }}>
        <h1 className="serif" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20, color: "#1A1A1A" }}>
          Your prompt,{" "}
          <em style={{ color: "#6B5CF6", fontStyle: "italic" }}>battle-tested</em>
          <br />by two AIs.
        </h1>

        <p className="sans" style={{ fontSize: 16, color: "#787672", lineHeight: 1.7, marginBottom: 40, maxWidth: 440, margin: "0 auto 40px" }}>
          Paste any rough idea. OpenAI rewrites it, Gemini scores it, repeat — until your prompt is the best it can be.
        </p>

        {/* Notion-style input block */}
        <div style={{ background: "#FFFEF9", border: "1px solid #DDD9D0", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", textAlign: "left", marginBottom: 16 }}>
          <div className="sans" style={{ padding: "14px 16px", borderBottom: "1px solid #F0EDE6" }}>
            <span style={{ fontSize: 10, color: "#BBB8B0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your prompt</span>
          </div>
          <div style={{ padding: "16px", minHeight: 80 }}>
            <span className="sans" style={{ fontSize: 14, color: "#C9C6BF" }}>Drop your rough idea here…</span>
          </div>
          <div className="sans" style={{ padding: "10px 16px", borderTop: "1px solid #F0EDE6", background: "#FDFCF7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["Write a cold email to a VC", "Job interview prep", "Product tweet"].map(e => (
                <div key={e} style={{ background: "#F0EDE6", borderRadius: 4, padding: "3px 8px", fontSize: 11, color: "#888", cursor: "pointer" }}>{e}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ width: 24, height: 24, borderRadius: 4, background: n === 3 ? "#6B5CF6" : "transparent", border: `1px solid ${n === 3 ? "#6B5CF6" : "#DDD9D0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: n === 3 ? "#fff" : "#AAA" }}>{n}</div>
              ))}
            </div>
          </div>
        </div>

        <button className="sans" style={{ background: "#1A1A1A", border: "none", borderRadius: 6, padding: "12px 32px", fontSize: 14, fontWeight: 500, color: "#fff", cursor: "pointer", width: "100%" }}>
          Make it better →
        </button>

        {/* Notion-style social proof — understated */}
        <p className="sans" style={{ fontSize: 12, color: "#BBB8B0", marginTop: 20 }}>
          1,200+ prompts improved today · avg score jump +4.2 pts
        </p>
      </div>

      {/* Notion-style divider + steps */}
      <div className="sans" style={{ borderTop: "1px solid #EEEAE0", maxWidth: 640, margin: "0 auto", padding: "36px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[
            ["01 — Paste", "Any rough idea, prompt fragment, or half-formed instruction."],
            ["02 — Battle", "OpenAI rewrites. Gemini critiques the result. Repeat up to 5 rounds."],
            ["03 — Copy", "Take the best version. Every round is saved and selectable."],
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
