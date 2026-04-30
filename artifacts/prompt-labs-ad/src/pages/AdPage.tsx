import { useEffect, useState } from "react";

const PROMPT_LABS_URL = "https://promptlabs.replit.app";

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1.2vw, 16px)" }}>
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: "clamp(28px, 5.5vh, 44px)", width: "auto" }}
      >
        <rect width="28" height="28" rx="7" fill="url(#g1)" />
        <path
          d="M7 10.5L12.5 14L7 17.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 17.5H21"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="100%" stopColor="#e05252" />
          </linearGradient>
        </defs>
      </svg>
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(12px, 2.2vh, 18px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.02em",
          opacity: 0.9,
        }}
      >
        prompt labs
      </span>
    </div>
  );
}

function PromptRewriteDemo() {
  const before = "write me a cold email to get meetings with VCs";
  const after = [
    { label: "Role:", value: "Startup fundraising advisor & cold email specialist." },
    { label: "Task:", value: "Write a concise cold email to a VC partner." },
    { label: "Requirements:", value: "Max 150 words. Open with one relevant metric. One clear ask." },
    { label: "Output:", value: "Subject line + email body." },
    { label: "Tone:", value: "Confident, direct, human — never salesy." },
  ];

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: "clamp(16px, 3vw, 40px)",
        alignItems: "center",
        width: "100%",
        maxWidth: 900,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "clamp(14px, 2.5vh, 24px) clamp(16px, 2.5vw, 28px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.1vw, 13px)",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "clamp(8px, 1.2vh, 14px)",
          }}
        >
          Your rough prompt
        </p>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(13px, 1.4vw, 17px)",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            fontStyle: "italic",
          }}
        >
          "{before}"
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s",
        }}
      >
        <div
          style={{
            width: 1,
            height: "clamp(24px, 5vh, 48px)",
            background: "linear-gradient(to bottom, transparent, #c0392b)",
          }}
        />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v14M4 13l6 6 6-6" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(8px, 0.9vw, 11px)",
            color: "#c0392b",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          N rounds
        </p>
      </div>

      <div
        style={{
          background: "rgba(192,57,43,0.08)",
          border: "1px solid rgba(192,57,43,0.3)",
          borderRadius: 12,
          padding: "clamp(14px, 2.5vh, 24px) clamp(16px, 2.5vw, 28px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(12px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}
      >
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.1vw, 13px)",
            color: "#e05252",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "clamp(8px, 1.2vh, 14px)",
          }}
        >
          Battle-tested prompt
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(5px, 0.8vh, 9px)" }}>
          {after.map(({ label, value }) => (
            <p
              key={label}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(11px, 1.2vw, 14px)",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#e05252", fontWeight: 700 }}>{label}</span>{" "}
              {value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070709",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Red glow — top left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "55%",
          height: "50%",
          background:
            "radial-gradient(ellipse at top left, rgba(192,57,43,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Red glow — bottom right (subtle) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(ellipse at bottom right, rgba(192,57,43,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Nav bar */}
      <nav
        style={{
          padding: "clamp(20px, 4vh, 36px) clamp(24px, 6vw, 72px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <Logo />
        <a
          href={PROMPT_LABS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(11px, 1.3vw, 14px)",
            color: "#fff",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "8px 20px",
            letterSpacing: "0.04em",
            transition: "border-color 0.2s, background 0.2s",
            background: "rgba(255,255,255,0.03)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(192,57,43,0.6)";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(192,57,43,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
          }}
        >
          Try it free →
        </a>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(32px, 6vh, 80px) clamp(24px, 8vw, 120px)",
          position: "relative",
          zIndex: 10,
          gap: "clamp(48px, 8vh, 96px)",
        }}
      >
        {/* Headline block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(12px, 2vh, 22px)",
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "clamp(11px, 1.6vh, 15px)",
              fontWeight: 400,
              color: "#c0392b",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            The problem with AI prompts
          </p>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(42px, 8.5vw, 112px)",
              fontWeight: 800,
              lineHeight: 1.03,
              color: "#fff",
              letterSpacing: "-0.035em",
            }}
          >
            Your prompts<br />
            deserve{" "}
            <span style={{ color: "#e05252" }}>better.</span>
          </h1>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 22px)",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              maxWidth: 560,
              marginTop: 4,
            }}
          >
            Two AIs argue. Your prompt gets rewritten until it's actually good.
          </p>
        </div>

        {/* Demo card */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PromptRewriteDemo />
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 0.4s",
          }}
        >
          <a
            href={PROMPT_LABS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: "'Space Mono', monospace",
              fontSize: "clamp(12px, 1.4vw, 16px)",
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              background: "linear-gradient(135deg, #c0392b, #e05252)",
              borderRadius: 10,
              padding: "clamp(14px, 2vh, 18px) clamp(28px, 4vw, 48px)",
              letterSpacing: "0.04em",
              boxShadow: "0 0 40px rgba(192,57,43,0.35)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 56px rgba(192,57,43,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 40px rgba(192,57,43,0.35)";
            }}
          >
            Improve my prompt →
          </a>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "clamp(10px, 1vh, 12px)",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.05em",
            }}
          >
            Free to try · No account required
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "clamp(16px, 3vh, 28px) clamp(24px, 6vw, 72px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.2vh, 13px)",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          promptlabs.replit.app
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.2vh, 13px)",
            color: "rgba(255,255,255,0.15)",
            letterSpacing: "0.05em",
          }}
        >
          OpenAI × Gemini
        </p>
      </footer>
    </div>
  );
}
