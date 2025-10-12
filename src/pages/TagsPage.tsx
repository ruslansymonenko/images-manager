import React from "react";

interface Props {}

const TagsPage: React.FC<Props> = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Tags
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your image tags and labels here.
      </p>
    </div>
  );
};

export default TagsPage;
