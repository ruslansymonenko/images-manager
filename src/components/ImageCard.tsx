import React, { useState, useEffect } from "react";
import { ImageFile } from "../utils/database";
import { useImages } from "../contexts/ImageContext";

interface ImageCardProps {
  image: ImageFile;
  onImageClick: (image: ImageFile) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onImageClick }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const { getImageAsBase64 } = useImages();

  useEffect(() => {
    const loadImageSrc = async () => {
      try {
        const base64Src = await getImageAsBase64(image.relative_path);
        setImageSrc(base64Src);
        setImageError(false);
      } catch (error) {
        console.error("Failed to load image source:", error);
        setImageError(true);
      }
    };

    loadImageSrc();
  }, [image.relative_path, getImageAsBase64]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const handleClick = () => {
    onImageClick(image);
  };

  return (
    <div
      className="card cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="aspect-square relative bg-tertiary">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-tertiary">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={image.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-primary truncate mb-2">{image.name}</h3>

        <div className="space-y-1 text-sm text-secondary">
          <p className="truncate" title={image.relative_path}>
            {image.relative_path}
          </p>
          <div className="flex justify-between">
            <span>{formatFileSize(image.file_size)}</span>
            <span className="uppercase">{image.extension}</span>
          </div>
          <p>Modified: {formatDate(image.modified_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
