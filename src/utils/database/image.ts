import { invoke } from "@tauri-apps/api/core";
import { BaseDatabaseManager } from "./base";
import { ImageFile } from "./types";

/**
 * Image domain manager - handles all image-related database operations
 */
export class ImageManager extends BaseDatabaseManager {
  async scanAndStoreImages(workspacePath: string): Promise<ImageFile[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const scannedImages: ImageFile[] = await invoke("scan_images", {
        workspacePath: workspacePath,
      });

      await this.workspaceDb.execute("DELETE FROM images");

      for (const image of scannedImages) {
        await this.workspaceDb.execute(
          `INSERT INTO images (name, relative_path, file_size, extension, modified_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            image.name,
            image.relative_path,
            image.file_size,
            image.extension,
            image.modified_at,
          ]
        );
      }

      console.log(`Stored ${scannedImages.length} images in database`);
      return scannedImages;
    } catch (error) {
      console.error("Failed to scan and store images:", error);
      throw error;
    }
  }

  async getAllImages(): Promise<ImageFile[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const images = await this.workspaceDb.select<ImageFile[]>(
        "SELECT * FROM images ORDER BY name"
      );
      return images;
    } catch (error) {
      console.error("Failed to get images:", error);
      throw error;
    }
  }

  async getImageByPath(relativePath: string): Promise<ImageFile | null> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const images = await this.workspaceDb.select<ImageFile[]>(
        "SELECT * FROM images WHERE relative_path = ?",
        [relativePath]
      );
      return images.length > 0 ? images[0] : null;
    } catch (error) {
      console.error("Failed to get image by path:", error);
      throw error;
    }
  }
  async updateImagePath(oldPath: string, newPath: string): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      await this.workspaceDb.execute(
        `UPDATE images SET 
         relative_path = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE relative_path = ?`,
        [newPath, oldPath]
      );
    } catch (error) {
      console.error("Failed to update image path:", error);
      throw error;
    }
  }

  async updateImageName(
    relativePath: string,
    newName: string,
    newPath: string
  ): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      await this.workspaceDb.execute(
        `UPDATE images SET 
         name = ?, 
         relative_path = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE relative_path = ?`,
        [newName, newPath, relativePath]
      );
    } catch (error) {
      console.error("Failed to update image name:", error);
      throw error;
    }
  }

  async deleteImageFromDb(relativePath: string): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      await this.workspaceDb.execute(
        "DELETE FROM images WHERE relative_path = ?",
        [relativePath]
      );
    } catch (error) {
      console.error("Failed to delete image from database:", error);
      throw error;
    }
  }

  async moveImage(
    oldPath: string,
    newPath: string,
    workspacePath: string
  ): Promise<string> {
    try {
      const newRelativePath: string = await invoke("move_image", {
        request: {
          old_path: oldPath,
          new_path: newPath,
          workspace_path: workspacePath,
        },
      });

      await this.updateImagePath(oldPath, newRelativePath);
      return newRelativePath;
    } catch (error) {
      console.error("Failed to move image:", error);
      throw error;
    }
  }

  async renameImage(
    oldName: string,
    newName: string,
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    try {
      const newRelativePath: string = await invoke("rename_image", {
        request: {
          old_name: oldName,
          new_name: newName,
          relative_path: relativePath,
          workspace_path: workspacePath,
        },
      });

      await this.updateImageName(relativePath, newName, newRelativePath);
      return newRelativePath;
    } catch (error) {
      console.error("Failed to rename image:", error);
      throw error;
    }
  }

  async deleteImage(
    relativePath: string,
    workspacePath: string
  ): Promise<void> {
    try {
      await invoke("delete_image", {
        relativePath: relativePath,
        workspacePath: workspacePath,
      });

      await this.deleteImageFromDb(relativePath);
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  }

  async getImageAbsolutePath(
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    try {
      return await invoke("get_image_absolute_path", {
        relativePath: relativePath,
        workspacePath: workspacePath,
      });
    } catch (error) {
      console.error("Failed to get image absolute path:", error);
      throw error;
    }
  }

  async getImageAsBase64(
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    try {
      return await invoke("get_image_as_base64", {
        relativePath: relativePath,
        workspacePath: workspacePath,
      });
    } catch (error) {
      console.error("Failed to get image as base64:", error);
      throw error;
    }
  }
}
