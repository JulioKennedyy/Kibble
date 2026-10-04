// Kibble API client
// API keys are NEVER stored or sent from the frontend.
// All estimation is done server-side.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 8000;

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
      throw new Error(body.detail ?? `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    return _wrapError(err, signal);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", propagate);
  }
}

function _wrapError(err, outerSignal) {
  if (err?.name === "AbortError") {
    if (outerSignal?.aborted) throw err; // debounce / user cancelled
    throw new Error("The API took too long to respond. Is the backend running?");
  }
  if (err instanceof TypeError) {
    throw new Error("API unavailable. Start the FastAPI backend on port 8000.");
  }
  throw err;
}
