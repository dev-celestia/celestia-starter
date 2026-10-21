//! Gallery section metadata + docs snippets.
//!
//! Component identity lives in [`crate::catalog`]; this module attaches shared
//! family docs (usage / props / notes) and re-exports the catalog types the
//! showcase shell needs.

pub use crate::catalog::{Category, Family, SECTION_COUNT, Section};

impl Section {
    pub fn code(self) -> &'static str {
        self.family().code()
    }

    /// Structured docs for the gallery Docs tab: packages, props, usage, tips.
    pub fn docs(self) -> SectionDocs {
        let family = self.family();
        SectionDocs {
            props: family.props(),
            usage: family.code(),
            notes: family.notes(),
        }
    }
}

impl Family {
    pub fn code(self) -> &'static str {
        match self {
            Family::Buttons => BUTTONS_CODE,
            Family::Typography => TYPOGRAPHY_CODE,
            Family::TagsBadges => TAGS_BADGES_CODE,
            Family::Inputs => INPUTS_CODE,
            Family::Pickers => PICKERS_CODE,
            Family::Feedback => FEEDBACK_CODE,
            Family::Overlays => OVERLAYS_CODE,
            Family::MenusDialogs => MENUS_DIALOGS_CODE,
            Family::DataDisplay => DATA_DISPLAY_CODE,
            Family::Layout => LAYOUT_CODE,
            Family::ChatAI => CHAT_AI_CODE,
            Family::Editors => EDITORS_CODE,
            Family::Charts => CHARTS_CODE,
            Family::Composites => COMPOSITES_CODE,
            Family::DragDrop => DRAG_DROP_CODE,
            Family::Icons => ICONS_CODE,
            Family::Palette => PALETTE_CODE,
            Family::State => STATE_CODE,
            Family::Theming => THEMING_CODE,
        }
    }

    fn props(self) -> &'static [DocProp] {
        match self {
            Family::Buttons => BUTTONS_PROPS,
            Family::Typography => TYPOGRAPHY_PROPS,
            Family::TagsBadges => TAGS_BADGES_PROPS,
            Family::Inputs => INPUTS_PROPS,
            Family::Pickers => PICKERS_PROPS,
            Family::Feedback => FEEDBACK_PROPS,
            Family::Overlays => OVERLAYS_PROPS,
            Family::MenusDialogs => MENUS_DIALOGS_PROPS,
            Family::DataDisplay => DATA_DISPLAY_PROPS,
            Family::Layout => LAYOUT_PROPS,
            Family::ChatAI => CHAT_AI_PROPS,
            Family::Editors => EDITORS_PROPS,
            Family::Charts => CHARTS_PROPS,
            Family::Composites => COMPOSITES_PROPS,
            Family::DragDrop => DRAG_DROP_PROPS,
            Family::Icons => ICONS_PROPS,
            Family::Palette => PALETTE_PROPS,
            Family::Theming => THEMING_PROPS,
            Family::State => STATE_PROPS,
        }
    }

    fn notes(self) -> &'static [&'static str] {
        match self {
            Family::Buttons => BUTTONS_NOTES,
            Family::Typography => TYPOGRAPHY_NOTES,
            Family::TagsBadges => TAGS_BADGES_NOTES,
            Family::Inputs => INPUTS_NOTES,
            Family::Pickers => PICKERS_NOTES,
            Family::Feedback => FEEDBACK_NOTES,
            Family::Overlays => OVERLAYS_NOTES,
            Family::MenusDialogs => MENUS_DIALOGS_NOTES,
            Family::DataDisplay => DATA_DISPLAY_NOTES,
            Family::Layout => LAYOUT_NOTES,
            Family::ChatAI => CHAT_AI_NOTES,
            Family::Editors => EDITORS_NOTES,
            Family::Charts => CHARTS_NOTES,
            Family::Composites => COMPOSITES_NOTES,
            Family::DragDrop => DRAG_DROP_NOTES,
            Family::Icons => ICONS_NOTES,
            Family::Palette => PALETTE_NOTES,
            Family::Theming => THEMING_NOTES,
            Family::State => STATE_NOTES,
        }
    }
}

/// One prop / builder method row in the Docs tab.
#[derive(Clone, Copy)]
pub struct DocProp {
    pub name: &'static str,
    pub ty: &'static str,
    pub description: &'static str,
}

/// Props + usage + tips for a gallery component (package comes from [`Section::package`]).
#[derive(Clone, Copy)]
pub struct SectionDocs {
    pub props: &'static [DocProp],
    pub usage: &'static str,
    pub notes: &'static [&'static str],
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

const TYPOGRAPHY_CODE: &str = r#"use celestia_ui::components::primitive::typography::{
    Heading, Typography, TypographyTone, TypographyVariant,
};

// Prefer role constructors over ad-hoc text_sm + FontWeight
Heading::h1("Page title")
Heading::h2("Section")
Typography::lead("Supporting intro under a title.")
Typography::body("Default reading size for product copy.")
Typography::muted("Secondary helper line.")
Typography::caption("Footnote / meta")
Typography::overline("SECTION") // pass already uppercased
Typography::code("pnpm desktop")

// Or pick a variant + tone explicitly
Typography::new("Accent body")
    .variant(TypographyVariant::Body)
    .tone(TypographyTone::Accent)"#;

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
// Notification counter & status dot — wrap the anchor they overlay
GpuiBadge::new()
    .count(8)
    .child(Badge::new("Brand").variant(BadgeVariant::Brand))
