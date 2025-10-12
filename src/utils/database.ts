import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";

export interface Workspace {
  id?: number;
  name: string;
  absolute_path: string;
  created_at?: string;
  updated_at?: string;
}

class DatabaseManager {
  private mainDb: Database | null = null;
  private workspaceDb: Database | null = null;

  // Ensure main database connection is valid
  private async ensureMainDbConnection(): Promise<Database> {
    if (!this.mainDb) {
      console.log("Main database not initialized, initializing now...");
      await this.initMainDatabase();
    }

    // Test the connection with a simple query
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

  // Initialize main app database
  async initMainDatabase(): Promise<void> {
    try {
      // First, try to load the database
      console.log("Loading main database...");
      this.mainDb = await Database.load("sqlite:main.db");
      console.log("Main database loaded successfully");

      // Then try to execute the schema creation
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

  // Initialize workspace-specific database
  async initWorkspaceDatabase(workspacePath: string): Promise<string> {
    try {
      // Ensure workspace structure and get database path
      const dbPath: string = await invoke("ensure_workspace_structure", {
        workspacePath,
      });

      // Load the workspace database
      this.workspaceDb = await Database.load(`sqlite:${dbPath}`);

      // Create basic tables for future use
      await this.workspaceDb.execute(`
        CREATE TABLE IF NOT EXISTS workspace_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Store workspace initialization info
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

  // Add a new workspace to the main database
  async addWorkspace(workspace: Omit<Workspace, "id">): Promise<number> {
    const db = await this.ensureMainDbConnection();

    try {
      // Validate workspace path
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

  // Get all workspaces from the main database
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

  // Get workspace by path
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

  // Update workspace's updated_at timestamp
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

  // Remove workspace from main database
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

  // Get workspace name from path using Rust backend
  async getWorkspaceNameFromPath(path: string): Promise<string> {
    try {
      return await invoke("get_workspace_name_from_path", { path });
    } catch (error) {
      console.error("Failed to get workspace name from path:", error);
      throw error;
    }
  }

  // Open an existing workspace
  async openWorkspace(workspacePath: string): Promise<Workspace> {
    try {
      // Validate the path
      await invoke("validate_workspace_path", { path: workspacePath });

      // Check if workspace exists in main database
      let workspace = await this.getWorkspaceByPath(workspacePath);

      if (!workspace) {
        // If not in database, add it
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
        // Update timestamp for existing workspace
        await this.updateWorkspaceTimestamp(workspace.id!);
      }

      // Initialize workspace database
      await this.initWorkspaceDatabase(workspacePath);

      console.log("Workspace opened successfully:", workspace);
      return workspace;
    } catch (error) {
      console.error("Failed to open workspace:", error);
      throw error;
    }
  }

  // Close current workspace database connection
  async closeWorkspaceDatabase(): Promise<void> {
    if (this.workspaceDb) {
      await this.workspaceDb.close();
      this.workspaceDb = null;
      console.log("Workspace database connection closed");
    }
  }

  // Get current workspace database instance
  getWorkspaceDatabase(): Database | null {
    return this.workspaceDb;
  }

  // Get main database instance
  getMainDatabase(): Database | null {
    return this.mainDb;
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
