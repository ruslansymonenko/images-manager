import React from "react";
import { Workspace } from "../utils/database";
import { FolderOpen, Calendar } from "lucide-react";

interface Props {
  currentWorkspace: Workspace;
}

const WorkspaceInfoCard: React.FC<Props> = ({ currentWorkspace }) => {
  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {currentWorkspace.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all mb-4">
            {currentWorkspace.absolute_path}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                Created:{" "}
                {currentWorkspace.created_at
                  ? formatDate(currentWorkspace.created_at)
                  : "Unknown"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                Last accessed:{" "}
                {currentWorkspace.updated_at
                  ? formatDate(currentWorkspace.updated_at)
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInfoCard;
