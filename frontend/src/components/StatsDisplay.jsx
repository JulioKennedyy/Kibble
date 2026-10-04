import { Coins, Gauge, Hash, MessageSquare, Layers, Wallet, FileText, Bot, History } from "lucide-react";

/**
 * StatsDisplay — exibe as estatísticas de tokens e custo
 * de forma simplificada e em PT-BR.
 */
export function StatsDisplay({ stats, isLoading, error, budgetTokens, onRetry }) {
  if (error) {
    return (
      <span className="flex items-center gap-2 px-1 text-xs text-red-400">
        {error}
        {onRetry && (
          <button
            className="rounded border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-300 transition hover:bg-red-400/20"
            onClick={onRetry}
            type="button"
            aria-label="Retry"
          >
            Tentar de novo
          </button>
        )}
      </span>
    );
  }

  const fmt = (n) => (isLoading ? "…" : Number(n ?? 0).toLocaleString("pt-BR"));
  const pct = (n) => (isLoading ? "…" : `${Number(n ?? 0).toFixed(1)}%`);
  const usd = (n, digits = 6) =>
    isLoading ? "…" : `$${Number(n ?? 0).toFixed(digits)}`;

  const inputTokens   = Number(stats?.input_tokens ?? 0);
  const systemTokens  = Number(stats?.system_tokens ?? 0);
  const promptTokens  = Number(stats?.prompt_tokens ?? 0);
  const contextTokens = Number(stats?.context_tokens ?? 0);
  const outputTokens  = Number(stats?.output_tokens ?? 0);
  const totalTokens   = Number(stats?.total_tokens ?? 0);
  const contextPct    = Number(stats?.context_percent ?? 0);
  const contextWin    = Number(stats?.context_window ?? 0);
  const budgetPct     = budgetTokens
    ? Math.min((totalTokens / budgetTokens) * 100, 100)
    : 0;

  return (
    <div className="w-full space-y-3 px-1">
      {/* Linha principal de tokens */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500">
        {/* Entrada total */}
        <Stat
          icon={<Hash size={13} strokeWidth={1.8} className="text-cyan-400" />}
          label="entrada"
          value={fmt(inputTokens)}
          valueClass="text-cyan-300"
          tooltip={
            (systemTokens > 0 || contextTokens > 0)
              ? `Instrução: ${systemTokens.toLocaleString("pt-BR")} · Prompt: ${promptTokens.toLocaleString("pt-BR")} · Histórico: ${contextTokens.toLocaleString("pt-BR")}`
              : undefined
          }
        />

        {/* Histórico (só aparece se tiver) */}
        {contextTokens > 0 && (
          <Stat
            icon={<History size={13} strokeWidth={1.8} className="text-orange-400" />}
            label="histórico"
            value={fmt(contextTokens)}
            valueClass="text-orange-300"
          />
        )}

        {/* Saída esperada */}
        <Stat
          icon={<MessageSquare size={13} strokeWidth={1.8} className="text-violet-400" />}
          label="saída"
          value={fmt(outputTokens)}
          valueClass="text-violet-300"
        />

        {/* Total */}
        <Stat
          icon={<Layers size={13} strokeWidth={1.8} className="text-zinc-400" />}
          label="total"
          value={fmt(totalTokens)}
          valueClass="text-zinc-200"
        />

        {/* Uso da janela */}
        <Stat
          icon={<Gauge size={13} strokeWidth={1.8} className="text-amber-400" />}
          label={`janela ${isLoading ? "" : `/ ${contextWin.toLocaleString("pt-BR")}`}`}
          value={pct(contextPct)}
          valueClass={contextPct >= 90 ? "text-red-400" : "text-amber-300"}
        />

        {/* Orçamento pessoal */}
        {budgetTokens > 0 && (
          <Stat
            icon={<Wallet size={13} strokeWidth={1.8} className="text-teal-400" />}
            label="orçamento"
            value={isLoading ? "…" : `${budgetPct.toFixed(1)}%`}
            valueClass="text-teal-300"
          />
        )}
      </div>

      {/* Custo estimado — visual simplificado */}
      <div
        aria-label="Custo estimado"
        className="flex min-w-[205px] items-center justify-between gap-4 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Coins size={14} strokeWidth={1.8} className="text-emerald-300" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              custo estimado
            </div>
            <div className="mt-0.5 text-[10px] tabular-nums text-zinc-600">
              {usd(stats?.input_cost)} entrada + {usd(stats?.output_cost)} saída
            </div>
          </div>
        </div>
        <span className="font-semibold tabular-nums text-emerald-200" title="Custo total estimado">
          {usd(stats?.cost)}
        </span>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, valueClass, tooltip }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={tooltip}>
      {icon}
      <strong className={`font-medium ${valueClass}`}>{value}</strong>{" "}
      <span className="text-zinc-600">{label}</span>
    </span>
  );
}
