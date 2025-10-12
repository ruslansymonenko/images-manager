import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderClosed } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import RecentWorkspaces from "../components/RecentWorkspaces";
import SelectWorkspaceForm from "../components/SelectWorkspaceForm";

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
          <SelectWorkspaceForm
            folderPath={folderPath}
            isLoading={isLoading}
            openFolder={openFolder}
            handleSubmit={handleSubmit}
          />

          {isInitialized && workspaces.length > 0 && (
            <RecentWorkspaces
              workspaces={workspaces}
              handleOpenRecentWorkspace={handleOpenRecentWorkspace}
              handleRemoveWorkspace={handleRemoveWorkspace}
            />
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
