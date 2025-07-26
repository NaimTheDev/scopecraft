import type {
  QuestionnaireState,
  GeneratedEstimate,
} from "../stores/useQuestionnaireStore";

export async function generateEstimate(
  state: QuestionnaireState,
  hourlyRate: number
): Promise<GeneratedEstimate> {
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch("/api/generate-estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...state, hourlyRate }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate estimate");
    }

    const data = await response.json();
    return data.estimate;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out - please try again");
    }
    throw error;
  }
}