GpuiBadge::new()
    .dot()
    .child(Badge::new("Inbox").variant(BadgeVariant::Secondary))

// Image or icon mark — with or without a label
use celestia_ui::components::primitive::image_icon::{
    ImageIcon, ImageIconLayout, ImageIconSize,
};
use celestia_ui::components::primitive::icon::PhosphorIcon;

ImageIcon::icon("file", PhosphorIcon::File)                    // mark only
ImageIcon::icon("main", PhosphorIcon::FileCode)
    .label("main.rs")
    .description("2.4 KB")
ImageIcon::icon("tile", PhosphorIcon::MusicNotes)
    .size(ImageIconSize::Xl)
    .label("Playlist")
    .layout(ImageIconLayout::Vertical)"#;

const INPUTS_CODE: &str = r#"use celestia_ui::components::primitive::aspect_ratio::AspectRatio;
use celestia_ui::components::primitive::checkbox::Checkbox;
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::input::{Input, InputState};
use celestia_ui::components::primitive::item::{Item, ItemContent, ItemGroup, ItemMedia, ItemTitle};
use celestia_ui::components::primitive::radio::Radio;
use celestia_ui::components::primitive::rating::Rating;
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::components::primitive::toggle::{Toggle, ToggleGroup};
use gpui::*;

// Entity-backed text / select / slider
Input::new(&self.demo_input).cleanable(true)
Select::new(&self.demo_select)
Slider::new(&self.demo_slider)

// Boolean / choice — Switch is a track; Toggle is a pressed button
Switch::new("sw-1").checked(true).label("Notifications")
Checkbox::new("cb-1").checked(true).label("Include archived")
Radio::new("rd-1").checked(true).label("Weekly")
Rating::new("rating-1").value(4)

// Pressed toggle + segmented exclusive group
Toggle::new("tg-bold").outline().label("Bold").checked(true)
ToggleGroup::new("tg-align").outline().segmented().exclusive()
    .child(Toggle::new("align-l").checked(true))
    .child(Toggle::new("align-c"))
    .child(Toggle::new("align-r"))

// List-row atom + fixed-ratio box
ItemGroup::new().child(
    Item::new().id("row").outline()
        .child(ItemMedia::new().icon().child(PhosphorIcon::File))
        .child(ItemContent::new().child(ItemTitle::new("README.md"))),
)
AspectRatio::widescreen().child(div().size_full().bg(cx.theme().muted))"#;

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

const OVERLAYS_CODE: &str = r#"use celestia_ui::components::composite::modal::{Modal, ModalSize};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
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

// Presentational centered modal (pair with window.open_dialog for a live host)
Modal::new("edit-profile")
    .title("Edit profile")
    .description("Update how your name appears across Celestia.")
    .size(ModalSize::Medium)
    .child(div().text_sm().child("Body content"))
    .footer(Button::new("save").variant(ButtonVariant::Primary).label("Save"))

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

const MENUS_DIALOGS_CODE: &str = r#"use celestia_ui::components::composite::menu::{ContextMenuExt as _, PopupMenuItem};
use celestia_ui::components::composite::toolbar_menu::{ToolbarMenu, ToolbarMenuItem};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::menubar::{Menubar, MenubarMenu};
use celestia_ui::components::primitive::navigation_menu::{NavigationMenu, NavigationMenuItem};
use gpui::*;

// Button dropdown
Button::new("dd-file")
    .variant(ButtonVariant::Outline)
    .label("File Menu")
    .dropdown_caret(true)
    .dropdown_menu(|menu, _, _| {
        menu.item(PopupMenuItem::new("New File").on_click(|_, _, _| {}))
            .separator()
            .item(PopupMenuItem::new("Save").on_click(|_, _, _| {}))
    })

// Toolbar strip
ToolbarMenu::new("tm-h-icon").icon_only().horizontal()
    .item(ToolbarMenuItem::new("refresh", PhosphorIcon::ArrowClockwise).label("Refresh"))

// Top-of-window menubar
Menubar::new("menubar")
    .menu(MenubarMenu::new("file", "File", |menu, _, _| {
        menu.item(PopupMenuItem::new("New").on_click(|_, _, _| {}))
            .item(PopupMenuItem::new("Quit").on_click(|_, _, _| {}))
    }))
    .menu(MenubarMenu::new("edit", "Edit", |menu, _, _| {
        menu.item(PopupMenuItem::new("Undo").on_click(|_, _, _| {}))
    }))

// Horizontal nav with flyouts
NavigationMenu::new("nav")
    .item(NavigationMenuItem::link("home", "Home").active(true))
    .item(NavigationMenuItem::flyout("product", "Product", |menu, _, _| {
        menu.item(PopupMenuItem::new("Features").on_click(|_, _, _| {}))
            .item(PopupMenuItem::new("Pricing").on_click(|_, _, _| {}))
    }))
    .item(NavigationMenuItem::link("docs", "Docs"))

// Right-click context menu
div().context_menu(|menu, _, _| {
    menu.item(PopupMenuItem::new("Inspect Element").on_click(|_, _, _| {}))
})"#;

