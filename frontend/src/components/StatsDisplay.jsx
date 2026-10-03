import { Coins, Gauge, Hash, MessageSquare } from "lucide-react";

export function StatsDisplay({ stats, isLoading, error, quotaTokens }) {
  if (error) {
    return <p className="px-1 text-xs text-red-400">{error}</p>;
  }

  const inputTokens = Number(stats?.input_tokens ?? 0);
  const outputTokens = Number(stats?.output_tokens ?? 0);
  const contextPercent = Number(stats?.context_percent ?? 0);
  const contextWindow = Number(stats?.context_window ?? 0);
  const cost = Number(stats?.cost ?? 0);
  const quotaPercent = quotaTokens
    ? Math.min(((inputTokens + outputTokens) / quotaTokens) * 100, 100)
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-zinc-500">
      <span className="inline-flex items-center gap-1.5">
        <Hash size={14} strokeWidth={1.8} />
        <strong className="font-medium text-zinc-300">
          {isLoading ? "..." : inputTokens.toLocaleString()}
        </strong>{" "}
        input
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MessageSquare size={14} strokeWidth={1.8} />
        <strong className="font-medium text-zinc-300">
          {isLoading ? "..." : outputTokens.toLocaleString()}
        </strong>{" "}
        output
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Gauge size={14} strokeWidth={1.8} />
        <strong className="font-medium text-zinc-300">
          {isLoading ? "..." : `${contextPercent.toFixed(1)}%`}
        </strong>{" "}
        context{" "}
        <span className="text-zinc-700">
          / {isLoading ? "..." : contextWindow.toLocaleString()}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Gauge size={14} strokeWidth={1.8} />
        <strong className="font-medium text-zinc-300">
          {isLoading ? "..." : `${quotaPercent.toFixed(2)}%`}
        </strong>{" "}
        budget
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Coins size={14} strokeWidth={1.8} />
        <strong className="font-medium text-zinc-300">
          {isLoading ? "..." : `$${cost.toFixed(6)}`}
        </strong>
      </span>
    </div>
  );
}
