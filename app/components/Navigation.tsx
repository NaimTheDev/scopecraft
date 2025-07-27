import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  signOutUser,
  createUserDocument,
} from "../utils/firebase.client";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user document exists
        await createUserDocument(user);
      }
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setSigningOut(false);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/new-estimate", label: "New Estimate", icon: "✨" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      className={`glass-card flex items-center justify-between px-8 py-4 mb-8 shadow-glass ${className}`}
      style={{ backdropFilter: "blur(6px)" }}
    >
      <div className="flex items-center space-x-3">
        <img
          src="/logo-light.png"
          alt="MyAppCostEstimator Logo"
          className="h-8 w-8 rounded-xl shadow-soft"
        />
        <span className="text-2xl font-extrabold tracking-tight text-primary drop-shadow">
          MyAppCostEstimator
        </span>
      </div>
      <div className="flex space-x-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors shadow-soft ${
              location.pathname === item.href
                ? "bg-primary text-white shadow-glass"
                : "text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-surface-light/80"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {user && (
          <button
            onClick={handleSignOut}
            className="ml-4 btn-accent"
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        )}
      </div>
    </nav>
  );
}
