import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useImages } from "../contexts/ImageContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useTag } from "../contexts/TagContext";
import { useConnections } from "../contexts/ConnectionContext";
import { Tag } from "../utils/database";
import ImageDetailsTags from "../components/ImageDetailsTags";
import ImageDetailsDates from "../components/ImageDetailsDates";
import { ImageConnections } from "../components";

const ImageDetailsPage: React.FC = () => {
  const { imagePath } = useParams<{ imagePath: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { images, selectImage, getImageAsBase64, renameImage, deleteImage } =
    useImages();
  const { getTagsForImage, addTagToImage, removeTagFromImage } = useTag();
  const { clearImageConnectionsCache } = useConnections();

  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageTags, setImageTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Find the current image based on the URL parameter
  const decodedPath = imagePath ? decodeURIComponent(imagePath) : "";
  const currentImage = images.find((img) => img.relative_path === decodedPath);

  // If image was renamed and URL doesn't match, try to find by old reference
  // This helps when navigating after a rename operation
  const fallbackImage = !currentImage
    ? images.find(
        (img) => img.name === newName && img.relative_path !== decodedPath
      )
    : null;

  const imageToDisplay = currentImage || fallbackImage;

  useEffect(() => {
    if (imageToDisplay) {
      selectImage(imageToDisplay);
    }
  }, [imageToDisplay, selectImage]);

  useEffect(() => {
    const loadImageSrc = async () => {
      if (!imageToDisplay) return;

      try {
        const base64Src = await getImageAsBase64(imageToDisplay.relative_path);
        setImageSrc(base64Src);
        setImageError(false);
      } catch (error) {
        console.error("Failed to load image source:", error);
        setImageError(true);
      }
    };

    loadImageSrc();
  }, [imageToDisplay, getImageAsBase64]);

  useEffect(() => {
    if (imageToDisplay) {
      setNewName(imageToDisplay.name);
      loadImageTags();
    }
  }, [imageToDisplay]);

  // Update URL if the current image's path changes (after rename)
  useEffect(() => {
    if (imageToDisplay && imageToDisplay.relative_path !== decodedPath) {
      navigate(
        `/gallery/image/${encodeURIComponent(imageToDisplay.relative_path)}`,
        { replace: true }
      );
    }
  }, [imageToDisplay?.relative_path, decodedPath, navigate]);

  const loadImageTags = async () => {
    if (!imageToDisplay?.id) return;

    setIsLoadingTags(true);
    try {
      const tags = await getTagsForImage(imageToDisplay.id);
      setImageTags(tags);
    } catch (error) {
      console.error("Failed to load image tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleTagsChange = async (tags: Tag[]) => {
    if (!imageToDisplay?.id) return;

    try {
      // Find tags to add and remove
      const currentTagIds = imageTags.map((tag) => tag.id!);
      const newTagIds = tags.map((tag) => tag.id!);

      const tagsToAdd = newTagIds.filter((id) => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter(
        (id) => !newTagIds.includes(id)
      );

      // Add new tags
      for (const tagId of tagsToAdd) {
        await addTagToImage(imageToDisplay.id, tagId);
      }

      // Remove tags
      for (const tagId of tagsToRemove) {
        await removeTagFromImage(imageToDisplay.id, tagId);
      }

      // Reload tags
      await loadImageTags();
    } catch (error) {
      console.error("Failed to update image tags:", error);
    }
  };

  const handleRemoveTag = async (tagToRemove: Tag) => {
    if (!imageToDisplay?.id || !tagToRemove.id) return;

    try {
      await removeTagFromImage(imageToDisplay.id, tagToRemove.id);
      await loadImageTags();
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

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

  if (!imageToDisplay) {
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

  const handleRename = async () => {
    if (!newName.trim() || newName === imageToDisplay.name) {
      setIsEditing(false);
      setNewName(imageToDisplay.name);
      return;
    }

    try {
      await renameImage(
        imageToDisplay.name,
        newName.trim(),
        imageToDisplay.relative_path
      );
      setIsEditing(false);
      
      // Clear connections cache for this image since the path may have changed
      if (imageToDisplay.id) {
        clearImageConnectionsCache(imageToDisplay.id);
      }
      
      // The URL will be updated automatically by the useEffect when the image state changes
    } catch (error) {
      console.error("Failed to rename image:", error);
      alert("Failed to rename image. Please try again.");
      setNewName(imageToDisplay.name);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${imageToDisplay.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Clear connections cache for this image before deletion
      if (imageToDisplay.id) {
        clearImageConnectionsCache(imageToDisplay.id);
      }
      
      await deleteImage(imageToDisplay.relative_path);
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
      setNewName(imageToDisplay.name);
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
                alt={imageToDisplay.name}
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
                    setNewName(imageToDisplay.name);
                  }}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {imageToDisplay.name}
              </p>
            )}
          </div>

          {/* File Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Path
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-md break-all">
              {imageToDisplay.relative_path}
            </p>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File Size
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {formatFileSize(imageToDisplay.file_size)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md uppercase">
                {imageToDisplay.extension}
              </p>
            </div>
          </div>

          {/* Dates */}
          <ImageDetailsDates currentImage={imageToDisplay} />

          {/* Tags */}
          <ImageDetailsTags
            imageTags={imageTags}
            isLoadingTags={isLoadingTags}
            handleTagsChange={handleTagsChange}
            handleRemoveTag={handleRemoveTag}
          />

          {/* Connections */}
          <ImageConnections currentImage={imageToDisplay} />
        </div>
      </div>
    </div>
  );
};

export default ImageDetailsPage;
