import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUpRight, LoaderCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

import { estimatePrompt, fetchModels } from "./api";
import { KibbleMascot } from "./components/KibbleMascot";
import { KibbleCornerCompanion } from "./components/KibbleCornerCompanion";
import { ModelSelector, FALLBACK_MODELS } from "./components/ModelTabs";
import { StatsDisplay } from "./components/StatsDisplay";
import { ComparePanel } from "./components/ComparePanel";

const EMPTY_STATS = {
  input_tokens: 0,
  system_tokens: 0,
  prompt_tokens: 0,
  context_tokens: 0,
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
  const [conversationHistory, setConversationHistory] = useState("");
  const [expectedOutputTokens, setExpectedOutputTokens] = useState(512);
  const [budgetTokens, setBudgetTokens] = useState(1_000_000);
  const [selectedModel, setSelectedModel] = useState("gemini-3.8-flash");
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSleepy, setIsSleepy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [modelBounce, setModelBounce] = useState(false);
  const typingTimer = useRef(null);
  const deleteTimer = useRef(null);
  const idleTimer = useRef(null);
  const hungryTimer = useRef(null);

  // Load model catalogue once
  useEffect(() => {
    fetchModels()
      .then((list) => list?.length && setModels(list))
      .catch(() => {});
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
          conversationHistory,
          expectedOutputTokens,
          controller.signal,
        );
        setStats(result);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err.message ?? "Erro desconhecido");
          setStats(EMPTY_STATS);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => { controller.abort(); clearTimeout(timer); };
  }, [text, selectedModel, systemPrompt, conversationHistory, expectedOutputTokens, retryKey]);

  // ── Typing & Deleting detection & natural mascot cycles ──
  const handleTextChange = (value, setter, currentValue = "") => {
    const isDel = currentValue !== undefined && value.length < currentValue.length;
    setter(value);
    setIsSleepy(false);
    setIsHungry(false);
    clearTimeout(typingTimer.current);
    clearTimeout(deleteTimer.current);
    clearTimeout(idleTimer.current);
    clearTimeout(hungryTimer.current);

    if (isDel) {
      setIsDeleting(true);
      setIsTyping(false);
      deleteTimer.current = setTimeout(() => setIsDeleting(false), 1300);
    } else {
      setIsDeleting(false);
      setIsTyping(true);
      typingTimer.current = setTimeout(() => setIsTyping(false), 1400);
    }

    // After 8s of inactivity, Kibble gets hungry looking for more tokens
    hungryTimer.current = setTimeout(() => setIsHungry(true), 8000);
    // After 25s, Kibble peacefully falls asleep
    idleTimer.current = setTimeout(() => setIsSleepy(true), 25000);
  };

  // ── Model change bounce ──
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setModelBounce(true);
    setTimeout(() => setModelBounce(false), 800);
  };

  // ── Sleepy / Hungry timer on mount ──
  useEffect(() => {
    hungryTimer.current = setTimeout(() => setIsHungry(true), 8000);
    idleTimer.current = setTimeout(() => setIsSleepy(true), 25000);
    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(hungryTimer.current);
      clearTimeout(deleteTimer.current);
    };
  }, []);

  // Mascot reacts smoothly to live site state
  const getMascotState = () => {
    if (error) return "surprised";
    const effectiveBudget = showAdvanced ? budgetTokens : 0;
    const isQuotaExceeded =
      (effectiveBudget > 0 && tokens > effectiveBudget) ||
      (stats.context_percent >= 100);
    if (isQuotaExceeded) return "scared";
    if (isDeleting) return "scared";
    if (isLoading && !isTyping) return "thinking";
    if (isTyping) return "eating";
    if (!text && !systemPrompt && !conversationHistory) {
      if (isSleepy) return "sleeping";
      return "idle";
    }
    if (tokens > 4000) return "satisfied";
    if (tokens > 80) return "satisfied";
    return "idle";
  };
  const mascotState = getMascotState();

  return (
    <div className="min-h-screen bg-[#071216] text-zinc-200">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        {/* Brand Logo with Kibble Mascot */}
        <div className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-zinc-100 select-none">
          <span
            className="relative flex h-10 w-12 items-center justify-center transition-transform hover:scale-105"
            aria-hidden="true"
          >
            <KibbleMascot
              isTyping={isTyping}
              isDeleting={isDeleting}
              size={40}
              state={mascotState}
              showGlow={false}
              showShadow={false}
              interactive={false}
            />
          </span>
          <span>Kibble</span>
        </div>

        {/* Model selector (dropdown pill) + loading indicator */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <LoaderCircle className="animate-spin text-cyan-300" size={13} />
          )}
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
          />
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-6 pb-20">
        {/* Card principal */}
        <section
          className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-2xl shadow-black/20"
          aria-label="Entrada do prompt"
        >
          {/* Instrução do sistema */}
          <div className="border-b border-zinc-800/80 px-4 pt-3 pb-3">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Instrução do sistema (opcional)
            </label>
            <input
              aria-label="Instrução do sistema"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-cyan-400/40 transition"
              onChange={(e) => handleTextChange(e.target.value, setSystemPrompt, systemPrompt)}
              placeholder="Ex: Você é um assistente que responde em português…"
              value={systemPrompt}
            />
          </div>

          {/* Histórico da conversa */}
          <div className="border-b border-zinc-800/80 px-4 pt-3 pb-3">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-0.5">
              Histórico da conversa (opcional)
            </label>
            <p className="text-[10px] text-zinc-700 mb-1.5">
              O provedor cobra por todos os tokens enviados — incluindo o histórico.
            </p>
            <textarea
              aria-label="Histórico da conversa"
              className="min-h-[64px] w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs leading-5 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-orange-400/40 transition"
              onChange={(e) => handleTextChange(e.target.value, setConversationHistory, conversationHistory)}
              placeholder="Cole mensagens anteriores aqui para incluir no cálculo…"
              value={conversationHistory}
            />
          </div>

          {/* ── Área do prompt — FOCO PRINCIPAL ── */}
          <textarea
            aria-label="Prompt"
            className="min-h-[260px] w-full resize-y bg-transparent p-5 text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700 focus:ring-1 focus:ring-inset focus:ring-zinc-700"
            onChange={(e) => handleTextChange(e.target.value, setText, text)}
            placeholder="Escreva ou cole seu prompt aqui…"
            value={text}
            autoFocus
          />

          {/* Controles + Stats bar */}
          <div className="border-t border-zinc-800/80 px-4 py-3 space-y-2">
            {/* Controles na mesma linha */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <label className="flex items-center gap-2">
                Tokens de resposta
                <input
                  aria-label="Tokens de saída esperados"
                  className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40 transition"
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

              <button
                className="flex items-center gap-1 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-600 transition hover:border-zinc-700 hover:text-zinc-300"
                onClick={() => setShowAdvanced((v) => !v)}
                type="button"
              >
                Mais opções
                {showAdvanced ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>

              {showAdvanced && (
                <label className="flex items-center gap-2">
                  Orçamento (tokens)
                  <input
                    aria-label="Orçamento pessoal de tokens"
                    className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40 transition"
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
              )}

              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-zinc-600">
                {text.length.toLocaleString("pt-BR")} chars
                {error && (
                  <button
                    aria-label="Tentar novamente"
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

            {/* Stats */}
            <StatsDisplay
              budgetTokens={showAdvanced ? budgetTokens : 0}
              error={error}
              isLoading={isLoading}
              onRetry={triggerRetry}
              stats={stats}
            />
          </div>
        </section>

        {/* Painel de comparação */}
        <ComparePanel estimate={stats} />
      </main>

      {/* Kibble Companion passivo no canto da tela */}
      <KibbleCornerCompanion
        budgetTokens={showAdvanced ? budgetTokens : 0}
        error={error}
        hasText={Boolean(text || systemPrompt || conversationHistory)}
        isDeleting={isDeleting}
        isLoading={isLoading}
        isSleepy={isSleepy}
        isTyping={isTyping}
        stats={stats}
      />
    </div>
  );
}
