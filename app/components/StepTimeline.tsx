import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";

export default function StepTimeline() {
  const { timeline, setTimeline } = useQuestionnaireStore();

  const timelineOptions = [
    {
      value: "2-3 weeks",
      label: "Rush (2-3 weeks)",
      desc: "Urgent delivery",
      multiplier: 1.5,
    },
    {
      value: "4-6 weeks",
      label: "Standard (4-6 weeks)",
      desc: "Normal timeline",
      multiplier: 1.0,
    },
    {
      value: "2-3 months",
      label: "Relaxed (2-3 months)",
      desc: "Quality focused",
      multiplier: 0.8,
    },
    {
      value: "flexible",
      label: "Flexible Timeline",
      desc: "No strict deadline",
      multiplier: 0.7,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-2">
          What&apos;s the timeline?
        </h2>
        <p className="text-gray-600 mb-6">
          Choose your preferred project timeline
        </p>
      </div>

      <div className="space-y-3">
        {timelineOptions.map((option) => (
          <button
            key={option.value}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-brand-light ${
              timeline === option.value
                ? "border-brand bg-blue-50"
                : "border-surface-border hover:bg-gray-50"
            }`}
            onClick={() => setTimeline(option.value)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-surface-text">
                {option.label}
              </h3>
              {option.multiplier !== 1.0 && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    option.multiplier > 1
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {option.multiplier}x cost
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{option.desc}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-surface-border pt-6">
        <label
          htmlFor="custom-timeline"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Or specify a custom timeline:
        </label>
        <input
          id="custom-timeline"
          type="text"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="e.g. 8-10 weeks, 3 months, end of Q2"
          className="w-full px-3 py-2 border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
        <p className="text-sm text-gray-500 mt-1">
          Feel free to describe your timeline in your own words
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-1">
          Timeline Considerations
        </h3>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Rush timelines may require additional resources and costs</li>
          <li>• Quality assurance and testing time should be factored in</li>
          <li>
            • Flexible timelines often result in better outcomes and value
          </li>
          <li>• Complex features may extend the overall timeline</li>
        </ul>
      </div>
    </div>
  );
}
