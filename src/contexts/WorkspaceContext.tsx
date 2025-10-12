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
      console.log("Refreshing workspaces...");
      const allWorkspaces = await databaseManager.getAllWorkspaces();

      setWorkspaces(allWorkspaces);
      console.log(`Loaded ${allWorkspaces.length} workspaces`);
    } catch (error) {
      console.error("Failed to refresh workspaces:", error);

      // If database connection issue, try to reinitialize
      if (error instanceof Error && error.message.includes("closed pool")) {
        console.log("Database connection lost, attempting to reinitialize...");

        try {
          await databaseManager.initMainDatabase();

          const allWorkspaces = await databaseManager.getAllWorkspaces();

          setWorkspaces(allWorkspaces);
          console.log("Database reinitialized successfully");
        } catch (reinitError) {
          console.error("Failed to reinitialize database:", reinitError);
          throw reinitError;
        }
      } else {
        throw error;
      }
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
      console.log(`Removing workspace with ID: ${id}`);

      // If the removed workspace is currently open, close it first
      if (currentWorkspace && currentWorkspace.id === id) {
        console.log("Closing currently open workspace before removal");
        await closeWorkspace();
      }

      await databaseManager.removeWorkspace(id);
      await refreshWorkspaces();
      console.log("Workspace removed from context successfully");
    } catch (error) {
      console.error("Failed to remove workspace from context:", error);

      // If database connection issue, try to reinitialize and retry
      if (error instanceof Error && error.message.includes("closed pool")) {
        console.log(
          "Database connection lost during removal, attempting to recover..."
        );

        try {
          await databaseManager.initMainDatabase();
          await databaseManager.removeWorkspace(id);
          await refreshWorkspaces();

          console.log("Workspace removal recovered successfully");
        } catch (recoveryError) {
          console.error(
            "Failed to recover from database connection error:",
            recoveryError
          );
          throw recoveryError;
        }
      } else {
        throw error;
      }
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
