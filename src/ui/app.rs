use crate::models::{PasswordEntry, Vault};
use crate::storage::VaultStorage;
use crate::ui::theme::Theme;
use egui::{Align, CentralPanel, Color32, Layout, RichText, ScrollArea, TextEdit, Vec2};

#[derive(PartialEq, Clone)]
pub enum View {
    Login,
    VaultList,
    EntryDetail(String),
    NewEntry,
}

pub struct PocketApp {
    vault: Vault,
    storage: VaultStorage,
    master_password: String,
    current_view: View,
    theme: Theme,

    // Login view state
    password_input: String,
    error_message: Option<String>,

    // New entry state
    new_title: String,
    new_username: String,
    new_password: String,
    new_url: String,
    new_notes: String,

    // Search and filter
    search_query: String,
}

impl PocketApp {
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        let storage = VaultStorage::new().expect("Failed to create storage");
        let theme = Theme::retro();
        theme.apply_to_egui(&cc.egui_ctx);

        Self {
            vault: Vault::new(),
            storage,
            master_password: String::new(),
            current_view: View::Login,
            theme,
            password_input: String::new(),
            error_message: None,
            new_title: String::new(),
            new_username: String::new(),
            new_password: String::new(),
            new_url: String::new(),
            new_notes: String::new(),
            search_query: String::new(),
        }
    }

    fn unlock(&mut self) {
        match self.storage.load(&self.password_input) {
            Ok(vault) => {
                self.vault = vault;
                self.master_password = self.password_input.clone();
                self.password_input.clear();
                self.current_view = View::VaultList;
                self.error_message = None;
            }
            Err(e) => {
                self.error_message = Some(e);
            }
        }
    }

    fn save_vault(&mut self) -> Result<(), String> {
        self.storage.save(&self.vault, &self.master_password)
    }

    fn add_new_entry(&mut self) {
        let entry = PasswordEntry::new(
            self.new_title.clone(),
            self.new_username.clone(),
            self.new_password.clone(),
        );

        self.vault.add_entry(entry);

        if let Err(e) = self.save_vault() {
            self.error_message = Some(e);
        }

        // Clear form
        self.new_title.clear();
        self.new_username.clear();
        self.new_password.clear();
        self.new_url.clear();
        self.new_notes.clear();

        self.current_view = View::VaultList;
    }

    fn delete_entry(&mut self, id: &str) {
        self.vault.remove_entry(id);
        if let Err(e) = self.save_vault() {
            self.error_message = Some(e);
        }
        self.current_view = View::VaultList;
    }

    fn render_login(&mut self, ui: &mut egui::Ui) {
        ui.vertical_centered(|ui| {
            ui.add_space(80.0);

            // Logo/Title
            ui.label(
                RichText::new("Pocket")
                    .size(48.0)
                    .color(self.theme.text_primary),
            );

            ui.add_space(8.0);
            ui.label(
                RichText::new("Your secure password vault")
                    .size(14.0)
                    .color(self.theme.text_secondary),
            );

            ui.add_space(40.0);

            // Password input
            ui.vertical(|ui| {
                ui.set_max_width(320.0);

                ui.label(RichText::new("Master Password").color(self.theme.text_primary));
                ui.add_space(4.0);

                let password_edit = TextEdit::singleline(&mut self.password_input)
                    .password(true)
                    .min_size(Vec2::new(320.0, 32.0));

                let response = ui.add(password_edit);

                if response.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                    self.unlock();
                }

                ui.add_space(12.0);

                // Error message
                if let Some(error) = &self.error_message {
                    ui.label(RichText::new(error).color(self.theme.error));
                    ui.add_space(8.0);
                }

                // Unlock button
                let button = egui::Button::new(
                    RichText::new("Unlock Vault")
                        .size(14.0)
                        .color(self.theme.background),
                )
                .fill(self.theme.accent)
                .min_size(Vec2::new(320.0, 36.0));

                if ui.add(button).clicked() {
                    self.unlock();
                }
            });
        });
    }

    fn render_vault_list(&mut self, ui: &mut egui::Ui) {
        // Header
        ui.horizontal(|ui| {
            ui.label(RichText::new("Pocket").size(24.0).color(self.theme.text_primary));

            ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                let new_button = egui::Button::new(
                    RichText::new("+ New Entry").color(self.theme.background),
                )
                .fill(self.theme.accent);

                if ui.add(new_button).clicked() {
                    self.current_view = View::NewEntry;
                }

                ui.add_space(8.0);

                // Search box
                ui.add(
                    TextEdit::singleline(&mut self.search_query)
                        .hint_text("Search...")
                        .min_size(Vec2::new(200.0, 24.0)),
                );
            });
        });

        ui.add_space(16.0);
        ui.separator();
        ui.add_space(16.0);

        // Entry list
        ScrollArea::vertical().show(ui, |ui| {
            let filtered_entries: Vec<_> = self
                .vault
                .entries
                .iter()
                .filter(|entry| {
                    if self.search_query.is_empty() {
                        true
                    } else {
                        entry
                            .title
                            .to_lowercase()
                            .contains(&self.search_query.to_lowercase())
                            || entry
                                .username
                                .to_lowercase()
                                .contains(&self.search_query.to_lowercase())
                    }
                })
                .collect();

            if filtered_entries.is_empty() {
                ui.vertical_centered(|ui| {
                    ui.add_space(40.0);
                    ui.label(
                        RichText::new("No passwords stored yet")
                            .size(16.0)
                            .color(self.theme.text_secondary),
                    );
                    ui.add_space(8.0);
                    ui.label(
                        RichText::new("Click '+ New Entry' to add your first password")
                            .size(14.0)
                            .color(self.theme.text_secondary),
                    );
                });
            } else {
                for entry in filtered_entries {
                    let entry_id = entry.id.clone();

                    let response = ui.group(|ui| {
                        ui.set_min_width(ui.available_width());

                        ui.vertical(|ui| {
                            ui.label(
                                RichText::new(&entry.title)
                                    .size(16.0)
                                    .color(self.theme.text_primary)
                                    .strong(),
                            );

                            ui.add_space(4.0);

                            ui.label(
                                RichText::new(&entry.username)
                                    .size(14.0)
                                    .color(self.theme.text_secondary),
                            );

                            if let Some(url) = &entry.url {
                                if !url.is_empty() {
                                    ui.label(
                                        RichText::new(url)
                                            .size(12.0)
                                            .color(self.theme.accent),
                                    );
                                }
                            }
                        });
                    });

                    if response.response.clicked() {
                        self.current_view = View::EntryDetail(entry_id);
                    }

                    ui.add_space(8.0);
                }
            }
        });
    }

    fn render_entry_detail(&mut self, ui: &mut egui::Ui, entry_id: &str) {
        if let Some(entry) = self.vault.find_entry(entry_id) {
            let entry = entry.clone(); // Clone to avoid borrow issues

            // Header
            ui.horizontal(|ui| {
                if ui.button("← Back").clicked() {
                    self.current_view = View::VaultList;
                }

                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    let delete_button = egui::Button::new(
                        RichText::new("Delete").color(self.theme.background),
                    )
                    .fill(self.theme.error);

                    if ui.add(delete_button).clicked() {
                        self.delete_entry(&entry.id);
                    }
                });
            });

            ui.add_space(24.0);

            // Entry details
            ScrollArea::vertical().show(ui, |ui| {
                ui.vertical(|ui| {
                    ui.set_max_width(480.0);

                    // Title
                    ui.label(
                        RichText::new(&entry.title)
                            .size(28.0)
                            .color(self.theme.text_primary),
                    );

                    ui.add_space(24.0);

                    // Username
                    ui.label(RichText::new("Username").color(self.theme.text_secondary));
                    ui.add_space(4.0);
                    ui.code(&entry.username);

                    ui.add_space(16.0);

                    // Password
                    ui.label(RichText::new("Password").color(self.theme.text_secondary));
                    ui.add_space(4.0);
                    ui.code(&entry.password);

                    // URL
                    if let Some(url) = &entry.url {
                        if !url.is_empty() {
                            ui.add_space(16.0);
                            ui.label(RichText::new("URL").color(self.theme.text_secondary));
                            ui.add_space(4.0);
                            ui.hyperlink(url);
                        }
                    }

                    // Notes
                    if let Some(notes) = &entry.notes {
                        if !notes.is_empty() {
                            ui.add_space(16.0);
                            ui.label(RichText::new("Notes").color(self.theme.text_secondary));
                            ui.add_space(4.0);
                            ui.label(notes);
                        }
                    }
                });
            });
        } else {
            ui.label("Entry not found");
            if ui.button("← Back").clicked() {
                self.current_view = View::VaultList;
            }
        }
    }

    fn render_new_entry(&mut self, ui: &mut egui::Ui) {
        // Header
        ui.horizontal(|ui| {
            if ui.button("← Cancel").clicked() {
                self.current_view = View::VaultList;
            }
        });

        ui.add_space(24.0);

        // Form
        ScrollArea::vertical().show(ui, |ui| {
            ui.vertical(|ui| {
                ui.set_max_width(480.0);

                ui.label(RichText::new("New Entry").size(28.0).color(self.theme.text_primary));

                ui.add_space(24.0);

                // Title
                ui.label(RichText::new("Title *").color(self.theme.text_secondary));
                ui.add_space(4.0);
                ui.add(
                    TextEdit::singleline(&mut self.new_title)
                        .hint_text("e.g., Gmail")
                        .min_size(Vec2::new(480.0, 28.0)),
                );

                ui.add_space(16.0);

                // Username
                ui.label(RichText::new("Username *").color(self.theme.text_secondary));
                ui.add_space(4.0);
                ui.add(
                    TextEdit::singleline(&mut self.new_username)
                        .hint_text("e.g., user@example.com")
                        .min_size(Vec2::new(480.0, 28.0)),
                );

                ui.add_space(16.0);

                // Password
                ui.label(RichText::new("Password *").color(self.theme.text_secondary));
                ui.add_space(4.0);
                ui.add(
                    TextEdit::singleline(&mut self.new_password)
                        .password(true)
                        .hint_text("Enter password")
                        .min_size(Vec2::new(480.0, 28.0)),
                );

                ui.add_space(16.0);

                // URL
                ui.label(RichText::new("URL").color(self.theme.text_secondary));
                ui.add_space(4.0);
                ui.add(
                    TextEdit::singleline(&mut self.new_url)
                        .hint_text("e.g., https://gmail.com")
                        .min_size(Vec2::new(480.0, 28.0)),
                );

                ui.add_space(16.0);

                // Notes
                ui.label(RichText::new("Notes").color(self.theme.text_secondary));
                ui.add_space(4.0);
                ui.add(
                    TextEdit::multiline(&mut self.new_notes)
                        .hint_text("Additional notes...")
                        .min_size(Vec2::new(480.0, 80.0)),
                );

                ui.add_space(24.0);

                // Save button
                ui.horizontal(|ui| {
                    let can_save = !self.new_title.is_empty()
                        && !self.new_username.is_empty()
                        && !self.new_password.is_empty();

                    let save_button = egui::Button::new(
                        RichText::new("Save Entry").color(self.theme.background),
                    )
                    .fill(if can_save {
                        self.theme.accent
                    } else {
                        Color32::GRAY
                    })
                    .min_size(Vec2::new(150.0, 36.0));

                    if ui.add_enabled(can_save, save_button).clicked() {
                        self.add_new_entry();
                    }
                });
            });
        });
    }
}

impl eframe::App for PocketApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        CentralPanel::default().show(ctx, |ui| {
            ui.add_space(16.0);

            match &self.current_view.clone() {
                View::Login => self.render_login(ui),
                View::VaultList => self.render_vault_list(ui),
                View::EntryDetail(id) => self.render_entry_detail(ui, id),
                View::NewEntry => self.render_new_entry(ui),
            }
        });
    }
}
