export * from "./types";

// Export domain managers for advanced use cases
export { BaseDatabaseManager } from "./base";
export { WorkspaceManager } from "./workspace";
export { ImageManager } from "./image";
export { TagManager } from "./tag";
export { ConnectionManager } from "./connection";

// Export the main database manager (primary interface)
export { databaseManager } from "./manager";

// For backward compatibility, also export as default
import { databaseManager } from "./manager";
export default databaseManager;
