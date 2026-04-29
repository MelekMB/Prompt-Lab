export function StripeStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F6F9FC", minHeight: "100vh", color: "#0A2540" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Stripe-style gradient header band */}
      <div style={{ background: "linear-gradient(135deg, #0A2540 0%, #1a3a5c 40%, #0d3360 60%, #0A2540 100%)", padding: "0 0 80px 0", position: "relative", overflow: "hidden" }}>
        {/* Diagonal color sweep — Stripe signature */}
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, background: "linear-gradient(135deg, rgba(99,91,255,0.35), rgba(80,180,255,0.15))", borderRadius: "50%", transform: "rotate(-15deg)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, background: "linear-gradient(135deg, rgba(99,91,255,0.2), rgba(0,180,150,0.1))", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>prompt labs</span>
            <div style={{ display: "flex", gap: 28, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              <span>Products</span><span>Docs</span><span>Pricing</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>Sign in</span>
            <button style={{ background: "#635BFF", border: "none", borderRadius: 5, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Start now →</button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 40px 0", textAlign: "center", position: "relative", zIndex: 10 }}>
          <h1 style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04, color: "#fff", marginBottom: 20 }}>
            Your prompt,<br />
            <span style={{ background: "linear-gradient(90deg, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              battle-tested.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 36 }}>
            Two AIs argue over your prompt until it scores 9 out of 10. Works for any prompt, any use case.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={{ background: "#635BFF", border: "none", borderRadius: 5, padding: "12px 28px", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Start optimizing →</button>
            <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 5, padding: "12px 24px", fontSize: 14, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>See leaderboard</button>
          </div>
        </div>
      </div>

      {/* Light section — Stripe "product below the fold" */}
      <div style={{ background: "#fff", margin: "0 40px", borderRadius: 10, padding: "32px", boxShadow: "0 2px 24px rgba(10,37,64,0.08)", transform: "translateY(-40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#8898aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Your prompt</div>
            <div style={{ fontSize: 14, color: "#ccc", marginBottom: 20 }}>Drop your rough idea here...</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Write a cold email to a VC", "Job interview prep", "Product tweet"].map(e => (
                <div key={e} style={{ background: "#F6F9FC", border: "1px solid #E0E7EF", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#4a5568", cursor: "pointer" }}>{e}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ width: 30, height: 30, borderRadius: 5, background: n === 3 ? "#635BFF" : "#F6F9FC", border: `1px solid ${n === 3 ? "#635BFF" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: n === 3 ? "#fff" : "#8898aa" }}>{n}</div>
              ))}
            </div>
            <button style={{ background: "#635BFF", border: "none", borderRadius: 5, padding: "10px 24px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>Make it better →</button>
          </div>
        </div>
      </div>

      {/* Stripe-style stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 64, padding: "0 40px 40px", marginTop: -20 }}>
        {[["1,200+", "prompts improved today"], ["avg +4.2pts", "score improvement"], ["9.8/10", "top leaderboard score"]].map(([val, label]) => (
          <div key={val} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0A2540", letterSpacing: "-0.04em" }}>{val}</div>
            <div style={{ fontSize: 12, color: "#8898aa", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
