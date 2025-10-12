import React from "react";

interface Props {
  graphData: { nodes: any[] };
  stats: { connectedImages: number; totalConnections: number };
}

const ConnectionStatistics: React.FC<Props> = (props) => {
  const { graphData, stats } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-tertiary p-4 rounded-lg">
        <h3 className="text-sm font-medium text-primary">Total Images</h3>
        <p className="text-2xl font-bold text-secondary">
          {graphData.nodes.length}
        </p>
      </div>

      <div className="bg-tertiary p-4 rounded-lg">
        <h3 className="text-sm font-medium text-primary">Connected Images</h3>
        <p className="text-2xl font-bold text-secondary">
          {stats.connectedImages}
        </p>
      </div>

      <div className="bg-tertiary p-4 rounded-lg">
        <h3 className="text-sm font-medium text-primary">Total Connections</h3>
        <p className="text-2xl font-bold text-secondary">
          {stats.totalConnections}
        </p>
      </div>
    </div>
  );
};

export default ConnectionStatistics;
