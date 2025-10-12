import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useImages } from "../contexts/ImageContext";
import { useTag } from "../contexts/TagContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { ImageCard } from "../components";
import { ImageFile, ImageWithTags } from "../utils/database";
import GallerySearch from "../components/GallerySearch";

interface Props {}

const GalleryPage: React.FC<Props> = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { images, isLoading, scanImages, selectImage } = useImages();
  const { selectedTagIds, getFilteredImages, filterMode } = useTag();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExtension, setSelectedExtension] = useState("all");
  const [filteredImages, setFilteredImages] = useState<ImageWithTags[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);

  // Load filtered images when tag selection or filter mode changes
  useEffect(() => {
    const loadFilteredImages = async () => {
      setIsLoadingFiltered(true);
      try {
        const filtered = await getFilteredImages();
        setFilteredImages(filtered);
      } catch (error) {
        console.error("Failed to load filtered images:", error);
        setFilteredImages([]);
      } finally {
        setIsLoadingFiltered(false);
      }
    };

    if (currentWorkspace) {
      loadFilteredImages();
    }
  }, [selectedTagIds, filterMode, getFilteredImages, currentWorkspace]);

  // Apply additional filters (search and extension) to the tag-filtered images
  const finalFilteredImages = filteredImages.filter((image) => {
    const matchesSearch =
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.relative_path.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExtension =
      selectedExtension === "all" || image.extension === selectedExtension;

    return matchesSearch && matchesExtension;
  });

  const handleImageClick = (image: ImageFile) => {
    selectImage(image);
    navigate(`/gallery/image/${encodeURIComponent(image.relative_path)}`);
  };

  const handleRescan = async () => {
    try {
      await scanImages();
    } catch (error) {
      console.error("Failed to rescan images:", error);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please open a workspace to view images.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gallery
        </h1>
        <button
          onClick={handleRescan}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Scanning..." : "Rescan Images"}
        </button>
      </div>

      {/* Search, Filter, and Tag Controls */}
      <GallerySearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedExtension={selectedExtension}
        setSelectedExtension={setSelectedExtension}
      />

      {/* Image Stats */}
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Showing {finalFilteredImages.length} of {images.length} images
        {searchTerm && <span> • Search: "{searchTerm}"</span>}
        {selectedExtension !== "all" && (
          <span> • Format: {selectedExtension.toUpperCase()}</span>
        )}
        {selectedTagIds.length > 0 && (
          <span>
            {" "}
            • Tags: {selectedTagIds.length} selected ({filterMode.toUpperCase()}
            )
          </span>
        )}
      </div>

      {/* Loading State */}
      {(isLoading || isLoadingFiltered) && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            Loading images...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && images.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No images found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This workspace doesn't contain any supported image files.
          </p>
          <button
            onClick={handleRescan}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Scan for Images
          </button>
        </div>
      )}

      {/* No Results State */}
      {!isLoading &&
        !isLoadingFiltered &&
        images.length > 0 &&
        finalFilteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No images match your filters
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms, tags, or filters.
            </p>
          </div>
        )}

      {/* Image Grid */}
      {!isLoading && !isLoadingFiltered && finalFilteredImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {finalFilteredImages.map((image) => (
            <ImageCard
              key={image.relative_path}
              image={image}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
