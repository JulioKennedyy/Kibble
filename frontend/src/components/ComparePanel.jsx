import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardPaste } from "lucide-react";

/**
 * ComparePanel — permite colar os tokens reais do provedor
 * e comparar com a estimativa do Kibble.
 *
 * Não faz nenhuma chamada externa. Tudo local.
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
        aria-label="Compare estimate with actual usage"
        id="compare-toggle"
      >
        <span className="flex items-center gap-2">
          <ClipboardPaste size={13} strokeWidth={1.8} />
          Comparar estimativa com uso real
        </span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="border-t border-zinc-800/60 px-4 pb-4 pt-3">
          <p className="mb-3 text-[11px] leading-5 text-zinc-600">
            Cole os valores de{" "}
            <code className="text-zinc-400">usage</code> da resposta do
            provedor (ex:{" "}
            <code className="text-zinc-400">prompt_tokens</code> /{" "}
            <code className="text-zinc-400">completion_tokens</code> da
            OpenAI, ou{" "}
            <code className="text-zinc-400">input_tokens</code> /{" "}
            <code className="text-zinc-400">output_tokens</code> da
            Anthropic / Google). Nenhuma chamada de API é feita.
          </p>

          <div className="mb-4 flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-zinc-500">
              Tokens de entrada reais
              <input
                aria-label="Real input tokens / Tokens de entrada reais"
                className="w-32 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                min="0"
                onChange={(e) => setRealInput(e.target.value)}
                placeholder="ex: 1024"
                type="number"
                value={realInput}
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-zinc-500">
              Tokens de saída reais
              <input
                aria-label="Real output tokens / Tokens de saída reais"
                className="w-32 rounded-lg border border-zinc-800 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40"
                min="0"
                onChange={(e) => setRealOutput(e.target.value)}
                placeholder="ex: 256"
                type="number"
                value={realOutput}
              />
            </label>
          </div>

          {hasPasted && (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-zinc-600">
                  <th className="pb-1 font-medium">Métrica</th>
                  <th className="pb-1 font-medium">Estimativa Kibble</th>
                  <th className="pb-1 font-medium">Real (provedor)</th>
                  <th className="pb-1 font-medium">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                <tr>
                  <td className="py-1.5 text-cyan-400">Tokens de entrada</td>
                  <td className="py-1.5 text-zinc-300">{estInput.toLocaleString("pt-BR")}</td>
                  <td className="py-1.5 text-zinc-300">{realIn.toLocaleString("pt-BR")}</td>
                  <td className={`py-1.5 font-medium ${diffColor(diffIn)}`}>
                    {sign(diffIn)}{diffIn.toLocaleString("pt-BR")} ({sign(pctIn)}{pctIn}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-violet-400">Tokens de saída</td>
                  <td className="py-1.5 text-zinc-300">{estOutput.toLocaleString("pt-BR")}</td>
                  <td className="py-1.5 text-zinc-300">{realOut.toLocaleString("pt-BR")}</td>
                  <td className={`py-1.5 font-medium ${diffColor(diffOut)}`}>
                    {sign(diffOut)}{diffOut.toLocaleString("pt-BR")} ({sign(pctOut)}{pctOut}%)
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
