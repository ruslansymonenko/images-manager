import { invoke } from "@tauri-apps/api/core";
import { type ThemeMode } from "../styles/variables";

export interface WorkspaceSettings {
  theme: ThemeMode;
  version: string;
  lastModified: string;
}

const SETTINGS_VERSION = "1.0.0";

/**
 * Load theme settings for a workspace
 */
export async function loadWorkspaceTheme(
  workspacePath: string
): Promise<ThemeMode | null> {
  try {
    // Use the existing ensure_workspace_structure command to make sure .im_settings exists
    await invoke("ensure_workspace_structure", { workspacePath });

    // For now, we'll use localStorage as a fallback since we don't have direct file access
    // In a future version, we can add Tauri commands for reading/writing settings files
    const storageKey = `workspace-theme-${workspacePath}`;
    const stored = localStorage.getItem(storageKey);

    if (stored && (stored === "light" || stored === "dark")) {
      return stored;
    }

    return null; // No theme preference saved
  } catch (error) {
    console.error("Failed to load workspace theme:", error);
    return null;
  }
}

/**
 * Save theme settings for a workspace
 */
export async function saveWorkspaceTheme(
  workspacePath: string,
  theme: ThemeMode
): Promise<void> {
  try {
    // Use the existing ensure_workspace_structure command to make sure .im_settings exists
    await invoke("ensure_workspace_structure", { workspacePath });

    // For now, we'll use localStorage as a fallback since we don't have direct file access
    // In a future version, we can add Tauri commands for reading/writing settings files
    const storageKey = `workspace-theme-${workspacePath}`;
    localStorage.setItem(storageKey, theme);

    console.log(`Theme '${theme}' saved for workspace: ${workspacePath}`);
  } catch (error) {
    console.error("Failed to save workspace theme:", error);
    throw error;
  }
}

/**
 * Load all workspace settings (extensible for future settings)
 */
export async function loadWorkspaceSettings(
  workspacePath: string
): Promise<Partial<WorkspaceSettings>> {
  try {
    const theme = await loadWorkspaceTheme(workspacePath);

    return {
      theme: theme || "light", // Default to light theme
      version: SETTINGS_VERSION,
      lastModified: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load workspace settings:", error);
    return {
      theme: "light",
      version: SETTINGS_VERSION,
      lastModified: new Date().toISOString(),
    };
  }
}

/**
 * Save all workspace settings (extensible for future settings)
 */
export async function saveWorkspaceSettings(
  workspacePath: string,
  settings: Partial<WorkspaceSettings>
): Promise<void> {
  try {
    if (settings.theme) {
      await saveWorkspaceTheme(workspacePath, settings.theme);
    }
  } catch (error) {
    console.error("Failed to save workspace settings:", error);
    throw error;
  }
}

/**
 * Check if workspace has any settings saved
 */
export async function hasWorkspaceSettings(
  workspacePath: string
): Promise<boolean> {
  try {
    const theme = await loadWorkspaceTheme(workspacePath);
    return theme !== null;
  } catch (error) {
    console.error("Failed to check workspace settings:", error);
    return false;
  }
}

/**
 * Delete workspace settings (useful for cleanup)
 */
export async function deleteWorkspaceSettings(
  workspacePath: string
): Promise<void> {
  try {
    const storageKey = `workspace-theme-${workspacePath}`;
    localStorage.removeItem(storageKey);
    console.log("Workspace settings cleaned up");
  } catch (error) {
    console.error("Failed to delete workspace settings:", error);
  }
}
