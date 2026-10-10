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
    ChatAI,
    Editors,
    Charts,
    Icons,
    Palette,
    Theming,
    State,
}

pub const SECTIONS: [Section; 16] = [
    Section::Buttons,
    Section::TagsBadges,
    Section::Inputs,
    Section::Pickers,
    Section::Feedback,
    Section::Overlays,
    Section::MenusDialogs,
    Section::DataDisplay,
    Section::Layout,
    Section::ChatAI,
    Section::Editors,
    Section::Charts,
    Section::Icons,
    Section::Palette,
    Section::Theming,
    Section::State,
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
            Section::ChatAI => "nav-chat-ai",
            Section::Editors => "nav-editors",
            Section::Charts => "nav-charts",
            Section::Icons => "nav-icons",
            Section::Palette => "nav-palette",
            Section::Theming => "nav-theming",
            Section::State => "nav-state",
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
            Section::Layout => "Layout",
            Section::ChatAI => "Chat & AI",
            Section::Editors => "Text Editors",
            Section::Charts => "Charts & Plots",
            Section::Icons => "Phosphor Icons",
            Section::Palette => "Palette",
            Section::Theming => "Theming & Config",
            Section::State => "State & Stores",
        }
    }

    pub fn description(self) -> &'static str {
        match self {
            Section::Buttons => {
                "button.rs wrapper — variants, sizes, kbd, link, and command palette."
            }
            Section::TagsBadges => {
                "badge.rs wrapper — variant chips, count/dot badges, markers, and avatars."
            }
            Section::Inputs => {
                "input, textarea, otp, select, slider, stepper, switch, checkbox, radio, rating, label."
            }
            Section::Pickers => "date_picker, calendar, color_picker, and number input.",
            Section::Feedback => {
                "alert, progress, progress_circle, spinner, skeleton, shimmer; zeron-port loaders, notice chips, context badges."
            }
            Section::Overlays => {
                "popover, tooltip, hover_card, toast, dialog, alert_dialog, and sheet."
            }
            Section::MenusDialogs => "dropdown / context menus, PopupMenuItem via WindowExt.",
            Section::DataDisplay => {
                "table, virtual_list, description_list, breadcrumb, pagination, and empty states."
            }
            Section::Layout => {
                "SwiftUI layout vocabulary — HStack, VStack, ZStack, Spacer, VGrid with every \
                 alignment variant live, defaults and gotchas per card, an interactive \
                 playground, plus tabs, accordion, collapsible, and group_box."
            }
            Section::ChatAI => {
                "message groups, bubbles with reactions, avatars, and file attachments."
            }
            Section::Editors => "markdown editor with toolbar + tree-sitter code mode.",
            Section::Charts => "bar charts and data plotting with semantic chart ramp.",
            Section::Icons => {
                "icon.rs wrapper — the vendored Phosphor Core 2.1.1 catalog (regular, bold, fill) with live search."
            }
            Section::Palette => "cx.theme() roles plus the brand pair and chart ramp.",
            Section::Theming => {
                "AppTheme — the globals.css equivalent: semantic tokens drive colors and radius, registered as named light/dark theme families and applied live."
            }
            Section::State => {
                "store.rs + context.rs — zustand-style stores, selector-gated subscriptions, and ambient contexts."
            }
        }
    }

    pub fn code(self) -> &'static str {
        match self {
            Section::Buttons => BUTTONS_CODE,
            Section::TagsBadges => TAGS_BADGES_CODE,
            Section::Inputs => INPUTS_CODE,
            Section::Pickers => PICKERS_CODE,
            Section::Feedback => FEEDBACK_CODE,
            Section::Overlays => OVERLAYS_CODE,
            Section::MenusDialogs => MENUS_DIALOGS_CODE,
            Section::DataDisplay => DATA_DISPLAY_CODE,
            Section::Layout => LAYOUT_CODE,
            Section::ChatAI => CHAT_AI_CODE,
            Section::Editors => EDITORS_CODE,
            Section::Charts => CHARTS_CODE,
            Section::Icons => ICONS_CODE,
            Section::Palette => PALETTE_CODE,
            Section::State => STATE_CODE,
            Section::Theming => THEMING_CODE,
        }
    }
}

