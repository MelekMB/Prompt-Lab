export function ScoreEverything() {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-mono flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[#e81c1c] text-lg">⚡</span>
          <span className="font-bold tracking-tight">prompt labs</span>
        </div>
        <span className="text-xs text-white/30 border border-white/10 px-3 py-1 rounded-full">🏆 Leaderboard</span>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row items-center gap-10 px-8 py-12 max-w-5xl mx-auto w-full">
        {/* Left: copy */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="text-xs text-[#e81c1c]/70 tracking-widest uppercase">AI-scored prompt engineering</div>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
            Know exactly<br />how good your<br /><span className="text-[#e81c1c]">prompt is.</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm">
            Every prompt gets a score out of 10. Two AIs iterate until it can't get better. You see every version.
          </p>
          <div className="flex flex-col gap-3 mt-2">
            <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-3.5">
              <p className="text-white/25 text-sm">Drop your rough idea here...</p>
            </div>
            <button className="w-full bg-[#e81c1c] text-white font-bold py-3 rounded-xl text-sm tracking-wide">
              Score &amp; improve →
            </button>
          </div>
        </div>

        {/* Right: live score card preview */}
        <div className="flex-1 max-w-xs w-full">
          <div className="bg-[#0d0d11] border border-white/8 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Score progression</span>
              <span className="text-xs text-green-400 font-bold">+5.2 pts</span>
            </div>
            {[
              { round: "Original", score: 2, color: "bg-red-500" },
              { round: "Round 1",  score: 5, color: "bg-orange-400" },
              { round: "Round 2",  score: 7, color: "bg-yellow-400" },
              { round: "Final",    score: 9, color: "bg-green-400" },
            ].map((r) => (
              <div key={r.round} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">{r.round}</span>
                  <span className="text-white/60 font-bold">{r.score}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.score * 10}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/5 text-[10px] text-white/25 text-center">
              OpenAI rewrites · Gemini critiques
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
