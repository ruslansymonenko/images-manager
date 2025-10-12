import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Tag, TagWithImageCount, ImageWithTags } from "../utils/database";
import { useWorkspace } from "./WorkspaceContext";
import databaseManager from "../utils/database";

interface TagContextType {
  // Tag state
  tags: Tag[];
  tagsWithImageCount: TagWithImageCount[];
  isLoading: boolean;
  error: string | null;

  // Tag management
  loadTags: () => Promise<void>;
  createTag: (
    tag: Omit<Tag, "id" | "created_at" | "updated_at">
  ) => Promise<number>;
  updateTag: (
    id: number,
    updates: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>
  ) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  searchTags: (query: string) => Promise<Tag[]>;
  tagNameExists: (name: string, excludeId?: number) => Promise<boolean>;

  // Image-tag associations
  getTagsForImage: (imageId: number) => Promise<Tag[]>;
  addTagToImage: (imageId: number, tagId: number) => Promise<void>;
  removeTagFromImage: (imageId: number, tagId: number) => Promise<void>;

  // Filtering
  selectedTagIds: number[];
  setSelectedTagIds: (tagIds: number[]) => void;
  filterMode: "and" | "or";
  setFilterMode: (mode: "and" | "or") => void;
  getFilteredImages: () => Promise<ImageWithTags[]>;
  clearTagFilter: () => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const useTag = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTag must be used within a TagProvider");
  }
  return context;
};

interface TagProviderProps {
  children: React.ReactNode;
}

export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const { currentWorkspace } = useWorkspace();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsWithImageCount, setTagsWithImageCount] = useState<
    TagWithImageCount[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<"and" | "or">("and");

  const loadTags = useCallback(async () => {
    if (!currentWorkspace) {
      setTags([]);
      setTagsWithImageCount([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [allTags, tagsWithCount] = await Promise.all([
        databaseManager.getAllTags(),
        databaseManager.getAllTagsWithImageCount(),
      ]);

      setTags(allTags);
      setTagsWithImageCount(tagsWithCount);
    } catch (err) {
      console.error("Failed to load tags:", err);
      setError(err instanceof Error ? err.message : "Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  const createTag = useCallback(
    async (
      tag: Omit<Tag, "id" | "created_at" | "updated_at">
    ): Promise<number> => {
      if (!currentWorkspace) {
        throw new Error("No workspace available");
      }

      try {
        const tagId = await databaseManager.createTag(tag);
        await loadTags(); // Refresh tags after creation
        return tagId;
      } catch (err) {
        console.error("Failed to create tag:", err);
        throw err;
      }
    },
    [currentWorkspace, loadTags]
  );

  const updateTag = useCallback(
    async (
      id: number,
      updates: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>
    ): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error("No workspace available");
      }

      try {
        await databaseManager.updateTag(id, updates);
        await loadTags(); // Refresh tags after update
      } catch (err) {
        console.error("Failed to update tag:", err);
        throw err;
      }
    },
    [currentWorkspace, loadTags]
  );

  const deleteTag = useCallback(
    async (id: number): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error("No workspace available");
      }

      try {
        await databaseManager.deleteTag(id);
        await loadTags(); // Refresh tags after deletion

        // Remove the deleted tag from selected tags if it was selected
        setSelectedTagIds((prev) => prev.filter((tagId) => tagId !== id));
      } catch (err) {
        console.error("Failed to delete tag:", err);
        throw err;
      }
    },
    [currentWorkspace, loadTags]
  );

  const searchTags = useCallback(
    async (query: string): Promise<Tag[]> => {
      if (!currentWorkspace) {
        return [];
      }

      try {
        return await databaseManager.searchTags(query);
      } catch (err) {
        console.error("Failed to search tags:", err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  const tagNameExists = useCallback(
    async (name: string, excludeId?: number): Promise<boolean> => {
      if (!currentWorkspace) {
        return false;
      }

      try {
        return await databaseManager.tagNameExists(name, excludeId);
      } catch (err) {
        console.error("Failed to check tag name:", err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  const getTagsForImage = useCallback(
    async (imageId: number): Promise<Tag[]> => {
      if (!currentWorkspace) {
        return [];
      }

      try {
        return await databaseManager.getTagsForImage(imageId);
      } catch (err) {
        console.error("Failed to get tags for image:", err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  const addTagToImage = useCallback(
    async (imageId: number, tagId: number): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error("No workspace available");
      }

      try {
        await databaseManager.addTagToImage(imageId, tagId);
        await loadTags(); // Refresh to update tag counts
      } catch (err) {
        console.error("Failed to add tag to image:", err);
        throw err;
      }
    },
    [currentWorkspace, loadTags]
  );

  const removeTagFromImage = useCallback(
    async (imageId: number, tagId: number): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error("No workspace available");
      }

      try {
        await databaseManager.removeTagFromImage(imageId, tagId);
        await loadTags(); // Refresh to update tag counts
      } catch (err) {
        console.error("Failed to remove tag from image:", err);
        throw err;
      }
    },
    [currentWorkspace, loadTags]
  );

  const getFilteredImages = useCallback(async (): Promise<ImageWithTags[]> => {
    if (!currentWorkspace) {
      return [];
    }

    try {
      if (selectedTagIds.length === 0) {
        return await databaseManager.getAllImagesWithTags();
      }

      if (filterMode === "and") {
        return await databaseManager.getImagesByTags(selectedTagIds);
      } else {
        return await databaseManager.getImagesByTagsOr(selectedTagIds);
      }
    } catch (err) {
      console.error("Failed to get filtered images:", err);
      throw err;
    }
  }, [currentWorkspace, selectedTagIds, filterMode]);

  const clearTagFilter = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  // Load tags when workspace changes
  useEffect(() => {
    loadTags();
    setSelectedTagIds([]); // Clear tag filters when workspace changes
  }, [loadTags]);

  const contextValue: TagContextType = {
    tags,
    tagsWithImageCount,
    isLoading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    searchTags,
    tagNameExists,
    getTagsForImage,
    addTagToImage,
    removeTagFromImage,
    selectedTagIds,
    setSelectedTagIds,
    filterMode,
    setFilterMode,
    getFilteredImages,
    clearTagFilter,
  };

  return (
    <TagContext.Provider value={contextValue}>{children}</TagContext.Provider>
  );
};
