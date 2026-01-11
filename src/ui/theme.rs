use egui::{Color32, CornerRadius, FontFamily, FontId, Stroke, Style, TextStyle, Visuals};

/// Retro-minimal color palette inspired by vintage CRT displays
pub struct Theme {
    pub background: Color32,
    pub surface: Color32,
    pub surface_hover: Color32,
    pub border: Color32,
    pub text_primary: Color32,
    pub text_secondary: Color32,
    pub accent: Color32,
    pub accent_hover: Color32,
    pub error: Color32,
    pub success: Color32,
}

impl Theme {
    pub fn retro() -> Self {
        Self {
            // Warm beige background like aged paper
            background: Color32::from_rgb(240, 237, 230),
            // Slightly darker surface for contrast
            surface: Color32::from_rgb(248, 246, 242),
            // Hover state
            surface_hover: Color32::from_rgb(230, 227, 220),
            // Subtle borders
            border: Color32::from_rgb(195, 190, 180),
            // Dark text like vintage ink
            text_primary: Color32::from_rgb(55, 50, 45),
            // Muted secondary text
            text_secondary: Color32::from_rgb(120, 115, 110),
            // Teal accent inspired by old TV glow
            accent: Color32::from_rgb(75, 140, 130),
            accent_hover: Color32::from_rgb(65, 125, 115),
            // Subtle error red
            error: Color32::from_rgb(180, 80, 80),
            // Subtle success green
            success: Color32::from_rgb(90, 140, 90),
        }
    }

    pub fn apply_to_egui(&self, ctx: &egui::Context) {
        let mut style = Style::default();
        let mut visuals = Visuals::light();

        // Apply colors
        visuals.window_fill = self.background;
        visuals.panel_fill = self.background;
        visuals.extreme_bg_color = self.surface;
        visuals.widgets.noninteractive.bg_fill = self.surface;
        visuals.widgets.inactive.bg_fill = self.surface;
        visuals.widgets.hovered.bg_fill = self.surface_hover;
        visuals.widgets.active.bg_fill = self.accent;

        visuals.widgets.noninteractive.bg_stroke = Stroke::new(1.0, self.border);
        visuals.widgets.inactive.bg_stroke = Stroke::new(1.0, self.border);
        visuals.widgets.hovered.bg_stroke = Stroke::new(1.0, self.accent);
        visuals.widgets.active.bg_stroke = Stroke::new(1.0, self.accent_hover);

        // Text colors
        visuals.widgets.noninteractive.fg_stroke = Stroke::new(1.0, self.text_primary);
        visuals.widgets.inactive.fg_stroke = Stroke::new(1.0, self.text_primary);
        visuals.widgets.hovered.fg_stroke = Stroke::new(1.0, self.text_primary);
        visuals.widgets.active.fg_stroke = Stroke::new(1.0, self.background);

        style.visuals = visuals;

        // Clean, minimal font sizes
        style.text_styles.insert(
            TextStyle::Heading,
            FontId::new(28.0, FontFamily::Proportional),
        );
        style.text_styles.insert(
            TextStyle::Body,
            FontId::new(14.0, FontFamily::Proportional),
        );
        style.text_styles.insert(
            TextStyle::Button,
            FontId::new(14.0, FontFamily::Proportional),
        );

        ctx.set_style(style);
    }
}
