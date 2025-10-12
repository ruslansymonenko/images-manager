import React from "react";

interface Props {}

const GalleryPage: React.FC<Props> = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Gallery
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        View and manage your image gallery here.
      </p>
    </div>
  );
};

export default GalleryPage;
