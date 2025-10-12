import React from "react";
import ThemeToggle from "../components/ThemeToggle";

interface Props {}

const SettingsPage: React.FC<Props> = () => {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure your application settings here.
      </p>

      {/* Theme Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        <ThemeToggle />
      </div>

      {/* Future Settings Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Application Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Additional settings will be available here in future updates.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
