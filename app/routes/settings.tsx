import { useState } from "react";
import { json, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useSettingsStore } from "../stores/useSettingsStore";
import { Navigation } from "../components/Navigation";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "save-settings") {
    // In a real app, you might want to save this to a database
    return json({ success: true, message: "Settings saved successfully!" });
  }

  return json({ success: false, message: "Invalid action" });
};

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formMethod === "POST";

  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);

  const handleSave = () => {
    updateSettings({ hourlyRate });
  };

  const handleReset = () => {
    resetSettings();
    setHourlyRate(100); // default rate
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        <div className="bg-surface shadow rounded-lg border border-surface-border">
          <div className="px-6 py-4 border-b border-surface-border">
            <h1 className="text-2xl font-bold text-surface-text">
              Settings ⚙️
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure your hourly rate for project estimates
            </p>
          </div>

          {actionData?.message && (
            <div
              className={`px-6 py-4 border-b border-surface-border ${
                actionData.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  actionData.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {actionData.message}
              </p>
            </div>
          )}

          <Form method="post">
            <input type="hidden" name="_action" value="save-settings" />

            {/* Hourly Rate */}
            <div className="px-6 py-6">
              <div className="max-w-xs">
                <label
                  htmlFor="hourlyRate"
                  className="block text-sm font-medium text-surface-text mb-2"
                >
                  💰 Hourly Rate
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="hourlyRate"
                    id="hourlyRate"
                    min="0"
                    step="0.01"
                    className="focus:ring-brand focus:border-brand block w-full pl-7 pr-12 sm:text-sm border-surface-border rounded-md"
                    placeholder="100.00"
                    value={hourlyRate}
                    onChange={(e) =>
                      setHourlyRate(parseFloat(e.target.value) || 0)
                    }
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/hour</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This rate will be used when calculating project estimates
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-surface flex justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-surface-border shadow-sm text-sm font-medium rounded-md text-surface-text bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
              >
                🔄 Reset to Default ($100/hour)
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "💾 Saving..." : "💾 Save Settings"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