const BUTTONS_CODE: &str = r#"use celestia_ui::components::Card;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::link::Link;
use gpui_component::h_flex;
use gpui::*;

// Primary action button
Button::new("btn-primary")
    .variant(ButtonVariant::Primary)
    .label("Primary")

// Outline secondary button
Button::new("btn-outline")
    .variant(ButtonVariant::Outline)
    .label("Outline")

// Subtle ghost button
Button::new("btn-ghost")
    .variant(ButtonVariant::Ghost)
    .label("Ghost")

// Compact small button
Button::new("btn-small")
    .variant(ButtonVariant::Primary)
    .size(ButtonSize::XSmall)
    .label("Small primary")

// Keyboard shortcut badge
Kbd::new(Keystroke::parse("cmd-d").expect("valid keystroke"))

// Interactive hyperlink
Link::new("link-gpui")
    .href("https://gpui.rs")
    .child("gpui.rs")"#;

const TAGS_BADGES_CODE: &str = r#"use celestia_ui::components::Card;
use celestia_ui::components::primitive::badge::{Badge, BadgeVariant, GpuiBadge};
use gpui_component::h_flex;
use gpui::*;

// Semantic variant badges
Badge::new("Primary")
Badge::new("Secondary").variant(BadgeVariant::Secondary)
Badge::new("Success").variant(BadgeVariant::Success)
Badge::new("Warning").variant(BadgeVariant::Warning)
Badge::new("Info").variant(BadgeVariant::Info)
Badge::new("Destructive").variant(BadgeVariant::Destructive)
Badge::new("Outline").variant(BadgeVariant::Outline)
Badge::new("Brand").variant(BadgeVariant::Brand)

// Notification counter & status dot badges
GpuiBadge::new().count(8)
GpuiBadge::new().dot()"#;

const INPUTS_CODE: &str = r#"use celestia_ui::components::Card;
use celestia_ui::components::primitive::checkbox::Checkbox;
use celestia_ui::components::primitive::input::{Input, InputState};
use celestia_ui::components::primitive::input_otp::{OtpInput, OtpState};
use celestia_ui::components::primitive::label::Label;
use celestia_ui::components::primitive::radio::Radio;
use celestia_ui::components::primitive::rating::Rating;
use celestia_ui::components::primitive::select::{Select, SelectState};
use celestia_ui::components::primitive::slider::{Slider, SliderState};
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::components::primitive::textarea::{Textarea, TextareaState};
use gpui::*;

// Single-line text input with clear button
Input::new(&self.demo_input).cleanable(true)

// Multi-line text area
Textarea::new(&self.demo_textarea)

// 6-digit OTP code input
OtpInput::new(&self.demo_otp)

// Dropdown select
Select::new(&self.demo_select)

// Continuous slider range
Slider::new(&self.demo_slider)

// Toggles, checkboxes, and radio buttons
Switch::new("sw-1").checked(true).label("Notifications")
Checkbox::new("cb-1").checked(true).label("Include archived")
Radio::new("rd-1").checked(true).label("Weekly")

// 5-star rating control
Rating::new("rating-1").value(4)"#;

const PICKERS_CODE: &str = r#"use celestia_ui::components::primitive::calendar::{Calendar, CalendarState};
use celestia_ui::components::composite::color_picker::{ColorPicker, ColorPickerState};
use celestia_ui::components::composite::date_picker::{DatePicker, DatePickerState};
use celestia_ui::components::primitive::input::{InputState, NumberInput};
use celestia_ui::components::primitive::label::Label;
use gpui::*;

// Interactive calendar grid with day selection
Calendar::new(&self.demo_calendar)

// Date picker popover dialog
DatePicker::new(&self.demo_date)

// Color picker popup with HSV/RGB palette
ColorPicker::new(&self.demo_color)

// Stepper numerical input
NumberInput::new(&self.demo_number)"#;

