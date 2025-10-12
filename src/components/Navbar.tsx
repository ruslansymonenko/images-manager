import React from "react";
import { NavLink } from "react-router-dom";
import { Home, FolderOpen, Images, Tags, Link, Settings } from "lucide-react";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const navItems = [
    { path: "/workspace", label: "Workspace", icon: FolderOpen },
    { path: "/gallery", label: "Gallery", icon: Images },
    { path: "/tags", label: "Tags", icon: Tags },
    { path: "/connections", label: "Connections", icon: Link },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Images Manager
            </h1>
          </div>

          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
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
