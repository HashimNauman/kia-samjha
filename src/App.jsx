import { useState, useRef } from "react";

const DESI_DECK =
  "Pakistani pop culture, a wide deck to draw from: music legends (Vital Signs and 'Dil Dil Pakistan', Junoon's Sufi-rock fusion, Nusrat Fateh Ali Khan qawwali, Coke Studio, Atif Aslam, 'Pasoori'); food culture (samosa vs pakora debates, the perfect chai, biryani-with-aloo wars, dhaba nihari, jalebi); cricket (Babar Azam, PSL, last-over collapses, Shoaib Akhtar's pace); iconic dramas (Humsafar, Dhoop Kinare, the never-ending serial); city rivalries (Karachi vs Lahore, 'Lahore Lahore hai'); daily life (load-shedding and K-Electric, jugaar fixes, Careem/inDrive bargaining, rishta aunties, the meddling relative cast — Phuppi, Mamoon, Chacha, Khala — rotate them); Punjabi humour and wordplay; truck-art poetry and rickshaw philosophy.";

const TERM_PRESETS = [
  "Large Language Model",
  "Algorithm",
  "Cloud Computing",
  "API",
  "Machine Learning",
  "Neural Network",
  "Encryption",
  "Phishing",
  "Cookies",
  "Bandwidth",
  "AI Hallucination",
  "Open Source",
  "Cache",
  "Blockchain",
  "VPN",
];

const SECTION_LABELS = [
  { key: "plain_english", label: "PLAIN ENGLISH", accent: false },
  { key: "analogy", label: "THE DESI ANALOGY", accent: true },
  { key: "punchline", label: "THE PUNJABI PUNCHLINE", accent: false },
  { key: "real_example", label: "IN REAL LIFE", accent: false },
];

