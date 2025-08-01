import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { QuestionnaireState } from "~/stores/useQuestionnaireStore";
import { generateEstimateWithOpenAI } from "../utils/openai.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const state = body as QuestionnaireState;
    
    // Get hourly rate from request body (passed from client)
    // The client should pass the user's actual hourly rate from Firestore
    // Default to 100 if not provided or invalid
    const hourlyRate = body.hourlyRate && body.hourlyRate > 0 ? body.hourlyRate : 100;

    // Generate estimate using OpenAI
    const estimate = await generateEstimateWithOpenAI(state, hourlyRate);

    return json({ success: true, estimate });
  } catch (error) {
    console.error("🔥 OpenAI estimate generation error:", error);

    if (error instanceof Error) {
      return json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return json(
      {
        error: "Failed to generate estimate",
      },
      { status: 500 }
    );
  }
}
