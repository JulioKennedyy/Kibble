import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardPaste } from "lucide-react";

/**
 * ComparePanel — lets the user paste real provider usage
 * and compares it against the Kibble estimate.
 *
 * Does NOT call any external API. All comparison is local.
 */
export function ComparePanel({ estimate }) {
  const [open, setOpen] = useState(false);
  const [realInput, setRealInput] = useState("");
  const [realOutput, setRealOutput] = useState("");

  const estInput  = Number(estimate?.input_tokens  ?? 0);
  const estOutput = Number(estimate?.output_tokens ?? 0);
  const realIn    = Number(realInput)  || 0;
  const realOut   = Number(realOutput) || 0;
  const hasPasted = realIn > 0 || realOut > 0;

  const diffIn  = realIn  - estInput;
  const diffOut = realOut - estOutput;
  const pctIn   = estInput  ? ((diffIn  / estInput)  * 100).toFixed(1) : "—";
  const pctOut  = estOutput ? ((diffOut / estOutput) * 100).toFixed(1) : "—";

  const sign = (n) => (n >= 0 ? "+" : "");
  const diffColor = (n) =>
    n === 0 ? "text-zinc-400" : n > 0 ? "text-red-400" : "text-emerald-400";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/20">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-expanded={open}
        id="compare-toggle"
      >
        <span className="flex items-center gap-2">
          <ClipboardPaste size={13} strokeWidth={1.8} />
          Compare estimate vs. real usage
        </span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="border-t border-zinc-800/60 px-4 pb-4 pt-3">
          <p className="mb-3 text-[11px] leading-5 text-zinc-600">
            Paste the <code className="text-zinc-400">usage</code> values from
            your provider response (e.g.{" "}
            <code className="text-zinc-400">prompt_tokens</code> /
            <code className="text-zinc-400"> completion_tokens</code> from
            OpenAI, or{" "}
            <code className="text-zinc-400">input_tokens</code> /
            <code className="text-zinc-400"> output_tokens</code> from
            Anthropic / Google). No API call is made.
          </p>

          <div className="mb-4 flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-zinc-500">
              Real input tokens
              <input
                aria-label="Real input tokens from provider"
                className="w-32 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                min="0"
                onChange={(e) => setRealInput(e.target.value)}
                placeholder="e.g. 1024"
                type="number"
                value={realInput}
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-zinc-500">
              Real output tokens
              <input
                aria-label="Real output tokens from provider"
                className="w-32 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                min="0"
                onChange={(e) => setRealOutput(e.target.value)}
                placeholder="e.g. 256"
                type="number"
                value={realOutput}
              />
            </label>
          </div>

          {hasPasted && (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-zinc-600">
                  <th className="pb-1 font-medium">Metric</th>
                  <th className="pb-1 font-medium">Kibble estimate</th>
                  <th className="pb-1 font-medium">Real (provider)</th>
                  <th className="pb-1 font-medium">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                <tr>
                  <td className="py-1.5 text-cyan-400">Input tokens</td>
                  <td className="py-1.5 text-zinc-300">{estInput.toLocaleString()}</td>
                  <td className="py-1.5 text-zinc-300">{realIn.toLocaleString()}</td>
                  <td className={`py-1.5 font-medium ${diffColor(diffIn)}`}>
                    {sign(diffIn)}{diffIn.toLocaleString()} ({sign(pctIn)}{pctIn}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-violet-400">Output tokens</td>
                  <td className="py-1.5 text-zinc-300">{estOutput.toLocaleString()}</td>
                  <td className="py-1.5 text-zinc-300">{realOut.toLocaleString()}</td>
                  <td className={`py-1.5 font-medium ${diffColor(diffOut)}`}>
                    {sign(diffOut)}{diffOut.toLocaleString()} ({sign(pctOut)}{pctOut}%)
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
