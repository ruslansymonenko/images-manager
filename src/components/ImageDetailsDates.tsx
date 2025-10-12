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
        <label className="block text-sm font-medium text-secondary mb-2">
          Last Modified
        </label>
        <p className="text-secondary bg-tertiary p-3 rounded-md">
          {formatDate(currentImage.modified_at)}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">
          Added to Database
        </label>
        <p className="text-secondary bg-tertiary p-3 rounded-md">
          {formatDate(currentImage.created_at || currentImage.updated_at || "")}
        </p>
      </div>
    </div>
  );
};

export default ImageDetailsDates;
