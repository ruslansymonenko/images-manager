import React from "react";

interface Props {}

const ConnectionsPage: React.FC<Props> = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Connections
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your external connections and integrations here.
      </p>
    </div>
  );
};

export default ConnectionsPage;
