import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Loader2, ArrowRight, RotateCcw, ChevronDown, Twitter, Trophy, User } from "lucide-react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";

import { useCreateSession } from "@workspace/api-client-react";
import type { ImprovePromptResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AVATAR_COLORS, LEADERBOARD_SUBJECTS, type LeaderboardSubject } from "@workspace/api-zod";

const IDENTITY_KEY = "prompt_labs_identity";
interface Identity { handle: string; avatarColor: string; }
function getIdentity(): Identity | null {
  try { const r = localStorage.getItem(IDENTITY_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveIdentity(id: Identity) { localStorage.setItem(IDENTITY_KEY, JSON.stringify(id)); }

const EXAMPLE_PROMPTS = [
  "Write a cold email to a VC",
  "Help me prep for a job interview",
  "Create a YC application answer",
  "Write a product launch tweet",
  "Explain this concept simply",
];

const DEMO_PAIRS: { before: string; after: string; scoreFrom: number; scoreTo: number }[] = [
  {
    before: `write me a cold email to a vc`,
    after: `Role: Startup fundraising advisor & copywriter.

Task: Write a concise cold email to a VC.

Context: First-time founder, early traction. Reader gets 200+ emails/week.

Requirements:
- Max 150 words
- Open with a specific metric, not a generic intro
- State traction upfront (users / revenue / growth)
- One ask: a 20-min call. No buzzwords.

Output:
Subject: [compelling subject line]
---
[email body]`,
    scoreFrom: 2,
    scoreTo: 9,
  },
  {
    before: `help me prep for a job interview`,
    after: `Role: Senior career coach specializing in tech interviews.

Task: Create a structured interview prep plan.

Context: Candidate has an upcoming technical + behavioral interview at a top-tier company.

Requirements:
- Cover STAR method for behavioral questions
- List the 5 most common technical topics to review
- Include 3 questions to ask the interviewer
- Estimated prep time per section

Output: A day-by-day prep schedule for 5 days`,
    scoreFrom: 2,
    scoreTo: 8,
  },
  {
    before: `write a tweet about my product launch`,
    after: `Role: Growth marketer & viral copywriter.

Task: Write a product launch tweet that drives clicks.

Context: Announcing a new tool to a tech-savvy audience on X/Twitter.

Requirements:
- Max 280 chars
- Hook in the first 6 words
- State the core benefit, not features
- End with a clear CTA (link or reply)
- Conversational tone — no corporate speak

Output: 3 tweet variants (short / medium / thread-opener)`,
    scoreFrom: 3,
    scoreTo: 9,
  },
  {
    before: `explain how transformers work`,
    after: `Role: Technical educator who specialises in ML concepts.

Task: Explain the Transformer architecture clearly.

Audience: Software engineers with no ML background.

Requirements:
- Use an analogy before introducing math
- Explain attention mechanism in plain English
- Cover: tokens, embeddings, self-attention, feed-forward layers
- Max 400 words
- Avoid jargon without definition

Output: Explanation + one simple diagram description`,
    scoreFrom: 2,
    scoreTo: 8,
  },
];

type DemoPhase = "typing-before" | "pause-before" | "transition" | "typing-after" | "pause-after";

function AnimatedBeforeAfter() {
  const [phase, setPhase] = useState<DemoPhase>("typing-before");
  const [displayed, setDisplayed] = useState("");
  const [pairIndex, setPairIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentPair = DEMO_PAIRS[pairIndex];

  // Auto-scroll to bottom as text types in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayed]);

  useEffect(() => {
    let cancelled = false;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;
    let idx = 0;

    const sleep = (ms: number) =>
      new Promise<void>(resolve => { pendingTimer = setTimeout(resolve, ms); });

    async function typeText(text: string, speed: number) {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        setDisplayed(text.slice(0, i));
        await sleep(speed);
      }
    }

    async function run() {
      while (!cancelled) {
        const pair = DEMO_PAIRS[idx % DEMO_PAIRS.length];
        setPairIndex(idx % DEMO_PAIRS.length);

        // 1. Type the before prompt
        setPhase("typing-before");
        setDisplayed("");
        await typeText(pair.before, 55);
        if (cancelled) return;

        // 2. Pause so user can read it
        setPhase("pause-before");
        await sleep(1800);
        if (cancelled) return;

        // 3. Transition spinner
        setPhase("transition");
        setDisplayed("");
        await sleep(1600);
        if (cancelled) return;

        // 4. Stream out the optimized result
        setPhase("typing-after");
        await typeText(pair.after, 10);
        if (cancelled) return;

        // 5. Hold the final result then move to next pair
        setPhase("pause-after");
        await sleep(3000);
        if (cancelled) return;

        idx++;
      }
    }

    run();

    return () => {
      cancelled = true;
      if (pendingTimer) clearTimeout(pendingTimer);
    };
  }, []);

  const isTyping = phase === "typing-before" || phase === "typing-after";
  const isAfter = phase === "typing-after" || phase === "pause-after";
  const isDone = phase === "pause-after";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f] overflow-hidden">
      {/* Header — scores always visible here, never inside scroll area */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors duration-700",
            isAfter ? "bg-green-400" : phase === "transition" ? "bg-primary animate-pulse" : "bg-yellow-400/70"
          )} />
          <span className="text-xs font-mono text-muted-foreground">
            {isAfter ? "optimized_prompt.md" : phase === "transition" ? "optimizing..." : "raw_prompt.txt"}
          </span>
        </div>

        {/* Score always in header — transitions as phase changes */}
        <div className="flex items-center gap-2">
          {!isAfter && phase !== "transition" && (
            <span className="text-[10px] text-muted-foreground font-mono">
              score: {currentPair.scoreFrom}/10
            </span>
          )}
          {isAfter && !isDone && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {currentPair.scoreFrom}/10 →
            </span>
          )}
          {isDone && (
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono animate-in fade-in duration-300">
              {currentPair.scoreFrom}/10 → {currentPair.scoreTo}/10
            </span>
          )}
          {isAfter && (
            <div className={cn(
              "flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 transition-opacity duration-300",
              isDone ? "opacity-100" : "opacity-60"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400 font-mono font-bold">{currentPair.scoreTo}/10</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll area — no absolute overlays, just text + cursor */}
      <div ref={scrollRef} className={cn("p-4 h-[260px] overflow-y-hidden", phase === "transition" && "flex items-center justify-center")}>
        {phase === "transition" ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-primary font-mono">AI optimizing...</span>
          </div>
        ) : (
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
            {displayed}
            {isTyping && <span className="animate-pulse text-primary">▋</span>}
          </pre>
        )}
      </div>
    </div>
  );
}

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
  goal: z.string().optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  constraints: z.string().optional(),
  rounds: z.number().min(1).max(5).default(3),
});

