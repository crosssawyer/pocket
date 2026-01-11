use serde::{Deserialize, Serialize};
use zeroize::Zeroize;

/// Represents a single password entry in the vault
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordEntry {
    pub id: String,
    pub title: String,
    pub username: String,
    #[serde(skip)]
    pub password: String,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl PasswordEntry {
    pub fn new(title: String, username: String, password: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            username,
            password,
            url: None,
            notes: None,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Drop for PasswordEntry {
    fn drop(&mut self) {
        self.password.zeroize();
    }
}

/// The password vault containing all entries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vault {
    pub entries: Vec<PasswordEntry>,
}

impl Vault {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    pub fn add_entry(&mut self, entry: PasswordEntry) {
        self.entries.push(entry);
    }

    pub fn remove_entry(&mut self, id: &str) {
        self.entries.retain(|e| e.id != id);
    }

    pub fn find_entry(&self, id: &str) -> Option<&PasswordEntry> {
        self.entries.iter().find(|e| e.id == id)
    }
}
