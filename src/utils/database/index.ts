/**
 * Database module exports
 *
 * This module provides a refactored database architecture with domain separation:
 * - Types: All interfaces and type definitions
 * - Base: Common database connection management
 * - Workspace: Workspace-related operations
 * - Image: Image-related operations
 * - Manager: Unified interface coordinating all domains
 */

// Export all types
export * from "./types";

// Export domain managers for advanced use cases
export { BaseDatabaseManager } from "./base";
export { WorkspaceManager } from "./workspace";
export { ImageManager } from "./image";

// Export the main database manager (primary interface)
export { databaseManager } from "./manager";

// For backward compatibility, also export as default
import { databaseManager } from "./manager";
export default databaseManager;
