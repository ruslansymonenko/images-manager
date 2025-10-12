use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub id: Option<i64>,
    pub name: String,
    pub absolute_path: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
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
            get_workspace_name_from_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
