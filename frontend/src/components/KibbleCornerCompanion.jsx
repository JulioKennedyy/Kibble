import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { KibbleMascot } from "./KibbleMascot";

export function KibbleCornerCompanion({
  isTyping,
  isDeleting,
  isLoading,
  stats,
  budgetTokens = 0,
  isSleepy,
  hasText,
  error,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [petMessage, setPetMessage] = useState(null);
  const messageTimer = useRef(null);
  const tokens = stats?.total_tokens || 0;
  const contextPercent = stats?.context_percent || 0;
  const budgetPercent = budgetTokens > 0 ? (tokens / budgetTokens) * 100 : 0;
  const fullnessPercent = Math.max(contextPercent, budgetPercent);
  const isFull = fullnessPercent >= 75 || tokens >= 4000;

  useEffect(() => () => window.clearTimeout(messageTimer.current), []);

  const isQuotaExceeded = useMemo(
    () =>
      (budgetTokens > 0 && tokens > budgetTokens) ||
      contextPercent >= 100,
    [budgetTokens, contextPercent, tokens],
  );

  const state = useMemo(() => {
    if (error) return "surprised";
    if (isQuotaExceeded || isDeleting) return "scared";
    if (isTyping) return "eating";
    if (isLoading) return "thinking";
    if (!hasText) return isSleepy ? "sleeping" : "idle";
    return isFull ? "satisfied" : "idle";
  }, [error, isQuotaExceeded, isDeleting, isTyping, isLoading, hasText, isSleepy, isFull]);

  const status = useMemo(() => {
    if (petMessage) return petMessage;
    if (error) return "Algo saiu do ritmo. Vamos tentar novamente.";
    if (isQuotaExceeded) {
      return contextPercent >= 100
        ? "Estou cheio: o prompt passou da janela de contexto."
        : `${tokens.toLocaleString("pt-BR")} tokens passam do seu limite.`;
    }
    if (isDeleting) return "Menos tokens agora. Assim cabe melhor.";
    if (isTyping) return "Estou acompanhando o que você escreve.";
    if (isLoading) return "Contando os tokens do seu prompt…";
    if (!hasText) return isSleepy ? "Pausa para recarregar." : "Cole um prompt e eu conto os tokens.";
    if (isFull) return `Estou bem cheio: ${tokens.toLocaleString("pt-BR")} tokens.`;
    if (fullnessPercent >= 50) return `Já usamos ${fullnessPercent.toFixed(1)}% do limite.`;
    return `${tokens.toLocaleString("pt-BR")} tokens contados. Ainda cabe mais.`;
  }, [petMessage, error, isQuotaExceeded, contextPercent, tokens, isDeleting, isTyping, isLoading, hasText, isSleepy, isFull, fullnessPercent]);

  const handleMascotPet = () => {
    window.clearTimeout(messageTimer.current);
    if (error) setPetMessage("Vamos tentar de novo. Eu continuo aqui.");
    else if (isQuotaExceeded) setPetMessage("Estou cheio. Precisamos reduzir esse prompt.");
    else if (isTyping) setPetMessage("Estou de olho no seu prompt.");
    else if (isLoading) setPetMessage("Só um instante, ainda estou contando.");
    else if (!hasText) setPetMessage("Pode colar um prompt para começarmos.");
    else if (isFull) setPetMessage("Ufa! Esse prompt foi um verdadeiro banquete.");
    else setPetMessage("Ainda tenho espaço. Pode mandar mais tokens.");
    messageTimer.current = window.setTimeout(() => setPetMessage(null), 2600);
  };

  if (isMinimized) {
    return (
      <button
        aria-label="Mostrar mascote Kibble"
        className="kibble-companion kibble-companion--minimized group fixed z-40 rounded-full border border-violet-300/15 bg-[#0c0b1c]/80 p-1.5 shadow-2xl shadow-violet-950/40 backdrop-blur-xl transition hover:border-violet-300/35"
        onClick={() => setIsMinimized(false)}
        type="button"
      >
        <KibbleMascot state={state} isTyping={isTyping} isDeleting={isDeleting} lookAtPrompt={hasText} size={48} showShadow={false} interactive={false} />
        <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#0c0b1c] bg-violet-400" />
      </button>
    );
  }

  return (
    <aside aria-label="Mascote Kibble" className="kibble-companion fixed z-40 w-[184px] select-none">
      <div className="relative">
        <button
          aria-label="Minimizar mascote Kibble"
          className="absolute right-6 top-8 z-20 rounded-full border border-white/10 bg-black/20 p-1.5 text-violet-200/60 backdrop-blur-md transition hover:bg-violet-500/15 hover:text-violet-100"
          onClick={() => setIsMinimized(true)}
          title="Minimizar Kibble"
          type="button"
        >
          <ChevronRight size={13} />
        </button>

        <button
          className="group relative flex w-full justify-center rounded-[36px] bg-transparent pb-2 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
          onClick={handleMascotPet}
          title="Fazer carinho no Kibble"
          type="button"
        >
          <span className="absolute bottom-3 left-1/2 h-10 w-28 -translate-x-1/2 rounded-full bg-violet-500/15 blur-2xl transition group-hover:bg-violet-400/25" />
          <KibbleMascot
            state={state}
            isTyping={isTyping}
            isDeleting={isDeleting}
            lookAtPrompt={hasText}
            size={128}
            showGlow={false}
            showShadow
            interactive={false}
          />
        </button>

        <div
          aria-live="polite"
          className={`relative -mt-1 rounded-2xl border px-3.5 py-3 shadow-xl backdrop-blur-xl ${
            isQuotaExceeded || error
              ? "border-amber-400/20 bg-[#1a1016]/90"
              : "border-violet-300/12 bg-[#0c0b1c]/88"
          }`}
        >
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">
            <Sparkles size={11} />
            Kibble
          </div>
          <p className="m-0 text-[11px] leading-[1.45] text-zinc-300">{status}</p>
        </div>
      </div>
    </aside>
  );
}
