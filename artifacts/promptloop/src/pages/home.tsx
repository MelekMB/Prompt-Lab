import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Save, Loader2, ArrowRight, RotateCcw, ChevronDown, Zap, Twitter } from "lucide-react";
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

const EXAMPLE_PROMPTS = [
  "Write a cold email to a VC",
  "Help me prep for a job interview",
  "Create a YC application answer",
  "Write a product launch tweet",
  "Explain this concept simply",
];

const DEMO_BEFORE = `write me a cold email to a vc`;
const DEMO_AFTER = `Role: Expert startup fundraising advisor & copywriter.

Task: Write a concise cold email to a VC.

Context: First-time founder with early traction. Reader gets 200+ cold emails/week — earn attention in line 1.

Requirements:
- Max 150 words
- Open with a specific metric, never a generic intro
- Mention traction upfront (users / revenue / growth)
- One clear ask: a 20-min call
- No buzzwords

Output Format:
Subject: [compelling subject line]
---
[email body]`;

function AnimatedBeforeAfter() {
  const [phase, setPhase] = useState<"before" | "transition" | "after">("before");
  const [displayText, setDisplayText] = useState(DEMO_BEFORE);
  useEffect(() => {
    const run = () => {
      setPhase("before");
      setDisplayText(DEMO_BEFORE);
      const t1 = setTimeout(() => setPhase("transition"), 2500);
      const t2 = setTimeout(() => { setPhase("after"); setDisplayText(DEMO_AFTER); }, 3200);
      return [t1, t2];
    };
    const timers = run();
    const interval = setInterval(() => { timers.forEach(clearTimeout); timers.splice(0); run().forEach(t => timers.push(t)); }, 10000);
    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", phase === "after" ? "bg-green-400" : "bg-yellow-400/70")} />
          <span className="text-xs font-mono text-muted-foreground">
            {phase === "before" ? "raw_prompt.txt" : phase === "transition" ? "optimizing..." : "optimized_prompt.md"}
          </span>
        </div>
        {phase === "after" && (
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono animate-in fade-in">2/10 → 9/10</span>
        )}
      </div>

      <div className={cn("relative p-4 min-h-[170px] transition-opacity duration-300", phase === "transition" ? "opacity-0" : "opacity-100")}>
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">{displayText}</pre>
        {phase === "before" && <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground font-mono">score: 2/10</span>}
        {phase === "after" && (
          <div className="absolute bottom-3 right-3 animate-in fade-in">
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400 font-mono font-bold">9/10</span>
            </div>
          </div>
        )}
      </div>

      {phase === "transition" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-primary font-mono">AI optimizing...</span>
          </div>
        </div>
      )}
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
  const colors = ["#0d9488", "#22d3ee", "#5eead4", "#67e8f9", "#ffffff"];
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

  const handleSaveSession = () => {
    if (phase.status !== "complete") return;
    const { result } = phase;
    const formData = form.getValues();
    createSessionMutation.mutate(
      { data: { originalPrompt: result.originalPrompt, goal: formData.goal, audience: formData.audience, tone: formData.tone, constraints: formData.constraints, finalPrompt: result.finalPrompt, finalScore: result.finalScore, rounds: result.rounds } },
      {
        onSuccess: (session) => { toast({ title: "Saved!", description: "View it in History." }); setLocation(`/session/${session.id}`); },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">Adversarial AI optimization</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Your prompts,{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            actually good.
          </span>
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Drop any rough idea. Two AIs fight over it until it's 10× better.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6 items-start">

        {/* Left: Input */}
        <div className="space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <FormField control={form.control} name="prompt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Your prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Drop your rough idea here..."
                          className="min-h-[130px] font-mono text-sm resize-none bg-transparent border-0 focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Example chips */}
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Try an example</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.map(ex => (
                      <button key={ex} type="button"
                        onClick={() => form.setValue("prompt", ex)}
                        className="text-[11px] bg-secondary/50 hover:bg-primary/20 hover:text-primary border border-border/50 hover:border-primary/30 text-muted-foreground px-2.5 py-1 rounded-full transition-all cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rounds + Submit row */}
                <div className="border-t border-border/30 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rounds</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button"
                          onClick={() => form.setValue("rounds", n)}
                          className={cn(
                            "w-7 h-7 rounded-lg text-xs font-bold transition-all border",
                            watchRounds === n
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(13,148,136,0.4)]"
                              : "bg-secondary/50 text-muted-foreground border-border/30 hover:bg-secondary"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" disabled={isRunning}
                    className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm px-5 h-9 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all border-0"
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
            <Card className="border-primary/30 shadow-[0_0_40px_rgba(13,148,136,0.12)] relative overflow-hidden bg-card/60">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-border/30">
                <motion.div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
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
                <Card className="border-primary/40 shadow-[0_0_50px_rgba(13,148,136,0.15)] overflow-hidden bg-card">
                  <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
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
                    <div className="flex gap-2">
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
                      <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSaveSession}
                        disabled={createSessionMutation.isPending}>
                        {createSessionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </Button>
                    </div>
                  </CardFooter>
                </Card>

                {/* Round trace */}
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-2">Optimization Trace</h3>
                  {phase.result.rounds.map((round, idx) => (
                    <Card key={idx} className="bg-card/40 border-border/30">
                      <div className="px-4 py-2 border-b border-border/20 flex items-center justify-between bg-secondary/10">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">Round {round.round}</span>
                        <Badge variant="outline" className={cn("font-mono text-[10px]",
                          round.geminiScore >= 8 ? "text-green-400 border-green-400/30" :
                          round.geminiScore >= 6 ? "text-yellow-400 border-yellow-400/30" :
                          "text-red-400 border-red-400/30")}>
                          {round.geminiScore}/10
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Critique</span>
                          <p className="text-xs text-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-3 mt-1">"{round.geminiCritique}"</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Refinement</span>
                          <p className="text-xs text-foreground font-medium mt-1 mb-2">{round.improvementSummary}</p>
                          <div className="relative group">
                            <pre className="bg-[#0a0a0f] p-3 rounded-lg border border-border/20 text-[11px] font-mono text-gray-400 max-h-[90px] overflow-y-auto whitespace-pre-wrap">
                              {round.chatgptPrompt}
                            </pre>
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(round.chatgptPrompt, `r-${idx}`)}>
                              {copied === `r-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    <p className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
