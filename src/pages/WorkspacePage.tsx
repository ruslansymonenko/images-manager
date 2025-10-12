import React from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Database, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "../components";
import { useWorkspace } from "../contexts/WorkspaceContext";

interface Props {}

const WorkspacePage: React.FC<Props> = () => {
  const navigate = useNavigate();
  const { currentWorkspace, closeWorkspace } = useWorkspace();

  const handleCloseWorkspace = async () => {
    try {
      await closeWorkspace();
      navigate("/");
    } catch (error) {
      console.error("Failed to close workspace:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Workspace Open
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to open a workspace to manage your images and settings.
          </p>
          <Button variant="primary" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Open Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Workspace
        </h1>
        <Button variant="secondary" onClick={handleCloseWorkspace}>
          Close Workspace
        </Button>
      </div>

      {/* Workspace Info Card */}
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

      {/* Database Status Card */}
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/gallery")}
            className="justify-center"
          >
            View Gallery
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/tags")}
            className="justify-center"
          >
            Manage Tags
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/connections")}
            className="justify-center"
          >
            Connections
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/settings")}
            className="justify-center"
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
