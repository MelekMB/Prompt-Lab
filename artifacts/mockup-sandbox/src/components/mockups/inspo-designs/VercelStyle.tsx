export function VercelStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fff", minHeight: "100vh", color: "#111", position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Grid overlay — Vercel signature */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#E8E8E8 1px, transparent 1px), linear-gradient(90deg, #E8E8E8 1px, transparent 1px)", backgroundSize: "72px 72px", opacity: 0.4, pointerEvents: "none" }} />
      {/* Corner markers */}
      {[[-2,-2],[69,-2],[-2,69],[69,69]].map(([x,y],i) => <div key={i} style={{ position: "absolute", left: x+310, top: y+88, width: 8, height: 8, border: "1px solid #ccc", background: "transparent" }} />)}

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", position: "relative", zIndex: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", borderBottom: "1px solid #E8E8E8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "12px solid #111" }} />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>prompt labs</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#666" }}>
            {["Products","Resources","Solutions","Enterprise","Pricing"].map(n => <span key={n} style={{ cursor: "pointer" }}>{n}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#fff", border: "1px solid #E0E0E0", borderRadius: 6, padding: "7px 14px", fontSize: 13, color: "#111", cursor: "pointer", fontFamily: "inherit" }}>Log In</button>
          <button style={{ background: "#111", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Sign Up</button>
        </div>
      </nav>

      {/* Hero — centered like Vercel */}
      <div style={{ textAlign: "center", padding: "72px 32px 0", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.04, color: "#111", marginBottom: 20 }}>
          Your prompt,<br />battle-tested by two AIs.
        </h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
          Two models fight over your prompt until it scores 9 out of 10. Works for any use case.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 48 }}>
          <button style={{ background: "#111", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "9px solid #fff" }} />
            Start Optimizing
          </button>
          <button style={{ background: "#fff", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "11px 24px", fontSize: 14, color: "#333", cursor: "pointer", fontFamily: "inherit" }}>See Leaderboard</button>
        </div>

        {/* Colorful geometric art — Vercel's signature element */}
        <div style={{ position: "relative", height: 280, overflow: "hidden", borderRadius: "0 0 16px 16px", background: "#fff" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            {/* Concentric lines radiating from center-bottom — like Vercel's triangle */}
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: `translateX(-50%)`,
                width: `${(i + 1) * 48}px`,
                height: `${(i + 1) * 48}px`,
                borderRadius: "50% 50% 0 0",
                border: `1.5px solid ${i % 3 === 0 ? "rgba(251,146,60,0.5)" : i % 3 === 1 ? "rgba(52,211,153,0.4)" : "rgba(99,102,241,0.3)"}`,
              }} />
            ))}
            {/* Center triangle */}
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderBottom: "100px solid #E0E0E0" }} />
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "52px solid transparent", borderRight: "52px solid transparent", borderBottom: "90px solid #C8C8C8" }} />
          </div>
        </div>
      </div>

      {/* Social proof logos strip */}
      <div style={{ display: "flex", justifyContent: "center", gap: 48, padding: "24px 32px", borderTop: "1px solid #F0F0F0", position: "relative", zIndex: 10 }}>
        {["OpenAI", "Gemini", "Anthropic", "Mistral"].map(name => (
          <span key={name} style={{ fontSize: 13, color: "#AAA", fontWeight: 500 }}>{name}</span>
        ))}
      </div>
    </div>
  );
}
