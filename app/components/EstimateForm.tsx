import { useState } from "react";
import StepClientRequest from "./StepClientRequest";
import StepProjectType from "./StepProjectType";
import StepFeatures from "./StepFeatures";
import StepTimeline from "./StepTimeline";
import StepBudgetNotes from "./StepBudgetNotes";
import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";
import { saveEstimateToFirestore } from "../utils/saveEstimates";
import { generateEstimate } from "../utils/generateEstimateFromOpenAI";
import { generateAndDownloadEstimatePDF } from "../utils/generatePDF";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase.client";
import { useNavigate } from "@remix-run/react";

export default function EstimateForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    <StepClientRequest key="client" />,
    <StepProjectType key="project" />,
    <StepFeatures key="features" />,
    <StepTimeline key="timeline" />,
    <StepBudgetNotes key="budget" />,
  ];

  const stepTitles = [
    "Client Request",
    "Project Type",
    "Features",
    "Timeline",
    "Budget & Notes",
  ];

  const navigate = useNavigate();
  const state = useQuestionnaireStore();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const projectId = await saveEstimateToFirestore(state);
      console.log("Estimate saved with ID:", projectId);
      const estimate = await generateEstimate(state);
      await updateDoc(doc(db, "projects", projectId), {
        generatedEstimate: estimate,
      });

      // Generate and download PDF
      try {
        const projectName = state.clientRequest || "New Project";
        await generateAndDownloadEstimatePDF(estimate, projectName);
      } catch (pdfError) {
        console.error("PDF generation failed:", pdfError);
        // Don't block the navigation if PDF fails
      }

      navigate(`/estimate-summary?projectId=${projectId}`);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Error saving estimate.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-surface-text mb-2">
            New Estimate
          </h1>
          <p className="text-gray-600">
            Step {step + 1} of {steps.length}: {stepTitles[step]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-border rounded-full h-2">
          <div
            className="bg-brand h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">{steps[step]}</div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 text-center text-blue-600 font-semibold animate-pulse">
            Generating your estimate...
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                handleSubmit();
              }}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Estimate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
