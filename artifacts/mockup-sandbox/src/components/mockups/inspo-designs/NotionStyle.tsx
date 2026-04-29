export function NotionStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#1E1F3B", minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Floating integration icons — Notion's visual motif */}
      {[
        { top: "18%", left: "4%",  emoji: "⚡", bg: "#F59E0B" },
        { top: "55%", left: "2%",  emoji: "🤖", bg: "#6366F1" },
        { top: "72%", left: "8%",  emoji: "📊", bg: "#10B981" },
        { top: "20%", right: "4%", emoji: "✨", bg: "#EC4899" },
        { top: "50%", right: "3%", emoji: "🏆", bg: "#F97316" },
        { top: "70%", right: "8%", emoji: "🎯", bg: "#8B5CF6" },
      ].map((item, i) => (
        <div key={i} style={{ position: "absolute", top: item.top, left: item.left, right: item.right, width: 44, height: 44, background: item.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 5 }}>
          {item.emoji}
        </div>
      ))}

      {/* Announcement banner */}
      <div style={{ background: "#2D2E52", padding: "8px 0", textAlign: "center", fontSize: 13, color: "#9CA3AF", borderBottom: "1px solid #3A3B5E" }}>
        Introducing round-by-round prompt analysis.{" "}
        <span style={{ color: "#60A5FA", cursor: "pointer" }}>Try it today →</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>⚡</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#9CA3AF" }}>
            {["Product","AI","Solutions","Enterprise","Pricing"].map(n => <span key={n} style={{ cursor: "pointer" }}>{n}</span>)}
        </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "transparent", border: "1px solid #3A3B5E", borderRadius: 6, padding: "7px 14px", fontSize: 13, color: "#9CA3AF", cursor: "pointer", fontFamily: "inherit" }}>Log in</button>
          <button style={{ background: "#2563EB", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Get prompt labs free</button>
        </div>
      </nav>

      {/* Hero — centered like Notion */}
      <div style={{ textAlign: "center", padding: "56px 32px 40px", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: 18 }}>
          Your prompt,<br />battle-tested.
        </h1>
        <p style={{ fontSize: 16, color: "#9CA3AF", lineHeight: 1.65, maxWidth: 440, margin: "0 auto 28px" }}>
          Two AIs keep optimizing until it scores 9 out of 10. They capture every improvement, score every round, and never stop until it's perfect.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
          <button style={{ background: "#2563EB", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Make it better</button>
          <button style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "12px 24px", fontSize: 14, color: "#E5E7EB", cursor: "pointer", fontFamily: "inherit" }}>Request a demo</button>
        </div>
      </div>

      {/* Product screenshot — centered like Notion */}
      <div style={{ margin: "0 32px", background: "#252642", borderRadius: "12px 12px 0 0", border: "1px solid #3A3B5E", overflow: "hidden", position: "relative", zIndex: 10, boxShadow: "0 -4px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid #3A3B5E" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ flex: 1, background: "#1E1F3B", borderRadius: 5, padding: "3px 12px", fontSize: 11, color: "#555", textAlign: "center" }}>prompt labs / session / cold-email-vc</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", height: 220 }}>
          <div style={{ borderRight: "1px solid #3A3B5E", padding: "14px 0" }}>
            <div style={{ padding: "6px 14px", fontSize: 11, color: "#6B7280" }}>Search</div>
            <div style={{ padding: "6px 14px", fontSize: 11, color: "#6B7280" }}>My prompts</div>
            <div style={{ padding: "6px 14px", fontSize: 11, color: "#fff", background: "#2D2E52" }}>⭐ Cold email VC</div>
            <div style={{ padding: "6px 14px", fontSize: 11, color: "#6B7280" }}>Job interview</div>
            <div style={{ padding: "6px 14px", fontSize: 11, color: "#6B7280" }}>Product tweet</div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Cold email to a VC</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 11 }}>
              {[["To-do","#6B7280","1"],["In progress","#F59E0B","2"],["Complete","#10B981","3"]].map(([label, color, count]) => (
                <div key={label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  <span style={{ color: "#9CA3AF" }}>{label}</span>
                  <span style={{ background: "#3A3B5E", borderRadius: 100, padding: "0 6px", color: "#fff" }}>{count}</span>
                </div>
              ))}
            </div>
            {["Rewrite for clarity", "Add negative constraints", "Define success criteria", "Finalize role and context"].map(task => (
              <div key={task} style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 0", borderTop: "1px solid #3A3B5E", fontSize: 12, color: "#D1D5DB" }}>
                <div style={{ width: 14, height: 14, border: "1px solid #4B5563", borderRadius: 3 }} />
                {task}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "16px", fontSize: 13, color: "#6B7280", position: "relative", zIndex: 10 }}>
        Trusted by 98% of the teams who try it
      </div>
    </div>
  );
}
