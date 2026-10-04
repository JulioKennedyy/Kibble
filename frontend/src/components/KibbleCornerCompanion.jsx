import React, { useState, useMemo } from "react";
import { KibbleMascot } from "./KibbleMascot";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  // Check quota exceeded
  const isQuotaExceeded = useMemo(() => {
    const tokens = stats?.total_tokens || 0;
    if (budgetTokens > 0 && tokens > budgetTokens) return true;
    if (stats?.context_percent >= 100) return true;
    return false;
  }, [budgetTokens, stats]);

  // Compute passive reaction state
  const state = useMemo(() => {
    if (error) return "surprised";
    if (isQuotaExceeded) return "scared";
    if (isDeleting) return "scared";
    if (isTyping) return "eating";
    if (isLoading) return "thinking";
    if (!hasText) {
      if (isSleepy) return "sleeping";
      return "idle";
    }
    const tokens = stats?.total_tokens || 0;
    if (tokens > 4000) return "satisfied";
    if (tokens > 0) return "satisfied";
    return "idle";
  }, [error, isQuotaExceeded, isDeleting, isTyping, isLoading, stats, isSleepy, hasText]);

  // Compute passive friendly status message
  const statusMessage = useMemo(() => {
    if (petMessage) return petMessage;
    if (error) return "Ops! Algo deu errado...";
    if (isQuotaExceeded) {
      if (stats?.context_percent >= 100) {
        return "🚨 Socorro! Estourou o contexto do modelo!";
      }
      return `🚨 Passou da quota! (${stats?.total_tokens?.toLocaleString()} / ${budgetTokens?.toLocaleString()} tokens)`;
    }
    if (isDeleting) {
      return "Ei! Cuspi um token... 🥺 Não apaga!";
    }
    if (isTyping) return "Mnham! Comendo tokens... 😋";
    if (isLoading) return "Hmm... calculando... 🤔";
    if (!hasText) {
      if (isSleepy) return "Zzz... me dê tokens...";
      return "Kibble está com fome de tokens! 💜";
    }
    const tokens = stats?.total_tokens || 0;
    if (tokens > 4000) return `${tokens.toLocaleString()} tokens! Que banquete! 💜`;
    if (tokens > 0) return `${tokens.toLocaleString()} tokens devorados! ✨`;
    return "Pronto para devorar tokens!";
  }, [petMessage, error, isQuotaExceeded, isDeleting, isTyping, isLoading, stats, budgetTokens, isSleepy, hasText]);

  const handleMascotPet = () => {
    const compliments = [
      "Mnham! Adoro tokens! 💜",
      "Kibble feliz! ✨",
      "Mais tokens, por favor! 😋",
      "Tokens são deliciosos! 🚀",
    ];
    const randomMsg = compliments[Math.floor(Math.random() * compliments.length)];
    setPetMessage(randomMsg);
    setTimeout(() => setPetMessage(null), 2400);
  };

  return (
    <aside
      aria-label="Mascote Kibble"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Speech / Status Bubble */}
      {!isMinimized && (
        <div
          className={`mb-2 mr-2 max-w-[240px] rounded-2xl border px-3.5 py-1.5 text-xs shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            isQuotaExceeded
              ? "border-amber-500/60 bg-[#1f0d0d]/95 text-amber-200 shadow-amber-950/50"
              : isDeleting
              ? "border-pink-500/40 bg-[#1a0f1d]/95 text-pink-200 shadow-pink-950/40"
              : "border-purple-500/25 bg-[#0d121f]/95 text-purple-200 shadow-purple-950/40"
          }`}
        >
          <p className="font-medium leading-snug">{statusMessage}</p>
          <div
            className={`absolute -bottom-1.5 right-8 w-2 h-2 rotate-45 border-r border-b ${
              isQuotaExceeded
                ? "border-amber-500/60 bg-[#1f0d0d]"
                : isDeleting
                ? "border-pink-500/40 bg-[#1a0f1d]"
                : "border-purple-500/25 bg-[#0d121f]"
            }`}
          />
        </div>
      )}

      {/* Mascot Card container */}
      <div
        className={`relative flex items-center gap-2 rounded-2xl border p-2 shadow-2xl backdrop-blur-lg transition-all ${
          isQuotaExceeded
            ? "border-amber-600/60 bg-[#180a0a]/90 shadow-amber-950/50"
            : "border-purple-800/40 bg-[#090d18]/90 shadow-black/60 hover:border-purple-600/50"
        }`}
      >
        {/* Mascot */}
        <div
          title="Kibble — Ele come os tokens que você digita! Clique para fazer carinho."
          className="relative flex items-center justify-center p-1"
        >
          <KibbleMascot
            state={state}
            isTyping={isTyping}
            isDeleting={isDeleting}
            size={isMinimized ? 44 : 64}
            onClick={handleMascotPet}
          />
        </div>

        {/* Info & Collapse trigger */}
        {!isMinimized && (
          <div className="flex flex-col pr-1 select-none">
            <span className="text-[11px] font-bold tracking-tight text-purple-300">
              Kibble
            </span>
            <span className="text-[10px] text-zinc-400">
              {stats?.total_tokens > 0
                ? `${stats.total_tokens.toLocaleString()} tokens`
                : "Comedor de tokens"}
            </span>
          </div>
        )}

        {/* Minimize / Expand Toggle */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="rounded-full p-1 text-zinc-500 hover:bg-purple-950/50 hover:text-purple-300 transition"
          title={isMinimized ? "Expandir Kibble" : "Minimizar Kibble"}
          type="button"
        >
          {isMinimized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>
    </aside>
  );
}