const DATA_DISPLAY_CODE: &str = r#"use celestia_ui::components::primitive::breadcrumb::{Breadcrumb, BreadcrumbItem};
use celestia_ui::components::composite::empty::{
    Empty as EmptyState, EmptyDescription, EmptyHeader, EmptyTitle,
};
use celestia_ui::components::composite::pagination::Pagination;
use celestia_ui::components::primitive::table::{DataTable, TableColumn};
use celestia_ui::components::composite::virtual_list::{VirtualListScrollHandle, v_virtual_list};
use gpui::*;

// Structured tabular data — pure GPUI composition table
DataTable::new(
    [
        TableColumn::new("Invoice").width(220.),
        TableColumn::new("Status").width(100.),
        TableColumn::new("Amount"),
    ],
    vec![
        vec!["INV-001 — Acme Corp".into(), "Paid".into(), "$1,200.00".into()],
        vec!["INV-002 — Globex Inc".into(), "Pending".into(), "$850.00".into()],
    ],
)
.caption("A list of recent invoices.")

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
StatusBar::new().left("Git: main* (clean)").right("UTF-8  •  Rust")

// Resizable panels — drag handles between panes (web resizable.tsx)
use celestia_ui::components::primitive::resizable::{ResizablePanelGroup, resizable_panel};
use celestia_ui::components::composite::resizable_split::ResizableSplit;

ResizablePanelGroup::horizontal("shell")
    .with_handle(true)
    .child(resizable_panel().size(px(220.)).child(sidebar))
    .child(resizable_panel().child(main))

ResizableSplit::horizontal("editor")
    .leading_size(px(240.))
    .leading(sidebar)
    .trailing(editor)"#;

const CHAT_AI_CODE: &str = r#"use celestia_ui::components::ai::prompt_input::{PromptInput, PromptStatus};
use celestia_ui::components::ai::reasoning::Reasoning;
use celestia_ui::components::ai::suggestion::{Suggestion, Suggestions};
use celestia_ui::components::ai::tool::{Tool, ToolState};
use celestia_ui::components::composite::message::{Message, MessageAlignment, MessageContent, MessageGroup};
use celestia_ui::components::primitive::bubble::{Bubble, BubbleVariant};
use gpui::*;

Suggestions::new("sugs")
    .child(Suggestion::new("s1", "Explain this diff"))
    .child(Suggestion::new("s2", "Write a unit test"));

PromptInput::new("prompt")
    .placeholder("Ask Celestia…")
    .status(PromptStatus::Ready);

Reasoning::new("think")
    .open(true)
    .duration_secs(3)
    .body("Comparing desktop and web message metrics…");

Tool::new("read", "read_file").state(ToolState::Completed);

MessageGroup::new().child(
    Message::new()
        .alignment(MessageAlignment::Start)
        .content(
            MessageContent::new().bubble(
                Bubble::new()
                    .with_variant(BubbleVariant::Filled)
                    .child("Hello from Celestia AI"),
            ),
        ),
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
use celestia_ui::components::composite::charts::{ChartDonut, ChartLine, ChartPie};
use gpui::*;

// Categorical band bar chart with semantic color ramp (raw plot)
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
.value(|(_, count)| *count)

// Prefabs — house chart ramp, sized containers, and the id opts into the
// interactive hover tooltip.
// Single-series trend line: smoothed by default, y values are f64.
ChartLine::new("chart-line-weekly", vec![("Mon", 420.0), ("Tue", 510.0)])
    .name("Sessions")
    .dots(true)

// Pie with leader-line labels; slice colors cycle the chart ramp.
// Slice values are f32.
ChartPie::new("chart-pie-sources", [("Direct", 300.0f32), ("Organic", 220.0)])
    .name("Visitors")

// Donut — punched-out centre with padded slices; children land in the hole.
ChartDonut::new("chart-donut-storage", [("Media", 320.0f32), ("Apps", 64.0)])
    .name("Storage")
    .child("512 GB")"#;

const PALETTE_CODE: &str = r#"use celestia_ui::palette;
use celestia_ui::theme::{hex, ActiveTheme as _, AppTheme, Scheme};
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

const COMPOSITES_CODE: &str = r#"use celestia_ui::components::composite::app_header::AppHeader;
use celestia_ui::components::composite::button_group::ButtonGroup;
use celestia_ui::components::composite::command_palette::{CommandPalette, CommandPaletteItem};
use celestia_ui::components::composite::window::{
    self as app_window, AppMenu, MinimizeWindow, WindowChrome,
};
use celestia_ui::components::composite::panel::Panel;
use celestia_ui::components::composite::start_bar::{StartBar, StartBarItem};
use celestia_ui::components::composite::traffic_lights::TrafficLights;
use celestia_ui::components::composite::system_tray::{SystemTray, SystemTrayClock, SystemTrayItem};
use celestia_ui::components::composite::toolbar::Toolbar;
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use gpui::{Menu, MenuItem};

AppHeader::new("header").brand("Celestia").title("Desktop")
Toolbar::new("tb").title("main.rs")

TrafficLights::new("lights").edited(true).on_close(|_, _| {})

// Import Window via the module — it is not re-exported from components::*
// (name clashes with gpui::Window).
app_window::Window::new("app", "Celestia Desktop")
    .chrome(WindowChrome::Native)

AppMenu::standard("Celestia")
    .menu(Menu::new("Window").items([MenuItem::action("Minimize", MinimizeWindow)]))
    .install(cx);

StartBar::new("taskbar")
    .start(Button::icon("start", PhosphorIcon::WindowsLogo).variant(ButtonVariant::Ghost))
    .item(StartBarItem::new("term", "Terminal").icon(PhosphorIcon::Terminal).active(true))
    .tray(
        SystemTray::new("tray")
            .item(SystemTrayItem::new("wifi", PhosphorIcon::WifiHigh))
            .clock(SystemTrayClock::new("clock", "3:34 PM").date("Tue 20 Oct")),
    )

ButtonGroup::new("edit")
    .child(Button::new("cut").variant(ButtonVariant::Ghost).label("Cut"))
    .child(Button::new("copy").variant(ButtonVariant::Ghost).label("Copy"))

Panel::new("checklist", "Release checklist")
    .description("Ship blockers")
    .child(/* content */)

CommandPalette::new("palette")
    .item(CommandPaletteItem::new("new", "New file").icon(PhosphorIcon::File))"#;

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

const THEMING_CODE: &str = r#"use celestia_ui::theme::{
    active, families, hex, select, ActiveTheme as _, AppFont, AppTheme, Scheme, Theme, ThemeMode,
};
use gpui::px;

