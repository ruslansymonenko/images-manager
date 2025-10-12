import React, { useState } from "react";
import { Edit2, Trash2, Save, X } from "lucide-react";
import { Tag, TagWithImageCount } from "../utils/database";
import { useTag } from "../contexts/TagContext";

interface TagManagerProps {
  tag: TagWithImageCount;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  className?: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  tag,
  onEdit,
  onDelete,
  className = "",
}) => {
  const { updateTag, deleteTag, tagNameExists } = useTag();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.color || "#6b7280");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSave = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setError("Tag name cannot be empty");
      return;
    }

    if (trimmedName !== tag.name) {
      const exists = await tagNameExists(trimmedName, tag.id);
      if (exists) {
        setError("A tag with this name already exists");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateTag(tag.id!, {
        name: trimmedName,
        color: editColor,
      });

      setIsEditing(false);
      if (onEdit) {
        onEdit({ ...tag, name: trimmedName, color: editColor });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditName(tag.name);
    setEditColor(tag.color || "#6b7280");
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the tag "${tag.name}"? This will remove it from all ${tag.image_count} images.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteTag(tag.id!);
      if (onDelete) {
        onDelete(tag);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tag");
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setEditName(tag.name);
    setEditColor(tag.color || "#6b7280");
    setError(null);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-lg bg-tertiary ${className}`}>
        <div className="space-y-3">
          {error && <div className="text-sm bg-error p-2 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Tag Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2  rounded-md bg-tertiary text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tag name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm text-secondary">{editColor}</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setEditColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    editColor === color ? "scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !editName.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Save className="w-3 h-3" />
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg bg-tertiary hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: tag.color || "#6b7280" }}
          />
          <div>
            <h3 className="font-medium text-primary">{tag.name}</h3>
            <p className="text-sm text-secondary">
              {tag.image_count} {tag.image_count === 1 ? "image" : "images"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleStartEdit}
            disabled={isLoading}
            className="p-2 text-primary rounded transition-colors"
            title="Edit tag"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 text-primary rounded transition-colors"
            title="Delete tag"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <div className="mt-2 text-sm text-error">{error}</div>}
    </div>
  );
};

export default TagManager;
