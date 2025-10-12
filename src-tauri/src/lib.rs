use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub id: Option<i64>,
    pub name: String,
    pub absolute_path: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageFile {
    pub name: String,
    pub relative_path: String,
    pub file_size: u64,
    pub created_at: String,
    pub modified_at: String,
    pub extension: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MoveImageRequest {
    pub old_path: String,
    pub new_path: String,
    pub workspace_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RenameImageRequest {
    pub old_name: String,
    pub new_name: String,
    pub relative_path: String,
    pub workspace_path: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Images Manager!", name)
}

#[tauri::command]
async fn ensure_workspace_structure(workspace_path: String) -> Result<String, String> {
    let workspace_dir = Path::new(&workspace_path);
    
    if !workspace_dir.exists() {
        return Err(format!("Workspace directory does not exist: {}", workspace_path));
    }
    
    // Create .im_settings folder if it doesn't exist
    let settings_dir = workspace_dir.join(".im_settings");
    if !settings_dir.exists() {
        fs::create_dir_all(&settings_dir)
            .map_err(|e| format!("Failed to create .im_settings directory: {}", e))?;
    }
    
    // Return the path to the workspace database
    let db_path = settings_dir.join("workspace.db");
    Ok(db_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn validate_workspace_path(path: String) -> Result<bool, String> {
    let workspace_path = Path::new(&path);
    
    if !workspace_path.exists() {
        return Err("Path does not exist".to_string());
    }
    
    if !workspace_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    Ok(true)
}

#[tauri::command]
async fn get_workspace_name_from_path(path: String) -> Result<String, String> {
    let workspace_path = Path::new(&path);
    
    match workspace_path.file_name() {
        Some(name) => Ok(name.to_string_lossy().to_string()),
        None => Err("Could not extract workspace name from path".to_string()),
    }
}

#[tauri::command]
async fn scan_images(workspace_path: String) -> Result<Vec<ImageFile>, String> {
    let workspace_dir = Path::new(&workspace_path);
    
    if !workspace_dir.exists() {
        return Err("Workspace directory does not exist".to_string());
    }
    
    let supported_extensions = vec!["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg"];
    let mut images = Vec::new();
    
    for entry in WalkDir::new(workspace_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        let file_path = entry.path();
        
        // Skip hidden directories and files
        if file_path.components().any(|component| {
            component.as_os_str().to_string_lossy().starts_with('.')
        }) {
            continue;
        }
        
        if let Some(extension) = file_path.extension() {
            let ext_str = extension.to_string_lossy().to_lowercase();
            if supported_extensions.contains(&ext_str.as_str()) {
                let relative_path = file_path
                    .strip_prefix(workspace_dir)
                    .map_err(|e| format!("Failed to get relative path: {}", e))?
                    .to_string_lossy()
                    .replace('\\', "/");
                
                let file_name = file_path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                
                let metadata = fs::metadata(file_path)
                    .map_err(|e| format!("Failed to read file metadata: {}", e))?;
                
                let created_at = metadata
                    .created()
                    .map(|time| {
                        let datetime: DateTime<Utc> = time.into();
                        datetime.to_rfc3339()
                    })
                    .unwrap_or_else(|_| Utc::now().to_rfc3339());
                
                let modified_at = metadata
                    .modified()
                    .map(|time| {
                        let datetime: DateTime<Utc> = time.into();
                        datetime.to_rfc3339()
                    })
                    .unwrap_or_else(|_| Utc::now().to_rfc3339());
                
                images.push(ImageFile {
                    name: file_name,
                    relative_path,
                    file_size: metadata.len(),
                    created_at,
                    modified_at,
                    extension: ext_str,
                });
            }
        }
    }
    
    Ok(images)
}

#[tauri::command]
async fn move_image(request: MoveImageRequest) -> Result<String, String> {
    let workspace_dir = Path::new(&request.workspace_path);
    let old_absolute_path = workspace_dir.join(&request.old_path);
    let new_absolute_path = workspace_dir.join(&request.new_path);
    
    if !old_absolute_path.exists() {
        return Err("Source file does not exist".to_string());
    }
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = new_absolute_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create target directory: {}", e))?;
    }
    
    fs::rename(&old_absolute_path, &new_absolute_path)
        .map_err(|e| format!("Failed to move file: {}", e))?;
    
    Ok(request.new_path)
}

#[tauri::command]
async fn rename_image(request: RenameImageRequest) -> Result<String, String> {
    let workspace_dir = Path::new(&request.workspace_path);
    let current_file_path = workspace_dir.join(&request.relative_path);
    let file_dir = current_file_path.parent()
        .ok_or("Invalid file path")?;
    
    let old_file_path = file_dir.join(&request.old_name);
    let new_file_path = file_dir.join(&request.new_name);
    
    if !old_file_path.exists() {
        return Err("Source file does not exist".to_string());
    }
    
    if new_file_path.exists() {
        return Err("Target file already exists".to_string());
    }
    
    fs::rename(&old_file_path, &new_file_path)
        .map_err(|e| format!("Failed to rename file: {}", e))?;
    
    // Return new relative path
    let new_relative_path = new_file_path
        .strip_prefix(workspace_dir)
        .map_err(|e| format!("Failed to get relative path: {}", e))?
        .to_string_lossy()
        .replace('\\', "/");
    
    Ok(new_relative_path)
}

#[tauri::command]
async fn delete_image(relative_path: String, workspace_path: String) -> Result<bool, String> {
    let workspace_dir = Path::new(&workspace_path);
    let file_path = workspace_dir.join(&relative_path);
    
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    
    fs::remove_file(file_path)
        .map_err(|e| format!("Failed to delete file: {}", e))?;
    
    Ok(true)
}

#[tauri::command]
async fn get_image_absolute_path(relative_path: String, workspace_path: String) -> Result<String, String> {
    let workspace_dir = Path::new(&workspace_path);
    let absolute_path = workspace_dir.join(&relative_path);
    
    if !absolute_path.exists() {
        return Err("Image file does not exist".to_string());
    }
    
    Ok(absolute_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ensure_workspace_structure,
            validate_workspace_path,
            get_workspace_name_from_path,
            scan_images,
            move_image,
            rename_image,
            delete_image,
            get_image_absolute_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
