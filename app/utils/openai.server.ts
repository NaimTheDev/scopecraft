import type {
  QuestionnaireState,
  GeneratedEstimate,
} from "~/stores/useQuestionnaireStore";

export async function generateEstimateWithOpenAI(
  state: QuestionnaireState
): Promise<GeneratedEstimate> {
  const prompt = `
You are an expert freelance estimator. Read both the explicit feature list and the client’s description, merge them into one deduplicated set of features, then estimate hours & cost. Return exactly valid JSON matching these TypeScript types (no extra fields, no follow-up questions).

Types:
export type EstimateBreakdown = {
  feature: string;
  hours: number;
  cost: number;
};
export type GeneratedEstimate = {
  totalHours: number;
  totalCost: number;
  breakdown: EstimateBreakdown[];
  hourlyRate: number;
};

--- INPUT ---
Client Request: ${state.clientRequest}
Explicit Features: ${state.features.join(", ")}
Timeline: ${state.timeline}
Budget: ${state.budget}
Notes: ${state.notes}

HOURLY RATE = 100 USD (use exactly 100)

--- ESTIMATION STEPS ---
1. FEATURE EXTRACTION & DEDUPLICATION  
   a. Scan the “Client Request” text for **any** mentioned feature requirements (e.g. login flows, admin panels, notifications, calendar views, settings pages, onboarding tours, custom reports, payment integrations, mobile responsiveness, etc.).  
   b. Combine those with the Explicit Features list.  
   c. Remove duplicates (case-insensitive).

2. BASELINE PRESETS (hrs):  
   - Authentication: 15  
   - Admin Dashboard: 20  
   - Notifications: 8  
   - Calendar Integration: 12  
   - Settings/Profile Page: 10  
   - Onboarding Flow: 6  
   - Reusable UI System: 12  
   - Mobile Responsiveness: 5  
   • For any extracted feature not in this list, estimate a baseline by analogy to the closest preset.

3. COMPLEXITY MULTIPLIER  
   • Low = ×1.0  
   • Medium = ×1.2  
   • High = ×1.5

4. BUFFERS  
   • Discovery: +4 hrs if any requirement is ambiguous.  
   • QA & Testing: +15% of total feature hours.  
   • Testing & Deployment: +10 hrs (always include for testing and deployment).  
   • Contingency:  
     – +15% of feature hours if timeline <2 weeks.  
     – +10% of feature hours if any third-party APIs/integrations are unclear.

5. CALCULATIONS  
   - For each feature:  
     hours = baseline × complexity multiplier  
     cost = hours × 100  
   - totalHours = sum(feature hours) + discovery + QA + testing & deployment + contingency  
   - totalCost = totalHours × 100

--- OUTPUT (JSON ONLY) ---
{
  "hourlyRate": 100,
  "totalHours": <number>,
  "totalCost": <number>,
  "breakdown": [
    { "feature": "Feature Name", "hours": <number>, "cost": <number> },
    …
  ]
}
`;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const output = data.choices?.[0]?.message?.content;

  if (!output) {
    throw new Error("No response from OpenAI API");
  }

  try {
    const parsedEstimate = JSON.parse(output);

    // Validate that the parsed data matches our GeneratedEstimate type structure
    if (
      !parsedEstimate.totalHours ||
      !parsedEstimate.totalCost ||
      !parsedEstimate.breakdown ||
      !parsedEstimate.hourlyRate
    ) {
      throw new Error("Missing required fields in estimate response");
    }

    // Type-safe return that matches GeneratedEstimate
    return {
      totalHours: parsedEstimate.totalHours,
      totalCost: parsedEstimate.totalCost,
      breakdown: parsedEstimate.breakdown.map(
        (item: { feature: string; hours: number; cost: number }) => ({
          feature: item.feature,
          hours: item.hours,
          cost: item.cost,
        })
      ),
      hourlyRate: parsedEstimate.hourlyRate,
    } as GeneratedEstimate;
  } catch (err) {
    console.error("Failed to parse estimate JSON:", output);
    throw new Error("Invalid estimate format from AI");
  }
}