const FEEDBACK_CODE: &str = r#"use celestia_ui::components::primitive::alert::Alert;
use celestia_ui::components::composite::context_badge::{BadgeDetail, MessageBadge, context_badge};
use celestia_ui::components::composite::loaders::{
    gradient_spinner, mini_mono_spinner, mini_spinner, progress_ring, pulse_loader,
};
use celestia_ui::components::composite::notice::{NoticeChipIcon, notice_chip};
use celestia_ui::components::primitive::progress::Progress;
use celestia_ui::components::primitive::skeleton::Skeleton;
use celestia_ui::components::primitive::spinner::Spinner;
use gpui::*;

// Status alerts (info, success, warning, error)
Alert::info("al-info", "This is an informational alert.")
Alert::success("al-ok", "Everything went well.")
Alert::warning("al-warn", "Watch out for this.")
Alert::error("al-err", "Something failed.")

// Progress bars & loading indicators
Progress::new("pg-1").value(0.65)
Spinner::new()
Skeleton::new().h_4().w(px(192.))

// Micro loaders running on shared pulse clock
pulse_loader(8.0, view, cx)
gradient_spinner(6.0, view, cx)
progress_ring(65, 40.0, foreground)

// Notice chips & context badges
notice_chip(false, "Command failed", "Build exited with status 101", NoticeChipIcon::Tile, cx)
context_badge("badge-id", &badge_info, cx)"#;

const OVERLAYS_CODE: &str = r#"use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::popover::Popover;
use celestia_ui::components::primitive::toast::{Notification, WindowExt};
use gpui::*;

// Anchored popover dialog
Popover::new("pop-1")
    .trigger(
        Button::new("pop-trigger")
            .variant(ButtonVariant::Outline)
            .label("Popover"),
    )
    .content(|_, _, _| {
        div()
            .p_3()
            .text_sm()
            .child("Renders above everything in the Root layer.")
    })

// Button tooltip on hover
Button::new("tt-1")
    .variant(ButtonVariant::Outline)
    .label("Hover me")
    .tooltip("A tooltip on a button")

// Floating toast notification
Button::new("toast-1")
    .variant(ButtonVariant::Primary)
    .label("Push a toast")
    .on_click(|_, window, cx| {
        window.push_notification(
            Notification::success("Saved to Celestia."),
            cx,
        );
    })"#;

const MENUS_DIALOGS_CODE: &str = r#"use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::composite::menu::{ContextMenuExt as _, PopupMenuItem};
use gpui::*;

// Button dropdown menu with items, accelerators, and separators
Button::new("dd-file")
    .variant(ButtonVariant::Outline)
    .label("File Menu")
    .dropdown_caret(true)
    .dropdown_menu(|menu, _, _| {
        menu.item(PopupMenuItem::new("New File").on_click(|_, _, _| {}))
            .item(PopupMenuItem::new("Open…").on_click(|_, _, _| {}))
            .separator()
            .item(PopupMenuItem::new("Save").on_click(|_, _, _| {}))
            .item(PopupMenuItem::new("Save As…").on_click(|_, _, _| {}))
    })

// Context menu invoked via right-click gesture
div()
    .context_menu(|menu, _, _| {
        menu.item(PopupMenuItem::new("Inspect Element").on_click(|_, _, _| {}))
            .item(PopupMenuItem::new("Copy Selector").on_click(|_, _, _| {}))
            .separator()
            .item(PopupMenuItem::new("Reload Frame").on_click(|_, _, _| {}))
    })"#;

const DATA_DISPLAY_CODE: &str = r#"use celestia_ui::components::primitive::breadcrumb::{Breadcrumb, BreadcrumbItem};
use celestia_ui::components::composite::description_list::DescriptionList;
use celestia_ui::components::composite::empty::{
    Empty as EmptyState, EmptyDescription, EmptyHeader, EmptyTitle,
};
use celestia_ui::components::composite::pagination::Pagination;
use celestia_ui::components::primitive::table::DataTable;
use celestia_ui::components::composite::virtual_list::{VirtualListScrollHandle, v_virtual_list};
use gpui::*;

