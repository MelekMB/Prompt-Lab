export function PerplexityStyle() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: "flex", height: "100vh", background: "#F5F4EF" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'); * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Left sidebar — dark, like Perplexity */}
      <div style={{ width: 200, background: "#1C1C1C", padding: "16px 0", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ padding: "8px 16px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#20B2AA", borderRadius: 6 }} />
        </div>
        {[["+ New", true], ["Leaderboard", false], ["Spaces", false], ["Customize", false], ["History", false]].map(([label, active]) => (
          <div key={label as string} style={{ padding: "7px 16px", fontSize: 13, color: active ? "#fff" : "#888", background: active ? "#2A2A2A" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderRadius: 6, margin: "0 8px" }}>
            {label as string}
          </div>
        ))}
        <div style={{ margin: "8px 16px 0", fontSize: 11, color: "#555" }}>No recent threads</div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "#F5F4EF" }}>
        {/* Top nav */}
        <div style={{ position: "absolute", top: 0, left: 200, right: 0, display: "flex", justifyContent: "flex-end", padding: "16px 24px", gap: 24, fontSize: 13, color: "#555" }}>
          {["Discover","Finance","Health","Academic","Patents"].map(item => <span key={item} style={{ cursor: "pointer" }}>{item}</span>)}
        </div>

        {/* Centered wordmark */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 400, color: "#1A1A1A", letterSpacing: "-0.04em" }}>prompt labs</div>
        </div>

        {/* Search box */}
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ background: "#fff", border: "1.5px solid #E2E0D8", borderRadius: 10, padding: "14px 16px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 15, color: "#999", marginBottom: 12 }}>Drop your rough idea here...</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F0EEE8", paddingTop: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ fontSize: 12, color: "#888", background: "#F5F4EF", border: "1px solid #E8E6E0", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>+ Attach</div>
                <div style={{ fontSize: 12, color: "#888", background: "#F5F4EF", border: "1px solid #E8E6E0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>⚙</span> Model
                </div>
              </div>
              <div style={{ width: 32, height: 32, background: "#1A1A1A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ color: "#fff", fontSize: 14 }}>↑</span>
              </div>
            </div>
          </div>

          {/* Suggestion chips — like Perplexity "Try Computer" */}
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #E8E6E0", borderRadius: 10, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚡</span> Try an example
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {["Cold email to a VC", "Job interview prep", "Product tweet", "Explain AI simply"].map(chip => (
                <div key={chip} style={{ background: "#F5F4EF", border: "1px solid #E8E6E0", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#555", cursor: "pointer" }}>{chip}</div>
              ))}
            </div>
            {["Write a cold email to a VC", "Help me prep for a job interview", "Create a YC application answer"].map(item => (
              <div key={item} style={{ fontSize: 13, color: "#444", padding: "6px 0", borderTop: "1px solid #F0EEE8", cursor: "pointer" }}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
