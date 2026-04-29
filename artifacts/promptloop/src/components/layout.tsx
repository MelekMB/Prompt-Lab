import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen w-full bg-[#070709] overflow-hidden text-foreground">

      {/* Very subtle top-left warmth — far less aggressive than before */}
      <div className="fixed top-0 left-0 w-[500px] h-[300px] pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at top left, rgba(192,30,30,0.07) 0%, transparent 70%)" }} />

      {/* Top Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05] bg-black/20 backdrop-blur-sm shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="7" fill="hsl(0 80% 52%)" />
            <path d="M7 10.5L12.5 14L7 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 17.5H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-base tracking-tight font-mono">prompt labs</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/leaderboard" className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
            location.startsWith("/leaderboard")
              ? "text-amber-400"
              : "text-muted-foreground hover:text-foreground"
          )}>
            🏆 Leaderboard
          </Link>
          <Link href="/" className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            location === "/"
              ? "bg-primary/15 border-primary/25 text-primary"
              : "border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}>
            Lab
          </Link>
        </nav>
      </header>

      {/* Subtle dot grid — very low opacity, structural not decorative */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
