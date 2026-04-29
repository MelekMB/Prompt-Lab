export function ShowTheSteps() {
  const steps = [
    { n: "1", label: "You paste", desc: "Any rough idea, half-baked prompt, or vague instruction." },
    { n: "2", label: "AIs battle", desc: "OpenAI rewrites. Gemini scores and critiques. Repeat up to 5×." },
    { n: "3", label: "You copy", desc: "The best version, ready to use." },
  ];

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
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 pb-12">
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight max-w-lg">
          Your prompt,{" "}
          <span className="text-[#e81c1c]">battle-tested.</span>
        </h1>

        <p className="text-white/40 text-sm max-w-xs leading-relaxed">
          Two AI models fight over your prompt until it's the best it can be.
        </p>

        {/* Steps */}
        <div className="flex items-start gap-0 max-w-lg w-full">
          {steps.map((s, i) => (
            <div key={s.n} className="flex-1 flex flex-col items-center gap-2 text-center px-2">
              <div className="w-8 h-8 rounded-full bg-[#e81c1c]/15 border border-[#e81c1c]/30 flex items-center justify-center text-[#e81c1c] font-bold text-sm">
                {s.n}
              </div>
              {i < steps.length - 1 && (
                <div className="absolute translate-x-[calc(50%+2.5rem)] translate-y-[-1.25rem] w-12 h-px bg-white/10" />
              )}
              <p className="text-xs font-bold text-white/80">{s.label}</p>
              <p className="text-[11px] text-white/35 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full max-w-md">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-3.5 text-left mb-3">
            <p className="text-white/25 text-sm">Drop your rough idea here...</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-[#e81c1c] text-white font-bold py-3 rounded-xl text-sm tracking-wide">
              Start optimizing →
            </button>
            <select className="bg-[#0f0f13] border border-white/10 text-white/40 text-xs rounded-xl px-3">
              <option>3 rounds</option>
              <option>5 rounds</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
