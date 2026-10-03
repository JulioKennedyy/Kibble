import { useEffect, useState, useCallback } from "react";
import { ArrowUpRight, LoaderCircle, RefreshCw } from "lucide-react";

import { estimatePrompt, fetchModels } from "./api";
import { KibbleMascot } from "./components/KibbleMascot";
import { ModelTabs, FALLBACK_MODELS } from "./components/ModelTabs";
import { StatsDisplay } from "./components/StatsDisplay";
import { ComparePanel } from "./components/ComparePanel";

const EMPTY_STATS = {
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
  input_cost: 0,
  output_cost: 0,
  cost: 0,
  context_percent: 0,
  context_window: 0,
  tokenizer: "",
  tokenizer_note: "",
};

const DEBOUNCE_MS = 400;

export default function App() {
  const [text, setText] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [expectedOutputTokens, setExpectedOutputTokens] = useState(512);
  const [budgetTokens, setBudgetTokens] = useState(1_000_000);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Load model catalogue once
  useEffect(() => {
    fetchModels()
      .then((list) => list?.length && setModels(list))
      .catch(() => {/* use fallback silently */});
  }, []);

  const triggerRetry = useCallback(() => setRetryKey((k) => k + 1), []);

  // Debounced estimation
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await estimatePrompt(
          text,
          selectedModel,
          systemPrompt,
          expectedOutputTokens,
          controller.signal,
        );
        setStats(result);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err.message ?? "Unknown error");
          setStats(EMPTY_STATS);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [text, selectedModel, systemPrompt, expectedOutputTokens, retryKey]);

  const mascotState = error ? "error" : isLoading ? "loading" : "idle";

  const activeModel =
    (models?.length ? models : FALLBACK_MODELS).find((m) => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-[#071216] text-zinc-200">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-100">
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-300/20"
            aria-hidden="true"
          >
            <KibbleMascot state={mascotState} />
          </span>
          Kibble<span className="text-violet-400">.</span>
        </div>

        <span className="inline-flex items-center gap-2 text-xs text-zinc-600">
          {isLoading && (
            <LoaderCircle className="animate-spin text-cyan-300" size={13} />
          )}
          {isLoading ? "Updating estimate…" : "Token & cost estimator"}
        </span>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-3xl flex-col justify-center px-6 pb-20">
        {/* Hero */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-400/80">
            Feed the bit
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-100 sm:text-4xl">
            See the shape of your request before it runs.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">
            Kibble counts your system instructions, prompt, expected response,
            context window, and estimated spend in one place.
          </p>
        </div>

        {/* Model selector */}
        <ModelTabs
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
        />

        {/* Tokenizer note */}
        {activeModel?.tokenizer_note && (
          <p className="mt-2 text-[11px] leading-5 text-zinc-600">
            <span className="font-medium text-zinc-500">Tokenizer:</span>{" "}
            {activeModel.tokenizer_note}
          </p>
        )}

        {/* Input panel */}
        <section
          className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-2xl shadow-black/20"
          aria-label="Prompt input"
        >
          {/* Controls row */}
          <div className="grid gap-3 border-b border-zinc-800/80 p-4 sm:grid-cols-[1fr_auto]">
            <input
              aria-label="System prompt"
              className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-cyan-400/40"
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Optional system prompt…"
              value={systemPrompt}
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <label className="flex items-center gap-2">
                Output&nbsp;tokens
                <input
                  aria-label="Expected output tokens"
                  className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                  min="0"
                  onChange={(e) =>
                    setExpectedOutputTokens(
                      Math.max(0, Math.min(1_000_000, Number(e.target.value) || 0)),
                    )
                  }
                  type="number"
                  value={expectedOutputTokens}
                />
              </label>
              <label className="flex items-center gap-2">
                Budget&nbsp;local
                <input
                  aria-label="Local token budget"
                  className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                  min="1"
                  onChange={(e) =>
                    setBudgetTokens(
                      Math.max(1, Math.min(1_000_000_000, Number(e.target.value) || 1)),
                    )
                  }
                  type="number"
                  value={budgetTokens}
                />
              </label>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            aria-label="Prompt"
            className="min-h-[300px] w-full resize-y bg-transparent p-5 text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700 focus:ring-1 focus:ring-inset focus:ring-zinc-700"
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your prompt here…"
            value={text}
          />

          {/* Stats bar */}
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3">
            <StatsDisplay
              budgetTokens={budgetTokens}
              error={error}
              isLoading={isLoading}
              onRetry={triggerRetry}
              stats={stats}
            />
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
              {text.length.toLocaleString()} chars
              {error && (
                <button
                  aria-label="Retry estimate"
                  className="ml-1 text-zinc-500 hover:text-cyan-300 transition"
                  onClick={triggerRetry}
                  type="button"
                >
                  <RefreshCw size={11} />
                </button>
              )}
              <ArrowUpRight size={12} />
            </span>
          </div>
        </section>

        {/* Disclaimers */}
        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-600">
          Context window = model limit. Budget local = your planning target,{" "}
          <strong className="text-zinc-500">not</strong> the provider account quota.
          Final billing depends on the provider tokenizer, cached tokens, tools,
          and the actual generated response.
        </p>

        {/* Comparison panel */}
        <ComparePanel estimate={stats} />
      </main>
    </div>
  );
}
