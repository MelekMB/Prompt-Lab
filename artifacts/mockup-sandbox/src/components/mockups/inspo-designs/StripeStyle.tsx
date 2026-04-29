export function StripeStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fff", minHeight: "100vh", color: "#0A2540", position: "relative", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Stripe-style flowing gradient — occupies right third */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "80%", background: "linear-gradient(135deg, #FF9A5C 0%, #FF6B9D 20%, #C77DFF 45%, #7B61FF 65%, #4FC3F7 85%, #69F0AE 100%)", opacity: 0.9, borderRadius: "0 0 0 60%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "10%", right: "5%", width: "40%", height: "60%", background: "linear-gradient(200deg, rgba(255,255,255,0.15) 0%, transparent 60%)", pointerEvents: "none", borderRadius: "50%" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 36px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0A2540", letterSpacing: "-0.03em" }}>prompt labs</span>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#425466" }}>
            {["Products","Solutions","Developers","Resources","Pricing"].map(n => <span key={n} style={{ cursor: "pointer" }}>{n}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "transparent", border: "1px solid #E0E8F0", borderRadius: 5, padding: "7px 16px", fontSize: 13, color: "#0A2540", cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
          <button style={{ background: "#635BFF", border: "none", borderRadius: 5, padding: "7px 18px", fontSize: 13, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Contact sales &gt;</button>
        </div>
      </nav>

      {/* Hero — left aligned like Stripe */}
      <div style={{ padding: "60px 36px", position: "relative", zIndex: 10, maxWidth: 560 }}>
        <div style={{ fontSize: 12, color: "#425466", marginBottom: 12 }}>
          Prompts improved today: <span style={{ fontWeight: 600 }}>1,247</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: 20 }}>
          The prompt engine to{" "}
          <span style={{ color: "#635BFF" }}>grow your AI results.</span>
          {" "}Two AIs refine every prompt,{" "}
          <span style={{ color: "#635BFF" }}>score it, and iterate.</span>
        </h1>
        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          <button style={{ background: "#635BFF", border: "none", borderRadius: 5, padding: "12px 24px", fontSize: 14, color: "#fff", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Start optimizing &gt;</button>
          <button style={{ background: "#fff", border: "1px solid #E0E8F0", borderRadius: 5, padding: "12px 20px", fontSize: 14, color: "#0A2540", cursor: "pointer", fontFamily: "inherit" }}>🔍 Sign up with Google</button>
        </div>

        {/* Social proof logos */}
        <div style={{ borderTop: "1px solid #E8EEF5", paddingTop: 24 }}>
          <div style={{ fontSize: 11, color: "#8898AA", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Trusted by AI teams at</div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Figma", "Notion", "Ramp", "Linear", "Vercel", "Stripe"].map(name => (
              <span key={name} style={{ fontSize: 13, color: "#8898AA", fontWeight: 600 }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