// Structured tabular data table
DataTable::from_key_value(
    [
        ("INV-001 (Acme Corp)", "$1,200.00"),
        ("INV-002 (Globex Inc)", "$850.00"),
    ],
    window,
    cx,
)

// Virtualized event stream — 2,000 uneven rows, only the visible range renders
v_virtual_list(
    view,                // any Render entity
    "virtual-list-demo",
    Rc::new(item_sizes), // every row's Size, up front
    |view, range, _window, cx| range.map(|ix| view.row(ix, cx)).collect(),
)
.track_scroll(&scroll_handle)
.h_full()

// Programmatic jump; the same handle drives attached scrollbars
scroll_handle.scroll_to_bottom();

// Metadata description list
DescriptionList::new()
    .item("Framework", "Celestia Desktop", 1)
    .item("Platform Engine", "GPUI (Metal / Vulkan)", 1)
    .item("Design System", "Celestia Semantic Tokens", 1)

// Hierarchical breadcrumbs & pagination controls
Breadcrumb::new()
    .child(BreadcrumbItem::new("Home"))
    .child(BreadcrumbItem::new("Components"))
Pagination::new("pg-demo").total_pages(8).current_page(3)

// Empty state placeholder
EmptyState::new().header(
    EmptyHeader::new()
        .title(EmptyTitle::new().child("No records found"))
        .description(EmptyDescription::new().child("Try adjusting your filters.")),
)"#;

const LAYOUT_CODE: &str = r#"use celestia_ui::components::composite::alignment::{
    HorizontalAlignment, VerticalAlignment, ZAlignment,
};
use celestia_ui::components::composite::group_box::GroupBox;
use celestia_ui::components::composite::h_stack::HStack;
use celestia_ui::components::composite::spacer::Spacer;
use celestia_ui::components::composite::status_bar::StatusBar;
use celestia_ui::components::composite::v_grid::{GridItem, VGrid};
use celestia_ui::components::composite::v_stack::VStack;
use celestia_ui::components::composite::z_stack::ZStack;
use celestia_ui::components::primitive::accordion::Accordion;
use celestia_ui::components::primitive::collapsible::Collapsible;
use celestia_ui::components::primitive::separator::Separator;
use celestia_ui::components::primitive::tabs::{
    Tabs, TabsContent, TabsList, TabsTrigger, TabsVariant,
};
use gpui::*;

// HStack — a gpui flex row; `spacing` becomes the flex gap (default 8px)
// and the alignment argument is the CROSS axis (vertical here).
HStack::new(VerticalAlignment::Top).spacing(px(8.))
    .child(div().h(px(24.)).child("short"))
    .child(div().h(px(56.)).child("tall"))
    .child(Spacer::new()) // pushes everything after it to the trailing edge
    .child(Button::new("act").label("Action"))

// VStack — the vertical twin; alignment is the horizontal cross axis
// (Leading | Center | Trailing).
VStack::new(HorizontalAlignment::Leading).spacing(px(12.))
    .child("Title")
    .child("Body copy")

// Spacer — expands along the parent stack's main axis; never shrinks below
// minLength (it floors BOTH min-width and min-height).
Spacer::new().min_length(px(64.))

// ZStack — the depth stack: every child becomes an absolutely-positioned
// full-bleed layer and the ONE alignment pins each layer. ZStack fills its
// parent, so give it a bounded frame. Compose inside a layer (an inner
// HStack) to place content on independent edges.
ZStack::new(ZAlignment::BottomTrailing)
    .child(div().size_full().bg(cx.theme().primary.opacity(0.10))) // photo
    .child(
        div().w_full().p_3().child(
            HStack::new(VerticalAlignment::Bottom)
                .child("Caption")
                .child(Spacer::new())
                .child("Badge"),
        ),
    )

// VGrid (LazyVGrid) — column rules size each row; children wrap in child
// order, so the grid grows vertically — put long content in a ScrollView.
VGrid::new([
    GridItem::Fixed(px(88.)), // pinned column width
    GridItem::Flexible,       // shares what's left (flex_1)
    GridItem::Flexible,
])
.spacing(px(8.))
.children(items)

