import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { useConnections } from "../contexts/ConnectionContext";
import { useWorkspace } from "../contexts/WorkspaceContext";

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

const ConnectionsGraph: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { getGraphData, getConnectionStats } = useConnections();

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
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
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

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback(
    (node: GraphNode) => {
      const encodedPath = encodeURIComponent(node.path);
      navigate(`/gallery/image/${encodedPath}`);
    },
    [navigate]
  );

  const getNodeColor = (node: GraphNode) => {
    const extension = node.extension.toLowerCase();

    if (["jpg", "jpeg"].includes(extension)) return "#FF6B6B";
    if (["png"].includes(extension)) return "#4ECDC4";
    if (["gif"].includes(extension)) return "#45B7D1";
    if (["webp"].includes(extension)) return "#96CEB4";
    if (["svg"].includes(extension)) return "#FFEAA7";
    if (["bmp"].includes(extension)) return "#DDA0DD";

    return "#95A5A6"; // Default gray
  };

  const getNodeSize = (node: GraphNode) => {
    // Scale node size based on file size, with a reasonable range
    const minSize = 4;
    const maxSize = 12;
    const minFileSize = 1024; // 1KB
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const normalizedSize =
      Math.log(Math.max(node.size, minFileSize)) / Math.log(maxFileSize);
    return minSize + (maxSize - minSize) * Math.min(normalizedSize, 1);
  };

  return (
    <div className="flex-1 bg-secondary rounded-lg  relative overflow-hidden shadow-md">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-tertiary rounded-lg p-3 shadow-md">
        <h4 className="text-sm font-medium text-primary mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-secondary">JPG/JPEG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
            <span className="text-secondary">PNG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-secondary">GIF</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-secondary">WebP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-secondary">SVG</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 bg-tertiary rounded-lg p-3 shadow-sm max-w-xs">
          <h4 className="text-sm font-medium text-primary mb-2">
            Selected Image
          </h4>
          <div className="space-y-1 text-xs">
            <p
              className="text-primary font-medium truncate"
              title={selectedNode.name}
            >
              {selectedNode.name}
            </p>
            <p className="text-secondary uppercase">{selectedNode.extension}</p>
            <p className="text-secondary">
              {(selectedNode.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={() => handleNodeDoubleClick(selectedNode)}
              className="mt-2 w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {stats.totalConnections === 0 && graphData.nodes.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            No connections yet. Go to an image's details page to start
            connecting images!
          </p>
        </div>
      )}

      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node: GraphNode) =>
          `${node.name} (${node.extension.toUpperCase()})`
        }
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        linkColor={() => "#6B7280"}
        linkWidth={2}
        nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          const nodeRadius = getNodeSize(node);

          // Draw node
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          // Draw border
          ctx.strokeStyle = "#374151";
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();

          // Draw label
          if (globalScale > 0.5) {
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = "#374151";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const truncatedLabel =
              label.length > 15 ? label.substring(0, 12) + "..." : label;

            ctx.fillText(
              truncatedLabel,
              node.x!,
              node.y! + nodeRadius + fontSize
            );
          }
        }}
        onNodeClick={handleNodeClick}
        onNodeRightClick={(node: GraphNode) => {
          setSelectedNode(node);
          handleNodeDoubleClick(node);
        }}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        width={undefined}
        height={undefined}
      />
    </div>
  );
};

export default ConnectionsGraph;