// Light ↔ dark — one call. Prefer this over reading is_dark() yourself.
Theme::toggle(cx);
Theme::change(ThemeMode::Dark, cx); // or set explicitly

// One config for the whole library — the desktop equivalent of the shadcn
// `:root` / `.dark` blocks in globals.css. Unset fields keep the Celestia
// defaults from theme.json. Unset font fields keep Geist and the platform mono face.
let config = AppTheme {
    radius: px(10.),
    font: AppFont {
        family: Some("Georgia".into()),
        size: Some(px(18.)),
        ..Default::default()
    },
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

const BUTTONS_PROPS: &[DocProp] = &[
    DocProp {
        name: "Button::new",
        ty: "id: ElementId",
        description: "Create a labeled button. Use Button::icon for icon-only.",
    },
    DocProp {
        name: "variant",
        ty: "ButtonVariant",
        description: "Primary, Secondary, Destructive, Success, Warning, Info, Outline, Ghost, Quiet, Link.",
    },
    DocProp {
        name: "size",
        ty: "ButtonSize",
        description: "XSmall → Large height steps, plus Icon / IconXs / IconSm / IconLg squares.",
    },
    DocProp {
        name: "leading_icon / trailing_icon",
        ty: "impl IntoElement",
        description: "Typed icon slots (PhosphorIcon works). loading swaps the leading slot for a Spinner.",
    },
    DocProp {
        name: "on_click / dropdown_menu",
        ty: "callback / PopupMenu",
        description: "Click handler, or attach a dropdown (dropdown_caret(true) shows the chevron).",
    },
    DocProp {
        name: "Kbd / Link",
        ty: "Keystroke / href",
        description: "Keyboard shortcut badge and interactive hyperlink companions.",
    },
];

const BUTTONS_NOTES: &[&str] = &[
    "Success / Warning / Info are desktop-only status fills — web buttons only ship destructive.",
    "Prefer Button::icon(id, icon) for square icon buttons instead of forcing an empty label.",
    "dropdown_menu still rides gpui-component's PopupMenu until the menu family is rewritten.",
];

const TYPOGRAPHY_PROPS: &[DocProp] = &[
    DocProp {
        name: "Typography::body / h1… / muted…",
        ty: "SharedString",
        description: "Role constructors. Prefer these over div().text_sm().",
    },
    DocProp {
        name: "variant",
        ty: "TypographyVariant",
        description: "Display, H1–H4, Lead, Body, BodySm, Muted, Caption, Overline, Code.",
    },
    DocProp {
        name: "tone",
        ty: "TypographyTone",
        description: "Default, Muted, Accent, Destructive, Success, Warning, Inherit.",
    },
    DocProp {
        name: "Heading::h1…h4 / display",
        ty: "SharedString",
        description: "Semantic heading wrappers over the same scale.",
    },
    DocProp {
        name: "truncate / align / center",
        ty: "bool / TypographyAlign",
        description: "Single-line ellipsis and horizontal alignment.",
    },
];

const TYPOGRAPHY_NOTES: &[&str] = &[
    "One type scale: Display 36 → Caption 12. Line-height is unitless so it scales with size.",
    "Overline expects already-uppercased copy — GPUI has no text-transform.",
    "Muted / Caption / Overline default to TypographyTone::Muted; override with .tone(...).",
    "Prefer Typography / Heading for product copy; keep Caption for media-adjacent helper rows.",
];

const TAGS_BADGES_PROPS: &[DocProp] = &[
    DocProp {
        name: "Badge::new",
        ty: "label: SharedString",
        description: "Semantic chip. Chain .variant(BadgeVariant::…).",
    },
    DocProp {
        name: "Chip::new",
        ty: "id + label",
        description: "Interactive tag — .selected, .on_dismiss, .outline / .soft.",
    },
    DocProp {
        name: "StatusDot::new",
        ty: "id → tone",
        description: "Presence pip — .online / .away / .busy / .offline, optional label.",
    },
    DocProp {
        name: "Caption / GpuiBadge / Avatar",
        ty: "text / count / size",
        description: "Muted helper text, count/dot badges, and identity avatars.",
    },
    DocProp {
        name: "ImageIcon::icon / src / custom",
        ty: "id + mark",
        description: "Image or icon mark. Omit .label() for mark-only; add .layout(Vertical) for tiles.",
    },
];

const TAGS_BADGES_NOTES: &[&str] = &[
    "Badge is labeled semantics; Chip is selectable/dismissible; StatusDot is presence.",
    "Use GpuiBadge for unread counts overlaid on another element.",
    "ImageIcon is a mark (image/icon/custom) with an optional label — prefer IconLabel for a simple icon+text row.",
];

const INPUTS_PROPS: &[DocProp] = &[
    DocProp {
        name: "Input / Textarea / OtpInput",
        ty: "&Entity<…State>",
        description: "Bind to InputState, TextareaState, or OtpState created with cx.new.",
    },
    DocProp {
        name: "Select / Slider",
        ty: "&Entity<SelectState|SliderState>",
        description: "Dropdown options and continuous range; state owns the value.",
    },
    DocProp {
        name: "Switch / Checkbox / Radio / Rating",
        ty: "id + checked / value",
        description: "Boolean, single-choice, and star rating. Wire on_click to flip view state.",
    },
    DocProp {
        name: "Toggle / ToggleGroup",
        ty: "checked + outline + segmented",
        description: "Pressed on/off button (not Switch). Group supports exclusive + segmented.",
    },
    DocProp {
        name: "Item / ItemGroup / AspectRatio",
        ty: "slots / ratio",
        description: "List-row atom (media, content, actions) and fixed width÷height boxes.",
    },
];

const INPUTS_NOTES: &[&str] = &[
    "All text controls are entity-backed — create the State once in Showcase::new (or your view) and pass &entity.",
    "Toggle is a pressed button; Switch is a track. Prefer Toggle for toolbars, Switch for settings.",
    "ToggleGroup::exclusive().segmented() is the desktop twin of a toggle-group / segmented control.",
    "OtpInput length is fixed at OtpState::new(n, …); re-create the state to change digit count.",
];

const PICKERS_PROPS: &[DocProp] = &[
    DocProp {
        name: "Calendar / DatePicker",
        ty: "&Entity<CalendarState|DatePickerState>",
        description: "Month grid or popover date field. Read selection from the state entity.",
    },
    DocProp {
        name: "ColorPicker",
        ty: "&Entity<ColorPickerState>",
        description: "HSV/RGB palette popup; state holds the live color.",
    },
    DocProp {
        name: "NumberInput",
        ty: "&Entity<InputState>",
        description: "Stepper numerical input over a shared InputState.",
    },
];

const PICKERS_NOTES: &[&str] = &[
    "Create picker states in your view constructor — they are not RenderOnce elements.",
    "DatePicker wraps Calendar in a popover; use Calendar alone when the grid should stay inline.",
];

const FEEDBACK_PROPS: &[DocProp] = &[
    DocProp {
        name: "Alert::{info,success,warning,error}",
        ty: "id + message",
        description: "Status banners. Prefer the constructors over a bare Alert::new.",
    },
    DocProp {
        name: "Progress / Meter / Spinner / Skeleton",
        ty: "value 0..=1",
        description: "Task progress vs capacity meter (disk/quota), spinner, placeholders.",
    },
    DocProp {
        name: "pulse_loader / gradient_spinner / progress_ring",
        ty: "size + view + cx",
        description: "Zeron-port micro loaders sharing a pulse clock.",
    },
    DocProp {
        name: "notice_chip / context_badge",
        ty: "title + detail",
        description: "Compact failure chips and contextual message badges.",
    },
];

const FEEDBACK_NOTES: &[&str] = &[
    "Alert / Progress / Meter / Spinner / Skeleton are raw-GPUI — no gpui-component dependency.",
    "Meter auto-tones Warning ≥ 0.7 and Danger ≥ 0.9 unless .tone() is set.",
    "Micro loaders need a view + cx so they can tick on the shared pulse clock.",
];

const OVERLAYS_PROPS: &[DocProp] = &[
    DocProp {
        name: "Popover::new",
        ty: "id + trigger + content",
        description: "Anchored overlay. Pass a Button (or other) as .trigger and a content builder.",
    },
    DocProp {
        name: "Button::tooltip",
        ty: "SharedString",
        description: "Hover tooltip on any button without a separate Tooltip element.",
    },
    DocProp {
        name: "window.push_notification",
        ty: "Notification + cx",
        description: "Toast via WindowExt — always-visible close. Use Notification::success / error / info.",
    },
    DocProp {
        name: "Modal",
        ty: "title + body + footer",
        description: "Presentational centered modal chrome (web dialog.tsx). ModalHeader / Title / Description / Body / Footer for composition.",
    },
    DocProp {
        name: "SheetPanel / Drawer",
        ty: "side + title + body",
        description: "Presentational sheet/drawer chrome (web sheet.tsx / drawer.tsx). Embed or host in open_sheet.",
    },
    DocProp {
        name: "Dialog / Sheet / AlertDialog",
        ty: "WindowExt open_*",
        description: "Modal hosts from the window root plugin layers.",
    },
];

const OVERLAYS_NOTES: &[&str] = &[
    "Modal / SheetPanel / Drawer are presentational — pair with window.open_dialog / open_sheet for a live overlay host.",
    "Modal centers on a scrim; Drawer defaults to bottom with a swipe handle; SheetPanel defaults to the right edge.",
    "Overlays mount through gpui_component::init — do not re-render dialog/sheet/toast layers yourself in Root.",
];

const MENUS_DIALOGS_PROPS: &[DocProp] = &[
    DocProp {
        name: "Button::dropdown_menu",
        ty: "|menu, window, cx|",
        description: "Build PopupMenuItem rows, separators, and accelerators on the fly.",
    },
    DocProp {
        name: "ToolbarMenu",
        ty: "appearance + orientation + items",
        description: "Horizontal/vertical strip. Icon-only, text-only (ToolbarMenuItem::text), or icon + label.",
    },
    DocProp {
        name: "Menubar / MenubarMenu",
        ty: "id + label + menu builder",
        description: "Top-of-window File/Edit/View strip; each menu opens a PopupMenu.",
    },
    DocProp {
        name: "NavigationMenu / NavigationMenuItem",
        ty: "link | flyout",
        description: "Horizontal nav. link() for immediate actions; flyout() for dropdown panels.",
    },
    DocProp {
        name: "ContextMenuExt::context_menu",
        ty: "|menu, window, cx|",
        description: "Right-click menu on any element that implements the extension.",
    },
];

const MENUS_DIALOGS_NOTES: &[&str] = &[
    "Popup surfaces still come from gpui-component; Menubar, NavigationMenu, and ToolbarMenu are crate-owned.",
    "Prefer Menubar for app chrome, NavigationMenu for in-content nav, dropdown_menu on buttons for one-off menus.",
    "ToolbarMenu: icon_only()/labeled() × horizontal()/vertical(); use ToolbarMenuItem::text for no-icon rows.",
];

const DATA_DISPLAY_PROPS: &[DocProp] = &[
    DocProp {
        name: "DataTable::new",
        ty: "columns + rows",
        description: "Declarative table. TableColumn::new(label).width(px) sizes each column.",
    },
    DocProp {
        name: "v_virtual_list",
        ty: "view + id + sizes + render",
        description: "Virtualized list — only the visible range mounts. Track with VirtualListScrollHandle.",
    },
    DocProp {
        name: "Breadcrumb / Pagination",
        ty: "items / pages",
        description: "Hierarchy crumbs and page controls.",
    },
    DocProp {
        name: "Empty",
        ty: "EmptyHeader + title/description",
        description: "Empty-state placeholder when a collection has no rows.",
    },
];

const DATA_DISPLAY_NOTES: &[&str] = &[
    "DataTable is pure GPUI composition — pass SharedString cells, not arbitrary elements.",
    "Virtual lists need every row's Size up front (Rc<[Size]>); uneven heights are fine.",
    "scroll_handle.scroll_to_item / scroll_to_bottom drive programmatic jumps and scrollbars.",
];

const LAYOUT_PROPS: &[DocProp] = &[
    DocProp {
        name: "HStack / VStack",
        ty: "alignment + spacing",
        description: "Flex row/column. Alignment is the CROSS axis; spacing becomes flex gap (default 8px).",
    },
    DocProp {
        name: "ZStack",
        ty: "ZAlignment",
        description: "Depth stack — children are absolute full-bleed layers. Give it a bounded frame.",
    },
    DocProp {
        name: "Spacer / VGrid",
        ty: "min_length / GridItem rules",
        description: "Main-axis expander, and LazyVGrid-style columns (Fixed / Flexible).",
    },
    DocProp {
        name: "Tabs / Accordion / Collapsible / GroupBox",
        ty: "variant + items",
        description: "Segmented or line tabs, expandable sections, and bordered groups.",
    },
    DocProp {
        name: "ResizablePanelGroup / resizable_panel",
        ty: "axis + size + size_range",
        description: "Drag-resizable panels. with_handle(true) keeps a grip visible while idle.",
    },
    DocProp {
        name: "ResizableSplit",
        ty: "leading_size + leading/trailing",
        description: "Two-pane interactive split — prefer over fixed-ratio SplitPane when users drag.",
    },
];

const LAYOUT_NOTES: &[&str] = &[
    "Spacer floors BOTH min-width and min-height via min_length — it never shrinks below that.",
    "ZStack fills its parent; compose an inner HStack to pin content to independent edges.",
    "VGrid grows vertically from child order — put long grids inside a ScrollView.",
    "Nest ResizablePanelGroup inside resizable_panel().child(...) for IDE-style side+stack layouts.",
    "SplitPane is fixed-ratio only; use Resizable / ResizableSplit for drag handles.",
];

const CHAT_AI_PROPS: &[DocProp] = &[
    DocProp {
        name: "MessageGroup / Message",
        ty: "alignment + avatar + content",
        description: "Threaded chat. MessageAlignment::Start/End flips side.",
    },
    DocProp {
        name: "PromptInput",
        ty: "placeholder + status",
        description: "Composer with submit / stop. PromptStatus::Streaming swaps the action.",
    },
    DocProp {
        name: "Reasoning / Tool / Sources",
        ty: "open + state",
        description: "Thinking block, tool-call card (ToolState), citation list.",
    },
    DocProp {
        name: "Plan / Task / ChainOfThought",
        ty: "steps + status",
        description: "Multi-step agent progress. Status enums drive icon color.",
    },
    DocProp {
        name: "Agent / Queue / AiConfirmation",
        ty: "model + pending",
        description: "Agent card, queued work, and approve/deny tool prompts.",
    },
    DocProp {
        name: "AiCodeBlock / Snippet / AiTerminal",
        ty: "code + output",
        description: "Read-only code, one-line snippet, and terminal chrome.",
    },
    DocProp {
        name: "ContextUsage / InlineCitation",
        ty: "tokens / sources",
        description: "Token budget meter and superscript citation chip.",
    },
];

const CHAT_AI_NOTES: &[&str] = &[
    "Build messages inside MessageGroup so spacing and avatar alignment stay consistent.",
    "Use MessageAlignment::End for the local user; Start for assistants / peers.",
    "New AI kit lives under components::ai — flat imports use AiCodeBlock / AiTerminal / AiConfirmation to avoid name clashes.",
];

const EDITORS_PROPS: &[DocProp] = &[
    DocProp {
        name: "TextEditor::new",
        ty: "window + cx → Entity",
        description: "Markdown editor with formatting toolbar. Call set_text to seed content.",
    },
    DocProp {
        name: "CodeEditor::new",
        ty: "language + window + cx → Entity",
        description: "Tree-sitter highlighted editor. Language string selects the grammar (e.g. \"rust\").",
    },
    DocProp {
        name: "set_text",
        ty: "&str + window + cx",
        description: "Replace buffer contents on either editor entity.",
    },
];

const EDITORS_NOTES: &[&str] = &[
    "Editors are Entities, not RenderOnce — create once and re-render the same handle.",
    "Give the Editor a fixed height on the element itself or it lays out one line tall.",
];

const CHARTS_PROPS: &[DocProp] = &[
    DocProp {
        name: "BarChart::new",
        ty: "data + band + value",
        description: "Categorical bars. .band / .value pick the category and numeric accessors.",
    },
    DocProp {
        name: "ChartLine",
        ty: "id + [(label, f64)]",
        description: "Single-series trend. Smoothed by default; .dots(true) marks points.",
    },
    DocProp {
        name: "ChartPie / ChartDonut",
        ty: "id + [(label, f32)]",
        description: "Slices cycle the chart ramp. Donut accepts children in the hole.",
    },
];

const CHARTS_NOTES: &[&str] = &[
    "Prefabs (ChartLine / Pie / Donut) house the chart ramp and hover tooltips — prefer them over raw plots.",
    "BarChart values are f64; pie/donut slice values are f32.",
];

const COMPOSITES_PROPS: &[DocProp] = &[
    DocProp {
        name: "AppHeader / Toolbar / ActionBar",
        ty: "id + slots",
        description: "Chrome strips — brand/nav header, mid-content toolbar, sticky footer actions.",
    },
    DocProp {
        name: "StartBar / StartBarItem / SystemTray / StartMenu",
        ty: "id + slots",
        description: "Windows-style taskbar: start trigger, pinned apps, tray + clock, start menu flyout.",
    },
    DocProp {
        name: "Window / AppMenu / TrafficLights",
        ty: "composite/window",
        description: "OS-neutral names; macOS chrome for now. WindowChrome::Native roots this gallery. AppMenu::install → cx.set_menus; fullscreen reveals the bar on top-edge hover.",
    },
    DocProp {
        name: "ButtonGroup / InputGroup / Panel",
        ty: "builder",
        description: "Joined buttons, addon input shells (web twins), and titled content panels.",
    },
    DocProp {
        name: "ActivityFeed / MediaObject / CodeBlock / ChatComposer",
        ty: "builder",
        description: "Notification lists, media rows, read-only snippets, and compose chrome.",
    },
    DocProp {
        name: "CommandPalette / TabBar / FormField / KanbanBoard / …",
        ty: "builder",
        description: "Earlier app composites — palette, tabs, forms, boards, confirm, toasts.",
    },
    DocProp {
        name: "FileTree / FileTreeFolder / FileTreeFile",
        ty: "path + name + expanded/selected",
        description: "Workspace directory hierarchy (web ai/file-tree.tsx). Host owns expand/select state.",
    },
];

const COMPOSITES_NOTES: &[&str] = &[
    "Composites are presentational shells — the host owns Entity state (inputs, open/close, selection).",
    "composite/window — Window / WindowChrome / AppMenu (OS-neutral; macOS layout for now). This gallery is WindowChrome::Native. Import Window via composite::window — it is not in components::* (clashes with gpui::Window).",
    "Prefer SplitPane for fixed ratios; use ResizableSplit / ResizablePanelGroup for drag handles.",
    "KanbanBoard ships its own KanbanCardDrag session. While a card is dragged, the column washes accent and an insert line appears before release — see the Drag & Drop family.",
    "ToastStack is an in-view host; window.push_notification still drives the Root notification layer.",
    "ButtonGroup joins borders; for exclusive pressed states use ToggleGroup instead.",
    "FileTree is presentational chrome; pair with FileBrowser.tree(…) or embed standalone.",
];

const DRAG_DROP_CODE: &str = r#"use celestia_ui::components::composite::dnd::{
    reorder_vec, DropTarget, Draggable, ItemDrag,
};
use celestia_ui::components::composite::drop_zone::DropZone;
use celestia_ui::components::composite::sortable_list::{SortableItem, SortableList};
use celestia_ui::components::primitive::drag_handle::DragHandle;
use celestia_ui::components::primitive::drop_indicator::DropIndicator;

