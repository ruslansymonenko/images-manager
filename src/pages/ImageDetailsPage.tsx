import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useImages } from "../contexts/ImageContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { convertFileSrc } from "@tauri-apps/api/core";

const ImageDetailsPage: React.FC = () => {
  const { imagePath } = useParams<{ imagePath: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const {
    images,
    selectedImage,
    selectImage,
    getImageAbsolutePath,
    renameImage,
    deleteImage,
  } = useImages();

  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the current image based on the URL parameter
  const decodedPath = imagePath ? decodeURIComponent(imagePath) : "";
  const currentImage =
    selectedImage || images.find((img) => img.relative_path === decodedPath);

  useEffect(() => {
    if (currentImage && currentImage !== selectedImage) {
      selectImage(currentImage);
    }
  }, [currentImage, selectedImage, selectImage]);

  useEffect(() => {
    const loadImageSrc = async () => {
      if (!currentImage) return;

      try {
        const absolutePath = await getImageAbsolutePath(
          currentImage.relative_path
        );
        const tauriSrc = convertFileSrc(absolutePath);
        setImageSrc(tauriSrc);
        setImageError(false);
      } catch (error) {
        console.error("Failed to load image source:", error);
        setImageError(true);
      }
    };

    loadImageSrc();
  }, [currentImage, getImageAbsolutePath]);

  useEffect(() => {
    if (currentImage) {
      setNewName(currentImage.name);
    }
  }, [currentImage]);

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Image Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please open a workspace to view image details.
        </p>
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Image Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The requested image could not be found.
        </p>
        <button
          onClick={() => navigate("/gallery")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

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
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === currentImage.name) {
      setIsEditing(false);
      setNewName(currentImage.name);
      return;
    }

    try {
      await renameImage(
        currentImage.name,
        newName.trim(),
        currentImage.relative_path
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename image:", error);
      alert("Failed to rename image. Please try again.");
      setNewName(currentImage.name);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${currentImage.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteImage(currentImage.relative_path);
      navigate("/gallery");
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNewName(currentImage.name);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/gallery")}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Image Details
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Display */}
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {imageError ? (
              <div className="w-full h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
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
                  <p>Unable to load image</p>
                </div>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={currentImage.name}
                className="w-full h-auto max-h-96 object-contain"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>

        {/* Image Information */}
        <div className="space-y-6">
          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Name
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(currentImage.name);
                  }}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {currentImage.name}
              </p>
            )}
          </div>

          {/* File Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Path
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-md break-all">
              {currentImage.relative_path}
            </p>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File Size
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {formatFileSize(currentImage.file_size)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md uppercase">
                {currentImage.extension}
              </p>
            </div>
          </div>

          {/* Dates */}
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
                {formatDate(
                  currentImage.created_at || currentImage.updated_at || ""
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailsPage;
