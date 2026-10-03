import { Coins, Gauge, Hash, MessageSquare, Layers, Wallet } from "lucide-react";

/**
 * StatsDisplay — visually differentiates:
 *   - input tokens (blue/cyan)
 *   - output tokens (violet)
 *   - total tokens (zinc)
 *   - context window usage (amber gauge)
 *   - budget local (teal, NOT provider quota)
 *   - estimated cost split: input cost + output cost + total
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
          >
            Retry
          </button>
        )}
      </span>
    );
  }

  const fmt = (n) => (isLoading ? "…" : Number(n ?? 0).toLocaleString());
  const pct = (n) => (isLoading ? "…" : `${Number(n ?? 0).toFixed(1)}%`);
  const usd = (n, digits = 6) =>
    isLoading ? "…" : `$${Number(n ?? 0).toFixed(digits)}`;

  const inputTokens = Number(stats?.input_tokens ?? 0);
  const outputTokens = Number(stats?.output_tokens ?? 0);
  const totalTokens  = Number(stats?.total_tokens ?? 0);
  const contextPct   = Number(stats?.context_percent ?? 0);
  const contextWin   = Number(stats?.context_window ?? 0);
  const budgetPct    = budgetTokens
    ? Math.min((totalTokens / budgetTokens) * 100, 100)
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-zinc-500">
      {/* Input tokens */}
      <Stat
        icon={<Hash size={13} strokeWidth={1.8} className="text-cyan-400" />}
        label="input"
        value={fmt(inputTokens)}
        valueClass="text-cyan-300"
      />

      {/* Output tokens */}
      <Stat
        icon={<MessageSquare size={13} strokeWidth={1.8} className="text-violet-400" />}
        label="output"
        value={fmt(outputTokens)}
        valueClass="text-violet-300"
      />

      {/* Total tokens */}
      <Stat
        icon={<Layers size={13} strokeWidth={1.8} className="text-zinc-400" />}
        label="total"
        value={fmt(totalTokens)}
        valueClass="text-zinc-200"
      />

      {/* Context window gauge */}
      <Stat
        icon={<Gauge size={13} strokeWidth={1.8} className="text-amber-400" />}
        label={`context ${isLoading ? "" : `/ ${contextWin.toLocaleString()}`}`}
        value={pct(contextPct)}
        valueClass={contextPct >= 90 ? "text-red-400" : "text-amber-300"}
      />

      {/* Local budget (not provider quota) */}
      {budgetTokens > 0 && (
        <Stat
          icon={<Wallet size={13} strokeWidth={1.8} className="text-teal-400" />}
          label="budget local"
          value={isLoading ? "…" : `${budgetPct.toFixed(1)}%`}
          valueClass="text-teal-300"
        />
      )}

      {/* Estimated cost */}
      <span className="inline-flex items-center gap-1.5">
        <Coins size={13} strokeWidth={1.8} className="text-emerald-400" />
        <span>
          <span className="font-medium text-cyan-300" title="Input cost">
            {usd(stats?.input_cost)}
          </span>
          <span className="mx-1 text-zinc-700">+</span>
          <span className="font-medium text-violet-300" title="Output cost">
            {usd(stats?.output_cost)}
          </span>
          <span className="mx-1 text-zinc-700">=</span>
          <span className="font-semibold text-emerald-300" title="Total estimated cost">
            {usd(stats?.cost)}
          </span>
        </span>
      </span>
    </div>
  );
}

function Stat({ icon, label, value, valueClass }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <strong className={`font-medium ${valueClass}`}>{value}</strong>{" "}
      <span className="text-zinc-600">{label}</span>
    </span>
  );
}
