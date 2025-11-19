import { useState, useEffect } from "react";
import { json, type ActionFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useNavigate,
} from "@remix-run/react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  createUserDocument,
} from "../utils/firebase.client";
import { useSettingsStore, initializeSettingsAuth } from "../stores/useSettingsStore";
import { useSpring, animated } from "@react-spring/web";

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
  const { settings, updateSettings, resetSettings, loading: settingsLoading } = useSettingsStore();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.formMethod === "POST";

  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    initializeSettingsAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user document exists
        await createUserDocument(currentUser);
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate("/");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Update local hourly rate when settings change
  useEffect(() => {
    setHourlyRate(settings.hourlyRate);
  }, [settings.hourlyRate]);

  const handleSave = async () => {
    try {
      await updateSettings({ hourlyRate });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  const ready = !authLoading && !settingsLoading;
  const headerSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : "translateY(-12px)",
    config: { tension: 210, friction: 24 },
  });
  const cardSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : "translateY(24px)",
    delay: 150,
    config: { tension: 190, friction: 28 },
  });

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-8 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <animated.div
          style={headerSpring}
          className="bg-white/90 backdrop-blur rounded-3xl shadow-lg px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <img
              src="/scopecraft_logo.png"
              alt="ScopeCraft Logo"
              className="h-12 w-12 rounded-xl object-contain"
            />
            <div>
              <p className="text-sm text-slate-500">ScopeCraft</p>
              <p className="text-xl font-semibold">AppCostEstimator.com</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-500">
            <a
              href="/dashboard"
              className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/new-estimate"
              className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              New Estimate
            </a>
            <span className="px-3 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50">
              Settings
            </span>
            <a
              href="/"
              className="px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Sign Out
            </a>
          </nav>
        </animated.div>

        <animated.div
          style={cardSpring}
          className="bg-white rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="px-6 sm:px-10 py-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
              <span role="img" aria-label="gear">
                ⚙️
              </span>
            </div>
            <p className="mt-2 text-slate-500">
              Configure your hourly rate for project estimates
            </p>
          </div>

          {actionData?.message && (
            <div
              className={`px-6 sm:px-10 py-4 border-b border-slate-100 ${
                actionData.success
                  ? "bg-green-50 border-green-100 text-green-800"
                  : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              <p className="text-sm">{actionData.message}</p>
            </div>
          )}

          <Form method="post" className="px-6 sm:px-10 py-8 space-y-8">
            <input type="hidden" name="_action" value="save-settings" />

            <div className="max-w-md space-y-2">
              <label
                htmlFor="hourlyRate"
                className="text-sm font-medium text-slate-700"
              >
                Hourly Rate
              </label>
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  $
                </div>
                <input
                  type="number"
                  name="hourlyRate"
                  id="hourlyRate"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border-0 bg-transparent pl-10 pr-16 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(parseFloat(e.target.value) || 0)
                  }
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  / hour
                </div>
              </div>
              <p className="text-sm text-slate-500">
                This rate will be used when calculating project estimates
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors font-semibold"
              >
                Reset to Default
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                disabled={isSubmitting || settingsLoading}
              >
                {isSubmitting || settingsLoading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </Form>
        </animated.div>
      </div>
    </div>
  );
}
