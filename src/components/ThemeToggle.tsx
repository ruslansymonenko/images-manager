import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { colors } from "../styles/variables";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const {
    theme,
    setTheme,
    toggleTheme,
    loadWorkspaceTheme,
    saveWorkspaceTheme,
  } = useTheme();
  const { currentWorkspace } = useWorkspace();

  const handleThemeChange = async (newTheme: "light" | "dark" | "toggle") => {
    if (newTheme === "toggle") {
      toggleTheme();
    } else {
      setTheme(newTheme);
    }

    // Save to workspace settings if workspace is open
    if (currentWorkspace) {
      try {
        await saveWorkspaceTheme(currentWorkspace.absolute_path);
      } catch (error) {
        console.error("Failed to save theme to workspace:", error);
      }
    }
  };

  const handleLoadWorkspaceTheme = async () => {
    if (currentWorkspace) {
      try {
        await loadWorkspaceTheme(currentWorkspace.absolute_path);
      } catch (error) {
        console.error("Failed to load workspace theme:", error);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Theme Preference
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred theme for the application.
        </p>
      </div>

      {/* Theme Selection Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleThemeChange("light")}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
            ${
              theme === "light"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }
          `}
        >
          <Sun className="w-5 h-5" />
          <span className="font-medium">Light</span>
        </button>

        <button
          onClick={() => handleThemeChange("dark")}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
            ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }
          `}
        >
          <Moon className="w-5 h-5" />
          <span className="font-medium">Dark</span>
        </button>
      </div>

      {/* Quick Toggle Button */}
      <div className="pt-2">
        <button
          onClick={() => handleThemeChange("toggle")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
        >
          <Monitor className="w-4 h-4" />
          <span>Quick Toggle</span>
        </button>
      </div>

      {/* Workspace Theme Management */}
      {currentWorkspace && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
            Workspace Theme
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Save theme preferences for this workspace: <br />
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {currentWorkspace.name}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleLoadWorkspaceTheme}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
            >
              Load Workspace Theme
            </button>
            <button
              onClick={() =>
                currentWorkspace &&
                saveWorkspaceTheme(currentWorkspace.absolute_path)
              }
              className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            >
              Save Current Theme
            </button>
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div className="pt-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
          Preview
        </h4>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors.primary[500] }}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Current theme: {theme}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            This is how your interface will look with the selected theme.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
