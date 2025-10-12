import React from "react";
import { Workspace } from "../utils/database";
import { FolderClosed, Clock, Trash2 } from "lucide-react";

interface Props {
  workspaces: Workspace[];
  handleOpenRecentWorkspace: (workspacePath: string) => void;
  handleRemoveWorkspace: (e: React.MouseEvent, workspaceId: number) => void;
}

const RecentWorkspaces: React.FC<Props> = ({
  workspaces,
  handleOpenRecentWorkspace,
  handleRemoveWorkspace,
}) => {
  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Recent Workspaces
      </h2>
      <div className="space-y-2">
        {workspaces.slice(0, 5).map((workspace) => (
          <div
            key={workspace.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            onClick={() => handleOpenRecentWorkspace(workspace.absolute_path)}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FolderClosed className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {workspace.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {workspace.absolute_path}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {workspace.updated_at && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(workspace.updated_at)}</span>
                </div>
              )}
              <button
                onClick={(e) => handleRemoveWorkspace(e, workspace.id!)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWorkspaces;
