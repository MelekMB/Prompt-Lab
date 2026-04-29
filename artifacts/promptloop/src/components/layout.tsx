import { Link, useLocation } from "wouter";
import { Sparkles, History, Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-[#080810] overflow-hidden text-foreground">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-violet-600/8 blur-[100px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/[0.06] bg-black/20 backdrop-blur-sm shrink-0 z-10">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight font-mono">prompt_lab</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 pt-1">
          <p className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Workspace</p>

          <Link href="/" className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            location === "/"
              ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}>
            <Terminal className="w-4 h-4" />
            Lab
          </Link>

          <Link href="/history" className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            location.startsWith("/history") || location.startsWith("/session")
              ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}>
            <History className="w-4 h-4" />
            History
          </Link>
        </nav>

        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 font-mono">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/30 backdrop-blur-sm shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold tracking-tight text-sm font-mono">prompt_lab</span>
          </div>
          <div className="flex gap-1">
            <Link href="/" className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              location === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              Lab
            </Link>
            <Link href="/history" className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              location.startsWith("/history") ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              History
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
