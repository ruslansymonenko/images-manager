import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConnections } from "../contexts/ConnectionContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useImages } from "../contexts/ImageContext";
import ConnectionStatistics from "../components/ConnectionsStatistics";
import ConnectionsGraph from "../components/ConnectionsGraph";

interface GraphNode {
  id: number;
  name: string;
  path: string;
  extension: string;
  size: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: number | GraphNode;
  target: number | GraphNode;
  id: number;
  created_at: string;
}

const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { refreshImages } = useImages();
  const {
    getGraphData,
    getConnectionStats,
    refreshConnections,
    isLoading,
    error,
  } = useConnections();

  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({
    nodes: [],
    links: [],
  });
  const [stats, setStats] = useState({
    totalConnections: 0,
    connectedImages: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentWorkspace) return;

    setIsLoadingData(true);
    try {
      const [data, connectionStats] = await Promise.all([
        getGraphData(),
        getConnectionStats(),
      ]);

      setGraphData(data);
      setStats(connectionStats);
    } catch (error) {
      console.error("Failed to load graph data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentWorkspace, getGraphData, getConnectionStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    try {
      await refreshImages();
      await refreshConnections();
      await loadData();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Connections</h1>
        <p className="text-secondary">
          Please open a workspace to view image connections.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            Image Connections Graph
          </h1>
          <p className="text-secondary">
            Visualize relationships between images in your workspace
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={isLoading || isLoadingData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading || isLoadingData ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error rounded-md">
          <p className="text-sm text-primary">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <ConnectionStatistics graphData={graphData} stats={stats} />

      {isLoadingData ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading graph data...
            </p>
          </div>
        </div>
      ) : graphData.nodes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-medium text-primary mb-2">
              No Images Found
            </h3>
            <p className="text-secondary mb-4">
              There are no images in this workspace to display.
            </p>
            <button
              onClick={() => navigate("/gallery")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Gallery
            </button>
          </div>
        </div>
      ) : (
        <ConnectionsGraph />
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-tertiary rounded-lg">
        <h4 className="text-sm font-medium text-primary mb-2">How to use:</h4>
        <ul className="text-xs text-secondary space-y-1">
          <li>• Click and drag to pan around the graph</li>
          <li>• Use mouse wheel to zoom in/out</li>
          <li>• Click on a node to see image details</li>
          <li>
            • Double-click or right-click on a node to open image details page
          </li>
          <li>• Drag nodes to reposition them</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionsPage;
