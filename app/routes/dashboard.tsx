import { useEffect, useMemo, useState } from "react";
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
import { useSpring, useTrail, animated } from "@react-spring/web";

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

  const ready = !authLoading && !loading;
  const heroSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : "translateY(24px)",
    config: { tension: 190, friction: 26 },
  });
  const cardsTrail = useTrail(projects.length || 0, {
    opacity: ready ? 1 : 0,
    y: ready ? 0 : 20,
    from: { opacity: 0, y: 20 },
    config: { mass: 1, tension: 210, friction: 24 },
    delay: 200,
  });

  const summary = useMemo(() => {
    const totalCost = projects.reduce((sum, project) => {
      const cost = Number(project.generatedEstimate?.totalCost) || 0;
      return sum + cost;
    }, 0);
    const totalHours = projects.reduce((sum, project) => {
      const hours = Number(project.generatedEstimate?.totalHours) || 0;
      return sum + hours;
    }, 0);
    return { totalCost, totalHours };
  }, [projects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white px-4 py-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-2">
          <Navigation />
        </div>

        <animated.section
          style={heroSpring}
          className="bg-white/80 backdrop-blur rounded-3xl shadow-xl px-6 py-10 sm:px-12"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="uppercase text-sm tracking-[0.2em] text-blue-500 mb-2">
                Dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Hello {user?.displayName || "there"}{" "}
                <span role="img" aria-label="waving hand">
                  👋
                </span>
              </h1>
              <p className="text-slate-600 mt-2">
                Keep track of every estimate, revisit details, and send polished
                proposals in seconds.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleNewEstimate}
                className="bg-brand text-white px-6 py-3 rounded-xl shadow-lg shadow-brand/30 hover:bg-brand-dark transition-colors font-semibold flex items-center justify-center gap-2"
              >
                ✨ Create New Estimate
              </button>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Active Estimates
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {projects.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-100">
              <p className="text-sm text-blue-700">Total projected cost</p>
              <p className="text-2xl font-bold text-blue-900">
                ${summary.totalCost.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50/80 rounded-2xl p-5 border border-purple-100">
              <p className="text-sm text-purple-700">Total hours</p>
              <p className="text-2xl font-bold text-purple-900">
                {summary.totalHours.toLocaleString()}h
              </p>
            </div>
          </div>
        </animated.section>

        <section className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Your Estimates</h2>
              <p className="text-slate-500">
                Continue refining scopes or generate proposals instantly.
              </p>
            </div>
          </div>

          {authLoading || loading ? (
            <div className="text-center py-12 text-blue-600">
              <div className="animate-pulse text-lg font-medium">
                Loading your workspace...
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">
                You haven&apos;t created any estimates yet.
              </p>
              <button
                onClick={handleNewEstimate}
                className="bg-brand text-white px-5 py-3 rounded-xl hover:bg-brand-dark transition-colors font-semibold"
              >
                Create your first estimate
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {projects.map((project, index) => {
                const style = cardsTrail[index];
                const estimatedCost =
                  Number(project.generatedEstimate?.totalCost) || 0;
                const estimatedHours =
                  Number(project.generatedEstimate?.totalHours) || 0;
                return (
                  <animated.div
                    key={project.id}
                    style={{
                      opacity: style.opacity,
                      transform: style.y.to(
                        (value) => `translateY(${value}px)`
                      ),
                    }}
                    className="rounded-3xl border border-slate-100 px-5 py-6 shadow-sm hover:shadow-lg transition-shadow bg-slate-50/60"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm text-slate-500">
                          {project.projectType || "General Project"} ·{" "}
                          {formatDate(project.createdAt)}
                        </p>
                        <h3 className="text-xl font-semibold">
                          {project.clientRequest
                            ? project.clientRequest.slice(0, 120) +
                              (project.clientRequest.length > 120 ? "..." : "")
                            : "Untitled Project"}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                          {project.timeline && (
                            <span className="flex items-center gap-1">
                              ⏱ {project.timeline}
                            </span>
                          )}
                          {project.budget && (
                            <span className="flex items-center gap-1">
                              💰 {project.budget}
                            </span>
                          )}
                          {project.notes && (
                            <span className="flex items-center gap-1">
                              📝 {project.notes.slice(0, 60)}
                            </span>
                          )}
                        </div>
                      </div>

                      {project.generatedEstimate && (
                        <div className="text-right min-w-[140px]">
                          <p className="text-sm uppercase tracking-wider text-slate-500">
                            Cost
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            ${estimatedCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500">
                            {estimatedHours.toLocaleString()} hours
                          </p>
                        </div>
                      )}
                    </div>

                    {project.features && project.features.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.features.slice(0, 6).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200"
                          >
                            {feature}
                          </span>
                        ))}
                        {project.features.length > 6 && (
                          <span className="px-3 py-1 rounded-full text-xs bg-slate-200 text-slate-600">
                            +{project.features.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a
                        href={`/estimate-summary?projectId=${project.id}`}
                        className="flex-1 text-center border border-blue-500 text-blue-600 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                      >
                        View Details
                      </a>
                      {project.generatedEstimate && (
                        <button
                          onClick={() => handleCreateProposal(project)}
                          className="flex-1 text-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Create Proposal
                        </button>
                      )}
                    </div>
                  </animated.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
