#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Section {
    Buttons,
    TagsBadges,
    Inputs,
    Feedback,
    Editors,
    Overlays,
    MenusDialogs,
    Tabs,
    Accordion,
    Pickers,
    Palette,
}

pub const SECTIONS: [Section; 11] = [
    Section::Buttons,
    Section::TagsBadges,
    Section::Inputs,
    Section::Feedback,
    Section::Editors,
    Section::Overlays,
    Section::MenusDialogs,
    Section::Tabs,
    Section::Accordion,
    Section::Pickers,
    Section::Palette,
];

impl Section {
    pub fn id(self) -> &'static str {
        match self {
            Section::Buttons => "nav-buttons",
            Section::TagsBadges => "nav-tags",
            Section::Inputs => "nav-inputs",
            Section::Feedback => "nav-feedback",
            Section::Editors => "nav-editors",
            Section::Overlays => "nav-overlays",
            Section::MenusDialogs => "nav-menus",
            Section::Tabs => "nav-tabs",
            Section::Accordion => "nav-accordion",
            Section::Pickers => "nav-pickers",
            Section::Palette => "nav-palette",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Section::Buttons => "Buttons",
            Section::TagsBadges => "Tags & badges",
            Section::Inputs => "Inputs",
            Section::Feedback => "Feedback",
            Section::Editors => "Text editors",
            Section::Overlays => "Overlays",
            Section::MenusDialogs => "Menus & dialogs",
            Section::Tabs => "Tabs",
            Section::Accordion => "Accordion",
            Section::Pickers => "Pickers",
            Section::Palette => "Palette",
        }
    }

    pub fn description(self) -> &'static str {
        match self {
            Section::Buttons => "button.rs wrapper — variants, sizes, kbd, link.",
            Section::TagsBadges => {
                "badge.rs wrapper — variant chips incl. Brand, count and dot badges."
            }
            Section::Inputs => "input, select, switch, checkbox, radio, rating.",
            Section::Feedback => "alert, progress, spinner, skeleton; toasts under Overlays.",
            Section::Editors => "markdown editor with toolbar + tree-sitter code mode.",
            Section::Overlays => "popover, tooltip, toast (notification).",
            Section::MenusDialogs => "dropdown / context menus, Dialog and Sheet via WindowExt.",
            Section::Tabs => "tab bar + tabs, separator.",
            Section::Accordion => "accordion with toggleable items.",
            Section::Pickers => "date_picker, color_picker, number input.",
            Section::Palette => "cx.theme() roles plus the brand pair and chart ramp.",
        }
    }
}
