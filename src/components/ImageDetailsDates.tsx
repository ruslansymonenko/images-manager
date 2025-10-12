import React from "react";
import { ImageFile } from "../utils/database";

interface Props {
  currentImage: ImageFile;
}

const ImageDetailsDates: React.FC<Props> = ({ currentImage }) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Last Modified
        </label>
        <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          {formatDate(currentImage.modified_at)}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Added to Database
        </label>
        <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          {formatDate(currentImage.created_at || currentImage.updated_at || "")}
        </p>
      </div>
    </div>
  );
};

export default ImageDetailsDates;
