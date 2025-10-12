import React from "react";
import { Tag } from "../utils/database";
import TagChip from "./TagChip";
import TagSelector from "./TagSelector";

interface Props {
  imageTags: Tag[];
  isLoadingTags: boolean;
  handleTagsChange: (tags: Tag[]) => void;
  handleRemoveTag: (tag: Tag) => void;
}

const ImageDetailsTags: React.FC<Props> = ({
  imageTags,
  isLoadingTags,
  handleTagsChange,
  handleRemoveTag,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>

        {isLoadingTags ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            Loading tags...
          </div>
        ) : (
          <>
            {/* Current Tags */}
            {imageTags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {imageTags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      tag={tag}
                      removable
                      onRemove={() => handleRemoveTag(tag)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tag Selector */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <TagSelector
                selectedTags={imageTags}
                onTagsChange={handleTagsChange}
                placeholder="Add tags to this image..."
                allowCreate={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageDetailsTags;
