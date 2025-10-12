import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";
import { BaseDatabaseManager } from "./base";
import { Workspace } from "./types";

/**
 * Workspace domain manager - handles all workspace-related database operations
 */
export class WorkspaceManager extends BaseDatabaseManager {
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

      await this.workspaceDb.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.workspaceDb.execute(`
        CREATE TABLE IF NOT EXISTS image_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
          UNIQUE (image_id, tag_id)
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
}