// Tabs (segmented pill / line underline), accordion, collapsible,
// separators, group boxes and status bars round out the family.
Tabs::new("tabs")
    .child(
        TabsList::new("tabs-list")
            .child(TabsTrigger::new("t-1").label("One").selected(true))
            .child(TabsTrigger::new("t-2").label("Two")),
    )
    .child(TabsContent::new("tc-1").child("Panel one"))
Accordion::new("acc")
    .item(|item| item.title("What is Celestia Desktop?").child("GPU-rendered native desktop UI on GPUI."))
Collapsible::new().open(true).content(div().p_3().child("Revealed with layout animation."))
Separator::horizontal()
GroupBox::new().child(div().p_3().child("Grouped content"))
StatusBar::new().left("Git: main* (clean)").right("UTF-8  •  Rust")"#;

const CHAT_AI_CODE: &str = r#"use celestia_ui::components::composite::attachment::{
    Attachment, AttachmentContent, AttachmentDescription, AttachmentTitle,
};
use celestia_ui::components::primitive::avatar::Avatar;
use celestia_ui::components::primitive::bubble::{Bubble, BubbleVariant};
use celestia_ui::components::composite::message::{Message, MessageAlignment, MessageContent, MessageGroup};
use gpui::*;

// Threaded chat message group
MessageGroup::new()
    .child(
        Message::new()
            .alignment(MessageAlignment::Start)
            .avatar(Avatar::new().name("Celestia AI"))
            .content(
                MessageContent::new().bubble(
                    Bubble::new()
                        .with_variant(BubbleVariant::Filled)
                        .child("Hello! How can I help you build with Celestia desktop today?"),
                ),
            ),
    )
    .child(
        Message::new()
            .alignment(MessageAlignment::End)
            .content(
                MessageContent::new().bubble(
                    Bubble::new()
                        .with_variant(BubbleVariant::Secondary)
                        .child("Show me the chat and AI primitive components!"),
                ),
            ),
    )

// Rich file attachment card
Attachment::new().content(
    AttachmentContent::new()
        .title(AttachmentTitle::new("design-tokens-v2.json"))
        .description(AttachmentDescription::new("JSON Configuration  •  14.2 KB")),
)"#;

const EDITORS_CODE: &str = r####"use celestia_ui::components::{CodeEditor, TextEditor};
use gpui::*;

// Markdown text editor with formatting toolbar
let demo_editor = cx.new(|cx| TextEditor::new(window, cx));
demo_editor.update(cx, |e, cx| {
    e.set_text(
        "## Release notes\n\n- Added **bold**, *italic* and `code` marks\n> Markdown in, markdown out.",
        window,
        cx,
    );
});

// Tree-sitter syntax highlighted code editor
let demo_code = cx.new(|cx| CodeEditor::new("rust", window, cx));
demo_code.update(cx, |e, cx| {
    e.set_text(
        "use celestia_ui::init;\n\nfn main() {\n    init(cx);\n    println!(\"Hello, Celestia!\");\n}",
        window,
        cx,
    );
});"####;

const CHARTS_CODE: &str = r#"use celestia_ui::components::composite::charts::chart::BarChart;
use gpui::*;

// Categorical band bar chart with semantic color ramp
BarChart::new(vec![
    ("Mon", 42.0),
    ("Tue", 68.0),
    ("Wed", 85.0),
    ("Thu", 55.0),
    ("Fri", 92.0),
    ("Sat", 40.0),
    ("Sun", 30.0),
])
.band(|(day, _)| *day)
.value(|(_, count)| *count)"#;

const PALETTE_CODE: &str = r#"use celestia_ui::palette;
use celestia_ui::theme::{hex, AppTheme, Scheme};
use gpui_component::ActiveTheme;
use gpui::*;

// Semantic theme color tokens
let primary = cx.theme().primary;
let success = cx.theme().success;
let warning = cx.theme().warning;
let info = cx.theme().info;
let danger = cx.theme().danger;

// Brand colors & chart palette ramp
let brand = palette(cx).brand();
let brand_deep = palette(cx).brand_deep();
let chart_1 = palette(cx).chart(0);
let chart_5 = palette(cx).chart(4);

