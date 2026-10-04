import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Utensils,
  Heart,
  Moon,
  Zap,
  MousePointer,
  HelpCircle,
  Eye,
  Info,
  ChevronRight,
} from "lucide-react";
import { KibbleMascot } from "./KibbleMascot";

/**
 * All 14 conceptual states requested by the user, mapped to descriptions and trigger ideas
 */
export const KIBBLE_STATES = [
  {
    id: "idle",
    name: "1. Kibble Parado",
    subtitle: "Estado padrão no canto da interface",
    desc: "Olha para o usuário ou para o cursor, respiração sutil e um token cúbico flutuando em órbita tranquila.",
    trigger: "Padrão quando não há atividade intensa.",
  },
  {
    id: "hungry",
    name: "2. Kibble com Fome",
    subtitle: "Procurando tokens pela tela",
    desc: "Olha para baixo em direção à caixa de texto, lambe os lábios ansioso esperando o usuário digitar.",
    trigger: "Ativado após 5-10 segundos de inatividade com campo vazio.",
  },
  {
    id: "found_token",
    name: "3. Encontrando um Token",
    subtitle: "Surpreso e animado",
    desc: "Olhos arregalados e anteninha empinada, fixando o olhar diretamente em um token luminoso que acabou de surgir.",
    trigger: "Quando o usuário foca no textarea ou começa a colar um texto.",
  },
  {
    id: "eating",
    name: "4. Comendo um Token",
    subtitle: "Pose icônica de referência",
    desc: "Boca aberta mordendo um cubo 3D de token lilás brilhante, com pequenos farelos cúbicos voando ao lado.",
    trigger: "Enquanto o usuário digita ativamente (onKeyDown / onChange).",
  },
  {
    id: "satisfied",
    name: "5. Kibble Satisfeito",
    subtitle: "Barriga cheia e feliz",
    desc: "Sorriso radiante, olhos em arco feliz (^ ^) e cubos luminosos digeridos visíveis dentro do corpinho.",
    trigger: "Após estimativa concluída com contagem equilibrada de tokens.",
  },
  {
    id: "searching",
    name: "6. Procurando Mais Tokens",
    subtitle: "Curioso e atento",
    desc: "Olha para a esquerda e para a direita em busca de mais conteúdo para devorar.",
    trigger: "Após um envio rápido ou quando o histórico de conversa é aberto.",
  },
  {
    id: "no_tokens",
    name: "7. Sem Tokens",
    subtitle: "Entediado / esperando",
    desc: "Postura murchinha, olhinhos meio caídos e um leve suspiro esperando novos tokens.",
    trigger: "Quando o usuário apaga todo o texto (textarea zerado).",
  },
  {
    id: "many_tokens",
    name: "8. Com Muitos Tokens",
    subtitle: "Extremamente feliz e eufórico",
    desc: "Cercado por vários cubos luminosos flutuando ao redor, raios de energia lilás e pura alegria.",
    trigger: "Prompts grandes com mais de 3.000 tokens ou arquivos longos.",
  },
  {
    id: "fast_eating",
    name: "9. Comendo Rápido",
    subtitle: "Frenesi de tokens",
    desc: "Mastigação ultra veloz, animação hiperativa e fluxo contínuo de tokens em direção à boca.",
    trigger: "Digitação acelerada ou colagem de grandes blocos de texto (paste).",
  },
  {
    id: "sleeping",
    name: "10. Kibble Dormindo",
    subtitle: "Aconchegado feito almofada",
    desc: "Corpinho achatado no chão, respiração lenta, boquinha de gatinho (ω) e letrinhas 'z Z' subindo.",
    trigger: "Após 20-30 segundos sem nenhuma interação do usuário na página.",
  },
  {
    id: "scared",
    name: "11. Kibble Assustado",
    subtitle: "Sobrecarga ou erro",
    desc: "Olhos arregalados, gotinha de suor azul escorrendo, tremendo de susto com tokens espalhados.",
    trigger: "Erro de requisição, estouro de orçamento ou limite da janela de contexto.",
  },
  {
    id: "celebrating",
    name: "12. Comemorando",
    subtitle: "Objetivo atingido",
    desc: "Dá pulinhos alegres, gira suavemente no ar com faíscas brilhantes e estrelinhas.",
    trigger: "Ao copiar estimativa, alternar para modelo otimizado ou economizar tokens.",
  },
  {
    id: "thinking",
    name: "13. Kibble Pensando",
    subtitle: "Calculando tokens",
    desc: "Olhando para cima com postura reflexiva e um ponto de interrogação lilás 3D flutuando no ar.",
    trigger: "Durante chamadas à API de contagem/cálculo de custo (loading state).",
  },
  {
    id: "cursor_tracking",
    name: "14. Interagindo com o Cursor",
    subtitle: "Rastreamento vivo dos olhos",
    desc: "As pupilas seguem a posição exata do ponteiro do mouse na tela através de trigonometria suave.",
    trigger: "Em qualquer momento que o mouse se movimentar pela tela da aplicação.",
  },
];

