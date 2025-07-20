import { useState } from "react";
import {
  migrateProjectsToUserSubcollections,
  verifyMigration,
} from "../utils/migrateProjects";

export default function AdminMigration() {
  const [migrationStatus, setMigrationStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [migrationResult, setMigrationResult] = useState<{
    migratedCount: number;
    projectsToDelete: number;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [verificationUserId, setVerificationUserId] = useState("");
  const [verificationResult, setVerificationResult] = useState<number | null>(
    null
  );

  const handleMigration = async () => {
    setMigrationStatus("running");
    setError("");
    setMigrationResult(null);

    try {
      const result = await migrateProjectsToUserSubcollections();
      setMigrationResult(result || { migratedCount: 0, projectsToDelete: 0 });
      setMigrationStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
      setMigrationStatus("error");
    }
  };

  const handleVerification = async () => {
    if (!verificationUserId.trim()) {
      alert("Please enter a user ID to verify");
      return;
    }

    try {
      const count = await verifyMigration(verificationUserId);
      setVerificationResult(count);
    } catch (err) {
      alert(
        `Verification failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Admin: Project Migration
          </h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ⚠️ Important Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This will migrate all existing projects from the old
                    structure to the new user subcollections structure. Make
                    sure you have a backup before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Migration Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Run Migration
            </h2>

            <button
              onClick={handleMigration}
              disabled={migrationStatus === "running"}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                migrationStatus === "running"
                  ? "bg-gray-400 cursor-not-allowed"
                  : migrationStatus === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {migrationStatus === "running" && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {migrationStatus === "running"
                ? "Migrating..."
                : "Start Migration"}
            </button>

            {/* Migration Results */}
            {migrationStatus === "success" && migrationResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Migration Completed Successfully!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        ✅ Migrated {migrationResult.migratedCount} projects
                      </p>
                      <p>
                        📁 {migrationResult.projectsToDelete} old documents
                        ready for cleanup
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {migrationStatus === "error" && error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Migration Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Verify Migration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter a user ID to verify that their projects were migrated
              correctly:
            </p>

            <div className="flex space-x-4">
              <input
                type="text"
                value={verificationUserId}
                onChange={(e) => setVerificationUserId(e.target.value)}
                placeholder="Enter user ID to verify"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleVerification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify
              </button>
            </div>

            {verificationResult !== null && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  ✅ User has <strong>{verificationResult}</strong> projects in
                  their subcollection.
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              After Migration
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. ✅ Test the app to ensure projects load correctly</p>
              <p>2. 🔍 Verify a few users using the verification tool above</p>
              <p>
                3. 🗑️ Uncomment the cleanup code in migrateProjects.ts to remove
                old documents
              </p>
              <p>4. 🚫 Remove this admin page from your app</p>
              <p>5. 🔒 Update your Firestore security rules if needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
