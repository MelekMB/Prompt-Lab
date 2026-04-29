import { Link, useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen w-full bg-[#080810] overflow-hidden text-foreground">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-violet-600/8 blur-[100px] pointer-events-none z-0" />

      {/* Top Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-black/20 backdrop-blur-sm shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight font-mono">prompt_lab</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/history" className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
            location.startsWith("/history") || location.startsWith("/session")
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}>
            History
          </Link>
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
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
