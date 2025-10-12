import React from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { Button } from "../components";
import { useWorkspace } from "../contexts/WorkspaceContext";
import WorkspaceInfoCard from "../components/WorkspaceInfoCard";
import WorkspaceStatusCard from "../components/WorkspaceStatusCard";

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
        <h1 className="text-2xl font-bold text-primary">Workspace</h1>
        <Button variant="secondary" onClick={handleCloseWorkspace}>
          Close Workspace
        </Button>
      </div>

      <WorkspaceInfoCard currentWorkspace={currentWorkspace} />
      <WorkspaceStatusCard />

      {/* Quick Actions */}
      <div className="bg-tertiary rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
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
