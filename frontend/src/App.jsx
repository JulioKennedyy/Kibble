import { useEffect, useState } from "react";
import { ArrowUpRight, CircleDot, LoaderCircle } from "lucide-react";

import { estimatePrompt } from "./api";
import { ModelTabs } from "./components/ModelTabs";
import { StatsDisplay } from "./components/StatsDisplay";

const EMPTY_STATS = {
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
  cost: 0,
  context_percent: 0,
  context_window: 0,
};

export default function App() {
  const [text, setText] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [expectedOutputTokens, setExpectedOutputTokens] = useState(512);
  const [quotaTokens, setQuotaTokens] = useState(1_000_000);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
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
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [text, selectedModel, systemPrompt, expectedOutputTokens]);

  return (
    <div className="min-h-screen bg-[#071216] text-zinc-200">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
            <CircleDot size={18} strokeWidth={2.4} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </span>
          Kibble<span className="text-violet-400">.</span>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-zinc-600">
          {isLoading && <LoaderCircle className="animate-spin text-cyan-300" size={13} />}
          {isLoading ? "Updating estimate..." : "Token & cost estimator"}
        </span>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-3xl flex-col justify-center px-6 pb-20">
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

        <ModelTabs
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
        />

        <section className="mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-2xl shadow-black/20">
          <div className="grid gap-3 border-b border-zinc-800/80 p-4 sm:grid-cols-[1fr_190px]">
            <input
              aria-label="System prompt"
              className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-cyan-400/40"
              onChange={(event) => setSystemPrompt(event.target.value)}
              placeholder="Optional system prompt..."
              value={systemPrompt}
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <label className="flex items-center gap-2">
                Output
                <input
                  className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                  min="0"
                  onChange={(event) =>
                    setExpectedOutputTokens(
                      Math.max(0, Math.min(1_000_000, Number(event.target.value) || 0)),
                    )
                  }
                  type="number"
                  value={expectedOutputTokens}
                />
              </label>
              <label className="flex items-center gap-2">
                Budget
                <input
                  aria-label="Token budget"
                  className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                  min="1"
                  onChange={(event) =>
                    setQuotaTokens(
                      Math.max(1, Math.min(1_000_000_000, Number(event.target.value) || 1)),
                    )
                  }
                  type="number"
                  value={quotaTokens}
                />
              </label>
            </div>
          </div>
          <textarea
            aria-label="Prompt"
            className="min-h-[340px] w-full resize-y bg-transparent p-5 text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700 focus:ring-1 focus:ring-inset focus:ring-zinc-700"
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or write your prompt here..."
            value={text}
          />
          <div className="flex min-h-12 items-center justify-between border-t border-zinc-800/80 px-4 py-3">
            <StatsDisplay
              error={error}
              isLoading={isLoading}
              quotaTokens={quotaTokens}
              stats={stats}
            />
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
              {text.length.toLocaleString()} chars
              <ArrowUpRight size={12} />
            </span>
          </div>
        </section>
        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-600">
          Context is the model limit. Budget is your local planning target, not
          the provider account quota. Final billing depends on the provider
          tokenizer, cached tokens, tools, and the actual generated response.
        </p>
      </main>
    </div>
  );
}
