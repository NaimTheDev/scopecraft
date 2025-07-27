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
      className={`flex space-x-4 bg-white/80 shadow-xl rounded-xl px-6 py-3 items-center ${className}`}
      style={{ backdropFilter: "blur(6px)" }}
    >
      <Link
        to="/"
        className="text-2xl font-extrabold text-brand drop-shadow-glow tracking-tight mr-6"
      >
        MyAppCostEstimator.com
      </Link>
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors hover:bg-brand-light hover:text-brand-dark ${
            location.pathname === item.href
              ? "bg-brand text-white shadow-md"
              : "text-gray-700"
          }`}
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="flex-1" />
      {user ? (
        <button
          onClick={handleSignOut}
          className="ml-4 px-4 py-2 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 transition-colors disabled:opacity-60"
          disabled={signingOut}
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      ) : null}
    </nav>
  );
}
