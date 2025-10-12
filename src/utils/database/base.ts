import Database from "@tauri-apps/plugin-sql";

/**
 * Base database connection manager that provides common database functionality
 */
export class BaseDatabaseManager {
  protected mainDb: Database | null = null;
  protected workspaceDb: Database | null = null;

  protected async ensureMainDbConnection(): Promise<Database> {
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
}