export function KibbleUniverseModal({ isOpen, onClose }) {
  const [selectedState, setSelectedState] = useState("eating");
  const [feedCounter, setFeedCounter] = useState(0);
  const [petting, setPetting] = useState(false);
  const [flyingTokens, setFlyingTokens] = useState([]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStateInfo =
    KIBBLE_STATES.find((s) => s.id === selectedState) || KIBBLE_STATES[0];

  // Feed action: spawn tokens that fly towards Kibble
  const handleFeed = () => {
    const id = Date.now();
    setFlyingTokens((prev) => [...prev, id]);
    setSelectedState("eating");
    setFeedCounter((c) => c + 1);

    setTimeout(() => {
      setFlyingTokens((prev) => prev.filter((t) => t !== id));
      if (feedCounter > 2) {
        setSelectedState("satisfied");
      }
    }, 900);
  };

  // Pet action: Kibble gets happy with hearts
  const handlePet = () => {
    setPetting(true);
    setSelectedState("celebrating");
    setTimeout(() => {
      setPetting(false);
      setSelectedState("satisfied");
    }, 1400);
  };

  return (
    <div
      aria-label="Universo Visual do Kibble"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
      role="dialog"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-purple-900/40 bg-[#0d0c18] text-zinc-100 shadow-2xl shadow-purple-950/60">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-4 bg-[#121024]/80">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                Universo Visual do Kibble
                <span className="rounded-full bg-purple-900/50 px-2 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-700/50">
                  14 Estados & Microinterações
                </span>
              </h2>
              <p className="text-xs text-purple-300/70">
                Pequenos tokens, grandes possibilidades — Companheiro vivo da interface
              </p>
            </div>
          </div>

          <button
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Body (Split: Viewer Left / State Selector Right) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* ── Left Column: High-Res Interactive Viewer ── */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-purple-900/30 bg-gradient-to-b from-[#131126] to-[#0c0a18] relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            {/* Flying tokens when fed */}
            {flyingTokens.map((t) => (
              <div
                key={t}
                className="absolute z-20 pointer-events-none animate-ping text-purple-200"
                style={{
                  top: "40%",
                  left: "70%",
                  transition: "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <div className="h-5 w-5 rounded bg-gradient-to-tr from-purple-400 to-white shadow-lg shadow-purple-500/50" />
              </div>
            ))}

            {/* Floating Hearts when Pet */}
            {petting && (
              <div className="absolute top-1/4 flex gap-3 pointer-events-none animate-bounce text-pink-400 z-20">
                <Heart fill="#f43f5e" size={22} />
                <Heart fill="#ec4899" size={16} />
              </div>
            )}

            {/* Mascot Render in High-Res */}
            <div className="relative my-4 flex items-center justify-center">
              <KibbleMascot
                hasText={true}
                size={160}
                state={selectedState}
                trackCursor={selectedState === "cursor_tracking"}
              />
            </div>

            {/* Current State Details Badge */}
            <div className="w-full rounded-xl border border-purple-800/40 bg-purple-950/20 p-4 text-center mt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1">
                {currentStateInfo.name}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-2">
                {currentStateInfo.desc}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-400/90 font-medium">
                <Zap size={12} />
                Gatilho: {currentStateInfo.trigger}
              </div>
            </div>

            {/* Live Interactive Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
              <button
                className="flex items-center gap-1.5 rounded-lg border border-purple-700/50 bg-purple-900/30 px-3 py-1.5 text-xs font-medium text-purple-200 transition hover:bg-purple-800/50 hover:border-purple-500 active:scale-95 shadow-sm"
                onClick={handleFeed}
              >
                <Utensils size={13} />
                Alimentar Token
              </button>

              <button
                className="flex items-center gap-1.5 rounded-lg border border-pink-700/50 bg-pink-950/30 px-3 py-1.5 text-xs font-medium text-pink-200 transition hover:bg-pink-900/40 hover:border-pink-500 active:scale-95 shadow-sm"
                onClick={handlePet}
              >
                <Heart size={13} />
                Fazer Carinho
              </button>

              <button
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95 shadow-sm"
                onClick={() =>
                  setSelectedState(selectedState === "sleeping" ? "idle" : "sleeping")
                }
              >
                <Moon size={13} />
                {selectedState === "sleeping" ? "Acordar" : "Dormir"}
              </button>
            </div>
          </div>

          {/* ── Right Column: 14 States Interactive List ── */}
          <div className="md:col-span-6 p-4 sm:p-5 overflow-y-auto space-y-2 bg-[#0c0a18]/90 max-h-[580px]">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/20 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
                <Eye size={13} />
                Selecione um estado para testar:
              </span>
              <span className="text-[11px] text-zinc-500">14 estados</span>
            </div>

            <div className="space-y-1.5">
              {KIBBLE_STATES.map((st) => {
                const isSelected = selectedState === st.id;
                return (
                  <button
                    key={st.id}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-purple-900/40 border border-purple-500/60 shadow-md shadow-purple-950/40"
                        : "bg-zinc-900/30 border border-zinc-800/60 hover:bg-purple-950/20 hover:border-purple-800/40"
                    }`}
                    onClick={() => setSelectedState(st.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini state mascot preview */}
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#14122b] border border-purple-900/40">
                        <KibbleMascot hasText={false} size={24} state={st.id} />
                      </span>
                      <div>
                        <div
                          className={`text-xs font-semibold ${
                            isSelected ? "text-purple-200" : "text-zinc-200"
                          }`}
                        >
                          {st.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {st.subtitle}
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`transition ${
                        isSelected
                          ? "text-purple-400 translate-x-0.5"
                          : "text-zinc-600"
                      }`}
                      size={14}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Microinteraction Tips */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-zinc-400 space-y-1.5 mt-4">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Info size={13} className="text-purple-400" />
                Dica de Microinterações na Web
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                O Kibble já está conectado ao app principal: quando você digita no prompt, ele come tokens; quando calcula, ele pensa com o ‘?’; após 20s de inatividade, ele dorme; e os olhos acompanham suavemente seu cursor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KibbleUniverseModal;
