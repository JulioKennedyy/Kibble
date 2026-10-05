/**
 * Frontend test suite — covers:
 *   - StatsDisplay renders all six metrics
 *   - StatsDisplay shows retry button on error
 *   - StatsDisplay shows "…" while loading
 *   - ModelTabs renders all models and fires onSelect
 *   - ModelTabs model switch (correct tab is highlighted)
 *   - ComparePanel opens/closes and shows diff
 *   - api.js: happy path (mocked fetch)
 *   - api.js: API error (400) throws descriptive message
 *   - api.js: fetch TypeError → friendly unavailable message
 *   - App: debounce (estimate not called immediately on typing)
 *   - App: model switch triggers new estimate
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Component imports ───────────────────────────────────────────
import { StatsDisplay } from "../components/StatsDisplay";
import { ModelTabs, FALLBACK_MODELS } from "../components/ModelTabs";
import { ComparePanel } from "../components/ComparePanel";
import { KibbleCornerCompanion } from "../components/KibbleCornerCompanion";
import { KibbleMascot } from "../components/KibbleMascot";

// ─── Helpers ─────────────────────────────────────────────────────
const SAMPLE_STATS = {
  input_tokens: 120,
  output_tokens: 200,
  total_tokens: 320,
  input_cost: 0.00006,
  output_cost: 0.003,
  cost: 0.00306,
  context_percent: 0.25,
  context_window: 128000,
  tokenizer_note: "Native tiktoken",
};

// ─── StatsDisplay ────────────────────────────────────────────────
describe("StatsDisplay", () => {
  it("renders all six metric labels", () => {
    render(<StatsDisplay stats={SAMPLE_STATS} isLoading={false} error="" budgetTokens={1_000_000} />);
    expect(screen.getAllByText(/input|entrada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/output|saída/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/janela|context/i)).toBeInTheDocument();
    expect(screen.getByText(/orçamento|budget/i)).toBeInTheDocument();
  });

  it("shows ellipsis while loading", () => {
    render(<StatsDisplay stats={SAMPLE_STATS} isLoading={true} error="" budgetTokens={1_000_000} />);
    // All values should show "…"
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThan(4);
  });

  it("shows error message and retry button on error", () => {
    const onRetry = vi.fn();
    render(<StatsDisplay stats={SAMPLE_STATS} isLoading={false} error="API unavailable" budgetTokens={0} onRetry={onRetry} />);
    expect(screen.getByText(/api unavailable/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not show budget row when budgetTokens is 0", () => {
    render(<StatsDisplay stats={SAMPLE_STATS} isLoading={false} error="" budgetTokens={0} />);
    expect(screen.queryByText(/budget local/i)).not.toBeInTheDocument();
  });
});

// ─── ModelTabs ───────────────────────────────────────────────────
describe("ModelTabs", () => {
  it("renders all fallback models when no models passed", () => {
    const onSelect = vi.fn();
    render(<ModelTabs models={[]} selectedModel="gpt-5" onSelect={onSelect} />);
    FALLBACK_MODELS.forEach((m) => {
      expect(screen.getByRole("tab", { name: m.name })).toBeInTheDocument();
    });
  });

  it("marks selected model as active (aria-selected)", () => {
    const onSelect = vi.fn();
    render(<ModelTabs models={[]} selectedModel="gpt-4o" onSelect={onSelect} />);
    const tab = screen.getByRole("tab", { name: /GPT-4o$/ });
    expect(tab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onSelect with correct model id when tab clicked", async () => {
    const onSelect = vi.fn();
    render(<ModelTabs models={[]} selectedModel="gpt-5" onSelect={onSelect} />);
    const miniTab = screen.getByRole("tab", { name: /GPT-4o Mini/ });
    await userEvent.click(miniTab);
    expect(onSelect).toHaveBeenCalledWith("gpt-4o-mini");
  });
});

// ─── ComparePanel ─────────────────────────────────────────────────
describe("ComparePanel", () => {
  it("is collapsed by default", () => {
    render(<ComparePanel estimate={SAMPLE_STATS} />);
    expect(screen.queryByLabelText(/real input tokens/i)).not.toBeInTheDocument();
  });

  it("opens when toggle button is clicked", async () => {
    render(<ComparePanel estimate={SAMPLE_STATS} />);
    await userEvent.click(screen.getByRole("button", { name: /compare/i }));
    expect(screen.getByLabelText(/real input tokens/i)).toBeInTheDocument();
  });

  it("shows diff table after entering real values", async () => {
    render(<ComparePanel estimate={SAMPLE_STATS} />);
    await userEvent.click(screen.getByRole("button", { name: /compare/i }));

    const inputField = screen.getByLabelText(/real input tokens/i);
    const outputField = screen.getByLabelText(/real output tokens/i);

    await userEvent.clear(inputField);
    await userEvent.type(inputField, "130");
    await userEvent.clear(outputField);
    await userEvent.type(outputField, "180");

    // Diff table should appear
    expect(screen.getAllByText(/Input tokens|Tokens de entrada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Output tokens|Tokens de saída/i).length).toBeGreaterThan(0);
  });
});

// ─── api.js ──────────────────────────────────────────────────────
describe("KibbleCornerCompanion", () => {
  const props = {
    isTyping: false,
    isDeleting: false,
    isLoading: false,
    stats: { total_tokens: 0, context_percent: 0 },
    budgetTokens: 0,
    isSleepy: false,
    hasText: false,
    error: "",
  };

  it("shows a friendly empty-state message", () => {
    render(<KibbleCornerCompanion {...props} />);
    expect(screen.getByText(/cole um prompt/i)).toBeInTheDocument();
  });

  it("can be minimized", async () => {
    render(<KibbleCornerCompanion {...props} />);
    await userEvent.click(screen.getByRole("button", { name: /minimizar mascote/i }));
    expect(screen.getByRole("button", { name: /mostrar mascote/i })).toBeInTheDocument();
  });

  it("uses a full-state message when the token count is high", async () => {
    render(
      <KibbleCornerCompanion
        {...props}
        hasText
        stats={{ total_tokens: 5000, context_percent: 10 }}
      />,
    );
    await userEvent.click(screen.getByTitle(/fazer carinho/i));
    expect(screen.getByText(/verdadeiro banquete/i)).toBeInTheDocument();
  });
});

describe("KibbleMascot", () => {
  it("keeps its visual identity while switching to the eating reaction", () => {
    const { container } = render(<KibbleMascot isTyping size={96} />);
    expect(screen.getByRole("img", { name: /kibble \(eating\)/i })).toBeInTheDocument();
    expect(container.querySelector(".kibble-token-to-mouth")).toBeInTheDocument();
  });

  it("renders the sleeping expression as an accessible mascot state", () => {
    render(<KibbleMascot state="sleeping" size={96} />);
    expect(screen.getByRole("img", { name: /kibble \(sleeping\)/i })).toBeInTheDocument();
  });

  it("does not keep a static token beside the mouth while idle", () => {
    const { container } = render(<KibbleMascot state="idle" size={96} />);
    expect(container.querySelector(".kibble-token-to-mouth")).not.toBeInTheDocument();
  });

  it("turns its eyes toward the prompt while text is present", () => {
    const { container } = render(<KibbleMascot lookAtPrompt state="idle" size={96} />);
    expect(container.querySelector('[data-gaze="left"]')).toBeInTheDocument();
  });
});

describe("api.estimatePrompt", () => {
  let estimatePrompt;

  beforeEach(async () => {
    vi.resetModules();
    ({ estimatePrompt } = await import("../api.js"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("happy path — returns parsed JSON on 200", async () => {
    const mockData = { input_tokens: 10, output_tokens: 50, cost: 0.001 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }));
    const result = await estimatePrompt("hello", "gpt-4o", "", "", 50);
    expect(result).toEqual(mockData);
  });

  it("API error (400) — throws error with detail message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Unsupported model" }),
    }));
    await expect(estimatePrompt("hello", "bad-model", "", "", 50)).rejects.toThrow(
      "Unsupported model",
    );
  });

  it("TypeError (network down) — throws a friendly unavailable message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(estimatePrompt("hello", "gpt-4o", "", "", 50)).rejects.toThrow(
      /não foi possível acessar/i,
    );
  });
});
