use crate::crypto::{decrypt, derive_key, encrypt, generate_salt};
use crate::models::Vault;
use std::fs;
use std::path::PathBuf;

const VAULT_FILE: &str = "vault.enc";
const SALT_FILE: &str = "salt";

/// Manages persistent storage of the encrypted vault
pub struct VaultStorage {
    data_dir: PathBuf,
}

impl VaultStorage {
    pub fn new() -> Result<Self, String> {
        let data_dir = dirs::data_local_dir()
            .ok_or("Could not determine data directory")?
            .join("pocket");

        fs::create_dir_all(&data_dir)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;

        Ok(Self { data_dir })
    }

    fn vault_path(&self) -> PathBuf {
        self.data_dir.join(VAULT_FILE)
    }

    fn salt_path(&self) -> PathBuf {
        self.data_dir.join(SALT_FILE)
    }

    /// Loads or creates the salt for key derivation
    pub fn get_or_create_salt(&self) -> Result<Vec<u8>, String> {
        let salt_path = self.salt_path();

        if salt_path.exists() {
            fs::read(&salt_path)
                .map_err(|e| format!("Failed to read salt: {}", e))
        } else {
            let salt = generate_salt();
            fs::write(&salt_path, &salt)
                .map_err(|e| format!("Failed to write salt: {}", e))?;
            Ok(salt)
        }
    }

    /// Saves the vault to disk, encrypted
    pub fn save(&self, vault: &Vault, master_password: &str) -> Result<(), String> {
        let salt = self.get_or_create_salt()?;
        let key = derive_key(master_password, &salt)?;

        let json = serde_json::to_string(vault)
            .map_err(|e| format!("Failed to serialize vault: {}", e))?;

        let encrypted = encrypt(json.as_bytes(), &key)?;

        fs::write(self.vault_path(), encrypted)
            .map_err(|e| format!("Failed to write vault: {}", e))?;

        Ok(())
    }

    /// Loads the vault from disk, decrypted
    pub fn load(&self, master_password: &str) -> Result<Vault, String> {
        let vault_path = self.vault_path();

        if !vault_path.exists() {
            return Ok(Vault::new());
        }

        let salt = self.get_or_create_salt()?;
        let key = derive_key(master_password, &salt)?;

        let encrypted = fs::read(&vault_path)
            .map_err(|e| format!("Failed to read vault: {}", e))?;

        let decrypted = decrypt(&encrypted, &key)?;

        let json = String::from_utf8(decrypted)
            .map_err(|e| format!("Invalid UTF-8 in decrypted data: {}", e))?;

        serde_json::from_str(&json)
            .map_err(|e| format!("Failed to deserialize vault: {}", e))
    }

    /// Checks if a vault exists
    pub fn vault_exists(&self) -> bool {
        self.vault_path().exists()
    }
}