async function explainTerm(term) {
  const prompt = `You are a brilliant Pakistani technologist-artist who explains technology, IT, AI and LLM concepts to a general audience using Pakistani pop culture. Explain the tech term "${term}" for someone with no technical background.

Draw analogies from this deck: ${DESI_DECK}

Return ONLY a raw JSON object — no markdown fences, no preamble:
{
  "plain_english": "one accurate, jargon-free sentence defining the term",
  "analogy": "2-4 sentences mapping the term onto ONE specific Pakistani pop-culture reference — commit to it fully, make it genuinely illuminating, not just decorative",
  "punchline": "one witty line, ideally with Punjabi/Urdu wordplay or a relatable desi observation — make it funny but still true",
  "real_example": "2 sentences: one everyday situation where the reader meets this term, plus a sharp 'gotcha' or caveat in the same desi voice"
}

Keep the technology accurate underneath the jokes. Use natural Urdu-English code-switching. No emojis.`;

  const viaFetch = async () => {
    const workerUrl = import.meta.env.VITE_API_URL || "https://kia-samjha-api.hashim-nauman.workers.dev";
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Response was not JSON (HTTP ${response.status})`);
    }
    if (payload.error) throw new Error(payload.error.message || `API error (HTTP ${response.status})`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (payload.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  };

  const viaLegacy = async () => {
    if (typeof window === "undefined" || !window.claude || typeof window.claude.complete !== "function") {
      throw new Error("Legacy interface unavailable");
    }
    return await window.claude.complete(prompt);
  };

  const parseOutput = (text) => {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON in model output");
    const parsed = JSON.parse(text.slice(start, end + 1));
    for (const k of ["plain_english", "analogy", "punchline", "real_example"]) {
      if (!parsed[k]) throw new Error("Model output missing expected fields");
    }
    return parsed;
  };

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let text;
      try {
        text = await viaFetch();
      } catch (fetchErr) {
        console.warn(`Fetch path failed (attempt ${attempt}):`, fetchErr?.message);
        text = await viaLegacy();
      }
      return parseOutput(text);
    } catch (e) {
      lastError = e;
      console.warn(`Explain attempt ${attempt} failed:`, e?.message);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw lastError;
}

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

function SkeletonCard() {
  return (
    <article className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="border-l-2 border-rose-600 p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-24 shimmer rounded-sm" />
          <div className="h-7 w-2/3 shimmer rounded-sm" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 pt-4 border-t border-zinc-100">
            <div className="h-3 w-32 shimmer rounded-sm" />
            <div className="h-4 w-full shimmer rounded-sm" />
            <div className="h-4 w-5/6 shimmer rounded-sm" />
          </div>
        ))}
      </div>
    </article>
  );
}

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
  const [customTerm, setCustomTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const outputRef = useRef(null);

  const activeTerm = customTerm.trim() || term;

  const reset = () => {
    setResults([]);
    setTerm("");
    setCustomTerm("");
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const run = async () => {
    if (!activeTerm || loading) return;
    setLoading(true);
    setError(null);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const data = await explainTerm(activeTerm);
      setResults((prev) => [{ id: Date.now(), term: activeTerm, data }, ...prev]);
      setCustomTerm("");
    } catch (e) {
      console.error("Explainer error:", e);
      setError(
        `The explainer dropped the catch on that one — try again, or rephrase the term.${e?.message ? ` (Details: ${e.message})` : ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-900" style={{ fontFamily: "'Outfit', system-ui, sans-serif", backgroundColor: "#f9fafb" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        * { transition: border-color .3s cubic-bezier(.16,1,.3,1), background-color .3s cubic-bezier(.16,1,.3,1), color .3s cubic-bezier(.16,1,.3,1), transform .25s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
        @keyframes shimmerMove { from { background-position: -400px 0; } to { background-position: 400px 0; } }
        .shimmer { background: linear-gradient(90deg, #e4e4e7 25%, #f4f4f5 50%, #e4e4e7 75%); background-size: 800px 100%; animation: shimmerMove 1.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fade-up { animation: none; } .shimmer { animation: none; } * { transition: none !important; } }
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
              You don't need a CS degree — you need a good analogy. Type any tech, IT,
              or AI term and get it explained through Pakistani pop culture: Vital Signs,
              Junoon, samosas vs pakoras, PSL collapses, and a Punjabi punchline to make
              it stick.
            </p>
          </header>

          <section>
            <p className="font-mono text-xs tracking-widest text-zinc-400 mb-3">01 · PICK A TERM</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {TERM_PRESETS.map((t) => {
                const active = term === t && !customTerm.trim();
                return (
                  <button
                    key={t}
                    onClick={() => { setTerm(t); setCustomTerm(""); }}
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

            <div className="flex flex-col gap-2">
              <label htmlFor="custom-term" className="text-sm text-zinc-700" style={{ fontWeight: 500 }}>
                Or type any term
              </label>
              <input
                id="custom-term"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                placeholder="e.g. Quantum Computing, Kubernetes, RAG…"
                className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-rose-600"
              />
              <p className="text-xs text-zinc-400">Free text overrides the chips above.</p>
            </div>
          </section>

          <div className="space-y-3">
            <button
              onClick={run}
              disabled={!activeTerm || loading}
              className={`w-full flex items-center justify-between px-5 py-4 border active:scale-95 ${
                !activeTerm || loading
                  ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "border-rose-700 bg-rose-700 text-white hover:bg-rose-600 shadow-sm"
              }`}
              style={{ fontWeight: 600 }}
            >
              <span>
                {loading ? "Sochne do… bas 2 minute" : activeTerm ? `Explain "${activeTerm}"` : "Pick a term first"}
              </span>
              <ArrowIcon />
            </button>

            <button
              onClick={reset}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-zinc-300 bg-white text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 active:scale-95 disabled:opacity-50"
              style={{ fontWeight: 500 }}
            >
              <RefreshIcon />
              <span>Acha acha, theek hei</span>
            </button>
          </div>

          {error && (
            <p className="text-sm text-rose-700 border border-rose-200 bg-rose-50 px-4 py-3">{error}</p>
          )}

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

          {loading && <SkeletonCard />}

          {!loading && results.length === 0 && (
            <div className="border border-dashed border-zinc-300 bg-white/50 p-10 sm:p-14 text-center">
              <p className="text-zinc-700 text-lg mb-1" style={{ fontWeight: 600 }}>
                Chalo, shuru karein.
              </p>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Pick a term — or type your own — and the desi explanation will land
                right here.
              </p>
            </div>
          )}

          {results.map((r, i) => (
            <ResultCard key={r.id} result={r} index={loading ? i + 1 : i} />
          ))}
        </div>
      </main>
    </div>
  );
}
