import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Copy, Check, Save, Loader2, Sparkles, ChevronDown, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

import { useCreateSession } from "@workspace/api-client-react";
import type { ImprovePromptResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });

  const createSessionMutation = useCreateSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      goal: "",
      audience: "",
      tone: "",
      constraints: "",
      rounds: 3,
    },
  });

  const watchRounds = form.watch("rounds");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard", description: "You can now paste the prompt.", duration: 2000 });
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

      if (!response.ok || !response.body) {
        throw new Error("Server error. Please try again.");
      }

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
              setPhase({
                status: "round_start",
                round: event.round as number,
                totalRounds: event.totalRounds as number,
              });
              break;

            case "chatgpt_done":
              setPhase(prev =>
                prev.status !== "idle" && prev.status !== "complete" && prev.status !== "error"
                  ? { ...prev, status: "chatgpt_done", round: event.round as number }
                  : prev
              );
              break;

            case "round_done": {
              const roundData = event.data as RoundResult;
              completedRounds.push(roundData);
              setPhase({
                status: "round_done",
                round: event.round as number,
                totalRounds: (event.data as any).round === (event.round as number) ? data.rounds : data.rounds,
                completedRounds: [...completedRounds],
              });
              break;
            }

            case "synthesizing":
              setPhase(prev => ({
                status: "synthesizing",
                totalRounds: data.rounds,
                completedRounds: [...completedRounds],
              }));
              break;

            case "complete": {
              const result = event.data as ImprovePromptResponse;
              setPhase({ status: "complete", result });
              toast({
                title: "Optimization complete",
                description: `Completed ${result.rounds.length} rounds. Final score: ${result.finalScore}/10`,
              });
              break;
            }

            case "error":
              setPhase({ status: "error", message: event.message as string });
              toast({ title: "Optimization failed", description: event.message as string, variant: "destructive" });
              break;
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      setPhase({ status: "error", message: msg });
      toast({ title: "Optimization failed", description: msg, variant: "destructive" });
    }
  };

  const handleSaveSession = () => {
    if (phase.status !== "complete") return;
    const { result } = phase;
    const formData = form.getValues();

    createSessionMutation.mutate(
      {
        data: {
          originalPrompt: result.originalPrompt,
          goal: formData.goal,
          audience: formData.audience,
          tone: formData.tone,
          constraints: formData.constraints,
          finalPrompt: result.finalPrompt,
          finalScore: result.finalScore,
          rounds: result.rounds,
        }
      },
      {
        onSuccess: (session) => {
          toast({ title: "Session saved", description: "You can view it later in History." });
          setLocation(`/session/${session.id}`);
        },
        onError: () => {
          toast({ title: "Failed to save", description: "Could not save the session. Please try again.", variant: "destructive" });
        }
      }
    );
  };

  const isRunning = phase.status !== "idle" && phase.status !== "complete" && phase.status !== "error";

  const getCurrentRoundLabel = (): string => {
    switch (phase.status) {
      case "round_start": return `AI rewriting prompt...`;
      case "chatgpt_done": return `Evaluating response quality...`;
      case "round_done": return `Round ${phase.round} complete ✓`;
      case "synthesizing": return "Synthesizing final prompt...";
      default: return "Processing...";
    }
  };

  const getCurrentRound = (): number => {
    if ("round" in phase) return phase.round;
    if (phase.status === "synthesizing") return phase.totalRounds;
    return 1;
  };

  const getTotalRounds = (): number => {
    if ("totalRounds" in phase) return phase.totalRounds;
    return watchRounds;
  };

  const getCompletedRounds = (): RoundResult[] => {
    if ("completedRounds" in phase) return phase.completedRounds;
    return [];
  };

  const progressPct = isRunning
    ? phase.status === "synthesizing"
      ? 95
      : ((getCurrentRound() - (phase.status === "round_done" ? 0 : 0.5)) / getTotalRounds()) * 90
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Left Column: Input Form */}
        <div className="w-full md:w-5/12 shrink-0 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">prompt_lab</h1>
            <p className="text-muted-foreground mt-2">Iteratively refine your prompts through adversarial AI optimization.</p>
          </div>

          <Card className="border-border/50 shadow-md backdrop-blur-sm bg-card/80">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configuration</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Raw Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Draft your idea here..."
                            className="min-h-[120px] font-mono text-sm resize-none bg-secondary/50 focus-visible:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="space-y-4 border rounded-md p-4 bg-background/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Context Guidelines</h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-4 animate-in slide-in-from-top-2">
                      <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Objective</FormLabel>
                          <FormControl><Input placeholder="What are you trying to achieve?" className="h-8 text-sm" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="audience" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Target Audience</FormLabel>
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
                    </CollapsibleContent>
                  </Collapsible>

                  <FormField
                    control={form.control}
                    name="rounds"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel className="text-xs">Iterations</FormLabel>
                          <span className="font-mono text-xs font-bold text-primary">{field.value}</span>
                        </div>
                        <FormControl>
                          <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} className="py-2" />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground mt-1">More rounds = better optimization, higher latency.</p>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full font-mono font-bold tracking-wide" disabled={isRunning}>
                    {isRunning ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />RUNNING LOOP...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" />RUN OPTIMIZATION</>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </Card>
        </div>

        {/* Right Column: Output / Progress */}
        <div className="w-full md:w-7/12 space-y-6">

          {/* Loading State */}
          {isRunning && (
            <Card className="border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
              <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-primary/60 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-4 rounded-full border-b-2 border-primary/30 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>

                <div>
                  <h3 className="font-mono font-bold text-lg text-foreground">
                    {phase.status === "synthesizing"
                      ? `Synthesizing Final Prompt`
                      : `Processing Round ${getCurrentRound()} of ${getTotalRounds()}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 font-mono">{getCurrentRoundLabel()}</p>
                </div>

                <div className="w-full max-w-sm space-y-2 text-left mt-4">
                  {Array.from({ length: getTotalRounds() }).map((_, i) => {
                    const done = getCompletedRounds().find(r => r.round === i + 1);
                    const active = getCurrentRound() === i + 1 && phase.status !== "round_done";
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs font-mono">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          done ? 'bg-primary text-primary-foreground' :
                          active ? 'bg-primary/20 border border-primary text-primary animate-pulse' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {done ? <Check className="h-3 w-3" /> : (i + 1)}
                        </div>
                        <span className={done ? 'text-foreground' : active ? 'text-primary' : 'text-muted-foreground'}>
                          Iteration {i + 1}
                          {done ? <span className="ml-2 text-muted-foreground">— score {done.geminiScore}/10</span> : null}
                        </span>
                      </div>
                    );
                  })}
                  {phase.status === "synthesizing" && (
                    <div className="flex items-center gap-3 text-xs font-mono mt-1">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 border border-primary text-primary animate-pulse">
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <span className="text-primary">Final synthesis</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {phase.status === "error" && (
            <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-center">
              <p className="text-destructive font-mono text-sm">{phase.message}</p>
              <Button variant="outline" className="mt-4" onClick={() => setPhase({ status: "idle" })}>Try Again</Button>
            </div>
          )}

          {/* Results State */}
          <AnimatePresence mode="popLayout">
            {phase.status === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Final Prompt */}
                <Card className="border-primary shadow-[0_0_40px_rgba(124,58,237,0.15)] bg-card overflow-hidden">
                  <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-mono font-bold text-primary tracking-tight">FINAL_PROMPT.md</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-background/50 font-mono">
                        Score: {phase.result.finalScore}/10
                      </Badge>
                      <Button size="sm" variant="secondary" className="h-7 text-xs font-mono" onClick={() => copyToClipboard(phase.result.finalPrompt, "final")}>
                        {copied === "final" ? <Check className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
                        {copied === "final" ? "COPIED" : "COPY"}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px] w-full bg-[#0d0d12]">
                      <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {phase.result.finalPrompt}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="p-3 bg-secondary/30 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono">Optimized over {phase.result.rounds.length} rounds</span>
                    <Button size="sm" onClick={handleSaveSession} disabled={createSessionMutation.isPending} className="h-8">
                      {createSessionMutation.isPending ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
                      Save Session
                    </Button>
                  </CardFooter>
                </Card>

                {/* Round history */}
                <div className="space-y-4">
                  <h3 className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">Optimization Trace</h3>
                  {phase.result.rounds.map((round, idx) => (
                    <Card key={idx} className="bg-card/50 border-border/50">
                      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-secondary/20">
                        <span className="font-mono text-xs font-semibold">Iter_{round.round}</span>
                        <Badge variant="outline" className={`font-mono text-[10px] ${round.geminiScore >= 8 ? 'text-green-400 border-green-400/30' : round.geminiScore >= 6 ? 'text-yellow-400 border-yellow-400/30' : 'text-red-400 border-red-400/30'}`}>
                          Score: {round.geminiScore}/10
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Critique</span>
                          <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/40 pl-3 mt-1">
                            "{round.geminiCritique}"
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Refinement</span>
                          <p className="text-xs text-foreground font-medium mb-2 mt-1">{round.improvementSummary}</p>
                          <div className="relative group">
                            <pre className="bg-[#121218] p-3 rounded border border-border/40 text-[11px] font-mono text-gray-400 max-h-[100px] overflow-y-auto whitespace-pre-wrap">
                              {round.chatgptPrompt}
                            </pre>
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/80" onClick={() => copyToClipboard(round.chatgptPrompt, `round-${idx}`)}>
                              {copied === `round-${idx}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
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

          {/* Idle State */}
          {phase.status === "idle" && (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/50 rounded-lg bg-card/20 text-center p-8">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">Awaiting Input</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Enter a raw prompt and configure parameters. The system will iteratively critique and rewrite it to maximize structural quality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
