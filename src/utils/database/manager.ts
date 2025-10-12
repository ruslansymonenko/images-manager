import Database from "@tauri-apps/plugin-sql";
import { WorkspaceManager } from "./workspace";
import { ImageManager } from "./image";
import { Workspace, ImageFile } from "./types";

/**
 * Main DatabaseManager that coordinates all domain-specific managers
 * Provides a unified interface while maintaining separation of concerns
 */
class DatabaseManager {
  private workspaceManager: WorkspaceManager;
  private imageManager: ImageManager;

  constructor() {
    this.workspaceManager = new WorkspaceManager();
    this.imageManager = new ImageManager();
  }

  async initMainDatabase(): Promise<void> {
    return this.workspaceManager.initMainDatabase();
  }

  async addWorkspace(workspace: Omit<Workspace, "id">): Promise<number> {
    return this.workspaceManager.addWorkspace(workspace);
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    return this.workspaceManager.getAllWorkspaces();
  }

  async getWorkspaceByPath(path: string): Promise<Workspace | null> {
    return this.workspaceManager.getWorkspaceByPath(path);
  }

  async updateWorkspaceTimestamp(id: number): Promise<void> {
    return this.workspaceManager.updateWorkspaceTimestamp(id);
  }

  async removeWorkspace(id: number): Promise<void> {
    return this.workspaceManager.removeWorkspace(id);
  }

  async getWorkspaceNameFromPath(path: string): Promise<string> {
    return this.workspaceManager.getWorkspaceNameFromPath(path);
  }

  async openWorkspace(workspacePath: string): Promise<Workspace> {
    const workspace = await this.workspaceManager.openWorkspace(workspacePath);

    // Sync the workspace database connection to the image manager
    this.imageManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();

    return workspace;
  }

  async initWorkspaceDatabase(workspacePath: string): Promise<string> {
    const dbPath = await this.workspaceManager.initWorkspaceDatabase(
      workspacePath
    );

    // Sync the workspace database connection to the image manager
    this.imageManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();

    return dbPath;
  }

  async closeWorkspaceDatabase(): Promise<void> {
    await this.workspaceManager.closeWorkspaceDatabase();
    this.imageManager["workspaceDb"] = null;
  }

  // Image-related methods
  async scanAndStoreImages(workspacePath: string): Promise<ImageFile[]> {
    return this.imageManager.scanAndStoreImages(workspacePath);
  }

  async getAllImages(): Promise<ImageFile[]> {
    return this.imageManager.getAllImages();
  }

  async getImageByPath(relativePath: string): Promise<ImageFile | null> {
    return this.imageManager.getImageByPath(relativePath);
  }

  async updateImagePath(oldPath: string, newPath: string): Promise<void> {
    return this.imageManager.updateImagePath(oldPath, newPath);
  }

  async updateImageName(
    relativePath: string,
    newName: string,
    newPath: string
  ): Promise<void> {
    return this.imageManager.updateImageName(relativePath, newName, newPath);
  }

  async deleteImageFromDb(relativePath: string): Promise<void> {
    return this.imageManager.deleteImageFromDb(relativePath);
  }

  async moveImage(
    oldPath: string,
    newPath: string,
    workspacePath: string
  ): Promise<string> {
    return this.imageManager.moveImage(oldPath, newPath, workspacePath);
  }

  async renameImage(
    oldName: string,
    newName: string,
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    return this.imageManager.renameImage(
      oldName,
      newName,
      relativePath,
      workspacePath
    );
  }

  async deleteImage(
    relativePath: string,
    workspacePath: string
  ): Promise<void> {
    return this.imageManager.deleteImage(relativePath, workspacePath);
  }

  async getImageAbsolutePath(
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    return this.imageManager.getImageAbsolutePath(relativePath, workspacePath);
  }

  async getImageAsBase64(
    relativePath: string,
    workspacePath: string
  ): Promise<string> {
    return this.imageManager.getImageAsBase64(relativePath, workspacePath);
  }

  // Database accessor methods
  getWorkspaceDatabase(): Database | null {
    return this.workspaceManager.getWorkspaceDatabase();
  }

  getMainDatabase(): Database | null {
    return this.workspaceManager.getMainDatabase();
  }

  // Access to domain managers for advanced use cases
  getWorkspaceManager(): WorkspaceManager {
    return this.workspaceManager;
  }

  getImageManager(): ImageManager {
    return this.imageManager;
  }
}

export const databaseManager = new DatabaseManager();
