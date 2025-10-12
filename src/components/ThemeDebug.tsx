import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeDebug: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  const getDocumentClasses = () => {
    return document.documentElement.className;
  };

  const getCSSVariableValue = (variableName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  };

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
        Theme Debug Info
      </h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Current theme:</strong> {theme}
        </div>
        <div>
          <strong>Is dark:</strong> {isDark ? "Yes" : "No"}
        </div>
        <div>
          <strong>Document classes:</strong> {getDocumentClasses()}
        </div>
        <div>
          <strong>Background primary CSS var:</strong>
          <span
            style={{
              backgroundColor: getCSSVariableValue(
                "--color-background-primary"
              ),
            }}
          >
            {getCSSVariableValue("--color-background-primary") || "Not defined"}
          </span>
        </div>
        <div>
          <strong>Text primary CSS var:</strong>
          <span style={{ color: getCSSVariableValue("--color-text-primary") }}>
            {getCSSVariableValue("--color-text-primary") || "Not defined"}
          </span>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Toggle Theme (Debug)
      </button>
    </div>
  );
};