type FormValues = z.infer<typeof formSchema>;

interface RoundResult {
  round: number;
  chatgptPrompt: string;
  geminiCritique: string;
  geminiScore: number;
  improvementSummary: string;
}

type Phase =
  | { status: "idle" }
  | { status: "round_start"; round: number; totalRounds: number }
  | { status: "chatgpt_done"; round: number; totalRounds: number }
  | { status: "round_done"; round: number; totalRounds: number; completedRounds: RoundResult[] }
  | { status: "synthesizing"; totalRounds: number; completedRounds: RoundResult[] }
  | { status: "complete"; result: ImprovePromptResponse }
  | { status: "error"; message: string };

function ScoreRing({ score }: { score: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const color = score >= 8 ? "#34d399" : score >= 6 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-black text-white">{score}/10</div>
      </div>
    </div>
  );
}

function fireConfetti() {
  const end = Date.now() + 1200;
  const colors = ["#e05252", "#c0392b", "#ff7b7b", "#ff4444", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });

  // Round viewer state
  const [selectedRound, setSelectedRound] = useState<number | "final">(1);

  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lbStatus, setLbStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [savedSessionId, setSavedSessionId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<LeaderboardSubject>("Marketing");
  const [identity, setIdentityState] = useState<Identity | null>(null);
  const [newHandle, setNewHandle] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(AVATAR_COLORS[0]);

  useEffect(() => {
    const stored = getIdentity();
    if (stored) { setIdentityState(stored); setNewHandle(stored.handle); setSelectedColor(stored.avatarColor); }
  }, []);

  const createSessionMutation = useCreateSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "", goal: "", audience: "", tone: "", constraints: "", rounds: 3 },
  });

  const watchRounds = form.watch("rounds");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied!", duration: 1500 });
  };

  const shareOnX = (result: ImprovePromptResponse) => {
    const score = result.finalScore;
    const rounds = result.rounds.length;
    const tweet = `Just turned a rough prompt into a ${score}/10 in ${rounds} rounds of AI optimization 🚀\n\nThis thing actually works → promptloop.replit.app\n\n#AI #PromptEngineering`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank");
  };

  const onSubmit = async (data: FormValues) => {
    setPhase({ status: "round_start", round: 1, totalRounds: data.rounds ?? 3 });
    const completedRounds: RoundResult[] = [];

    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok || !response.body) throw new Error("Server error. Please try again.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          let event: Record<string, unknown>;
          try { event = JSON.parse(raw); } catch { continue; }

          switch (event.type) {
            case "round_start":
              setPhase({ status: "round_start", round: event.round as number, totalRounds: event.totalRounds as number });
              break;
            case "chatgpt_done":
              setPhase(prev => prev.status !== "idle" && prev.status !== "complete" && prev.status !== "error"
                ? { ...prev, status: "chatgpt_done", round: event.round as number } : prev);
              break;
            case "round_done": {
              const rd = event.data as RoundResult;
              completedRounds.push(rd);
              setPhase({ status: "round_done", round: event.round as number, totalRounds: data.rounds, completedRounds: [...completedRounds] });
              break;
            }
            case "synthesizing":
              setPhase({ status: "synthesizing", totalRounds: data.rounds, completedRounds: [...completedRounds] });
              break;
            case "complete": {
              const result = event.data as ImprovePromptResponse;
              setPhase({ status: "complete", result });
              setSelectedRound(1);
              if (result.finalScore >= 7) fireConfetti();
              toast({ title: `Done! Score: ${result.finalScore}/10`, description: `${result.rounds.length} rounds of optimization complete.` });
              break;
            }
            case "error":
              setPhase({ status: "error", message: event.message as string });
              toast({ title: "Failed", description: event.message as string, variant: "destructive" });
              break;
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      setPhase({ status: "error", message: msg });
      toast({ title: "Failed", description: msg, variant: "destructive" });
    }
  };

  const saveSession = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (phase.status !== "complete") { reject(new Error("No result")); return; }
      if (savedSessionId) { resolve(savedSessionId); return; }
      const { result } = phase;
      const formData = form.getValues();
      createSessionMutation.mutate(
        { data: { originalPrompt: result.originalPrompt, goal: formData.goal, audience: formData.audience, tone: formData.tone, constraints: formData.constraints, finalPrompt: result.finalPrompt, finalScore: result.finalScore, rounds: result.rounds } },
        {
          onSuccess: (session) => { setSavedSessionId(session.id); resolve(session.id); },
          onError: (e) => reject(e),
        }
      );
    });
  };

  const handleSaveSession = () => {
    saveSession()
      .then((id) => { toast({ title: "Saved!", description: "View it in History." }); setLocation(`/session/${id}`); })
      .catch(() => toast({ title: "Save failed", variant: "destructive" }));
  };

  const handleSubmitLeaderboard = async () => {
    const handle = newHandle.trim();
    if (!handle || handle.length < 2) { toast({ title: "Enter a handle (min 2 chars)", variant: "destructive" }); return; }
    setLbStatus("submitting");
    try {
      const sessionId = await saveSession();
      const newIdentity: Identity = { handle, avatarColor: selectedColor };
      saveIdentity(newIdentity);
      setIdentityState(newIdentity);
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, handle, avatarColor: selectedColor, subject: selectedSubject }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to submit");
      }
      setLbStatus("done");
      fireConfetti();
      toast({ title: "🏆 You're on the leaderboard!", description: `Rank submitted as ${handle}` });
    } catch {
      setLbStatus("idle");
      toast({ title: "Submission failed", variant: "destructive" });
    }
  };

  const isRunning = phase.status !== "idle" && phase.status !== "complete" && phase.status !== "error";

  const getCurrentRound = () => "round" in phase ? phase.round : 1;
  const getTotalRounds = () => "totalRounds" in phase ? phase.totalRounds : watchRounds;
  const getCompletedRounds = (): RoundResult[] => "completedRounds" in phase ? phase.completedRounds : [];

  const getStatusLabel = () => {
    switch (phase.status) {
      case "round_start": return "AI rewriting prompt...";
      case "chatgpt_done": return "Evaluating response quality...";
      case "round_done": return `Round ${phase.round} complete ✓`;
      case "synthesizing": return "Synthesizing final prompt...";
      default: return "Processing...";
    }
  };

  const progressPct = isRunning
    ? phase.status === "synthesizing" ? 95
    : ((getCurrentRound() - (phase.status === "round_done" ? 0 : 0.5)) / getTotalRounds()) * 90
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-20 space-y-8">

      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
          Your prompt,{" "}
          <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
            battle-tested.
          </span>
        </h1>
        <p className="text-muted-foreground text-base max-w-sm mx-auto">
          Two AIs argue over your prompt until it scores 9 out of 10.
        </p>

        {/* 3-step strip */}
        <div className="flex items-start justify-center gap-0 max-w-lg mx-auto pt-2">
          {[
            { n: "1", label: "You paste", desc: "Any rough idea or half-baked instruction." },
            { n: "2", label: "AIs battle", desc: "OpenAI rewrites. Gemini scores. Repeat." },
            { n: "3", label: "You copy", desc: "The best version, ready to use." },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex-1 flex flex-col items-center gap-1.5 text-center px-3 relative">
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                {s.n}
              </div>
              {i < arr.length - 1 && (
                <div className="absolute top-3.5 left-[calc(50%+18px)] right-0 h-px bg-border/40" />
              )}
              <p className="text-xs font-bold text-foreground/80">{s.label}</p>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6 items-start">

        {/* Left: Input */}
        <div className="space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

              <div className="rounded-2xl border border-white/[0.14] bg-zinc-800/70 backdrop-blur-sm overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.4)]">
                {/* Step 1 header */}
                <div className="px-4 pt-3 pb-1 flex items-center gap-2 border-b border-white/[0.06]">
                  <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold" style={{ fontSize: 9 }}>1</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground/80 tracking-wide">Paste your prompt</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">← start here</span>
                </div>

                <div className="px-4 pt-3 pb-2">
                  <FormField control={form.control} name="prompt" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Drop your rough idea here... e.g. 'write a cold email to a VC'"
                          className="min-h-[130px] font-mono text-sm resize-none bg-transparent border-0 focus-visible:ring-0 px-0 placeholder:text-muted-foreground/60 text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Example chips */}
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">or try an example</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.map(ex => (
                      <button key={ex} type="button"
                        onClick={() => form.setValue("prompt", ex)}
                        className="text-[11px] bg-white/[0.06] hover:bg-primary/20 hover:text-primary border border-white/[0.10] hover:border-primary/30 text-muted-foreground px-2.5 py-1 rounded-full transition-all cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rounds + Submit row */}
                <div className="border-t border-border/30 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">Rounds</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button"
                          onClick={() => form.setValue("rounds", n)}
                          className={cn(
                            "w-7 h-7 rounded-lg text-xs font-bold transition-all border",
                            watchRounds === n
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(192,57,43,0.4)]"
                              : "bg-secondary/50 text-muted-foreground border-border/30 hover:bg-secondary"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" disabled={isRunning}
                    className="ml-auto flex-shrink-0 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-bold text-sm px-5 h-9 rounded-xl shadow-[0_0_20px_rgba(224,82,82,0.3)] hover:shadow-[0_0_25px_rgba(224,82,82,0.5)] transition-all border-0"
                  >
                    {isRunning ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Running...</> : <><Sparkles className="w-3.5 h-3.5 mr-2" />Make it better<ArrowRight className="w-3 h-3 ml-1.5" /></>}
                  </Button>
                </div>
              </div>

              {/* Context collapsible */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/30 bg-card/30 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span>Add context <span className="text-xs opacity-50">(goal, audience, tone)</span></span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2 animate-in slide-in-from-top-2">
                  <div className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-3">
                    <FormField control={form.control} name="goal" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Objective</FormLabel>
                        <FormControl><Input placeholder="What are you trying to achieve?" className="h-8 text-sm" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="audience" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Audience</FormLabel>
                          <FormControl><Input placeholder="e.g. Beginners" className="h-8 text-sm" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="tone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tone</FormLabel>
                          <FormControl><Input placeholder="e.g. Professional" className="h-8 text-sm" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="constraints" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Constraints</FormLabel>
                        <FormControl><Input placeholder="e.g. Max 500 words" className="h-8 text-sm" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

            </form>
          </Form>
        </div>

        {/* Right: Output panel */}
        <div className="space-y-4">

          {/* Loading */}
          {isRunning && (
            <Card className="border-primary/30 shadow-[0_0_40px_rgba(192,57,43,0.12)] relative overflow-hidden bg-card/60">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-border/30">
                <motion.div className="h-full bg-gradient-to-r from-rose-500 to-red-400"
                  animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: "easeInOut" }} />
              </div>
              <CardContent className="pt-8 pb-6 flex flex-col items-center space-y-5 text-center">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: "3s" }} />
                  <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                  <div className="absolute inset-[14px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {phase.status === "synthesizing" ? "Synthesizing Final Prompt" : `Round ${getCurrentRound()} of ${getTotalRounds()}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">{getStatusLabel()}</p>
                </div>
                <div className="w-full max-w-xs space-y-1.5 text-left">
                  {Array.from({ length: getTotalRounds() }).map((_, i) => {
                    const done = getCompletedRounds().find(r => r.round === i + 1);
                    const active = getCurrentRound() === i + 1 && phase.status !== "round_done";
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-xs font-mono">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                          done ? "bg-primary text-primary-foreground" :
                          active ? "bg-primary/20 border border-primary text-primary animate-pulse" :
                          "bg-secondary text-muted-foreground")}>
                          {done ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={done ? "text-foreground" : active ? "text-primary" : "text-muted-foreground"}>
                          Iteration {i + 1}
                          {done && <span className="ml-2 text-muted-foreground">— {done.geminiScore}/10</span>}
                        </span>
                      </div>
                    );
                  })}
                  {phase.status === "synthesizing" && (
                    <div className="flex items-center gap-2.5 text-xs font-mono mt-1">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 border border-primary text-primary animate-pulse flex-shrink-0">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <span className="text-primary">Final synthesis</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {phase.status === "error" && (
            <div className="p-5 border border-destructive/30 rounded-2xl bg-destructive/5 text-center space-y-3">
              <p className="text-destructive text-sm">{phase.message}</p>
              <Button variant="outline" size="sm" onClick={() => setPhase({ status: "idle" })}><RotateCcw className="w-3.5 h-3.5 mr-2" />Try Again</Button>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="popLayout">
            {phase.status === "complete" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Final prompt card */}
                <Card className="border-primary/40 shadow-[0_0_50px_rgba(192,57,43,0.15)] overflow-hidden bg-card">
                  <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-primary text-sm">OPTIMIZED PROMPT</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {phase.result.roundPenalty > 0 && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <span className="text-gray-400">{phase.result.rawScore}/10</span>
                            <span className="text-red-400/70">−{phase.result.roundPenalty}</span>
                          </div>
                          <div className="text-[9px] text-muted-foreground/60 font-mono">{phase.result.rounds.length}-round penalty</div>
                        </div>
                      )}
                      <ScoreRing score={phase.result.finalScore} />
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[260px] w-full bg-[#0a0a0f]">
                      <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {phase.result.finalPrompt}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="p-3 bg-secondary/20 border-t border-border/30 flex flex-wrap gap-2 justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono">{phase.result.rounds.length} rounds completed</span>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                        onClick={() => copyToClipboard(phase.result.finalPrompt, "final")}>
                        {copied === "final" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied === "final" ? "Copied!" : "Copy"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                        onClick={() => shareOnX(phase.result)}>
                        <Twitter className="w-3 h-3" />
                        Share on X
                      </Button>
                      {lbStatus === "done" ? (
                        <Button size="sm" disabled className="h-8 text-xs gap-1.5 bg-amber-500/20 text-amber-400 border-amber-500/30 border">
                          <Trophy className="w-3 h-3" />
                          On Leaderboard!
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          onClick={() => { setLbStatus("idle"); setShowLeaderboard(true); }}>
                          <Trophy className="w-3 h-3" />
                          Leaderboard
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>

                {/* Round prompt viewer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Prompt versions</h3>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">select a round to inspect</span>
                  </div>

                  {/* Round selector tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {phase.result.rounds.map((round) => {
                      const active = selectedRound === round.round;
                      const scoreColor = round.geminiScore >= 8 ? "text-green-400 border-green-400/40 bg-green-400/10" :
                                        round.geminiScore >= 6 ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" :
                                        "text-red-400 border-red-400/40 bg-red-400/10";
                      return (
                        <button key={round.round} type="button"
                          onClick={() => setSelectedRound(round.round)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all",
                            active
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
                          )}>
                          Round {round.round}
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-bold", active ? "bg-primary/20 border-primary/30 text-primary" : scoreColor)}>
                            {round.geminiScore}/10
                          </span>
                        </button>
                      );
                    })}
                    <button type="button"
                      onClick={() => setSelectedRound("final")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all",
                        selectedRound === "final"
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
                      )}>
                      <Sparkles className="w-3 h-3" />
                      Final
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-bold",
                        selectedRound === "final"
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "text-green-400 border-green-400/40 bg-green-400/10")}>
                        {phase.result.finalScore}/10
                      </span>
                    </button>
                  </div>

                  {/* Prompt display */}
                  {(() => {
                    const isRoundNum = typeof selectedRound === "number";
                    const round = isRoundNum ? phase.result.rounds.find(r => r.round === selectedRound) : null;
                    const promptText = round ? round.chatgptPrompt : phase.result.finalPrompt;
                    const copyKey = `view-${selectedRound}`;
                    return (
                      <div className="relative group rounded-xl border border-border/20 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-secondary/10">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {selectedRound === "final" ? "final_prompt.md" : `round_${selectedRound}_prompt.md`}
                          </span>
                          <Button size="icon" variant="ghost" className="h-6 w-6"
                            onClick={() => copyToClipboard(promptText, copyKey)}>
                            {copied === copyKey ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <ScrollArea className="h-[200px] bg-[#0a0a0f]">
                          <pre className="p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {promptText}
                          </pre>
                        </ScrollArea>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle: animated demo + stats */}
          {phase.status === "idle" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Live example</p>
              </div>
              <div className="relative">
                <AnimatedBeforeAfter />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Prompts optimized", value: "12,400+" },
                  { label: "Avg score boost", value: "+4.8pts" },
                  { label: "Rounds avg", value: "3.2" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                    <p className="text-lg font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard submit modal */}
      <Dialog open={showLeaderboard} onOpenChange={(o) => { if (!o) setShowLeaderboard(false); }}>
        <DialogContent className="max-w-md bg-[#0e0e14] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <Trophy className="w-5 h-5 text-amber-400" />
              Submit to Leaderboard
            </DialogTitle>
          </DialogHeader>

          {lbStatus === "done" ? (
            <div className="py-8 text-center space-y-3">
              <div className="text-5xl">🏆</div>
              <h3 className="font-bold text-lg">You're on the board!</h3>
              <p className="text-sm text-muted-foreground">Your prompt is competing globally as <strong className="text-foreground font-mono">{identity?.handle}</strong>.</p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => { setShowLeaderboard(false); setLocation("/leaderboard"); }}>
                View Leaderboard
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />Your handle
                </label>
                <Input
                  placeholder="e.g. promptwizard42"
                  value={newHandle}
                  onChange={e => setNewHandle(e.target.value)}
                  maxLength={30}
                  className="font-mono bg-black/30 border-white/10 focus:border-primary/50"
                />
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Avatar colour</p>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setSelectedColor(c)}
                        className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", selectedColor === c ? "border-white scale-110" : "border-transparent")}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {LEADERBOARD_SUBJECTS.map(s => (
                    <button key={s} type="button" onClick={() => setSelectedSubject(s)}
                      className={cn("text-xs px-3 py-1 rounded-full border font-mono transition-all",
                        selectedSubject === s ? "bg-primary/20 border-primary/40 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {newHandle.trim().length >= 2 && (
                <div className="rounded-xl border border-white/10 p-3 flex items-center gap-3 bg-white/[0.03]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black font-mono text-sm border-2 flex-shrink-0"
                    style={{ backgroundColor: `${selectedColor}22`, borderColor: `${selectedColor}55`, color: selectedColor }}>
                    {newHandle.trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm font-mono">{newHandle.trim()}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedSubject} · {phase.status === "complete" ? `${phase.result.finalScore}/10` : ""}</p>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitLeaderboard}
                disabled={lbStatus === "submitting" || newHandle.trim().length < 2}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold border-0">
                {lbStatus === "submitting" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Trophy className="w-4 h-4 mr-2" />Claim your rank</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
