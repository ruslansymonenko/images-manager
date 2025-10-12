import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";

export interface Workspace {
  id?: number;
  name: string;
  absolute_path: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImageFile {
  id?: number;
  name: string;
  relative_path: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  modified_at: string;
  extension: string;
}

export interface MoveImageRequest {
  old_path: string;
  new_path: string;
  workspace_path: string;
}

export interface RenameImageRequest {
  old_name: string;
  new_name: string;
  relative_path: string;
  workspace_path: string;
}

class DatabaseManager {
  private mainDb: Database | null = null;
  private workspaceDb: Database | null = null;

  private async ensureMainDbConnection(): Promise<Database> {
    if (!this.mainDb) {
      console.log("Main database not initialized, initializing now...");
      await this.initMainDatabase();
    }

    try {
      await this.mainDb!.select("SELECT 1");
    } catch (error) {
      console.log("Database connection test failed, reinitializing...", error);
      this.mainDb = null;
      await this.initMainDatabase();
    }

    if (!this.mainDb) {
      throw new Error("Failed to initialize main database connection");
    }

    return this.mainDb;
  }

  async initMainDatabase(): Promise<void> {
    try {
      console.log("Loading main database...");
      this.mainDb = await Database.load("sqlite:main.db");
      console.log("Main database loaded successfully");

      console.log("Creating workspaces table...");
      await this.mainDb.execute(`
        CREATE TABLE IF NOT EXISTS workspaces (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          absolute_path TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("Main database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize main database:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async initWorkspaceDatabase(workspacePath: string): Promise<string> {
    try {
      const dbPath: string = await invoke("ensure_workspace_structure", {
        workspacePath,
      });

      this.workspaceDb = await Database.load(`sqlite:${dbPath}`);

      await this.workspaceDb.execute(`
        CREATE TABLE IF NOT EXISTS workspace_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.workspaceDb.execute(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          relative_path TEXT NOT NULL UNIQUE,
          file_size INTEGER NOT NULL,
          extension TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          modified_at DATETIME NOT NULL
        )
      `);

      await this.workspaceDb.execute(
        `INSERT OR REPLACE INTO workspace_info (key, value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        ["initialized", "true"]
      );

      console.log("Workspace database initialized successfully");
      return dbPath;
    } catch (error) {
      console.error("Failed to initialize workspace database:", error);
      throw error;
    }
  }

  async addWorkspace(workspace: Omit<Workspace, "id">): Promise<number> {
    const db = await this.ensureMainDbConnection();

    try {
      await invoke("validate_workspace_path", {
        path: workspace.absolute_path,
      });

      const result = await db.execute(
        `INSERT INTO workspaces (name, absolute_path, created_at, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [workspace.name, workspace.absolute_path]
      );

      console.log("Workspace added successfully:", result);
      return result.lastInsertId as number;
    } catch (error) {
      console.error("Failed to add workspace:", error);
      throw error;
    }
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    const db = await this.ensureMainDbConnection();

    try {
      const result = await db.select<Workspace[]>(
        "SELECT * FROM workspaces ORDER BY updated_at DESC"
      );
      return result;
    } catch (error) {
      console.error("Failed to get workspaces:", error);
      throw error;
    }
  }

  async getWorkspaceByPath(path: string): Promise<Workspace | null> {
    const db = await this.ensureMainDbConnection();

    try {
      const result = await db.select<Workspace[]>(
        "SELECT * FROM workspaces WHERE absolute_path = ?",
        [path]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Failed to get workspace by path:", error);
      throw error;
    }
  }

  async updateWorkspaceTimestamp(id: number): Promise<void> {
    const db = await this.ensureMainDbConnection();

    try {
      await db.execute(
        "UPDATE workspaces SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );
    } catch (error) {
      console.error("Failed to update workspace timestamp:", error);
      throw error;
    }
  }

  async removeWorkspace(id: number): Promise<void> {
    const db = await this.ensureMainDbConnection();

    try {
      await db.execute("DELETE FROM workspaces WHERE id = ?", [id]);
      console.log("Workspace removed successfully");
    } catch (error) {
      console.error("Failed to remove workspace:", error);
      throw error;
    }
  }

  async getWorkspaceNameFromPath(path: string): Promise<string> {
    try {
      return await invoke("get_workspace_name_from_path", { path });
    } catch (error) {
      console.error("Failed to get workspace name from path:", error);
      throw error;
    }
  }

  async openWorkspace(workspacePath: string): Promise<Workspace> {
    try {
      await invoke("validate_workspace_path", { path: workspacePath });

      let workspace = await this.getWorkspaceByPath(workspacePath);

      if (!workspace) {
        const name = await this.getWorkspaceNameFromPath(workspacePath);
        await this.addWorkspace({
          name,
          absolute_path: workspacePath,
        });

        workspace = await this.getWorkspaceByPath(workspacePath);
        if (!workspace) {
          throw new Error("Failed to retrieve newly added workspace");
        }
      } else {
        await this.updateWorkspaceTimestamp(workspace.id!);
      }

      await this.initWorkspaceDatabase(workspacePath);

      console.log("Workspace opened successfully:", workspace);
      return workspace;
    } catch (error) {
      console.error("Failed to open workspace:", error);
      throw error;
    }
  }

  async closeWorkspaceDatabase(): Promise<void> {
    if (this.workspaceDb) {
      await this.workspaceDb.close();
      this.workspaceDb = null;
      console.log("Workspace database connection closed");
    }
  }

  getWorkspaceDatabase(): Database | null {
    return this.workspaceDb;
  }

  getMainDatabase(): Database | null {
    return this.mainDb;
  }

  // Image management methods
  async scanAndStoreImages(workspacePath: string): Promise<ImageFile[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // Scan images using Tauri command
      const scannedImages: ImageFile[] = await invoke("scan_images", {
        workspacePath: workspacePath,
      });

      // Clear existing images and insert new ones
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
        oldPath: oldPath,
        newPath: newPath,
        workspacePath: workspacePath,
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
        oldName: oldName,
        newName: newName,
        relativePath: relativePath,
        workspacePath: workspacePath,
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

export const databaseManager = new DatabaseManager();
