import type {
  QuestionnaireState,
  GeneratedEstimate,
} from "../stores/useQuestionnaireStore";

export async function generateEstimate(
  state: QuestionnaireState
): Promise<GeneratedEstimate> {
  const response = await fetch("/api/generate-estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate estimate");
  }

  const data = await response.json();
  return data.estimate;
}
