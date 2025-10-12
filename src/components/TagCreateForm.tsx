import React from "react";

interface Props {
  newTagName: string;
  setNewTagName: (name: string) => void;
  newTagColor: string;
  setNewTagColor: (color: string) => void;
  createError: string | null;
  isCreating: boolean;
  handleCreateTag: () => Promise<void>;
  handleCancelCreate: () => void;
}

const ComponentName: React.FC<Props> = ({
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  createError,
  isCreating,
  handleCreateTag,
  handleCancelCreate,
}) => {
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

  return (
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
  );
};

export default ComponentName;
