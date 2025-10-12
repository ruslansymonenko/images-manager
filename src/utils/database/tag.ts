import { BaseDatabaseManager } from "./base";
import {
  Tag,
  ImageTag,
  ImageWithTags,
  TagWithImageCount,
  ImageFile,
} from "./types";

/**
 * Tag domain manager - handles all tag-related database operations
 */
export class TagManager extends BaseDatabaseManager {
  async createTag(
    tag: Omit<Tag, "id" | "created_at" | "updated_at">
  ): Promise<number> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const result = await this.workspaceDb.execute(
        `INSERT INTO tags (name, color, created_at, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [tag.name, tag.color || null]
      );

      console.log("Tag created successfully:", result);
      return result.lastInsertId as number;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  }

  async getAllTags(): Promise<Tag[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const tags = await this.workspaceDb.select<Tag[]>(
        "SELECT * FROM tags ORDER BY name"
      );
      return tags;
    } catch (error) {
      console.error("Failed to get tags:", error);
      throw error;
    }
  }

  async getAllTagsWithImageCount(): Promise<TagWithImageCount[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const tags = await this.workspaceDb.select<TagWithImageCount[]>(
        `SELECT t.*, COUNT(it.image_id) as image_count
         FROM tags t
         LEFT JOIN image_tags it ON t.id = it.tag_id
         GROUP BY t.id
         ORDER BY t.name`
      );
      return tags;
    } catch (error) {
      console.error("Failed to get tags with image count:", error);
      throw error;
    }
  }

  async getTagById(id: number): Promise<Tag | null> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const tags = await this.workspaceDb.select<Tag[]>(
        "SELECT * FROM tags WHERE id = ?",
        [id]
      );
      return tags.length > 0 ? tags[0] : null;
    } catch (error) {
      console.error("Failed to get tag by ID:", error);
      throw error;
    }
  }

  async updateTag(
    id: number,
    updates: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>
  ): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const setParts = [];
      const values = [];

      if (updates.name !== undefined) {
        setParts.push("name = ?");
        values.push(updates.name);
      }

      if (updates.color !== undefined) {
        setParts.push("color = ?");
        values.push(updates.color);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      setParts.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      await this.workspaceDb.execute(
        `UPDATE tags SET ${setParts.join(", ")} WHERE id = ?`,
        values
      );

      console.log("Tag updated successfully");
    } catch (error) {
      console.error("Failed to update tag:", error);
      throw error;
    }
  }

  async deleteTag(id: number): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // First, delete all image-tag associations
      await this.workspaceDb.execute(
        "DELETE FROM image_tags WHERE tag_id = ?",
        [id]
      );

      // Then, delete the tag itself
      await this.workspaceDb.execute("DELETE FROM tags WHERE id = ?", [id]);

      console.log("Tag deleted successfully");
    } catch (error) {
      console.error("Failed to delete tag:", error);
      throw error;
    }
  }

  async addTagToImage(imageId: number, tagId: number): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // Check if the association already exists
      const existing = await this.workspaceDb.select<ImageTag[]>(
        "SELECT * FROM image_tags WHERE image_id = ? AND tag_id = ?",
        [imageId, tagId]
      );

      if (existing.length > 0) {
        return; // Association already exists
      }

      await this.workspaceDb.execute(
        `INSERT INTO image_tags (image_id, tag_id, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [imageId, tagId]
      );

      console.log("Tag added to image successfully");
    } catch (error) {
      console.error("Failed to add tag to image:", error);
      throw error;
    }
  }

  async removeTagFromImage(imageId: number, tagId: number): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      await this.workspaceDb.execute(
        "DELETE FROM image_tags WHERE image_id = ? AND tag_id = ?",
        [imageId, tagId]
      );

      console.log("Tag removed from image successfully");
    } catch (error) {
      console.error("Failed to remove tag from image:", error);
      throw error;
    }
  }

  async getTagsForImage(imageId: number): Promise<Tag[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const tags = await this.workspaceDb.select<Tag[]>(
        `SELECT t.* FROM tags t
         INNER JOIN image_tags it ON t.id = it.tag_id
         WHERE it.image_id = ?
         ORDER BY t.name`,
        [imageId]
      );
      return tags;
    } catch (error) {
      console.error("Failed to get tags for image:", error);
      throw error;
    }
  }

  async getAllImagesWithTags(): Promise<ImageWithTags[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // First get all images
      const images = await this.workspaceDb.select<ImageFile[]>(
        "SELECT * FROM images ORDER BY name"
      );

      // Then get tags for each image
      const imagesWithTags: ImageWithTags[] = [];
      for (const image of images) {
        const tags = await this.getTagsForImage(image.id!);
        imagesWithTags.push({ ...image, tags });
      }

      return imagesWithTags;
    } catch (error) {
      console.error("Failed to get images with tags:", error);
      throw error;
    }
  }

  async getImagesByTags(tagIds: number[]): Promise<ImageWithTags[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    if (tagIds.length === 0) {
      return this.getAllImagesWithTags();
    }

    try {
      // Build query for images that have ALL specified tags
      const placeholders = tagIds.map(() => "?").join(",");
      const images = await this.workspaceDb.select<ImageFile[]>(
        `SELECT DISTINCT i.* FROM images i
         INNER JOIN image_tags it ON i.id = it.image_id
         WHERE it.tag_id IN (${placeholders})
         GROUP BY i.id
         HAVING COUNT(DISTINCT it.tag_id) = ?
         ORDER BY i.name`,
        [...tagIds, tagIds.length]
      );

      // Get tags for each image
      const imagesWithTags: ImageWithTags[] = [];
      for (const image of images) {
        const tags = await this.getTagsForImage(image.id!);
        imagesWithTags.push({ ...image, tags });
      }

      return imagesWithTags;
    } catch (error) {
      console.error("Failed to get images by tags:", error);
      throw error;
    }
  }

  async getImagesByTagsOr(tagIds: number[]): Promise<ImageWithTags[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    if (tagIds.length === 0) {
      return this.getAllImagesWithTags();
    }

    try {
      const placeholders = tagIds.map(() => "?").join(",");
      const images = await this.workspaceDb.select<ImageFile[]>(
        `SELECT DISTINCT i.* FROM images i
         INNER JOIN image_tags it ON i.id = it.image_id
         WHERE it.tag_id IN (${placeholders})
         ORDER BY i.name`,
        tagIds
      );

      // Get tags for each image
      const imagesWithTags: ImageWithTags[] = [];
      for (const image of images) {
        const tags = await this.getTagsForImage(image.id!);
        imagesWithTags.push({ ...image, tags });
      }

      return imagesWithTags;
    } catch (error) {
      console.error("Failed to get images by tags (OR):", error);
      throw error;
    }
  }

  async searchTags(query: string): Promise<Tag[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const tags = await this.workspaceDb.select<Tag[]>(
        "SELECT * FROM tags WHERE name LIKE ? ORDER BY name",
        [`%${query}%`]
      );
      return tags;
    } catch (error) {
      console.error("Failed to search tags:", error);
      throw error;
    }
  }

  async tagNameExists(name: string, excludeId?: number): Promise<boolean> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      let query =
        "SELECT COUNT(*) as count FROM tags WHERE LOWER(name) = LOWER(?)";
      const params: any[] = [name];

      if (excludeId !== undefined) {
        query += " AND id != ?";
        params.push(excludeId);
      }

      const result = await this.workspaceDb.select<{ count: number }[]>(
        query,
        params
      );
      return result[0].count > 0;
    } catch (error) {
      console.error("Failed to check if tag name exists:", error);
      throw error;
    }
  }
}
