import { useState, useRef } from "react";
import EXPLANATIONS from "./explanations.json";

const TERM_PRESETS = Object.keys(EXPLANATIONS);

const SECTION_LABELS = [
  { key: "plain_english", label: "PLAIN ENGLISH", accent: false },
  { key: "analogy", label: "THE DESI ANALOGY", accent: true },
  { key: "punchline", label: "THE PUNJABI PUNCHLINE", accent: false },
  { key: "real_example", label: "IN REAL LIFE", accent: false },
];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const SparkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" strokeLinecap="round" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);
const FlagPK = ({ width = 21 }) => (
  <svg width={width} height={(width * 2) / 3} viewBox="0 0 30 20" aria-label="Flag of Pakistan" role="img" style={{ display: "inline-block", flexShrink: 0 }}>
    <rect width="30" height="20" fill="#ffffff" />
    <rect x="7.5" width="22.5" height="20" fill="#01411C" />
    <circle cx="19.4" cy="10.4" r="5.6" fill="#ffffff" />
    <circle cx="20.9" cy="9.1" r="4.8" fill="#01411C" />
    <polygon fill="#ffffff" points="23.6,4.2 24.1,5.6 25.6,5.65 24.4,6.55 24.85,8 23.6,7.15 22.35,8 22.8,6.55 21.6,5.65 23.1,5.6" />
  </svg>
);

const KiaSamjhaGuy = ({ height = 104 }) => (
  <svg height={height} viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M14 150 C18 120, 40 110, 56 110 C70 110, 86 118, 92 138" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 108 L48 98 M64 108 L64 98" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="56" cy="66" r="26" stroke="#18181b" strokeWidth="3" />
    <path d="M32 58 C34 34, 78 34, 80 58" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 58 q5 -4 10 0" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M60 58 q5 -4 10 0" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="47" cy="65" r="2.3" fill="#18181b" />
    <circle cx="65" cy="65" r="2.3" fill="#18181b" />
    <path d="M46 80 q10 6 20 0" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 86 q6 4 12 0" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
    <path d="M88 128 C102 118, 110 96, 104 80" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <path d="M104 80 C101 64, 101 54, 103 46" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="103" cy="46" r="3.2" fill="#be123c" />
    <g stroke="#be123c" strokeWidth="2.6" strokeLinecap="round">
      <path d="M103 46 L97 31" />
      <path d="M103 46 L102 28" />
      <path d="M103 46 L107 31" />
      <path d="M103 46 L110 35" />
      <path d="M103 46 L95 34" />
    </g>
  </svg>
);

function ResultCard({ result, index }) {
  const { term, data } = result;
  return (
    <article className="fade-up border border-zinc-200 bg-white shadow-sm" style={{ animationDelay: `${index * 90}ms` }}>
      <div className="border-l-2 border-rose-600 p-6 sm:p-8">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
          <div>
            <p className="font-mono text-xs tracking-widest text-zinc-400 mb-1">
              EXPLAINED
            </p>
            <h3 className="text-2xl sm:text-3xl text-zinc-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em", fontWeight: 600 }}>
              {term}
            </h3>
          </div>
          <span className="flex items-center gap-2 font-mono text-xs px-2 py-1 border border-zinc-300 text-zinc-600 bg-zinc-50">
            <FlagPK width={18} /> Pakistan
          </span>
        </header>
        <div className="divide-y divide-zinc-100">
          {SECTION_LABELS.map(({ key, label, accent }) => (
            <section key={key} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
              <p className={`sm:col-span-4 font-mono text-xs tracking-widest pt-1 ${accent ? "text-rose-600" : "text-zinc-400"}`}>
                § {label}
              </p>
              <p className="sm:col-span-8 text-zinc-700 leading-relaxed">{data[key]}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const outputRef = useRef(null);

  const reset = () => {
    setResults([]);
    setTerm("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const run = () => {
    if (!term) return;
    const data = EXPLANATIONS[term];
    if (!data) return;
    setResults((prev) => [{ id: Date.now(), term, data }, ...prev]);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-zinc-900" style={{ fontFamily: "'Outfit', system-ui, sans-serif", backgroundColor: "#f9fafb" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        * { transition: border-color .3s cubic-bezier(.16,1,.3,1), background-color .3s cubic-bezier(.16,1,.3,1), color .3s cubic-bezier(.16,1,.3,1), transform .25s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .fade-up { animation: none; } * { transition: none !important; } }
      `}</style>

      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-600">
            <FlagPK width={22} />
          </p>
          <p className="font-mono text-xs text-zinc-400 hidden sm:block">TECH · EXPLAINED DESI STYLE</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-5 lg:sticky lg:top-10 self-start space-y-10">
          <header>
            <div className="flex items-end gap-3 mb-5">
              <h1 className="text-5xl sm:text-6xl text-zinc-900 leading-none" style={{ letterSpacing: "-0.04em", fontWeight: 700 }}>
                Kia <span className="text-rose-600">Samjha?</span>
              </h1>
              <KiaSamjhaGuy height={104} />
            </div>
            <p className="text-zinc-500 leading-relaxed max-w-md">
              You don't need a CS degree — you need a good analogy. Pick any tech, IT,
              or AI term and get it explained through Pakistani pop culture: Vital Signs,
              Junoon, samosas vs pakoras, PSL collapses, and a Punjabi punchline to make
              it stick.
            </p>
          </header>

          <section>
            <p className="font-mono text-xs tracking-widest text-zinc-400 mb-3">01 · PICK A TERM</p>
            <div className="flex flex-wrap gap-2">
              {TERM_PRESETS.map((t) => {
                const active = term === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`px-3 py-1 text-sm border active:scale-95 ${
                      active
                        ? "border-rose-600 text-rose-700 bg-rose-50"
                        : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-400 hover:text-zinc-800"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="space-y-3">
            <button
              onClick={run}
              disabled={!term}
              className={`w-full flex items-center justify-between px-5 py-4 border active:scale-95 ${
                !term
                  ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "border-rose-700 bg-rose-700 text-white hover:bg-rose-600 shadow-sm"
              }`}
              style={{ fontWeight: 600 }}
            >
              <span>
                {term ? `Explain "${term}"` : "Pick a term first"}
              </span>
              <ArrowIcon />
            </button>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-zinc-300 bg-white text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 active:scale-95"
              style={{ fontWeight: 500 }}
            >
              <RefreshIcon />
              <span>Acha acha, theek hei</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-200 pt-4">
            Analogies for understanding, not engineering specs. The jokes are desi; the
            tech underneath is accurate — but always sanity-check before you quote it in
            a meeting.
          </p>
        </div>

        <div ref={outputRef} className="lg:col-span-7 space-y-6 scroll-mt-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs tracking-widest text-zinc-400">THE GLOSSARY</p>
            <span className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
              <SparkIcon /> {results.length} explained this session
            </span>
          </div>

          {results.length === 0 && (
            <div className="border border-dashed border-zinc-300 bg-white/50 p-10 sm:p-14 text-center">
              <p className="text-zinc-700 text-lg mb-1" style={{ fontWeight: 600 }}>
                Chalo, shuru karein.
              </p>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Pick a term and the desi explanation will land right here.
              </p>
            </div>
          )}

          {results.map((r, i) => (
            <ResultCard key={r.id} result={r} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
