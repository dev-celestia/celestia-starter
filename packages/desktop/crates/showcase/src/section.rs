#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Section {
    Buttons,
    TagsBadges,
    Inputs,
    Pickers,
    Feedback,
    Overlays,
    MenusDialogs,
    DataDisplay,
    Layout,
    SwiftUI,
    ChatAI,
    Editors,
    Charts,
    Palette,
}

pub const SECTIONS: [Section; 14] = [
    Section::Buttons,
    Section::TagsBadges,
    Section::Inputs,
    Section::Pickers,
    Section::Feedback,
    Section::Overlays,
    Section::MenusDialogs,
    Section::DataDisplay,
    Section::Layout,
    Section::SwiftUI,
    Section::ChatAI,
    Section::Editors,
    Section::Charts,
    Section::Palette,
];

impl Section {
    pub fn id(self) -> &'static str {
        match self {
            Section::Buttons => "nav-buttons",
            Section::TagsBadges => "nav-tags",
            Section::Inputs => "nav-inputs",
            Section::Pickers => "nav-pickers",
            Section::Feedback => "nav-feedback",
            Section::Overlays => "nav-overlays",
            Section::MenusDialogs => "nav-menus",
            Section::DataDisplay => "nav-data-display",
            Section::Layout => "nav-layout",
            Section::SwiftUI => "nav-swiftui",
            Section::ChatAI => "nav-chat-ai",
            Section::Editors => "nav-editors",
            Section::Charts => "nav-charts",
            Section::Palette => "nav-palette",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Section::Buttons => "Buttons & Actions",
            Section::TagsBadges => "Badges & Avatars",
            Section::Inputs => "Inputs & Selection",
            Section::Pickers => "Pickers & Calendar",
            Section::Feedback => "Feedback",
            Section::Overlays => "Overlays & Dialogs",
            Section::MenusDialogs => "Menus",
            Section::DataDisplay => "Data Display",
            Section::Layout => "Layout & Chrome",
            Section::SwiftUI => "SwiftUI Primitives",
            Section::ChatAI => "Chat & AI",
            Section::Editors => "Text Editors",
            Section::Charts => "Charts & Plots",
            Section::Palette => "Palette",
        }
    }

    pub fn description(self) -> &'static str {
        match self {
            Section::Buttons => "button.rs wrapper — variants, sizes, kbd, link, and command palette.",
            Section::TagsBadges => {
                "badge.rs wrapper — variant chips, count/dot badges, markers, and avatars."
            }
            Section::Inputs => {
                "input, textarea, otp, select, slider, stepper, switch, checkbox, radio, rating, label."
            }
            Section::Pickers => "date_picker, calendar, color_picker, and number input.",
            Section::Feedback => "alert, progress, progress_circle, spinner, skeleton, shimmer; zeron-port loaders, notice chips, context badges.",
            Section::Overlays => "popover, tooltip, hover_card, toast, dialog, alert_dialog, and sheet.",
            Section::MenusDialogs => "dropdown / context menus, PopupMenuItem via WindowExt.",
            Section::DataDisplay => "table, description_list, breadcrumb, pagination, and empty states.",
            Section::Layout => "tabs, accordion, collapsible, group_box, resizable, status_bar, separator.",
            Section::SwiftUI => "HStack, VStack, ZStack, Spacer, VGrid, ScrollView, and Frame modifiers.",
            Section::ChatAI => "message groups, bubbles with reactions, avatars, and file attachments.",
            Section::Editors => "markdown editor with toolbar + tree-sitter code mode.",
            Section::Charts => "bar charts and data plotting with semantic chart ramp.",
            Section::Palette => "cx.theme() roles plus the brand pair and chart ramp.",
        }
    }
}
