// Default fallback list so the UI renders even before /api/models resolves.
// The backend is the source of truth; this list is only a UI seed.
export const FALLBACK_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "Google" },
  { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",   provider: "Google" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", provider: "Google" },
  { id: "gpt-5",            name: "GPT-5",             provider: "OpenAI" },
  { id: "gpt-4o",           name: "GPT-4o",            provider: "OpenAI" },
  { id: "gpt-4o-mini",      name: "GPT-4o Mini",       provider: "OpenAI" },
  { id: "claude-sonnet-4-5",name: "Claude Sonnet 4.5", provider: "Anthropic" },
];

const PROVIDER_COLORS = {
  Google:    "text-emerald-400",
  OpenAI:    "text-sky-400",
  Anthropic: "text-violet-400",
};

export function ModelTabs({ models, selectedModel, onSelect }) {
  const list = models?.length ? models : FALLBACK_MODELS;

  return (
    <div
      className="flex w-full gap-1 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950 p-1"
      role="tablist"
      aria-label="Model selector"
    >
      {list.map((model) => {
        const active = selectedModel === model.id;
        const providerColor = PROVIDER_COLORS[model.provider] ?? "text-zinc-400";
        return (
          <button
            aria-selected={active}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
              active
                ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20 shadow-sm"
                : "text-zinc-500 hover:bg-cyan-400/5 hover:text-cyan-100"
            }`}
            key={model.id}
            onClick={() => onSelect(model.id)}
            role="tab"
            type="button"
          >
            <span className={active ? "" : providerColor}>{model.name}</span>
          </button>
        );
      })}
    </div>
  );
}
