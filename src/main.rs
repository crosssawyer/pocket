mod crypto;
mod models;
mod storage;
mod ui;

use eframe::NativeOptions;
use egui::Vec2;
use ui::PocketApp;

fn main() -> eframe::Result {
    let options = NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size(Vec2::new(800.0, 600.0))
            .with_min_inner_size(Vec2::new(600.0, 400.0))
            .with_title("Pocket - Password Manager"),
        ..Default::default()
    };

    eframe::run_native(
        "Pocket",
        options,
        Box::new(|cc| Ok(Box::new(PocketApp::new(cc)))),
    )
}
