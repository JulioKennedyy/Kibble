const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function estimatePrompt(prompt, modelId, systemPrompt, expectedOutputTokens, signal) {
  const requestController = new AbortController();
  const timeout = setTimeout(() => requestController.abort(), 5000);
  const abortRequest = () => requestController.abort();
  signal?.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(`${API_URL}/api/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model_id: modelId,
        system_prompt: systemPrompt,
        expected_output_tokens: expectedOutputTokens,
      }),
      signal: requestController.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail ?? "Unable to estimate prompt");
    }

    return response.json();
  } catch (error) {
    if (requestController.signal.aborted && !signal?.aborted) {
      throw new Error("The API took too long to respond. Is the backend running?");
    }
    if (error instanceof TypeError) {
      throw new Error("API unavailable. Start the FastAPI backend on port 8000.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortRequest);
  }
}
