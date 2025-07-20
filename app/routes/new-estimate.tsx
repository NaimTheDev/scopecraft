import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, createUserDocument } from "../utils/firebase.client";
import EstimateForm from "../components/EstimateForm";

export default function NewEstimateRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen p-6 bg-gray-50">
      <EstimateForm />
    </div>
  );
}
