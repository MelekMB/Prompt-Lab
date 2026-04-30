import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      baseOpacity: Math.random() * 0.5 + 0.08,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
    }));

    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;
      for (const s of stars) {
        const opacity = s.baseOpacity * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen w-full bg-[#070709] overflow-hidden text-foreground">
      <StarField />

      {/* Maroon radial glow — top left like OpenClaw */}
      <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at top left, rgba(192,30,30,0.13) 0%, transparent 70%)" }} />

      {/* Subtle center glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at top, rgba(220,80,60,0.07) 0%, transparent 70%)" }} />

      {/* Top Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05] bg-black/30 backdrop-blur-sm shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_8px_rgba(224,82,82,0.6)]">
            <rect width="28" height="28" rx="7" fill="url(#logoGrad)" />
            <path d="M7 10.5L12.5 14L7 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 17.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c0392b" />
                <stop offset="100%" stopColor="#e05252" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-bold text-base tracking-tight font-mono">prompt labs</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            location === "/"
              ? "bg-primary/20 border-primary/30 text-primary"
              : "border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}>
            Lab
          </Link>
        </nav>
      </header>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.018] z-0"
        style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
