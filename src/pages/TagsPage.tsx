import React, { useState } from "react";
import { Plus, Search, Tag as TagIcon } from "lucide-react";
import { useTag } from "../contexts/TagContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { TagManager } from "../components";

interface Props {}

const TagsPage: React.FC<Props> = () => {
  const { currentWorkspace } = useWorkspace();
  const { tagsWithImageCount, isLoading, createTag, tagNameExists, loadTags } =
    useTag();

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const predefinedColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#6b7280",
    "#374151",
    "#111827",
  ];

  // Filter tags based on search
  const filteredTags = tagsWithImageCount.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      setCreateError("Tag name cannot be empty");
      return;
    }

    if (await tagNameExists(trimmedName)) {
      setCreateError("A tag with this name already exists");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      await createTag({
        name: trimmedName,
        color: newTagColor,
      });

      // Reset form
      setNewTagName("");
      setNewTagColor("#3b82f6");
      setShowCreateForm(false);

      // Refresh tags list
      await loadTags();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create tag"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setNewTagName("");
    setNewTagColor("#3b82f6");
    setCreateError(null);
    setShowCreateForm(false);
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Tags
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please open a workspace to manage tags.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tags Management
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Create New Tag
          </h3>

          {createError && (
            <div className="mb-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {createError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  disabled={isCreating}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {newTagColor}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      newTagColor === color
                        ? "border-gray-900 dark:border-gray-100 scale-110"
                        : "border-gray-300 dark:border-gray-600 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isCreating}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Tag"}
              </button>
              <button
                onClick={handleCancelCreate}
                disabled={isCreating}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Stats */}
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        {searchTerm
          ? `Showing ${filteredTags.length} of ${tagsWithImageCount.length} tags`
          : `${tagsWithImageCount.length} tags total`}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            Loading tags...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tagsWithImageCount.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <TagIcon className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No tags yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first tag to start organizing your images.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Tag
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading &&
        tagsWithImageCount.length > 0 &&
        filteredTags.length === 0 &&
        searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tags found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No tags match your search "{searchTerm}".
            </p>
          </div>
        )}

      {/* Tags Grid */}
      {!isLoading && filteredTags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <TagManager
              key={tag.id}
              tag={tag}
              onEdit={() => loadTags()}
              onDelete={() => loadTags()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsPage;
