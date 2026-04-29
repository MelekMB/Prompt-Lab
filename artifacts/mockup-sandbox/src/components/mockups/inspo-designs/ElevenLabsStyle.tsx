export function ElevenLabsStyle() {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const heights = [20,35,55,70,85,90,75,60,80,95,70,50,65,85,40,55,75,90,60,45,80,70,55,40,65,85,95,70,55,40,60,80,45,70,90,60,50,75,85,40,65,55,80,70,45,90,60,50];
    return heights[i % heights.length];
  });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#000", minHeight: "100vh", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.04em" }}>prompt labs</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 6, height: 22, background: "#fff", borderRadius: 2 }} />
          <div style={{ width: 6, height: 22, background: "#fff", borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 13, color: "#fff", background: "#fff", color: "#000", borderRadius: 4, padding: "7px 16px", fontWeight: 600, cursor: "pointer" }}>Try free</span>
      </nav>

      {/* Waveform band — signature element */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, padding: "0 0 0 40px", height: 80, marginTop: 16 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 4, height: `${h}%`, background: i < 20 ? `rgba(255,255,255,${0.15 + (i/20)*0.7})` : `rgba(255,255,255,${0.85 - ((i-20)/28)*0.7})`, borderRadius: 2, flexShrink: 0 }} />
        ))}
      </div>

      {/* Hero */}
      <div style={{ padding: "24px 40px 0" }}>
        <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.98, textTransform: "uppercase" }}>
          YOUR<br />
          PROMPT<br />
          <span style={{ WebkitTextStroke: "1px #fff", color: "transparent" }}>PERFECTED.</span>
        </h1>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 40, gap: 40 }}>
          <div style={{ maxWidth: 320 }}>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 24 }}>
              Two AI models debate, critique, and rewrite your prompt across multiple rounds. The result is scored and logged.
            </p>

            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 6, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your prompt</div>
              <div style={{ fontSize: 13, color: "#444" }}>Drop your rough idea here...</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "#fff", border: "none", borderRadius: 4, padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer" }}>
                OPTIMIZE
              </button>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ width: 28, height: 38, background: n === 3 ? "#fff" : "#111", border: "1px solid #222", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: n === 3 ? "#000" : "#444" }}>{n}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Score progression — sound flow analog */}
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Score progression</div>
            {[["Original", 2], ["Round 1", 5], ["Round 2", 7], ["Round 3", 9]].map(([label, score], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#555", width: 60, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 3, background: "#111", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${(score as number) * 10}%`, background: i === 3 ? "#fff" : "#444", borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: i === 3 ? "#fff" : "#555", fontWeight: i === 3 ? 700 : 400, width: 28 }}>{score}/10</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "1px solid #111", padding: "16px 40px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444" }}>
        <span>OpenAI rewrites · Gemini critiques</span>
        <span>🏆 Leaderboard</span>
        <span>avg score jump +4.2 pts</span>
      </div>
    </div>
  );
}
