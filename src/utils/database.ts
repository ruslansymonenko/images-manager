/**
 * Legacy database.ts file - now imports from the refactored modular structure
 *
 * This file maintains backward compatibility while using the new domain-separated modules.
 * The database functionality has been refactored into separate modules:
 *
 * - database/types.ts: Type definitions and interfaces
 * - database/base.ts: Base database connection management
 * - database/workspace.ts: Workspace domain operations
 * - database/image.ts: Image domain operations
 * - database/manager.ts: Unified coordinator
 * - database/index.ts: Main exports
 *
 * For new code, consider importing directly from the specific modules or the main index.
 */

// Re-export everything from the modular structure for backward compatibility
export * from "./database/index";

// The main databaseManager instance remains available as before
export { databaseManager } from "./database/manager";
