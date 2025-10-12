import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useImages } from "../contexts/ImageContext";
import { useTag } from "../contexts/TagContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { ImageCard, TagSelector, TagChip } from "../components";
import { ImageFile, ImageWithTags } from "../utils/database";

interface Props {}

const GalleryPage: React.FC<Props> = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { images, isLoading, scanImages, selectImage } = useImages();
  const {
    selectedTagIds,
    tags,
    getFilteredImages,
    filterMode,
    setFilterMode,
    clearTagFilter,
  } = useTag();

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

  // Get unique extensions from all images (not just filtered)
  const uniqueExtensions = Array.from(
    new Set(images.map((img) => img.extension))
  ).sort();

  // Get selected tags for display
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id!));

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
      <div className="mb-6 space-y-4">
        {/* Tag Filter Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Tags
            </h3>
            {selectedTagIds.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Mode:
                  </label>
                  <select
                    value={filterMode}
                    onChange={(e) =>
                      setFilterMode(e.target.value as "and" | "or")
                    }
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="and">AND (all tags)</option>
                    <option value="or">OR (any tag)</option>
                  </select>
                </div>
                <button
                  onClick={clearTagFilter}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <TagSelector placeholder="Select tags to filter images..." />

          {selectedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Search and Extension Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedExtension}
              onChange={(e) => setSelectedExtension(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All formats</option>
              {uniqueExtensions.map((ext) => (
                <option key={ext} value={ext}>
                  {ext.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
