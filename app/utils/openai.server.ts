import type {
  QuestionnaireState,
  GeneratedEstimate,
} from "~/stores/useQuestionnaireStore";

export async function generateEstimateWithOpenAI(
  state: QuestionnaireState,
  hourlyRate: number
): Promise<GeneratedEstimate> {
  const prompt = `
You are an expert freelance estimator using PERT (Program Evaluation and Review Technique) for accurate project estimation. Read both the explicit feature list and the client's description, merge them into one deduplicated set of features, then estimate hours & cost using three-point estimation. Return exactly valid JSON matching these TypeScript types (no extra fields, no follow-up questions).

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

HOURLY RATE = ${hourlyRate} USD (use exactly ${hourlyRate})

--- PERT ESTIMATION METHODOLOGY ---
For each feature, use THREE-POINT ESTIMATION:
• Optimistic (O): Best-case scenario (everything goes perfectly)
• Most Likely (M): Realistic estimate based on normal conditions  
• Pessimistic (P): Worst-case scenario (complications, learning curve, rework)
• PERT Expected Time = (O + 4M + P) / 6

1. FEATURE EXTRACTION & DEDUPLICATION  
   a. Scan the "Client Request" text for **any** mentioned feature requirements (e.g. login flows, admin panels, notifications, calendar views, settings pages, onboarding tours, custom reports, payment integrations, mobile responsiveness, etc.).  
   b. Combine those with the Explicit Features list.  
   c. Remove duplicates (case-insensitive).

2. BASELINE THREE-POINT ESTIMATES (O/M/P hours):  
   - Authentication: 8/15/25  
   - Admin Dashboard: 12/20/35  
   - Notifications: 4/8/15  
   - Calendar Integration: 6/12/20  
   - Settings/Profile Page: 5/10/18  
   - Onboarding Flow: 3/6/12  
   - Reusable UI System: 8/12/20  
   - Mobile Responsiveness: 3/5/10  
   - Payment Integration: 8/16/28  
   - Search Functionality: 4/8/16  
   - User Management: 6/12/20  
   - Data Import/Export: 5/10/18  
   - Email System: 4/8/15  
   - File Upload: 3/6/12  
   - Reporting Dashboard: 8/15/25  
   • For any extracted feature not in this list, create three-point estimates by analogy to the closest preset.

3. COMPLEXITY FACTORS (adjust baseline estimates):
   • Simple/Low Complexity: Use baseline O/M/P as-is
   • Medium Complexity: O×1.2, M×1.3, P×1.4  
   • High Complexity: O×1.5, M×1.7, P×2.0
   • Consider: Third-party integrations, custom algorithms, advanced UI/UX, security requirements, scalability needs

4. TIMELINE PRESSURE ADJUSTMENTS:
   • Tight timeline (<2 weeks): Increase P by 50% due to rushed development risks
   • Reasonable timeline (2-8 weeks): No adjustment
   • Flexible timeline (>8 weeks): Decrease O by 10% due to careful planning

5. PROJECT RISK FACTORS:
   • Unclear requirements: Increase P by 30%
   • New technology stack: Increase M by 20%, P by 40%  
   • External dependencies: Increase P by 25%
   • Client availability concerns: Increase M by 15%

6. PERT CALCULATIONS FOR EACH FEATURE:
   - Apply complexity and risk adjustments to O/M/P
   - Calculate: Expected Hours = (O + 4M + P) / 6
   - Round to nearest 0.5 hour
   - Cost = Expected Hours × ${hourlyRate}

7. PROJECT BUFFERS (apply to total):
   • Discovery & Requirements: +8 hours if any ambiguity exists
   • QA & Testing: +20% of total feature hours (PERT accounts for some testing in P estimates)
   • Project Management: +10% of total feature hours  
   • Deployment & Launch: +8 hours (always include)
   • Contingency Buffer: +10% of total (PERT already includes risk, so smaller buffer needed)

8. FINAL CALCULATIONS:
   - Feature Hours = sum of all PERT expected hours for features
   - Buffer Hours = Discovery + QA + PM + Deployment + Contingency  
   - Total Hours = Feature Hours + Buffer Hours
   - Total Cost = Total Hours × ${hourlyRate}

--- OUTPUT (JSON ONLY) ---
{
  "hourlyRate": ${hourlyRate},
  "totalHours": <number>,
  "totalCost": <number>,
  "breakdown": [
    { "feature": "Feature Name", "hours": <number>, "cost": <number> },
    { "feature": "Discovery & Requirements", "hours": <number>, "cost": <number> },
    { "feature": "QA & Testing (20%)", "hours": <number>, "cost": <number> },
    { "feature": "Project Management (10%)", "hours": <number>, "cost": <number> },
    { "feature": "Deployment & Launch", "hours": <number>, "cost": <number> },
    { "feature": "Contingency Buffer (10%)", "hours": <number>, "cost": <number> },
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
