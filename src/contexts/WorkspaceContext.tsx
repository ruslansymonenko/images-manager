import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { databaseManager, Workspace } from "../utils/database";

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isInitialized: boolean;
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  removeWorkspace: (id: number) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
}) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseManager.initMainDatabase();
        await refreshWorkspaces();
        setIsInitialized(true);
        console.log("Workspace context initialized");
      } catch (error) {
        console.error("Failed to initialize workspace context:", error);
      }
    };

    initializeDatabase();
  }, []);

  const refreshWorkspaces = async () => {
    try {
      const allWorkspaces = await databaseManager.getAllWorkspaces();
      setWorkspaces(allWorkspaces);
    } catch (error) {
      console.error("Failed to refresh workspaces:", error);
      throw error;
    }
  };

  const openWorkspace = async (path: string) => {
    try {
      const workspace = await databaseManager.openWorkspace(path);
      setCurrentWorkspace(workspace);
      await refreshWorkspaces(); // Refresh to update timestamps
      console.log("Workspace opened in context:", workspace);
    } catch (error) {
      console.error("Failed to open workspace in context:", error);
      throw error;
    }
  };

  const closeWorkspace = async () => {
    try {
      await databaseManager.closeWorkspaceDatabase();
      setCurrentWorkspace(null);
      console.log("Workspace closed in context");
    } catch (error) {
      console.error("Failed to close workspace in context:", error);
      throw error;
    }
  };

  const removeWorkspace = async (id: number) => {
    try {
      await databaseManager.removeWorkspace(id);

      // If the removed workspace is currently open, close it
      if (currentWorkspace && currentWorkspace.id === id) {
        await closeWorkspace();
      }

      await refreshWorkspaces();
      console.log("Workspace removed from context");
    } catch (error) {
      console.error("Failed to remove workspace from context:", error);
      throw error;
    }
  };

  const contextValue: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    isInitialized,
    openWorkspace,
    closeWorkspace,
    refreshWorkspaces,
    removeWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
