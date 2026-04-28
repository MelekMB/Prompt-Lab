import { Link, useLocation } from "wouter";
import { Sparkles, History, Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight font-mono">PromptLoop</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="mb-4 mt-2 px-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
          </div>
          
          <Link href="/" className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            location === "/" 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}>
            <Terminal className="h-4 w-4" />
            Lab
          </Link>
          
          <Link href="/history" className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            location.startsWith("/history") || location.startsWith("/session")
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}>
            <History className="h-4 w-4" />
            History
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground font-mono">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-bold tracking-tight font-mono">PromptLoop</span>
          </div>
          <div className="flex gap-2">
            <Link href="/" className={cn(
              "px-3 py-1.5 rounded text-sm font-medium",
              location === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>
              Lab
            </Link>
            <Link href="/history" className={cn(
              "px-3 py-1.5 rounded text-sm font-medium",
              location.startsWith("/history") ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>
              History
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto z-0 relative scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
