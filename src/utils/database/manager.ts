import Database from "@tauri-apps/plugin-sql";
import { WorkspaceManager } from "./workspace";
import { ImageManager } from "./image";
import { TagManager } from "./tag";
import {
  Workspace,
  ImageFile,
  Tag,
  ImageWithTags,
  TagWithImageCount,
} from "./types";

/**
 * Main DatabaseManager that coordinates all domain-specific managers
 * Provides a unified interface while maintaining separation of concerns
 */
class DatabaseManager {
  private workspaceManager: WorkspaceManager;
  private imageManager: ImageManager;
  private tagManager: TagManager;

  constructor() {
    this.workspaceManager = new WorkspaceManager();
    this.imageManager = new ImageManager();
    this.tagManager = new TagManager();
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

    // Sync the workspace database connection to the image and tag managers
    this.imageManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();
    this.tagManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();

    return workspace;
  }

  async initWorkspaceDatabase(workspacePath: string): Promise<string> {
    const dbPath = await this.workspaceManager.initWorkspaceDatabase(
      workspacePath
    );

    // Sync the workspace database connection to the image and tag managers
    this.imageManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();
    this.tagManager["workspaceDb"] =
      this.workspaceManager.getWorkspaceDatabase();

    return dbPath;
  }

  async closeWorkspaceDatabase(): Promise<void> {
    await this.workspaceManager.closeWorkspaceDatabase();
    this.imageManager["workspaceDb"] = null;
    this.tagManager["workspaceDb"] = null;
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

  // Tag-related methods
  async createTag(
    tag: Omit<Tag, "id" | "created_at" | "updated_at">
  ): Promise<number> {
    return this.tagManager.createTag(tag);
  }

  async getAllTags(): Promise<Tag[]> {
    return this.tagManager.getAllTags();
  }

  async getAllTagsWithImageCount(): Promise<TagWithImageCount[]> {
    return this.tagManager.getAllTagsWithImageCount();
  }

  async getTagById(id: number): Promise<Tag | null> {
    return this.tagManager.getTagById(id);
  }

  async updateTag(
    id: number,
    updates: Partial<Omit<Tag, "id" | "created_at" | "updated_at">>
  ): Promise<void> {
    return this.tagManager.updateTag(id, updates);
  }

  async deleteTag(id: number): Promise<void> {
    return this.tagManager.deleteTag(id);
  }

  async addTagToImage(imageId: number, tagId: number): Promise<void> {
    return this.tagManager.addTagToImage(imageId, tagId);
  }

  async removeTagFromImage(imageId: number, tagId: number): Promise<void> {
    return this.tagManager.removeTagFromImage(imageId, tagId);
  }

  async getTagsForImage(imageId: number): Promise<Tag[]> {
    return this.tagManager.getTagsForImage(imageId);
  }

  async getAllImagesWithTags(): Promise<ImageWithTags[]> {
    return this.tagManager.getAllImagesWithTags();
  }

  async getImagesByTags(tagIds: number[]): Promise<ImageWithTags[]> {
    return this.tagManager.getImagesByTags(tagIds);
  }

  async getImagesByTagsOr(tagIds: number[]): Promise<ImageWithTags[]> {
    return this.tagManager.getImagesByTagsOr(tagIds);
  }

  async searchTags(query: string): Promise<Tag[]> {
    return this.tagManager.searchTags(query);
  }

  async tagNameExists(name: string, excludeId?: number): Promise<boolean> {
    return this.tagManager.tagNameExists(name, excludeId);
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

  getTagManager(): TagManager {
    return this.tagManager;
  }
}

export const databaseManager = new DatabaseManager();
