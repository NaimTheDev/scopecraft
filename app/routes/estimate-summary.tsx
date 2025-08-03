import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, createUserDocument } from "../utils/firebase.client";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import type {
  GeneratedEstimate,
  EstimateBreakdown,
} from "~/stores/useQuestionnaireStore";
import {
  generateAndDownloadEstimatePDF,
  generateAndDownloadProposalPDF,
} from "../utils/generatePDF";
import {
  parseBudget,
  getCumulativeCost,
  formatCurrency,
  type BudgetInfo,
} from "../utils/budgetUtils";

export default function EstimateSummaryPage() {
  const [searchParams] = useSearchParams();
  const [estimate, setEstimate] = useState<GeneratedEstimate | null>(null);
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: "", hours: "" });

  const projectId = searchParams.get("projectId");

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Sign in anonymously if no user is authenticated
        try {
          const result = await signInAnonymously(auth);
          await createUserDocument(result.user);
          setUser(result.user);
        } catch (error) {
          console.error("Anonymous auth failed:", error);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!projectId || !user || authLoading) return;

    const fetchEstimate = async () => {
      try {
        // Fetch from users/{userId}/projects subcollection
        const ref = doc(db, "users", user.uid, "projects", projectId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.generatedEstimate) {
            setEstimate(data.generatedEstimate as GeneratedEstimate);
          }
          // Parse and set budget information
          if (data.budget) {
            const parsedBudget = parseBudget(data.budget);
            setBudgetInfo(parsedBudget);
          }
        }
      } catch (error) {
        console.error("Error fetching estimate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [projectId, user, authLoading]);

  const handleDownloadEstimatePDF = async () => {
    if (!estimate) return;

    try {
      const projectName = `Project ${projectId}`;
      await generateAndDownloadEstimatePDF(estimate, projectName);
    } catch (error) {
      console.error("Error generating estimate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleDownloadProposalPDF = async () => {
    if (!estimate) return;

    try {
      const projectName = `Project ${projectId}`;
      await generateAndDownloadProposalPDF(estimate, projectName);
    } catch (error) {
      console.error("Error generating proposal PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const recalculateEstimate = (breakdown: EstimateBreakdown[]) => {
    if (!estimate) return { totalHours: 0, totalCost: 0 };
    
    const totalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);
    const totalCost = totalHours * estimate.hourlyRate;
    return { totalHours, totalCost };
  };

  const deleteFeature = async (index: number) => {
    if (!estimate || !projectId || !user) return;

    setSaving(true);
    try {
      const newBreakdown = estimate.breakdown.filter((_, i) => i !== index);
      const { totalHours, totalCost } = recalculateEstimate(newBreakdown);

      const updatedEstimate = {
        ...estimate,
        breakdown: newBreakdown,
        totalHours,
        totalCost,
      };

      // Update in Firestore
      await updateDoc(doc(db, "users", user.uid, "projects", projectId), {
        generatedEstimate: updatedEstimate,
      });

      // Update local state
      setEstimate(updatedEstimate);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting feature:", error);
      alert("Failed to delete feature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = async () => {
    if (
      !estimate ||
      !projectId ||
      !user ||
      !newFeature.name.trim() ||
      !newFeature.hours
    )
      return;

    const hours = parseInt(newFeature.hours);
    if (isNaN(hours) || hours <= 0) {
      alert("Please enter a valid number of hours.");
      return;
    }

    setSaving(true);
    try {
      const newBreakdownItem: EstimateBreakdown = {
        feature: newFeature.name.trim(),
        hours: hours,
        cost: hours * estimate.hourlyRate,
      };

      const newBreakdown = [...estimate.breakdown, newBreakdownItem];
      const { totalHours, totalCost } = recalculateEstimate(newBreakdown);

      const updatedEstimate = {
        ...estimate,
        breakdown: newBreakdown,
        totalHours,
        totalCost,
      };

      // Update in Firestore
      await updateDoc(doc(db, "users", user.uid, "projects", projectId), {
        generatedEstimate: updatedEstimate,
      });

      // Update local state
      setEstimate(updatedEstimate);
      setNewFeature({ name: "", hours: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding feature:", error);
      alert("Failed to add feature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to determine if an item is over budget based on cumulative cost
  const isItemOverBudget = (index: number): boolean => {
    if (!budgetInfo?.range || !estimate) return false;
    const cumulativeCost = getCumulativeCost(estimate.breakdown, index);
    return cumulativeCost > budgetInfo.range.max;
  };

  // Check if the total estimate exceeds the budget
  const isTotalOverBudget = (): boolean => {
    if (!budgetInfo?.range || !estimate) return false;
    return estimate.totalCost > budgetInfo.range.max;
  };

  // Get the budget overage amount
  const getBudgetOverage = (): number => {
    if (!budgetInfo?.range || !estimate) return 0;
    return Math.max(0, estimate.totalCost - budgetInfo.range.max);
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-lg">Missing project ID.</div>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse text-brand text-lg">
            {authLoading
              ? "� Authenticating..."
              : "🔄 Loading your estimate..."}
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-lg">
            ⚠️ No estimate found for this project.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-surface-text mb-2">
            💼 Your Estimate Summary
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Budget information and overage banner */}
          {budgetInfo?.range && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-text">
                  💰 Budget Information
                </h3>
                <span className="text-gray-600">
                  {budgetInfo.isCustom ? (
                    `Budget: ${formatCurrency(budgetInfo.range.max)}`
                  ) : (
                    `Budget: ${budgetInfo.originalValue}`
                  )}
                </span>
              </div>
              
              {isTotalOverBudget() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-red-600 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-red-800 font-semibold mb-1">
                        Some items are out of scope for your defined budget
                      </h4>
                      <p className="text-red-700 text-sm mb-2">
                        Your estimate ({formatCurrency(estimate.totalCost)}) exceeds your budget by{" "}
                        <strong>{formatCurrency(getBudgetOverage())}</strong>.
                      </p>
                      <p className="text-red-700 text-sm">
                        If this doesn't look right, consider updating the hourly rate in your{" "}
                        <a href="/settings" className="underline font-medium">settings</a>{" "}
                        and regenerating the estimate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <p className="text-lg">
              <strong className="text-surface-text">Total Hours:</strong>{" "}
              {estimate.totalHours}
            </p>
            <p className="text-lg">
              <strong className="text-surface-text">Hourly Rate:</strong> $
              {estimate.hourlyRate}
            </p>
            <p className="text-xl">
              <strong className="text-surface-text">Total Cost:</strong>
              <span className={`font-bold ml-2 ${
                isTotalOverBudget() ? 'text-red-600' : 'text-brand'
              }`}>
                ${estimate.totalCost}
              </span>
              {budgetInfo?.range && (
                <span className="text-sm text-gray-600 ml-2">
                  (Budget: {formatCurrency(budgetInfo.range.max)})
                </span>
              )}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-surface-text mb-4">
            🔍 Feature Breakdown
          </h2>
          <div className="space-y-3">
            {estimate.breakdown.map((item, index) => {
              const isOverBudget = isItemOverBudget(index);
              const cumulativeCost = getCumulativeCost(estimate.breakdown, index);
              
              return (
                <div
                  key={index}
                  className={`bg-surface border p-4 rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow ${
                    isOverBudget
                      ? 'border-red-300 bg-red-50'
                      : 'border-surface-border'
                  }`}
                >
                  <div>
                    <strong className={`${isOverBudget ? 'text-red-800' : 'text-surface-text'}`}>
                      {item.feature}
                    </strong>
                    <div className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.hours} hrs
                      {budgetInfo?.range && (
                        <span className="ml-2">
                          • Running total: {formatCurrency(cumulativeCost)}
                        </span>
                      )}
                    </div>
                    {isOverBudget && (
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Exceeds budget
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-lg ${
                      isOverBudget ? 'text-red-600' : 'text-brand'
                    }`}>
                      ${item.cost}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete feature"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Feature Button */}
            <div className="border-2 border-dashed border-surface-border rounded-lg p-4 text-center">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-brand hover:text-brand-dark transition-colors font-medium"
                >
                  + Add Feature
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Feature name (e.g., Payment Integration)"
                    value={newFeature.name}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, name: e.target.value })
                    }
                    className="w-full p-2 border border-surface-border rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <input
                    type="number"
                    placeholder="Hours (e.g., 8)"
                    value={newFeature.hours}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, hours: e.target.value })
                    }
                    className="w-full p-2 border border-surface-border rounded-md focus:ring-2 focus:ring-brand focus:border-brand"
                    min="1"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={addFeature}
                      disabled={
                        saving || !newFeature.name.trim() || !newFeature.hours
                      }
                      className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark transition-colors disabled:bg-gray-400"
                    >
                      {saving ? "Adding..." : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewFeature({ name: "", hours: "" });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirm !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-surface-text mb-2">
                  Delete Feature
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete &quot;
                  {estimate.breakdown[deleteConfirm]?.feature}&quot;? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteFeature(deleteConfirm)}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            >
              📊 Go to Dashboard
            </a>

            <button
              onClick={handleDownloadEstimatePDF}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              📄 Download Estimate PDF
            </button>

            <button
              className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(estimate, null, 2))
              }
            >
              📋 Copy Estimate JSON
            </button>

            <button
              onClick={handleDownloadProposalPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              ✍️ Download Proposal PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
