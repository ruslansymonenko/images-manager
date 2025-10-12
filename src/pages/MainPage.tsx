import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderClosed, Clock, Trash2 } from "lucide-react";
import { Button } from "../components";
import { useWorkspace } from "../contexts/WorkspaceContext";

interface Props {}

const MainPage: React.FC<Props> = () => {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { workspaces, isInitialized, openWorkspace, removeWorkspace } =
    useWorkspace();

  const openFolder = async () => {
    try {
      const folder = await open({
        multiple: false,
        directory: true,
      });

      if (folder) {
        setFolderPath(folder);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to open folder:", err);
      setError("Failed to open folder dialog");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath) return;

    setIsLoading(true);
    setError(null);

    try {
      await openWorkspace(folderPath);
      navigate("/workspace");
    } catch (err) {
      console.error("Failed to open workspace:", err);
      setError(err instanceof Error ? err.message : "Failed to open workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecentWorkspace = async (workspacePath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await openWorkspace(workspacePath);
      navigate("/workspace");
    } catch (err) {
      console.error("Failed to open recent workspace:", err);
      setError(err instanceof Error ? err.message : "Failed to open workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWorkspace = async (
    e: React.MouseEvent,
    workspaceId: number
  ) => {
    e.stopPropagation();

    if (
      window.confirm(
        "Are you sure you want to remove this workspace from the list? This will not delete the actual folder."
      )
    ) {
      try {
        await removeWorkspace(workspaceId);
      } catch (err) {
        console.error("Failed to remove workspace:", err);
        setError(
          err instanceof Error ? err.message : "Failed to remove workspace"
        );
      }
    }
  };

  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full max-w-4xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <FolderClosed className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Images Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select or create a workspace to organize your images
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="workspace-path"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Workspace Path
              </label>
              <div className="flex space-x-2">
                <input
                  id="workspace-path"
                  type="text"
                  {...(folderPath
                    ? { value: folderPath }
                    : { placeholder: "Select a folder..." })}
                  className="input-base flex-1"
                  required
                  readOnly
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-[80px]"
                  onClick={openFolder}
                  disabled={isLoading}
                >
                  Browse
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A new workspace will be created if the folder doesn't contain
                one
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!folderPath || isLoading}
            >
              {isLoading ? "Opening..." : "Open Workspace"}
            </Button>
          </form>

          {/* Recent Workspaces */}
          {isInitialized && workspaces.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Workspaces
              </h2>
              <div className="space-y-2">
                {workspaces.slice(0, 5).map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() =>
                      handleOpenRecentWorkspace(workspace.absolute_path)
                    }
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
          )}

          {isInitialized && workspaces.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No recent workspaces found. Create your first workspace by
                selecting a folder above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
