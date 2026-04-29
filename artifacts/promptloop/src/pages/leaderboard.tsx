import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardEntryType } from "@workspace/api-zod";

const SUBJECT_COLORS: Record<string, string> = {
  Marketing: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  Technical: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Creative: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Business: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Education: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Career: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  Product: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  Other: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const RANK_STYLES = [
  { bg: "bg-amber-400/10 border-amber-400/30", text: "text-amber-400", label: "🥇" },
  { bg: "bg-gray-300/10 border-gray-300/30", text: "text-gray-300", label: "🥈" },
  { bg: "bg-orange-600/10 border-orange-600/30", text: "text-orange-600", label: "🥉" },
];

function AvatarBadge({ handle, color, size = "md" }: { handle: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-12 h-12 text-lg" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-black font-mono flex-shrink-0 border-2", sz)}
      style={{ backgroundColor: `${color}22`, borderColor: `${color}55`, color }}
    >
      {handle.charAt(0).toUpperCase()}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8.5 ? "text-green-400 bg-green-400/10 border-green-400/30" :
                score >= 7 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" :
                "text-red-400 bg-red-400/10 border-red-400/30";
  return (
    <span className={cn("font-mono font-black text-sm px-2.5 py-1 rounded-full border", color)}>
      {score.toFixed(1)}/10
    </span>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Leaderboard() {
  const { data: entries = [], isLoading, error } = useQuery<LeaderboardEntryType[]>({
    queryKey: ["leaderboard"],
    queryFn: () => fetch("/api/leaderboard").then(r => r.json()),
    refetchInterval: 30000,
  });

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-20 space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Global Rankings</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Top{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Prompt Engineers
          </span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          The highest-scoring prompts optimized in prompt labs. Submit yours after running.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono">Loading leaderboard...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Failed to load leaderboard.</p>
        </div>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-xl font-bold">No entries yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Be the first to submit a prompt to the leaderboard. Run the optimizer and hit "Submit to Leaderboard".
          </p>
        </div>
      )}

      {/* Top 3 podium */}
      {!isLoading && top3.length > 0 && (
        <div className="grid gap-3">
          {top3.map((entry, i) => {
            const style = RANK_STYLES[i] ?? RANK_STYLES[2];
            return (
              <div key={entry.id} className={cn(
                "rounded-2xl border p-4 flex items-start gap-4 transition-all",
                i === 0
                  ? "bg-amber-400/5 border-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
                  : "bg-card/40 border-border/30"
              )}>
                {/* Rank */}
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border", style.bg)}>
                  <span>{style.label}</span>
                </div>

                {/* Avatar */}
                <AvatarBadge handle={entry.handle} color={entry.avatarColor} />

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground font-mono">{entry.handle}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-mono", SUBJECT_COLORS[entry.subject] ?? SUBJECT_COLORS.Other)}>
                      {entry.subject}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(new Date(entry.createdAt))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate leading-relaxed">
                    "{entry.originalPromptPreview}"
                  </p>
                  <p className="text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
                    {entry.finalPromptPreview}
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0">
                  <ScoreBadge score={entry.score} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      {!isLoading && rest.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-1">All entries</h3>
          {rest.map((entry, i) => (
            <div key={entry.id} className="rounded-xl border border-border/20 bg-card/20 px-4 py-3 flex items-center gap-3 hover:bg-card/40 transition-colors">
              <span className="font-mono text-xs text-muted-foreground w-6 text-right flex-shrink-0">#{i + 4}</span>
              <AvatarBadge handle={entry.handle} color={entry.avatarColor} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-mono text-foreground">{entry.handle}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-mono", SUBJECT_COLORS[entry.subject] ?? SUBJECT_COLORS.Other)}>
                    {entry.subject}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                  "{entry.originalPromptPreview}"
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScoreBadge score={entry.score} />
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {!isLoading && entries.length > 0 && (
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Run the optimizer and hit <strong className="text-foreground">Submit to Leaderboard</strong> to claim your rank</span>
          </div>
        </div>
      )}
    </div>
  );
}
