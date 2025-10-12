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
        <h3 className="text-lg font-medium text-primary mb-2">
          Theme Preference
        </h3>
        <p className="text-sm text-secondary mb-4">
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
                ? "border-focus bg-primary text-inverse"
                : "border-primary bg-secondary text-primary hover:border-hover hover:bg-hover"
            }
          `}
        >
          <Sun className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">Light</span>
        </button>

        <button
          onClick={() => handleThemeChange("dark")}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
            ${
              theme === "dark"
                ? "border-focus bg-primary text-inverse"
                : "border-primary bg-secondary text-primary hover:border-hover hover:bg-hover"
            }
          `}
        >
          <Moon className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">Dark</span>
        </button>
      </div>

      {/* Quick Toggle Button */}
      <div className="pt-2">
        <button
          onClick={() => handleThemeChange("toggle")}
          className="flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-hover text-primary rounded-lg transition-colors duration-200"
        >
          <Monitor className="w-4 h-4" />
          <span>Quick Toggle</span>
        </button>
      </div>

      {/* Workspace Theme Management */}
      {currentWorkspace && (
        <div className="pt-4 border-t border-primary">
          <h4 className="text-md font-medium text-primary mb-2">
            Workspace Theme
          </h4>
          <p className="text-sm text-secondary mb-3">
            Save theme preferences for this workspace: <br />
            <span className="font-mono text-xs bg-tertiary px-2 py-1 rounded">
              {currentWorkspace.name}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleLoadWorkspaceTheme}
              className="btn-secondary text-sm"
            >
              Load Workspace Theme
            </button>
            <button
              onClick={() =>
                currentWorkspace &&
                saveWorkspaceTheme(currentWorkspace.absolute_path)
              }
              className="btn-primary text-sm"
            >
              Save Current Theme
            </button>
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div className="pt-4">
        <h4 className="text-md font-medium text-primary mb-2">Preview</h4>
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors.primary[500] }}
            />
            <span className="text-sm font-medium text-primary">
              Current theme: {theme}
            </span>
          </div>
          <div className="text-xs text-secondary">
            This is how your interface will look with the selected theme.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
