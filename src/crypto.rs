use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2,
};
use rand::RngCore;
use zeroize::Zeroize;

const NONCE_SIZE: usize = 12;

/// Derives an encryption key from a master password using Argon2
pub fn derive_key(password: &str, salt: &[u8]) -> Result<Vec<u8>, String> {
    let argon2 = Argon2::default();
    let salt_string = SaltString::encode_b64(salt)
        .map_err(|e| format!("Failed to encode salt: {}", e))?;

    let hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|e| format!("Failed to hash password: {}", e))?;

    let hash_bytes = hash.hash.ok_or("No hash generated")?;
    Ok(hash_bytes.as_bytes()[..32].to_vec())
}

/// Generates a random salt for key derivation
pub fn generate_salt() -> Vec<u8> {
    let mut salt = vec![0u8; 16];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// Encrypts data using AES-256-GCM
pub fn encrypt(data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| format!("Invalid key length: {}", e))?;

    let mut nonce_bytes = [0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut result = nonce_bytes.to_vec();
    result.extend_from_slice(&ciphertext);

    Ok(result)
}

/// Decrypts data using AES-256-GCM
pub fn decrypt(encrypted_data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    if encrypted_data.len() < NONCE_SIZE {
        return Err("Invalid encrypted data".to_string());
    }

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| format!("Invalid key length: {}", e))?;

    let (nonce_bytes, ciphertext) = encrypted_data.split_at(NONCE_SIZE);
    let nonce = Nonce::from_slice(nonce_bytes);

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))
}

/// Securely wipes a byte vector from memory
pub fn secure_wipe(data: &mut Vec<u8>) {
    data.zeroize();
}