// Live app theming configuration (rebuilds mode configs dynamically)
let config = AppTheme {
    radius: px(10.),
    light: Scheme {
        primary: Some(hex(0x2563eb)),
        ..Default::default()
    },
    dark: Scheme {
        primary: Some(hex(0x6aa5ff)),
        ..Default::default()
    },
};
config.apply(cx);"#;

const STATE_CODE: &str = r#"use celestia_ui::state::{StoreContext, StoreHandle};
use gpui::*;

// 1. Zustand-style store — plain data plus &mut self actions
#[derive(Clone, Default)]
struct GalleryState {
    count: u32,
    label: SharedString,
}

impl GalleryState {
    fn increment(&mut self) {
        self.count += 1;
    }
}

// Create once, share the handle (getState / setState)
let gallery = StoreHandle::new(GalleryState::default(), cx);
gallery.set(cx, GalleryState::increment);          // action path
gallery.set(cx, |s| s.label = "Recording".into()); // inline update
let count = gallery.read(cx).count;                // getState

// 2. Selector-gated subscription (useStore(selector)) — the toolbar's
//    `count` updates only when the count slice changes
let toolbar = Toolbar {
    count: gallery.read(cx).count,
};
gallery.observe_slice(cx, |s| s.count, |toolbar, count, cx| {
    toolbar.count = count;
    cx.notify();
})
.detach();

// 3. React-context-style ambient value — provide once at the root…
StoreContext::<Session>::provide(Session::default(), cx);

// …then consume anywhere, no prop drilling
let session = StoreContext::<Session>::require(cx);
session.update(cx, |s| s.user = "celeste".into());"#;

const ICONS_CODE: &str = r#"use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon, PhosphorWeight, PHOSPHOR_VERSION};
use gpui::*;

// Bare children render at the surrounding text style:
div().text_sm().child(PhosphorIcon::CheckCircle)

// The Phosphor wrapper adds weight selection and inherits size/color
// from the text style unless overridden:
Phosphor::new(PhosphorIcon::Heart)
    .weight(PhosphorWeight::Fill)
    .size(px(20.))
    .color(cx.theme().danger)

Phosphor::new(PhosphorIcon::PaperPlaneTilt)
    .size(px(18.))
    .color(cx.theme().foreground)

Phosphor::new(PhosphorIcon::Star)
    .weight(PhosphorWeight::Bold)

// 1,512 glyphs per weight are embedded under assets/phosphor —
// Phosphor Core 2.1.1 (regular, bold, fill). Register the asset source
// once in main: application().with_assets(CelestiaAssets).run(…)"#;

const THEMING_CODE: &str = r#"use celestia_ui::theme::{active, families, hex, select, AppTheme, Scheme};
use gpui::px;

// One config for the whole library — the desktop equivalent of the shadcn
// `:root` / `.dark` blocks in globals.css. Unset fields keep the Celestia
// defaults from theme.json.
let config = AppTheme {
    radius: px(10.),
    light: Scheme {
        primary: Some(hex(0x2563eb)),
        ..Default::default()
    },
    dark: Scheme {
        primary: Some(hex(0x6aa5ff)),
        ..Default::default()
    },
};

// Expands each token into every theme key it drives (hover/active steps,
// ring, caret, selection, tints…) and overlays the active family. Every
// component reading cx.theme() picks it up on the next frame, and it
// survives Theme::change / mode switches.
config.apply(cx);

// Multi-theme: register the config as a named light+dark family and switch
// between families at runtime. Light, dark and custom themes — one token
// vocabulary, no per-component style fields.
config.register("Nocturne", cx); // registers + activates
select("Celestia", cx);          // back to the default family
families(cx);                    // ["Celestia", "Nocturne"]
active(cx);                      // "Celestia"

// Radius alone (radius_lg derives +4px for dialogs and notifications):
AppTheme { radius: px(12.), ..Default::default() }.apply(cx);

// Back to the Celestia defaults:
AppTheme::default().apply(cx);"#;
