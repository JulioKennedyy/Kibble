// Kibble API client
// API keys are NEVER stored or sent from the frontend.
// All estimation is done server-side.

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (configuredApiUrl || "http://localhost:8000").replace(/\/$/, "");
const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);
// Free web services can need close to a minute to wake after being idle.
const DEFAULT_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0
  ? parsedTimeout
  : 75_000;

/**
 * Fetch all models from the backend catalogue.
 * @param {AbortSignal} [signal]
 */
export async function fetchModels(signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const propagate = () => controller.abort();
  signal?.addEventListener("abort", propagate, { once: true });

  try {
    const response = await fetch(`${API_URL}/api/models`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return /** @type {import("./types").ModelInfo[]} */ (await response.json());
  } catch (err) {
    return _wrapError(err, signal);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", propagate);
  }
}

/**
 * Request a token + cost estimate from the backend.
 * @param {string} prompt
 * @param {string} modelId
 * @param {string} systemPrompt
 * @param {string} conversationHistory
 * @param {number} expectedOutputTokens
 * @param {AbortSignal} [signal]
 */
export async function estimatePrompt(
  prompt,
  modelId,
  systemPrompt,
  conversationHistory,
  expectedOutputTokens,
  signal,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const propagate = () => controller.abort();
  signal?.addEventListener("abort", propagate, { once: true });

  try {
    const response = await fetch(`${API_URL}/api/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model_id: modelId,
        system_prompt: systemPrompt,
        conversation_history: conversationHistory,
        expected_output_tokens: expectedOutputTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(_detailMessage(body.detail) ?? `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    return _wrapError(err, signal);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", propagate);
  }
}

function _detailMessage(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg).filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return null;
}

function _wrapError(err, outerSignal) {
  if (err?.name === "AbortError") {
    if (outerSignal?.aborted) throw err; // debounce / user cancelled
    throw new Error("O servidor demorou para acordar. Tente novamente em alguns segundos.");
  }
  if (err instanceof TypeError) {
    throw new Error("Não foi possível acessar o servidor do Kibble.");
  }
  throw err;
}
