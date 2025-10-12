import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Images,
  Tags,
  Link,
  Settings,
  LogOut,
} from "lucide-react";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const navItems = [
    { path: "/workspace", label: "Workspace", icon: FolderOpen },
    { path: "/gallery", label: "Gallery", icon: Images },
    { path: "/tags", label: "Tags", icon: Tags },
    { path: "/connections", label: "Connections", icon: Link },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/", label: "Exit", icon: LogOut },
  ];

  return (
    <nav className="bg-elevated border-b border-primary text-primary">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home
              className="w-6 h-6"
              style={{ color: "var(--color-interactive-primary)" }}
            />
            <h1 className="text-xl font-bold text-primary">Images Manager</h1>
          </div>

          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary"
                      : "text-primary hover:text-primary hover:bg-hover"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
