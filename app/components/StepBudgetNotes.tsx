import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";

export default function StepBudgetNotes() {
  const { budget, notes, setBudget, setNotes } = useQuestionnaireStore();

  const budgetOptions = [
    { value: "$2,000 - $5,000", label: "Starter", desc: "Basic features" },
    {
      value: "$5,000 - $15,000",
      label: "Professional",
      desc: "Standard features",
    },
    {
      value: "$15,000 - $50,000",
      label: "Enterprise",
      desc: "Full feature set",
    },
    { value: "Custom", label: "Custom Budget", desc: "Discuss requirements" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-2">
          Client&apos;s Budget
        </h2>
        <p className="text-gray-600 mb-6">
          Select a budget range that works for your client
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              className={`p-4 border-2 rounded-lg text-left transition-all hover:border-brand-light ${
                budget === option.value
                  ? "border-brand bg-blue-50"
                  : "border-surface-border hover:bg-gray-50"
              }`}
              onClick={() => setBudget(option.value)}
            >
              <h3 className="font-semibold text-surface-text mb-1">
                {option.label}
              </h3>
              <p className="text-brand font-medium mb-1">{option.value}</p>
              <p className="text-sm text-gray-600">{option.desc}</p>
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="custom-budget"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Or enter a specific budget:
          </label>
          <input
            id="custom-budget"
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="$10,000"
            className="w-full px-3 py-2 border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-2xl font-bold text-surface-text mb-2"
        >
          Extra Notes
        </label>
        <p className="text-gray-600 mb-4">
          Add any additional details or requirements
        </p>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Client prefers modern UI, needs mobile-first design, integrates with existing CRM..."
          rows={5}
          className="w-full px-3 py-2 border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-900 mb-1">
          Ready to Generate!
        </h3>
        <p className="text-green-800 text-sm">
          Your estimate is ready to be generated. Review the information and
          click &quot;Generate Estimate&quot; when ready.
        </p>
      </div>
    </div>
  );
}
