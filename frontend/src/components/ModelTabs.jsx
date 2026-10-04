import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export const FALLBACK_MODELS = [
  // OpenAI
  { id: "gpt-6-astra",       name: "GPT-6 Astra",          provider: "OpenAI",    description: "Modelo mais avançado" },
  { id: "gpt-5.6-sol",       name: "GPT-5.6 Sol",          provider: "OpenAI",    description: "Poderoso e versátil" },
  { id: "gpt-5.6-luna",      name: "GPT-5.6 Luna",         provider: "OpenAI",    description: "Rápido e barato" },
  { id: "gpt-5",             name: "GPT-5",                 provider: "OpenAI",    description: "Custo-benefício" },
  { id: "gpt-4o",            name: "GPT-4o",                provider: "OpenAI",    description: "Rápido e capaz" },
  { id: "gpt-4o-mini",       name: "GPT-4o Mini",           provider: "OpenAI",    description: "Mais econômico" },
  // Google
  { id: "gemini-3.8-flash",  name: "Gemini 3.8 Flash",      provider: "Google",    description: "Novo — rápido e inteligente" },
  { id: "gemini-3.1-pro",    name: "Gemini 3.1 Pro",        provider: "Google",    description: "Raciocínio avançado" },
  { id: "gemini-2.5-flash",  name: "Gemini 2.5 Flash",      provider: "Google",    description: "Rápido e eficiente" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "Google", description: "Ultra econômico" },
  { id: "gemini-2.5-pro",    name: "Gemini 2.5 Pro",        provider: "Google",    description: "Qualidade alta" },
  // Anthropic
  { id: "claude-fable-5-1",  name: "Claude Fable 5.1",      provider: "Anthropic", description: "Fronteira — máxima capacidade" },
  { id: "claude-opus-5-5",   name: "Claude Opus 5.5",       provider: "Anthropic", description: "Problemas complexos" },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5",     provider: "Anthropic", description: "Equilíbrio ideal" },
  { id: "claude-haiku-4-5",  name: "Claude Haiku 4.5",      provider: "Anthropic", description: "Leve e rápido" },
  { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5",     provider: "Anthropic", description: "Legado — ainda disponível" },
];

const PROVIDER_COLORS = {
  Google:    "text-emerald-400",
  OpenAI:    "text-sky-400",
  Anthropic: "text-violet-400",
};

// Short name for the button pill (strip provider prefix)
function shortName(model) {
  return model.name
    .replace("Gemini ", "")
    .replace("GPT-", "GPT-")
    .replace("Claude ", "");
}

export function ModelSelector({ models, selectedModel, onSelect }) {
  const list = models?.length ? models : FALLBACK_MODELS;
  const active = list.find((m) => m.id === selectedModel) ?? list[0];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const providerColor = PROVIDER_COLORS[active?.provider] ?? "text-zinc-400";

  // Group by provider
  const groups = list.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button — compact pill like Gemini */}
      <button
        id="model-selector-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-3.5 py-1.5 text-sm font-medium text-zinc-100 shadow-sm transition hover:bg-zinc-700/80"
      >
        <span className={providerColor + " font-semibold text-[13px]"}>
          {shortName(active)}
        </span>
        <ChevronDown size={13} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Selecionar modelo"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[230px] overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60"
        >
          {Object.entries(groups).map(([provider, items], gi) => (
            <div key={provider}>
              {gi > 0 && <div className="mx-3 border-t border-zinc-800" />}
              <div className="px-3 pt-2.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {provider}
              </div>
              {items.map((model) => {
                const isActive = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    role="option"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => { onSelect(model.id); setOpen(false); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-zinc-800/80 ${
                      isActive ? "bg-zinc-800/50" : ""
                    }`}
                  >
                    {/* Checkmark column */}
                    <span className="flex w-4 shrink-0 items-center justify-center">
                      {isActive && <Check size={13} className="text-cyan-400" />}
                    </span>
                    <div>
                      <div className={`text-[13px] font-medium ${isActive ? "text-zinc-100" : "text-zinc-300"}`}>
                        {model.name}
                      </div>
                      {model.description && (
                        <div className="text-[11px] text-zinc-600">{model.description}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="px-3 pb-2.5 pt-0.5" />
        </div>
      )}
    </div>
  );
}

export function ModelTabs({ models, selectedModel, onSelect }) {
  const list = models?.length ? models : FALLBACK_MODELS;
  return (
    <div role="tablist" className="flex flex-wrap gap-1">
      {list.map((m) => {
        const isActive = m.id === selectedModel;
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(m.id)}
            className={`px-3 py-1 text-xs rounded ${isActive ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}
