import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";

export default function StepProjectType() {
  const { projectType, setProjectType } = useQuestionnaireStore();

  const options = [
    {
      id: "web-app",
      label: "Web Application",
      icon: "🌐",
      desc: "Full-stack web app",
    },
    {
      id: "mobile-app",
      label: "Mobile App",
      icon: "📱",
      desc: "iOS/Android application",
    },
    {
      id: "landing-page",
      label: "Landing Page",
      icon: "📄",
      desc: "Marketing website",
    },
    {
      id: "saas-dashboard",
      label: "SaaS Dashboard",
      icon: "📊",
      desc: "Admin interface",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-2">
          What type of project is this?
        </h2>
        <p className="text-gray-600 mb-6">
          Select the option that best describes your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            className={`p-6 border-2 rounded-lg text-left transition-all hover:border-brand-light ${
              projectType === option.label
                ? "border-brand bg-blue-50"
                : "border-surface-border hover:bg-gray-50"
            }`}
            onClick={() => setProjectType(option.label)}
          >
            <div className="text-3xl mb-3">{option.icon}</div>
            <h3 className="font-semibold text-surface-text mb-1">
              {option.label}
            </h3>
            <p className="text-sm text-gray-600">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
