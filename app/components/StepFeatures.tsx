import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";

export default function StepFeatures() {
  const { features, toggleFeature } = useQuestionnaireStore();
  const options = [
    {
      id: "User Authentication",
      label: "User Authentication",
      icon: "🔐",
      desc: "Email/password, forgot password, sessions",
      hours: "15 hrs",
    },
    {
      id: "Admin Dashboard",
      label: "Admin Dashboard",
      icon: "⚙️",
      desc: "Tables, CRUD, filters, role management",
      hours: "20 hrs",
    },
    {
      id: "Notifications",
      label: "Notifications",
      icon: "📩",
      desc: "Email/SMS/in-app system (trigger + queue)",
      hours: "8 hrs",
    },
    {
      id: "Calendar Integration",
      label: "Calendar Integration",
      icon: "📅",
      desc: "Google/Outlook API or basic event view",
      hours: "12 hrs",
    },
    {
      id: "Settings/Profile Page",
      label: "Settings/Profile Page",
      icon: "🛠",
      desc: "Account info, preferences",
      hours: "10 hrs",
    },
    {
      id: "Onboarding Flow",
      label: "Onboarding Flow",
      icon: "🧭",
      desc: "Welcome, guided walkthrough, tooltips",
      hours: "6 hrs",
    },
    {
      id: "Reusable UI System",
      label: "Reusable UI System",
      icon: "🧩",
      desc: "Tailwind + component system + layout",
      hours: "12 hrs",
    },
    {
      id: "Mobile Responsiveness",
      label: "Mobile Responsiveness",
      icon: "�",
      desc: "Tailwind breakpoints or flex layout",
      hours: "5 hrs",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-2">
          Which features do you need?
        </h2>
        <p className="text-gray-600 mb-6">
          Select all features that apply to your project
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-4 border border-surface-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              className="mr-4 h-5 w-5 text-brand focus:ring-brand border-surface-border rounded"
              checked={features.includes(option.id)}
              onChange={() => toggleFeature(option.id)}
              aria-labelledby={`feature-label-${option.id}`}
            />
            <div className="flex items-center flex-1">
              <span className="text-2xl mr-4">{option.icon}</span>
              <div className="flex-1">
                <h3
                  id={`feature-label-${option.id}`}
                  className="font-semibold text-surface-text"
                >
                  {option.label}
                </h3>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </div>
              <div className="text-right ml-4">
                <span className="text-sm font-medium text-brand">
                  {option.hours}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {features.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-brand-light">
          <p className="text-brand-dark font-medium">
            Selected: {features.length} feature
            {features.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