Draggable::new("src", ItemDrag::new("list", "a", 0, "Alpha"))
    .child(/* label */);

DropTarget::new("sink")
    .on_item_drop(|drag, _, _| { /* accept */ });

DropZone::new("uploads")
    .on_files(|paths, _, _| { /* Vec<PathBuf> */ });

SortableItem::new("row", "tasks", "a", 0, "Inbox")
    .on_reorder(|&(from, to), _, _| {
        // reorder_vec(&mut items, from, to);
    });"#;

const DRAG_DROP_PROPS: &[DocProp] = &[
    DocProp {
        name: "DragHandle",
        ty: "id + disabled",
        description: "Six-dot grip. Visual only — attach on_drag on a parent Draggable / SortableItem.",
    },
    DocProp {
        name: "DropIndicator",
        ty: "axis + visible",
        description: "Accent insert line. Axis::Vertical = horizontal rule (vertical lists).",
    },
    DocProp {
        name: "ItemDrag / Draggable / DropTarget",
        ty: "list_id + item_id + index + label",
        description: "Typed payload and drop surface. The source stays as-is; a valid hover paints an accent wash, an insertion line, and “Release to drop”.",
    },
    DocProp {
        name: "DropZone",
        ty: "on_files / on_item_drop / state",
        description: "Dashed file zone. Live ExternalPaths highlight with “Release to drop”; force_state pins gallery / error chrome.",
    },
    DocProp {
        name: "SortableList / SortableItem",
        ty: "on_reorder(from, to)",
        description: "Reorderable rows. A valid hover draws an insertion line and accent wash before on_reorder.",
    },
];

