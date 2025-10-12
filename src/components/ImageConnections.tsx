import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConnections } from "../contexts/ConnectionContext";
import { useImages } from "../contexts/ImageContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { ImageConnection, ImageFile } from "../utils/database/types";

interface Props {
  currentImage: ImageFile;
}

const ImageConnections: React.FC<Props> = ({ currentImage }) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { images, getImageAsBase64, selectImage } = useImages();
  const {
    getConnectionsForImage,
    createConnection,
    removeConnection,
    checkConnectionExists,
    isLoading,
    error,
  } = useConnections();

  const [connections, setConnections] = useState<ImageConnection[]>([]);
  const [availableImages, setAvailableImages] = useState<ImageFile[]>([]);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [connectionExists, setConnectionExists] = useState<
    Record<number, boolean>
  >({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>(
    {}
  );
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  useEffect(() => {
    if (currentImage?.id) {
      loadConnections();
    }
  }, [currentImage?.id]);

  useEffect(() => {
    // Filter out the current image from available images
    const filtered = images.filter((img) => img.id !== currentImage?.id);
    setAvailableImages(filtered);
  }, [images, currentImage?.id]);

  const loadConnections = async (forceRefresh: boolean = false) => {
    if (!currentImage?.id) return;

    setIsLoadingConnections(true);
    try {
      const imageConnections = await getConnectionsForImage(
        currentImage.id,
        forceRefresh
      );
      setConnections(imageConnections);
    } catch (error) {
      console.error("Failed to load connections:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const checkExistingConnections = async () => {
    if (!currentImage?.id) return;

    const connectionChecks: Record<number, boolean> = {};

    for (const image of availableImages) {
      if (image.id) {
        try {
          const exists = await checkConnectionExists(currentImage.id, image.id);
          connectionChecks[image.id] = exists;
        } catch (error) {
          console.error(
            `Failed to check connection for image ${image.id}:`,
            error
          );
          connectionChecks[image.id] = false;
        }
      }
    }

    setConnectionExists(connectionChecks);
  };

  const loadImagePreview = async (imageId: number, relativePath: string) => {
    if (!currentWorkspace || imagePreviews[imageId]) return;

    try {
      const base64Src = await getImageAsBase64(relativePath);
      setImagePreviews((prev) => ({
        ...prev,
        [imageId]: base64Src,
      }));
    } catch (error) {
      console.error(`Failed to load preview for image ${imageId}:`, error);
    }
  };

  useEffect(() => {
    if (showAddConnection) {
      checkExistingConnections();
    }
  }, [showAddConnection, availableImages, currentImage?.id]);

  useEffect(() => {
    // Load previews for connected images
    connections.forEach((conn) => {
      if (conn.connected_image.id) {
        loadImagePreview(
          conn.connected_image.id,
          conn.connected_image.relative_path
        );
      }
    });
  }, [connections]);

  const handleAddConnection = async () => {
    if (!currentImage?.id || !selectedImageId) return;

    try {
      await createConnection(currentImage.id, selectedImageId);
      setShowAddConnection(false);
      setSelectedImageId(null);
      // Force refresh connections from database
      await loadConnections(true);
    } catch (error) {
      console.error("Failed to add connection:", error);
    }
  };

  const handleRemoveConnection = async (connectedImageId: number) => {
    if (!currentImage?.id) return;

    if (!confirm("Are you sure you want to remove this connection?")) {
      return;
    }

    try {
      await removeConnection(currentImage.id, connectedImageId);
      // Force refresh connections from database
      await loadConnections(true);
    } catch (error) {
      console.error("Failed to remove connection:", error);
    }
  };

  const handleImageClick = (imagePath: string) => {
    // Clear the selected image from context before navigating
    selectImage(null);
    const encodedPath = encodeURIComponent(imagePath);
    navigate(`/gallery/image/${encodedPath}`);
  };

  const handleImagePreviewLoad = (imageId: number, relativePath: string) => {
    if (!imagePreviews[imageId]) {
      loadImagePreview(imageId, relativePath);
    }
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Connected Images
      </label>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoadingConnections ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-gray-500 dark:text-gray-400">
            Loading connections...
          </div>
        </div>
      ) : connections.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
          No connections yet
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {connections.map((connection) => (
            <div
              key={connection.connection_id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() =>
                  handleImageClick(connection.connected_image.relative_path)
                }
                onMouseEnter={() =>
                  handleImagePreviewLoad(
                    connection.connected_image.id!,
                    connection.connected_image.relative_path
                  )
                }
              >
                {imagePreviews[connection.connected_image.id!] ? (
                  <img
                    src={imagePreviews[connection.connected_image.id!]}
                    alt={connection.connected_image.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
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
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() =>
                    handleImageClick(connection.connected_image.relative_path)
                  }
                >
                  {connection.connected_image.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {connection.connected_image.relative_path}
                </p>
              </div>

              <button
                onClick={() =>
                  handleRemoveConnection(connection.connected_image.id!)
                }
                disabled={isLoading}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                title="Remove connection"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {!showAddConnection ? (
        <button
          onClick={() => setShowAddConnection(true)}
          disabled={availableImages.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {availableImages.length === 0
            ? "No other images available"
            : "Add Connection"}
        </button>
      ) : (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Connect to another image:
          </h4>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {availableImages.map((image) => (
              <div
                key={image.id}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedImageId === image.id
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${connectionExists[image.id!] ? "opacity-50" : ""}`}
                onClick={() =>
                  !connectionExists[image.id!] && setSelectedImageId(image.id!)
                }
              >
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    {image.name}
                  </p>
                  {connectionExists[image.id!] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Already connected
                    </p>
                  )}
                </div>

                {selectedImageId === image.id && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddConnection}
              disabled={!selectedImageId || isLoading}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Connecting..." : "Connect"}
            </button>
            <button
              onClick={() => {
                setShowAddConnection(false);
                setSelectedImageId(null);
              }}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageConnections;
