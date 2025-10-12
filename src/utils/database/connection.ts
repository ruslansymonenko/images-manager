import { BaseDatabaseManager } from "./base";
import { Connection, ImageConnection, ImageFile } from "./types";

/**
 * Connection domain manager - handles all connection-related database operations
 */
export class ConnectionManager extends BaseDatabaseManager {
  /**
   * Create a connection between two images
   * Automatically creates the reverse connection as well for bidirectional relationships
   */
  async createConnection(imageAId: number, imageBId: number): Promise<number> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    if (imageAId === imageBId) {
      throw new Error("Cannot create connection between the same image");
    }

    try {
      // Ensure we always insert in a consistent order to avoid duplicates
      const [minId, maxId] =
        imageAId < imageBId ? [imageAId, imageBId] : [imageBId, imageAId];

      // Check if connection already exists
      const existing = await this.workspaceDb.select<Connection[]>(
        "SELECT * FROM connections WHERE image_a_id = ? AND image_b_id = ?",
        [minId, maxId]
      );

      if (existing.length > 0) {
        throw new Error("Connection already exists between these images");
      }

      const result = await this.workspaceDb.execute(
        "INSERT INTO connections (image_a_id, image_b_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        [minId, maxId]
      );

      console.log("Connection created successfully");
      return result.lastInsertId as number;
    } catch (error) {
      console.error("Failed to create connection:", error);
      throw error;
    }
  }

  /**
   * Remove a connection between two images
   */
  async removeConnection(imageAId: number, imageBId: number): Promise<void> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // Ensure we check in both directions since we store in consistent order
      const [minId, maxId] =
        imageAId < imageBId ? [imageAId, imageBId] : [imageBId, imageAId];

      await this.workspaceDb.execute(
        "DELETE FROM connections WHERE image_a_id = ? AND image_b_id = ?",
        [minId, maxId]
      );

      console.log("Connection removed successfully");
    } catch (error) {
      console.error("Failed to remove connection:", error);
      throw error;
    }
  }

  /**
   * Get all connections for a specific image
   */
  async getConnectionsForImage(imageId: number): Promise<ImageConnection[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      // Get connections where this image is either image_a or image_b
      const connections = await this.workspaceDb.select<any[]>(
        `
        SELECT 
          c.id as connection_id,
          c.created_at,
          CASE 
            WHEN c.image_a_id = ? THEN i2.id
            ELSE i1.id
          END as connected_image_id,
          CASE 
            WHEN c.image_a_id = ? THEN i2.name
            ELSE i1.name
          END as connected_image_name,
          CASE 
            WHEN c.image_a_id = ? THEN i2.relative_path
            ELSE i1.relative_path
          END as connected_image_relative_path,
          CASE 
            WHEN c.image_a_id = ? THEN i2.file_size
            ELSE i1.file_size
          END as connected_image_file_size,
          CASE 
            WHEN c.image_a_id = ? THEN i2.extension
            ELSE i1.extension
          END as connected_image_extension,
          CASE 
            WHEN c.image_a_id = ? THEN i2.created_at
            ELSE i1.created_at
          END as connected_image_created_at,
          CASE 
            WHEN c.image_a_id = ? THEN i2.updated_at
            ELSE i1.updated_at
          END as connected_image_updated_at,
          CASE 
            WHEN c.image_a_id = ? THEN i2.modified_at
            ELSE i1.modified_at
          END as connected_image_modified_at
        FROM connections c
        JOIN images i1 ON c.image_a_id = i1.id
        JOIN images i2 ON c.image_b_id = i2.id
        WHERE c.image_a_id = ? OR c.image_b_id = ?
        ORDER BY c.created_at DESC
      `,
        [
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
          imageId,
        ]
      );

      return connections.map((conn) => ({
        connection_id: conn.connection_id,
        created_at: conn.created_at,
        connected_image: {
          id: conn.connected_image_id,
          name: conn.connected_image_name,
          relative_path: conn.connected_image_relative_path,
          file_size: conn.connected_image_file_size,
          extension: conn.connected_image_extension,
          created_at: conn.connected_image_created_at,
          updated_at: conn.connected_image_updated_at,
          modified_at: conn.connected_image_modified_at,
        },
      }));
    } catch (error) {
      console.error("Failed to get connections for image:", error);
      throw error;
    }
  }

  /**
   * Get all connections in the workspace for graph visualization
   */
  async getAllConnections(): Promise<Connection[]> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const connections = await this.workspaceDb.select<Connection[]>(
        "SELECT * FROM connections ORDER BY created_at DESC"
      );
      return connections;
    } catch (error) {
      console.error("Failed to get all connections:", error);
      throw error;
    }
  }

  /**
   * Check if a connection exists between two images
   */
  async connectionExists(imageAId: number, imageBId: number): Promise<boolean> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const [minId, maxId] =
        imageAId < imageBId ? [imageAId, imageBId] : [imageBId, imageAId];

      const connections = await this.workspaceDb.select<Connection[]>(
        "SELECT id FROM connections WHERE image_a_id = ? AND image_b_id = ?",
        [minId, maxId]
      );

      return connections.length > 0;
    } catch (error) {
      console.error("Failed to check connection existence:", error);
      throw error;
    }
  }

  /**
   * Get connection statistics for the workspace
   */
  async getConnectionStats(): Promise<{
    totalConnections: number;
    connectedImages: number;
  }> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const [totalResult, connectedResult] = await Promise.all([
        this.workspaceDb.select<{ count: number }[]>(
          "SELECT COUNT(*) as count FROM connections"
        ),
        this.workspaceDb.select<{ count: number }[]>(`
          SELECT COUNT(DISTINCT image_id) as count FROM (
            SELECT image_a_id as image_id FROM connections
            UNION
            SELECT image_b_id as image_id FROM connections
          )
        `),
      ]);

      return {
        totalConnections: totalResult[0]?.count || 0,
        connectedImages: connectedResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("Failed to get connection stats:", error);
      throw error;
    }
  }

  /**
   * Get graph data for visualization (nodes and edges)
   */
  async getGraphData(): Promise<{ nodes: any[]; links: any[] }> {
    if (!this.workspaceDb) {
      throw new Error("Workspace database not initialized");
    }

    try {
      const [images, connections] = await Promise.all([
        this.workspaceDb.select<ImageFile[]>("SELECT * FROM images"),
        this.getAllConnections(),
      ]);

      // Create nodes from images
      const nodes = images.map((image) => ({
        id: image.id,
        name: image.name,
        path: image.relative_path,
        extension: image.extension,
        size: image.file_size,
      }));

      // Create links from connections
      const links = connections.map((connection) => ({
        source: connection.image_a_id,
        target: connection.image_b_id,
        id: connection.id,
        created_at: connection.created_at,
      }));

      return { nodes, links };
    } catch (error) {
      console.error("Failed to get graph data:", error);
      throw error;
    }
  }
}
