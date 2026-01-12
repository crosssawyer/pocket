use crate::crypto::{decrypt, derive_key, encrypt, generate_salt, CryptoError};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum VaultError {
    #[error("Vault is locked")]
    Locked,
    #[error("Invalid master password")]
    InvalidPassword,
    #[error("Entry not found")]
    NotFound,
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Crypto error: {0}")]
    CryptoError(#[from] CryptoError),
    #[error("Vault already exists")]
    AlreadyExists,
    #[error("No vault found")]
    NoVault,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordEntry {
    pub id: Uuid,
    pub title: String,
    pub username: String,
    pub password: String,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub category: String,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub name: String,
    pub icon: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct VaultData {
    salt: String,
    encrypted_entries: String,
    encrypted_categories: String,
    version: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct DecryptedData {
    entries: HashMap<Uuid, PasswordEntry>,
    categories: Vec<Category>,
}

pub struct Vault {
    path: PathBuf,
    key: Option<[u8; 32]>,
    data: Option<DecryptedData>,
}

impl Default for Vault {
    fn default() -> Self {
        Self::new()
    }
}

impl Vault {
    pub fn new() -> Self {
        let path = Self::get_vault_path();
        Self {
            path,
            key: None,
            data: None,
        }
    }

    fn get_vault_path() -> PathBuf {
        let dirs = directories::ProjectDirs::from("com", "pocket", "Pocket")
            .expect("Failed to get project directories");
        let data_dir = dirs.data_dir();
        fs::create_dir_all(data_dir).ok();
        data_dir.join("vault.pocket")
    }

    pub fn exists(&self) -> bool {
        self.path.exists()
    }

    pub fn is_unlocked(&self) -> bool {
        self.key.is_some() && self.data.is_some()
    }

    pub fn create(&mut self, master_password: &str) -> Result<(), VaultError> {
        if self.exists() {
            return Err(VaultError::AlreadyExists);
        }

        let salt = generate_salt();
        let key = derive_key(master_password, &salt)?;

        let default_categories = vec![
            Category {
                name: "Login".to_string(),
                icon: "key".to_string(),
                color: "#6366f1".to_string(),
            },
            Category {
                name: "Finance".to_string(),
                icon: "wallet".to_string(),
                color: "#10b981".to_string(),
            },
            Category {
                name: "Social".to_string(),
                icon: "users".to_string(),
                color: "#f59e0b".to_string(),
            },
            Category {
                name: "Work".to_string(),
                icon: "briefcase".to_string(),
                color: "#3b82f6".to_string(),
            },
            Category {
                name: "Other".to_string(),
                icon: "folder".to_string(),
                color: "#8b5cf6".to_string(),
            },
        ];

        let data = DecryptedData {
            entries: HashMap::new(),
            categories: default_categories,
        };

        self.key = Some(key);
        self.data = Some(data);

        self.save_with_salt(&salt)?;
        Ok(())
    }

    pub fn unlock(&mut self, master_password: &str) -> Result<(), VaultError> {
        if !self.exists() {
            return Err(VaultError::NoVault);
        }

        let file_content = fs::read_to_string(&self.path)?;
        let vault_data: VaultData = serde_json::from_str(&file_content)?;

        let salt =
            base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &vault_data.salt)
                .map_err(|_| VaultError::InvalidPassword)?;

        let key = derive_key(master_password, &salt)?;

        // Try to decrypt to verify password
        let entries_json = decrypt(&vault_data.encrypted_entries, &key)
            .map_err(|_| VaultError::InvalidPassword)?;
        let categories_json = decrypt(&vault_data.encrypted_categories, &key)
            .map_err(|_| VaultError::InvalidPassword)?;

        let entries: HashMap<Uuid, PasswordEntry> = serde_json::from_str(&entries_json)?;
        let categories: Vec<Category> = serde_json::from_str(&categories_json)?;

        self.key = Some(key);
        self.data = Some(DecryptedData {
            entries,
            categories,
        });

        Ok(())
    }

    pub fn lock(&mut self) {
        self.key = None;
        self.data = None;
    }

    fn save(&self) -> Result<(), VaultError> {
        let file_content = fs::read_to_string(&self.path)?;
        let vault_data: VaultData = serde_json::from_str(&file_content)?;

        let salt =
            base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &vault_data.salt)
                .map_err(|_| VaultError::InvalidPassword)?;

        self.save_with_salt(&salt)
    }

    fn save_with_salt(&self, salt: &[u8]) -> Result<(), VaultError> {
        let key = self.key.as_ref().ok_or(VaultError::Locked)?;
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;

        let entries_json = serde_json::to_string(&data.entries)?;
        let categories_json = serde_json::to_string(&data.categories)?;

        let encrypted_entries = encrypt(&entries_json, key)?;
        let encrypted_categories = encrypt(&categories_json, key)?;

        let vault_data = VaultData {
            salt: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, salt),
            encrypted_entries,
            encrypted_categories,
            version: 1,
        };

        let json = serde_json::to_string_pretty(&vault_data)?;
        fs::write(&self.path, json)?;

        Ok(())
    }

    pub fn add_entry(&mut self, entry: PasswordEntry) -> Result<PasswordEntry, VaultError> {
        let data = self.data.as_mut().ok_or(VaultError::Locked)?;
        let id = entry.id;
        data.entries.insert(id, entry.clone());
        self.save()?;
        Ok(entry)
    }

    pub fn update_entry(&mut self, entry: PasswordEntry) -> Result<PasswordEntry, VaultError> {
        let data = self.data.as_mut().ok_or(VaultError::Locked)?;

        if !data.entries.contains_key(&entry.id) {
            return Err(VaultError::NotFound);
        }

        data.entries.insert(entry.id, entry.clone());
        self.save()?;
        Ok(entry)
    }

    pub fn delete_entry(&mut self, id: Uuid) -> Result<(), VaultError> {
        let data = self.data.as_mut().ok_or(VaultError::Locked)?;

        if data.entries.remove(&id).is_none() {
            return Err(VaultError::NotFound);
        }

        self.save()?;
        Ok(())
    }

    pub fn get_entry(&self, id: Uuid) -> Result<PasswordEntry, VaultError> {
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;
        data.entries.get(&id).cloned().ok_or(VaultError::NotFound)
    }

    pub fn get_all_entries(&self) -> Result<Vec<PasswordEntry>, VaultError> {
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;
        let mut entries: Vec<_> = data.entries.values().cloned().collect();
        entries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(entries)
    }

    pub fn get_categories(&self) -> Result<Vec<Category>, VaultError> {
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;
        Ok(data.categories.clone())
    }

    pub fn search_entries(&self, query: &str) -> Result<Vec<PasswordEntry>, VaultError> {
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;
        let query_lower = query.to_lowercase();

        let mut results: Vec<_> = data
            .entries
            .values()
            .filter(|e| {
                e.title.to_lowercase().contains(&query_lower)
                    || e.username.to_lowercase().contains(&query_lower)
                    || e.url
                        .as_ref()
                        .map(|u| u.to_lowercase().contains(&query_lower))
                        .unwrap_or(false)
            })
            .cloned()
            .collect();

        results.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(results)
    }

    pub fn get_favorites(&self) -> Result<Vec<PasswordEntry>, VaultError> {
        let data = self.data.as_ref().ok_or(VaultError::Locked)?;
        let mut favorites: Vec<_> = data
            .entries
            .values()
            .filter(|e| e.favorite)
            .cloned()
            .collect();
        favorites.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(favorites)
    }

    pub fn toggle_favorite(&mut self, id: Uuid) -> Result<PasswordEntry, VaultError> {
        let data = self.data.as_mut().ok_or(VaultError::Locked)?;

        let entry = data.entries.get_mut(&id).ok_or(VaultError::NotFound)?;
        entry.favorite = !entry.favorite;
        entry.updated_at = Utc::now();

        let result = entry.clone();
        self.save()?;
        Ok(result)
    }
}
