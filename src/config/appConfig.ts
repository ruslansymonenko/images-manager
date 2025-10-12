/**
 * Global application configuration
 * Contains app metadata, default settings, and configuration constants
 */

import { type ThemeMode } from "../styles/variables";
import packageJson from "../../package.json";

export interface AppConfig {
  // Application metadata
  app: {
    name: string;
    displayName: string;
    version: string;
    description: string;
    author: string;
    repository: string;
    homepage: string;
    license: string;
  };

  // Default settings
  defaults: {
    theme: ThemeMode;
    workspacePath?: string;
    autoSave: boolean;
    notifications: {
      enabled: boolean;
      position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
      autoClose: number;
    };
  };

  // API and service endpoints
  api: {
    updateEndpoint?: string;
    supportUrl: string;
    documentationUrl: string;
    issuesUrl: string;
  };

  // Feature flags
  features: {
    autoUpdates: boolean;
    telemetry: boolean;
    betaFeatures: boolean;
    exportImport: boolean;
    cloudSync: boolean;
  };

  // File and database configurations
  storage: {
    settingsFolder: string;
    databaseName: string;
    maxFileSize: number; // in bytes
    supportedImageFormats: string[];
    maxCacheSize: number; // in bytes
  };

  // UI configuration
  ui: {
    maxTagsPerImage: number;
    maxRecentWorkspaces: number;
    animationDuration: number;
    debounceDelay: number;
    pageSize: number;
  };
}

const appConfig: AppConfig = {
  // Application metadata
  app: {
    name: packageJson.name,
    displayName: "Images Manager",
    version: packageJson.version,
    description:
      "A Tauri-based desktop application for managing images within workspaces with SQLite database support.",
    author: "Images Manager Team",
    repository: "https://github.com/ruslansymonenko/images-manager",
    homepage: "https://github.com/ruslansymonenko/images-manager",
    license: "MIT",
  },

  // Default settings
  defaults: {
    theme: "light" as ThemeMode,
    workspacePath: undefined,
    autoSave: true,
    notifications: {
      enabled: true,
      position: "top-right",
      autoClose: 4000,
    },
  },

  // API and service endpoints
  api: {
    updateEndpoint: undefined, // To be configured for auto-updates
    supportUrl: "https://github.com/ruslansymonenko/images-manager/discussions",
    documentationUrl: "https://github.com/ruslansymonenko/images-manager/wiki",
    issuesUrl: "https://github.com/ruslansymonenko/images-manager/issues",
  },

  // Feature flags
  features: {
    autoUpdates: false, // Disabled by default, can be enabled in future versions
    telemetry: false, // Privacy-first approach
    betaFeatures: false,
    exportImport: true, // Export/import workspace data
    cloudSync: false, // Future feature
  },

  // File and database configurations
  storage: {
    settingsFolder: ".im_settings",
    databaseName: "workspace.db",
    maxFileSize: 100 * 1024 * 1024, // 100MB
    supportedImageFormats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "tiff",
      "tif",
      "svg",
      "ico",
    ],
    maxCacheSize: 500 * 1024 * 1024, // 500MB
  },

  // UI configuration
  ui: {
    maxTagsPerImage: 50,
    maxRecentWorkspaces: 10,
    animationDuration: 200, // milliseconds
    debounceDelay: 300, // milliseconds
    pageSize: 24, // images per page in gallery
  },
};

// Utility functions for configuration access
export const getAppName = (): string => appConfig.app.displayName;
export const getAppVersion = (): string => appConfig.app.version;
export const getDefaultTheme = (): ThemeMode => appConfig.defaults.theme;
export const getSupportedFormats = (): string[] =>
  appConfig.storage.supportedImageFormats;
export const getMaxFileSize = (): number => appConfig.storage.maxFileSize;
export const isFeatureEnabled = (
  feature: keyof AppConfig["features"]
): boolean => appConfig.features[feature];

// Environment-specific configuration
export const isDevelopment = (): boolean => {
  // Simple fallback since we can't access process.env in Tauri frontend
  return false; // Default to false for safety
};

export const isProduction = (): boolean => {
  return true; // Default to production for safety
};

// Configuration validation
export const validateConfig = (): boolean => {
  try {
    // Basic validation checks
    if (!appConfig.app.name || !appConfig.app.version) {
      console.error("Invalid app configuration: missing name or version");
      return false;
    }

    if (appConfig.ui.pageSize <= 0 || appConfig.ui.maxTagsPerImage <= 0) {
      console.error("Invalid UI configuration: invalid numeric values");
      return false;
    }

    if (appConfig.storage.supportedImageFormats.length === 0) {
      console.error("Invalid storage configuration: no supported formats");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Configuration validation error:", error);
    return false;
  }
};

// Configuration updater (for runtime modifications)
export const updateConfig = (updates: Partial<AppConfig>): void => {
  Object.assign(appConfig, updates);

  if (!validateConfig()) {
    console.warn("Configuration update resulted in invalid state");
  }
};

// Export the main configuration
export default appConfig;

// Constants for common use
export const APP_CONSTANTS = {
  SETTINGS_FOLDER: appConfig.storage.settingsFolder,
  DATABASE_NAME: appConfig.storage.databaseName,
  DEFAULT_THEME: appConfig.defaults.theme,
  MAX_FILE_SIZE: appConfig.storage.maxFileSize,
  SUPPORTED_FORMATS: appConfig.storage.supportedImageFormats,
  PAGE_SIZE: appConfig.ui.pageSize,
} as const;
