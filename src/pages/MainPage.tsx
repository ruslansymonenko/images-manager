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
    <div className="min-h-screen min-w-screen bg-primary flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mb-4">
              <FolderClosed
                className="w-8 h-8"
                style={{ color: "var(--color-interactive-primary)" }}
              />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Images Manager
            </h1>
            <p className="text-secondary">
              Select or create a workspace to organize your images
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 status-error border rounded-lg">
              <p>{error}</p>
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
              <p className="text-secondary">
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
