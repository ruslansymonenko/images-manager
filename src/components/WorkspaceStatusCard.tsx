import React from "react";
import { Database } from "lucide-react";

interface Props {}

const WorkspaceStatusCard: React.FC<Props> = () => {
  return (
    <div className="bg-tertiary rounded-lg shadow-sm text-secondary p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Database Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Main Database:</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">
                Workspace Database:
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Settings Folder:</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                .im_settings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceStatusCard;
