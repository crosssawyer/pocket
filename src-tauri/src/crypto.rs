use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::{rngs::OsRng, RngCore};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Encryption failed")]
    EncryptionFailed,
    #[error("Decryption failed")]
    DecryptionFailed,
    #[error("Invalid key derivation")]
    KeyDerivationFailed,
    #[error("Base64 decode error")]
    Base64Error,
}

const NONCE_SIZE: usize = 12;
const KEY_SIZE: usize = 32;

/// Derives a 256-bit key from a master password using Argon2id
pub fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; KEY_SIZE], CryptoError> {
    let argon2 = Argon2::default();
    let salt_string = SaltString::encode_b64(salt).map_err(|_| CryptoError::KeyDerivationFailed)?;

    let hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|_| CryptoError::KeyDerivationFailed)?;

    let hash_bytes = hash.hash.ok_or(CryptoError::KeyDerivationFailed)?;
    let bytes = hash_bytes.as_bytes();

    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&bytes[..KEY_SIZE]);
    Ok(key)
}

/// Generates a random salt for key derivation
pub fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// Encrypts plaintext using AES-256-GCM
pub fn encrypt(plaintext: &str, key: &[u8; KEY_SIZE]) -> Result<String, CryptoError> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| CryptoError::EncryptionFailed)?;

    let mut nonce_bytes = [0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|_| CryptoError::EncryptionFailed)?;

    // Prepend nonce to ciphertext
    let mut combined = nonce_bytes.to_vec();
    combined.extend(ciphertext);

    Ok(BASE64.encode(combined))
}

/// Decrypts ciphertext using AES-256-GCM
pub fn decrypt(ciphertext: &str, key: &[u8; KEY_SIZE]) -> Result<String, CryptoError> {
    let combined = BASE64
        .decode(ciphertext)
        .map_err(|_| CryptoError::Base64Error)?;

    if combined.len() < NONCE_SIZE {
        return Err(CryptoError::DecryptionFailed);
    }

    let (nonce_bytes, encrypted) = combined.split_at(NONCE_SIZE);
    let nonce = Nonce::from_slice(nonce_bytes);

    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| CryptoError::DecryptionFailed)?;

    let plaintext = cipher
        .decrypt(nonce, encrypted)
        .map_err(|_| CryptoError::DecryptionFailed)?;

    String::from_utf8(plaintext).map_err(|_| CryptoError::DecryptionFailed)
}

/// Generates a secure random password
pub fn generate_password(length: usize, include_symbols: bool) -> String {
    let mut chars: Vec<char> = Vec::new();

    // Always include letters and numbers
    chars.extend('a'..='z');
    chars.extend('A'..='Z');
    chars.extend('0'..='9');

    if include_symbols {
        chars.extend("!@#$%^&*()_+-=[]{}|;:,.<>?".chars());
    }

    let mut password = String::with_capacity(length);
    let mut rng = OsRng;

    for _ in 0..length {
        let idx = (rng.next_u32() as usize) % chars.len();
        password.push(chars[idx]);
    }

    password
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let salt = generate_salt();
        let key = derive_key("test_password", &salt).unwrap();
        let plaintext = "Hello, World!";

        let encrypted = encrypt(plaintext, &key).unwrap();
        let decrypted = decrypt(&encrypted, &key).unwrap();

        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_password_generation() {
        let password = generate_password(16, true);
        assert_eq!(password.len(), 16);
    }
}
