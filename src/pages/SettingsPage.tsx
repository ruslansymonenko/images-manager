import React from "react";
import ThemeToggle from "../components/ThemeToggle";

interface Props {}

const SettingsPage: React.FC<Props> = () => {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-primary mb-2">Settings</h1>
      <p className="text-secondary mb-8">
        Configure your application settings here.
      </p>

      {/* Theme Settings Section */}
      <div className="bg-tertiary rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Appearance</h2>
        <ThemeToggle />
      </div>

      {/* Future Settings Sections */}
      <div className="bg-tertiary rounded-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Application Settings
        </h2>
        <p className="text-secondary">
          Additional settings will be available here in future updates.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