const DRAG_DROP_NOTES: &[&str] = &[
    "GPUI drag sessions are type-keyed — sources use on_drag(T) and targets listen with on_drop::<T>.",
    "Valid destinations highlight before release. The insertion gap animates open over the resize motion (200ms) so the list actually grows before you release.",
    "Use the same list_id on every SortableItem in a group so cross-list drops can be rejected.",
    "KanbanBoard uses KanbanCardDrag (see composite/kanban_board) rather than ItemDrag. Empty columns show “Drop here”; cards show the insert line.",
    "Web twins: @celestia-project/ui/composite/drop-zone and sortable-list (dnd-kit).",
];

const ICONS_PROPS: &[DocProp] = &[
    DocProp {
        name: "PhosphorIcon",
        ty: "enum variant",
        description: "Bare child renders at the surrounding text style (regular weight).",
    },
    DocProp {
        name: "Phosphor::new",
        ty: "icon → builder",
        description: "Weight / size / color / rotation overrides. Inherits text style otherwise.",
    },
    DocProp {
        name: "weight",
        ty: "PhosphorWeight",
        description: "Regular, Bold, or Fill — must match a vendored assets/phosphor/<weight>/ tree.",
    },
    DocProp {
        name: "PHOSPHOR_VERSION",
        ty: "&str",
        description: "Embedded Phosphor Core version string (currently 2.1.1).",
    },
];

