use crate::vault::PasswordEntry;
use chrono::Utc;
use csv::{Reader, Writer};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct CsvRow {
    name: String,
    url: String,
    username: String,
    password: String,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub imported_count: usize,
    pub skipped_count: usize,
    pub skipped_entries: Vec<SkippedEntry>,
}

#[derive(Debug, Serialize)]
pub struct SkippedEntry {
    pub title: String,
    pub username: String,
    pub reason: String,
}

pub fn detect_category_from_url(url: &str) -> String {
    let url_lower = url.to_lowercase();

    // Finance patterns
    if url_lower.contains("paypal")
        || url_lower.contains("venmo")
        || url_lower.contains("bank")
        || url_lower.contains("chase")
        || url_lower.contains("wellsfargo")
        || url_lower.contains("stripe")
        || url_lower.contains("coinbase")
        || url_lower.contains("robinhood")
    {
        return "Finance".to_string();
    }

    // Social patterns
    if url_lower.contains("facebook")
        || url_lower.contains("twitter")
        || url_lower.contains("instagram")
        || url_lower.contains("linkedin")
        || url_lower.contains("reddit")
        || url_lower.contains("tiktok")
        || url_lower.contains("snapchat")
        || url_lower.contains("discord")
    {
        return "Social".to_string();
    }

    // Work patterns
    if url_lower.contains("slack")
        || url_lower.contains("teams")
        || url_lower.contains("zoom")
        || url_lower.contains("github")
        || url_lower.contains("gitlab")
        || url_lower.contains("jira")
        || url_lower.contains("office")
        || url_lower.contains("365")
    {
        return "Work".to_string();
    }

    // Default to Login
    "Login".to_string()
}

pub fn import_from_csv(
    csv_content: &str,
    existing_entries: &[PasswordEntry],
) -> Result<(Vec<PasswordEntry>, ImportResult), String> {
    let mut reader = Reader::from_reader(csv_content.as_bytes());
    let mut new_entries = Vec::new();
    let mut skipped_entries = Vec::new();

    // Build duplicate detection set (username + url combination)
    let mut existing_pairs: HashSet<(String, String)> = HashSet::new();
    for entry in existing_entries {
        let url_normalized = entry
            .url
            .as_ref()
            .map(|u| u.to_lowercase())
            .unwrap_or_default();
        existing_pairs.insert((entry.username.to_lowercase(), url_normalized));
    }

    for result in reader.deserialize() {
        let row: CsvRow = match result {
            Ok(r) => r,
            Err(e) => {
                skipped_entries.push(SkippedEntry {
                    title: "Unknown".to_string(),
                    username: "Unknown".to_string(),
                    reason: format!("Parse error: {}", e),
                });
                continue;
            }
        };

        // Check for duplicate
        let username_lower = row.username.to_lowercase();
        let url_lower = row.url.to_lowercase();
        let pair = (username_lower.clone(), url_lower.clone());

        if existing_pairs.contains(&pair) {
            skipped_entries.push(SkippedEntry {
                title: row.name.clone(),
                username: row.username.clone(),
                reason: "Duplicate (same username + URL)".to_string(),
            });
            continue;
        }

        // Detect category
        let category = detect_category_from_url(&row.url);

        // Create new entry
        let now = Utc::now();
        let entry = PasswordEntry {
            id: Uuid::new_v4(),
            title: row.name,
            username: row.username,
            password: row.password,
            url: if row.url.is_empty() {
                None
            } else {
                Some(row.url)
            },
            notes: None,
            category,
            favorite: false,
            created_at: now,
            updated_at: now,
        };

        // Add to duplicate detection set
        existing_pairs.insert(pair);
        new_entries.push(entry);
    }

    let result = ImportResult {
        imported_count: new_entries.len(),
        skipped_count: skipped_entries.len(),
        skipped_entries,
    };

    Ok((new_entries, result))
}

pub fn export_to_csv(entries: &[PasswordEntry]) -> Result<String, String> {
    let mut writer = Writer::from_writer(vec![]);

    writer
        .write_record(["name", "url", "username", "password"])
        .map_err(|e| format!("Failed to write header: {}", e))?;

    for entry in entries {
        writer
            .write_record([
                &entry.title,
                entry.url.as_deref().unwrap_or(""),
                &entry.username,
                &entry.password,
            ])
            .map_err(|e| format!("Failed to write entry: {}", e))?;
    }

    let data = writer
        .into_inner()
        .map_err(|e| format!("Failed to finalize CSV: {}", e))?;

    String::from_utf8(data).map_err(|e| format!("Failed to convert to UTF-8: {}", e))
}
