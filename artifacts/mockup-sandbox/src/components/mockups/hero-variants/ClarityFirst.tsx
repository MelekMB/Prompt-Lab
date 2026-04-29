export function ClarityFirst() {
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

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6 pt-8 pb-16">
        <div className="text-xs text-white/40 border border-white/10 rounded-full px-4 py-1.5 tracking-widest uppercase">
          Free · No signup
        </div>

        <h1 className="text-5xl font-black leading-[1.05] tracking-tight max-w-xl">
          Paste a rough prompt.<br />
          <span className="text-[#e81c1c]">Get a great one.</span>
        </h1>

        <p className="text-white/50 text-sm max-w-sm leading-relaxed">
          Two AIs argue over your prompt until it scores 9 out of 10. Takes about 30 seconds.
        </p>

        {/* Input CTA */}
        <div className="w-full max-w-lg mt-2">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-4 text-left mb-3">
            <p className="text-white/25 text-sm">Try: "write me a cold email to a VC"</p>
          </div>
          <button className="w-full bg-[#e81c1c] hover:bg-[#cc1818] text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-colors">
            Make it better →
          </button>
        </div>

        {/* Social proof strip */}
        <div className="flex items-center gap-6 text-xs text-white/30 mt-2">
          <span>↑ 1,200 prompts improved today</span>
          <span className="w-px h-3 bg-white/10" />
          <span>avg score jump: +4.2</span>
          <span className="w-px h-3 bg-white/10" />
          <span>top score: 9.8</span>
        </div>
      </div>
    </div>
  );
}
