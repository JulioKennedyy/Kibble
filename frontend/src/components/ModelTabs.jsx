export const models = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
];

export function ModelTabs({ selectedModel, onSelect }) {
  return (
    <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950 p-1">
      {models.map((model) => (
        <button
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
            selectedModel === model.id
              ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20 shadow-sm"
              : "text-zinc-500 hover:bg-cyan-400/5 hover:text-cyan-100"
          }`}
          key={model.id}
          onClick={() => onSelect(model.id)}
          type="button"
        >
          {model.label}
        </button>
      ))}
    </div>
  );
}
