/**
 * Database types and interfaces for the Images Manager application
 */

export interface Workspace {
  id?: number;
  name: string;
  absolute_path: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImageFile {
  id?: number;
  name: string;
  relative_path: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  modified_at: string;
  extension: string;
}

export interface MoveImageRequest {
  old_path: string;
  new_path: string;
  workspace_path: string;
}

export interface RenameImageRequest {
  old_name: string;
  new_name: string;
  relative_path: string;
  workspace_path: string;
}