const ICONS_NOTES: &[&str] = &[
    "Register CelestiaAssets once at app boot — without it every icon renders blank silently.",
    "Duotone is skipped: GPUI paints every SVG path with one color.",
    "Click a glyph in the gallery to copy PhosphorIcon::Name to the clipboard.",
];

const PALETTE_PROPS: &[DocProp] = &[
    DocProp {
        name: "cx.theme()",
        ty: "Theme roles",
        description: "primary, success, warning, info, danger, muted, border, background, …",
    },
    DocProp {
        name: "palette(cx)",
        ty: "brand + charts",
        description: "brand() / brand_deep() plus chart(i) ramp colors Theme does not carry.",
    },
    DocProp {
        name: "AppTheme / Scheme",
        ty: "radius + light/dark",
        description: "Runtime override of semantic tokens; unset fields keep theme.json defaults.",
    },
];

const PALETTE_NOTES: &[&str] = &[
    "Raw hex lives only in theme.json / palette.rs — call sites use cx.theme() or palette(cx).",
    "AppTheme::apply(cx) rebuilds the active family so every component picking tokens updates next frame.",
];

const THEMING_PROPS: &[DocProp] = &[
    DocProp {
        name: "Theme::toggle / change",
        ty: "cx / ThemeMode",
        description: "Flip light ↔ dark, or set the mode explicitly. Prefer toggle over reading is_dark.",
    },
    DocProp {
        name: "AppTheme::apply",
        ty: "&AppTheme + cx",
        description: "Overlay semantic colors + radius onto the active family (globals.css equivalent).",
    },
    DocProp {
        name: "register / select / families / active",
        ty: "name + cx",
        description: "Multi-theme: add a named light+dark family and switch between them at runtime.",
    },
];

const THEMING_NOTES: &[&str] = &[
    "Mode toggles stay inside the active family — they do not switch to another registered theme.",
    "radius_lg derives +4px from radius for dialogs and notifications.",
    "⌘D / Ctrl+D toggles theme in the gallery.",
];

const STATE_PROPS: &[DocProp] = &[
    DocProp {
        name: "StoreHandle::new",
        ty: "T + cx",
        description: "Zustand-style store. Share the handle; call .set / .read.",
    },
    DocProp {
        name: "set / read",
        ty: "|s| … / &T",
        description: "Mutate with an action or closure; read the current snapshot.",
    },
    DocProp {
        name: "observe_slice",
        ty: "selector + callback",
        description: "Re-render only when the selected slice changes (useStore(selector)).",
    },
    DocProp {
        name: "StoreContext::provide / require",
        ty: "T + cx",
        description: "Ambient React-context-style value — provide at the root, require anywhere.",
    },
];

const STATE_NOTES: &[&str] = &[
    "Detach observe_slice subscriptions so they live with the view.",
    "Prefer slice observers over observing the whole store when only one field drives a subtree.",
    "StoreContext avoids prop-drilling session / auth / workspace handles.",
];
