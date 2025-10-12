import React from "react";
import { useTag } from "../contexts/TagContext";
import TagSelector from "./TagSelector";
import TagChip from "./TagChip";
import { useImages } from "../contexts/ImageContext";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedExtension: string;
  setSelectedExtension: (value: string) => void;
}

const GallerySearch: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  selectedExtension,
  setSelectedExtension,
}) => {
  const { selectedTagIds, filterMode, setFilterMode, clearTagFilter, tags } =
    useTag();
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id!));
  const { images } = useImages();
  const uniqueExtensions = Array.from(
    new Set(images.map((img) => img.extension))
  ).sort();

  return (
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
  );
};

export default GallerySearch;
