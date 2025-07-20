import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth, db, createUserDocument } from "../utils/firebase.client";
import type { GeneratedEstimate } from "~/stores/useQuestionnaireStore";
import { Navigation } from "../components/Navigation";
import { generateAndDownloadProposalPDF } from "../utils/generatePDF";

interface ProjectData {
  id: string;
  clientRequest?: string;
  projectType?: string;
  features?: string[];
  timeline?: string;
  budget?: string;
  notes?: string;
  generatedEstimate?: GeneratedEstimate;
  createdAt?: Timestamp;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Create or update user document
        await createUserDocument(currentUser);
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
    if (!user || authLoading) return;

    const fetchProjects = async () => {
      try {
        // Fetch from users/{userId}/projects subcollection
        const q = query(
          collection(db, "users", user.uid, "projects"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectData[];
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, authLoading]);

  const handleNewEstimate = () => {
    navigate("/new-estimate");
  };

  const handleCreateProposal = async (project: ProjectData) => {
    if (!project.generatedEstimate) {
      alert("No estimate available for this project");
      return;
    }

    try {
      const projectName = project.clientRequest || `Project ${project.id}`;
      await generateAndDownloadProposalPDF(
        project.generatedEstimate,
        projectName
      );
    } catch (error) {
      console.error("Error generating proposal PDF:", error);
      alert("Failed to generate proposal PDF. Please try again.");
    }
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "Unknown date";
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-surface-text mb-2">
            ScopeCraft Dashboard 👋
          </h1>
          <p className="text-gray-600">Manage all your project estimates</p>
        </div>

        {/* New Estimate Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleNewEstimate}
            className="bg-brand text-white px-8 py-4 rounded-lg hover:bg-brand-dark transition-colors shadow-md text-lg font-semibold"
          >
            ✨ Create New Estimate
          </button>
        </div>

        {/* Estimates List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-surface-text mb-6">
            📋 Your Estimates
          </h2>

          {authLoading || loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-brand text-lg">
                🔄 Loading your estimates...
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-surface border border-surface-border rounded-lg p-8">
                <p className="text-gray-500 text-lg mb-4">
                  You haven&apos;t created any estimates yet.
                </p>
                <button
                  onClick={handleNewEstimate}
                  className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors"
                >
                  Create Your First Estimate
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-surface border border-surface-border rounded-lg p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-surface-text mb-2">
                        {project.clientRequest
                          ? project.clientRequest.slice(0, 100) +
                            (project.clientRequest.length > 100 ? "..." : "")
                          : "Untitled Project"}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {project.projectType && (
                          <span>📂 {project.projectType}</span>
                        )}
                        {project.timeline && <span>⏰ {project.timeline}</span>}
                        {project.budget && <span>💰 {project.budget}</span>}
                        <span>📅 {formatDate(project.createdAt)}</span>
                      </div>
                    </div>

                    {project.generatedEstimate && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand">
                          ${project.generatedEstimate.totalCost}
                        </div>
                        <div className="text-sm text-gray-600">
                          {project.generatedEstimate.totalHours} hours
                        </div>
                      </div>
                    )}
                  </div>

                  {project.features && project.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                        {project.features.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                            +{project.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <a
                      href={`/estimate-summary?projectId=${project.id}`}
                      className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark transition-colors text-sm"
                    >
                      View Details
                    </a>
                    {project.generatedEstimate && (
                      <button
                        onClick={() => handleCreateProposal(project)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Create Proposal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
