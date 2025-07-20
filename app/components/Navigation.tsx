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
    <nav className={`flex space-x-4 ${className}`}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            location.pathname === item.href
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}

      {/* Sign Out Button */}
      {user && (
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🚪</span>
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      )}
    </nav>
  );
}
