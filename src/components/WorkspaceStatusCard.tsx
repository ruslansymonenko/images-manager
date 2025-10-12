import React from "react";
import { Database } from "lucide-react";

interface Props {}

const WorkspaceStatusCard: React.FC<Props> = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Database Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Main Database:
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Workspace Database:
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Settings Folder:
              </span>
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
