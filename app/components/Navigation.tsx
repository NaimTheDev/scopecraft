import { Link, useLocation } from "@remix-run/react";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const location = useLocation();

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
    </nav>
  );
}
