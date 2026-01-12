mod crypto;
mod vault;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};
use uuid::Uuid;
use vault::{Category, PasswordEntry, Vault, VaultError};

struct AppState {
    vault: Mutex<Vault>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EntryInput {
    title: String,
    username: String,
    password: String,
    url: Option<String>,
    notes: Option<String>,
    category: String,
    favorite: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateEntryInput {
    id: String,
    title: String,
    username: String,
    password: String,
    url: Option<String>,
    notes: Option<String>,
    category: String,
    favorite: bool,
}

fn vault_error_to_string(e: VaultError) -> String {
    e.to_string()
}

#[tauri::command]
fn vault_exists(state: State<AppState>) -> bool {
    let vault = state.vault.lock().unwrap();
    vault.exists()
}

#[tauri::command]
fn vault_is_unlocked(state: State<AppState>) -> bool {
    let vault = state.vault.lock().unwrap();
    vault.is_unlocked()
}

#[tauri::command]
fn create_vault(state: State<AppState>, master_password: String) -> Result<(), String> {
    let mut vault = state.vault.lock().unwrap();
    vault
        .create(&master_password)
        .map_err(vault_error_to_string)
}

#[tauri::command]
fn unlock_vault(state: State<AppState>, master_password: String) -> Result<(), String> {
    let mut vault = state.vault.lock().unwrap();
    vault
        .unlock(&master_password)
        .map_err(vault_error_to_string)
}

#[tauri::command]
fn lock_vault(state: State<AppState>) {
    let mut vault = state.vault.lock().unwrap();
    vault.lock();
}

#[tauri::command]
fn get_entries(state: State<AppState>) -> Result<Vec<PasswordEntry>, String> {
    let vault = state.vault.lock().unwrap();
    vault.get_all_entries().map_err(vault_error_to_string)
}

#[tauri::command]
fn get_entry(state: State<AppState>, id: String) -> Result<PasswordEntry, String> {
    let vault = state.vault.lock().unwrap();
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    vault.get_entry(uuid).map_err(vault_error_to_string)
}

#[tauri::command]
fn add_entry(state: State<AppState>, entry: EntryInput) -> Result<PasswordEntry, String> {
    let mut vault = state.vault.lock().unwrap();
    let now = Utc::now();

    let password_entry = PasswordEntry {
        id: Uuid::new_v4(),
        title: entry.title,
        username: entry.username,
        password: entry.password,
        url: entry.url,
        notes: entry.notes,
        category: entry.category,
        favorite: entry.favorite,
        created_at: now,
        updated_at: now,
    };

    vault
        .add_entry(password_entry)
        .map_err(vault_error_to_string)
}

#[tauri::command]
fn update_entry(state: State<AppState>, entry: UpdateEntryInput) -> Result<PasswordEntry, String> {
    let mut vault = state.vault.lock().unwrap();
    let uuid = Uuid::parse_str(&entry.id).map_err(|e| e.to_string())?;

    let existing = vault.get_entry(uuid).map_err(vault_error_to_string)?;

    let password_entry = PasswordEntry {
        id: uuid,
        title: entry.title,
        username: entry.username,
        password: entry.password,
        url: entry.url,
        notes: entry.notes,
        category: entry.category,
        favorite: entry.favorite,
        created_at: existing.created_at,
        updated_at: Utc::now(),
    };

    vault
        .update_entry(password_entry)
        .map_err(vault_error_to_string)
}

#[tauri::command]
fn delete_entry(state: State<AppState>, id: String) -> Result<(), String> {
    let mut vault = state.vault.lock().unwrap();
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    vault.delete_entry(uuid).map_err(vault_error_to_string)
}

#[tauri::command]
fn search_entries(state: State<AppState>, query: String) -> Result<Vec<PasswordEntry>, String> {
    let vault = state.vault.lock().unwrap();
    vault.search_entries(&query).map_err(vault_error_to_string)
}

#[tauri::command]
fn get_favorites(state: State<AppState>) -> Result<Vec<PasswordEntry>, String> {
    let vault = state.vault.lock().unwrap();
    vault.get_favorites().map_err(vault_error_to_string)
}

#[tauri::command]
fn toggle_favorite(state: State<AppState>, id: String) -> Result<PasswordEntry, String> {
    let mut vault = state.vault.lock().unwrap();
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    vault.toggle_favorite(uuid).map_err(vault_error_to_string)
}

#[tauri::command]
fn get_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    let vault = state.vault.lock().unwrap();
    vault.get_categories().map_err(vault_error_to_string)
}

#[tauri::command]
fn generate_password(length: usize, include_symbols: bool) -> String {
    crypto::generate_password(length, include_symbols)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(any(target_os = "macos", target_os = "windows"))]
            {
                let window = app.get_webview_window("main").unwrap();

                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(16.0))
                        .expect("Failed to apply vibrancy");
                }

                #[cfg(target_os = "windows")]
                {
                    use window_vibrancy::apply_mica;
                    apply_mica(&window, Some(true)).ok();
                }
            }

            Ok(())
        })
        .manage(AppState {
            vault: Mutex::new(Vault::new()),
        })
        .invoke_handler(tauri::generate_handler![
            vault_exists,
            vault_is_unlocked,
            create_vault,
            unlock_vault,
            lock_vault,
            get_entries,
            get_entry,
            add_entry,
            update_entry,
            delete_entry,
            search_entries,
            get_favorites,
            toggle_favorite,
            get_categories,
            generate_password,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
