import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Tag } from "../utils/database";
import { useTag } from "../contexts/TagContext";
import TagChip from "./TagChip";

interface TagSelectorProps {
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  placeholder?: string;
  multiple?: boolean;
  allowCreate?: boolean;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags = [],
  onTagsChange,
  placeholder = "Search and select tags...",
  multiple = true,
  allowCreate = false,
  className = "",
}) => {
  const { tags, searchTags, createTag, selectedTagIds, setSelectedTagIds } =
    useTag();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use either controlled selectedTags or context selectedTagIds
  const currentSelectedTags =
    selectedTags.length > 0
      ? selectedTags
      : tags.filter((tag) => selectedTagIds.includes(tag.id!));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchTags(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to search tags:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults(tags);
      }
    };

    performSearch();
  }, [searchQuery, tags, searchTags]);

  const handleTagSelect = (tag: Tag) => {
    if (!tag.id) return;

    if (multiple) {
      const isSelected = currentSelectedTags.some((t) => t.id === tag.id);
      let newSelectedTags: Tag[];

      if (isSelected) {
        newSelectedTags = currentSelectedTags.filter((t) => t.id !== tag.id);
      } else {
        newSelectedTags = [...currentSelectedTags, tag];
      }

      if (onTagsChange) {
        onTagsChange(newSelectedTags);
      } else {
        // Update context
        setSelectedTagIds(newSelectedTags.map((t) => t.id!));
      }
    } else {
      if (onTagsChange) {
        onTagsChange([tag]);
      } else {
        setSelectedTagIds([tag.id]);
      }
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleTagRemove = (tagToRemove: Tag) => {
    if (!tagToRemove.id) return;

    const newSelectedTags = currentSelectedTags.filter(
      (t) => t.id !== tagToRemove.id
    );

    if (onTagsChange) {
      onTagsChange(newSelectedTags);
    } else {
      setSelectedTagIds(newSelectedTags.map((t) => t.id!));
    }
  };

  const handleCreateTag = async () => {
    if (!searchQuery.trim() || !allowCreate) return;

    setIsCreating(true);
    try {
      const tagId = await createTag({
        name: searchQuery.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
      });

      const newTag: Tag = {
        id: tagId,
        name: searchQuery.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };

      handleTagSelect(newTag);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const clearSelection = () => {
    if (onTagsChange) {
      onTagsChange([]);
    } else {
      setSelectedTagIds([]);
    }
  };

  const filteredResults = searchResults.filter(
    (tag) => !currentSelectedTags.some((selected) => selected.id === tag.id)
  );

  const canCreateTag =
    allowCreate &&
    searchQuery.trim() &&
    !searchResults.some(
      (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
    );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display */}
      {currentSelectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {currentSelectedTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              removable
              onRemove={() => handleTagRemove(tag)}
              size="sm"
            />
          ))}
          {multiple && (
            <button
              onClick={clearSelection}
              className="text-xs text-secondary  ml-1"
              title="Clear all tags"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border rounded-md bg-white dark:bg-gray-800 text-secondary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 "
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-elevated shadow-lg max-h-60 overflow-auto">
          {canCreateTag && (
            <button
              onClick={handleCreateTag}
              disabled={isCreating}
              className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : `Create "${searchQuery}"`}
            </button>
          )}

          {filteredResults.length === 0 && !canCreateTag ? (
            <div className="px-3 py-2 text-sm text-secondary">
              {searchQuery ? "No tags found" : "No available tags"}
            </div>
          ) : (
            filteredResults.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color || "#6b7280" }}
                />
                <span className="text-secondary">{tag.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
