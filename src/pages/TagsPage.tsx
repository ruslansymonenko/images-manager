import React, { useState } from "react";
import { Plus, Search, Tag as TagIcon } from "lucide-react";
import { useTag } from "../contexts/TagContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { TagManager } from "../components";
import TagCreateForm from "../components/TagCreateForm";

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
        <TagCreateForm
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          newTagColor={newTagColor}
          setNewTagColor={setNewTagColor}
          createError={createError}
          isCreating={isCreating}
          handleCreateTag={handleCreateTag}
          handleCancelCreate={handleCancelCreate}
        />
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
