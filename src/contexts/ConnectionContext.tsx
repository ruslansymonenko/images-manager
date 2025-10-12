import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { databaseManager } from "../utils/database";
import { Connection, ImageConnection } from "../utils/database/types";

interface ConnectionContextType {
  // State
  connections: Connection[];
  imageConnections: Record<number, ImageConnection[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  createConnection: (imageAId: number, imageBId: number) => Promise<void>;
  removeConnection: (imageAId: number, imageBId: number) => Promise<void>;
  getConnectionsForImage: (imageId: number) => Promise<ImageConnection[]>;
  refreshConnections: () => Promise<void>;
  checkConnectionExists: (
    imageAId: number,
    imageBId: number
  ) => Promise<boolean>;
  getConnectionStats: () => Promise<{
    totalConnections: number;
    connectedImages: number;
  }>;
  getGraphData: () => Promise<{ nodes: any[]; links: any[] }>;
  clearError: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
  children,
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [imageConnections, setImageConnections] = useState<
    Record<number, ImageConnection[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(error?.message || message);
  }, []);

  const refreshConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allConnections = await databaseManager.getAllConnections();
      setConnections(allConnections);
    } catch (error) {
      handleError(error, "Failed to refresh connections");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createConnection = useCallback(
    async (imageAId: number, imageBId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await databaseManager.createConnection(imageAId, imageBId);

        // Refresh connections and affected image connections
        await refreshConnections();

        // Clear cached connections for both images
        setImageConnections((prev) => {
          const updated = { ...prev };
          delete updated[imageAId];
          delete updated[imageBId];
          return updated;
        });

        console.log("Connection created successfully");
      } catch (error) {
        handleError(error, "Failed to create connection");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshConnections, handleError]
  );

  const removeConnection = useCallback(
    async (imageAId: number, imageBId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await databaseManager.removeConnection(imageAId, imageBId);

        // Refresh connections and affected image connections
        await refreshConnections();

        // Clear cached connections for both images
        setImageConnections((prev) => {
          const updated = { ...prev };
          delete updated[imageAId];
          delete updated[imageBId];
          return updated;
        });

        console.log("Connection removed successfully");
      } catch (error) {
        handleError(error, "Failed to remove connection");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshConnections, handleError]
  );

  const getConnectionsForImage = useCallback(
    async (imageId: number) => {
      // Return cached connections if available
      if (imageConnections[imageId]) {
        return imageConnections[imageId];
      }

      setError(null);

      try {
        const connections = await databaseManager.getConnectionsForImage(
          imageId
        );

        // Cache the connections
        setImageConnections((prev) => ({
          ...prev,
          [imageId]: connections,
        }));

        return connections;
      } catch (error) {
        handleError(error, "Failed to get connections for image");
        return [];
      }
    },
    [imageConnections, handleError]
  );

  const checkConnectionExists = useCallback(
    async (imageAId: number, imageBId: number) => {
      try {
        return await databaseManager.connectionExists(imageAId, imageBId);
      } catch (error) {
        handleError(error, "Failed to check connection existence");
        return false;
      }
    },
    [handleError]
  );

  const getConnectionStats = useCallback(async () => {
    try {
      return await databaseManager.getConnectionStats();
    } catch (error) {
      handleError(error, "Failed to get connection statistics");
      return { totalConnections: 0, connectedImages: 0 };
    }
  }, [handleError]);

  const getGraphData = useCallback(async () => {
    try {
      return await databaseManager.getGraphData();
    } catch (error) {
      handleError(error, "Failed to get graph data");
      return { nodes: [], links: [] };
    }
  }, [handleError]);

  const value: ConnectionContextType = {
    // State
    connections,
    imageConnections,
    isLoading,
    error,

    // Actions
    createConnection,
    removeConnection,
    getConnectionsForImage,
    refreshConnections,
    checkConnectionExists,
    getConnectionStats,
    getGraphData,
    clearError,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnections must be used within a ConnectionProvider");
  }
  return context;
};
