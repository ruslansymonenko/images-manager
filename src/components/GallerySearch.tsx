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
      <div className="bg-tertiary p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-primary">Filter by Tags</h3>
          {selectedTagIds.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-secondary">Mode:</label>
                <select
                  value={filterMode}
                  onChange={(e) =>
                    setFilterMode(e.target.value as "and" | "or")
                  }
                  className="text-xs input-base"
                >
                  <option value="and">AND (all tags)</option>
                  <option value="or">OR (any tag)</option>
                </select>
              </div>
              <button
                onClick={clearTagFilter}
                className="text-xs hover:underline"
                style={{ color: "var(--color-interactive-primary)" }}
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
            className="w-full input-base"
          />
        </div>
        <div className="w-48">
          <select
            value={selectedExtension}
            onChange={(e) => setSelectedExtension(e.target.value)}
            className="w-full input-base"
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
