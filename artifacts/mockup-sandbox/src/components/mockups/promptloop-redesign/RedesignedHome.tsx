import { useState, useEffect } from "react";
import { Sparkles, Zap, ArrowRight, Copy, Share2, RotateCcw, ChevronDown } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Write a cold email to a VC",
  "Help me prep for a job interview",
  "Create a YC application",
  "Write a product launch tweet",
  "Summarize this research paper",
];

const BEFORE = `write me a cold email to a vc`;

const AFTER = `Role: You are an expert startup fundraising advisor and copywriter.

Task: Write a concise, compelling cold email to a venture capitalist.

Context: The email should be sent by a first-time founder who has built early traction. The reader receives 200+ cold emails per week, so it must earn attention in the first 2 lines.

Requirements:
- Max 150 words — every word must earn its place
- Open with a specific data point or hook, never a generic intro
- Mention traction metric upfront (users, revenue, growth rate)
- One clear ask: a 20-minute call
- No buzzwords, no hype

Output Format:
Subject: [compelling subject line]
---
[email body]`;

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1f1f2e" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="url(#gradient)" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-white">{score}/10</span>
    </div>
  );
}

function AnimatedBeforeAfter() {
  const [phase, setPhase] = useState<"before" | "transition" | "after">("before");
  const [displayText, setDisplayText] = useState(BEFORE);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("transition"), 2200);
    const timer2 = setTimeout(() => {
      setPhase("after");
      setDisplayText(AFTER);
    }, 2800);
    const reset = setTimeout(() => {
      setPhase("before");
      setDisplayText(BEFORE);
    }, 8000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(reset); };
  }, [phase === "before" && displayText === BEFORE ? "start" : "idle"]);

  useEffect(() => {
    const loop = setInterval(() => {
      setPhase("before");
      setDisplayText(BEFORE);
    }, 9000);
    return () => clearInterval(loop);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0d0d12]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${phase === "after" ? "bg-green-400" : "bg-yellow-400"}`} />
          <span className="text-xs font-mono text-gray-400">
            {phase === "before" ? "raw_prompt.txt" : phase === "transition" ? "optimizing..." : "optimized_prompt.md"}
          </span>
        </div>
        {phase === "after" && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">2/10 → 9/10</span>
          </div>
        )}
      </div>

      <div className={`relative p-4 transition-all duration-500 min-h-[180px] ${phase === "transition" ? "opacity-0" : "opacity-100"}`}>
        <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-gray-300">
          {displayText}
        </pre>
        {phase === "before" && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs text-gray-500">
            <span>Score: 2/10</span>
          </div>
        )}
        {phase === "after" && (
          <div className="absolute bottom-4 right-4">
            <ScoreRing score={9} />
          </div>
        )}
      </div>

      {phase === "transition" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-purple-300 font-mono">AI optimizing...</span>
          </div>
        </div>
      )}

      {phase === "after" && (
        <div className="px-4 pb-4 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
          <button className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      )}
    </div>
  );
}

export function RedesignedHome() {
  const [prompt, setPrompt] = useState("");
  const [rounds, setRounds] = useState(3);

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">PromptLoop</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-400 hover:text-white transition-colors">History</button>
          <button className="text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-4 py-1.5 rounded-full transition-colors">
            Sign in
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24">

        {/* Hero headline */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">Adversarial AI optimization</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">
            Your prompts,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              actually good.
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Drop any rough prompt. Two AIs fight over it until it's 10x better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: Input */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-3">Your prompt</p>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Drop your rough idea here..."
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none outline-none font-mono leading-relaxed min-h-[140px]"
                />
              </div>

              {/* Example chips */}
              <div className="px-4 pb-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Try an example</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="text-[11px] bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 text-gray-400 px-2.5 py-1 rounded-full transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Rounds</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setRounds(n)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          rounds === n
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 text-gray-500 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                  Make it better
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Context collapsed */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/8 bg-white/[0.02] text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <span>Add context <span className="text-xs text-gray-600">(goal, audience, tone)</span></span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Animated before/after */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Live example</p>
              <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                <RotateCcw className="w-3 h-3" /> replay
              </button>
            </div>
            <AnimatedBeforeAfter />

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Prompts optimized", value: "12,400+" },
                { label: "Avg score boost", value: "+4.8pts" },
                { label: "Rounds avg", value: "3.2" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.03] border border-white/8 rounded-xl px-3 py-3">
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
