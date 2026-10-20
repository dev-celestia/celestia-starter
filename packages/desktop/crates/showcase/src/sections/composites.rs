use celestia_ui::components::Card;
use celestia_ui::components::composite::action_bar::ActionBar;
use celestia_ui::components::composite::activity_feed::{ActivityFeed, ActivityItem};
use celestia_ui::components::composite::app_header::AppHeader;
use celestia_ui::components::composite::banner::{Banner, BannerTone};
use celestia_ui::components::composite::breadcrumb_bar::{BreadcrumbBar, BreadcrumbBarItem};
use celestia_ui::components::composite::bulk_action_bar::BulkActionBar;
use celestia_ui::components::composite::button_group::{ButtonGroup, ButtonGroupText};
use celestia_ui::components::composite::chat_composer::ChatComposer;
use celestia_ui::components::composite::checklist::{Checklist, ChecklistItem};
use celestia_ui::components::composite::code_block::CodeBlock;
use celestia_ui::components::composite::command_palette::{CommandPalette, CommandPaletteItem};
use celestia_ui::components::composite::comment_thread::{CommentItem, CommentThread};
use celestia_ui::components::composite::commit_row::CommitRow;
use celestia_ui::components::composite::conversation_list::{ConversationItem, ConversationList};
use celestia_ui::components::composite::data_table_toolbar::DataTableToolbar;
use celestia_ui::components::composite::file_browser::{FileBrowser, FileBrowserRow};
use celestia_ui::components::composite::file_tree::{FileTree, FileTreeFile, FileTreeFolder};
use celestia_ui::components::composite::filter_bar::{FilterBar, FilterChip};
use celestia_ui::components::composite::find_replace_bar::FindReplaceBar;
use celestia_ui::components::composite::form_field::FormField;
use celestia_ui::components::composite::input_group::{InputGroup, InputGroupAddon};
use celestia_ui::components::composite::inspector_panel::{InspectorPanel, InspectorRow};
use celestia_ui::components::composite::issue_card::{IssueCard, IssueTone};
use celestia_ui::components::composite::kanban_board::{
    KanbanBoard, KanbanCard, KanbanColumn, KanbanDrop, apply_kanban_drop,
};
use celestia_ui::components::composite::keybinding_recorder::{
    KeybindingRecorder, KeybindingState,
};
use celestia_ui::components::composite::log_viewer::{LogLevel, LogRow, LogViewer};
use celestia_ui::components::composite::window::{
    MacAppMenu, MacMenuBarPreview, MacWindow, MacWindowKind, MacWindowTab, MinimizeWindow,
    ZoomWindow,
};
use celestia_ui::components::composite::media_object::MediaObject;
use celestia_ui::components::composite::notification_center::NotificationCenter;
use celestia_ui::components::composite::onboarding_tip::OnboardingTip;
use celestia_ui::components::composite::outline_view::{OutlineItem, OutlineView};
use celestia_ui::components::composite::page_header::PageHeader;
use celestia_ui::components::composite::panel::Panel;
use celestia_ui::components::composite::project_card::ProjectCard;
use celestia_ui::components::composite::property_list::{PropertyList, PropertyRow};
use celestia_ui::components::composite::search_field::SearchField;
use celestia_ui::components::composite::settings_page::{SettingsPage, SettingsSection};
use celestia_ui::components::composite::side_nav::{SideNav, SideNavItem};
use celestia_ui::components::composite::split_pane::SplitPane;
use celestia_ui::components::composite::start_bar::{StartBar, StartBarItem};
use celestia_ui::components::composite::start_menu::{StartMenu, StartMenuItem, StartMenuPin};
use celestia_ui::components::composite::stat_card::{StatCard, StatCardGroup, StatDeltaTone};
use celestia_ui::components::composite::system_tray::{
    SystemTray, SystemTrayClock, SystemTrayItem,
};
use celestia_ui::components::composite::tab_bar::{TabBar, TabBarItem};
use celestia_ui::components::composite::tag_input::TagInput;
use celestia_ui::components::composite::task_list::{TaskItem, TaskList};
use celestia_ui::components::composite::terminal_panel::TerminalPanel;
use celestia_ui::components::composite::timeline::{Timeline, TimelineItem};
use celestia_ui::components::composite::toast_stack::{ToastItem, ToastPlacement, ToastStack};
use celestia_ui::components::composite::toolbar::Toolbar;
use celestia_ui::components::composite::traffic_lights::TrafficLights;
use celestia_ui::components::composite::user_menu::UserMenu;
use celestia_ui::components::composite::wizard::Wizard;
use celestia_ui::components::composite::workspace_switcher::{WorkspaceItem, WorkspaceSwitcher};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::chip::Chip;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::components::primitive::initials::Initials;
use celestia_ui::components::primitive::input::Input;
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_composite_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Wizard => Card::new()
                .title("Wizard")
                .description("Multi-step wizard chrome.")
                .child(
                                Wizard::new("wiz", "Create project")
                                    .step(1)
                                    .steps(["Basics", "Template", "Review"])
                                    .body(div().text_sm().child("Pick a starter template."))
                                    .footer(
                                        ActionBar::new("wiz-foot")
                                            .bordered(false)
                                            .trailing(
                                                Button::new("wiz-next")
                                                    .variant(ButtonVariant::Primary)
                                                    .label("Continue"),
                                            ),
                                    )
                )
                .into_any_element(),
            Demo::PageHeader => Card::new()
                .title("PageHeader")
                .description("Page title + actions.")
                .child(
                                PageHeader::new("ph", "Components")
                                    .description("Gallery of desktop composites.")
                                    .action(
                                        Button::new("ph-new")
                                            .variant(ButtonVariant::Outline)
                                            .label("New"),
                                    )
                )
                .into_any_element(),
            Demo::SideNav => Card::new()
                .title("SideNav")
                .description("Vertical side navigation.")
                .child(
                                SideNav::new("sn")
                                    .item(
                                        SideNavItem::new("sn-home", "Home")
                                            .icon(PhosphorIcon::House)
                                            .active(true),
                                    )
                                    .item(
                                        SideNavItem::new("sn-proj", "Projects")
                                            .icon(PhosphorIcon::Folders)
                                            .badge("3"),
                                    )
                )
                .into_any_element(),
            Demo::TaskList => Card::new()
                .title("TaskList")
                .description("Task checklist list.")
                .child(
                                        TaskList::new("tl")
                                            .title("Today")
                                            .w(px(240.0))
                                            .item(TaskItem::new("t1", "Ship primitives").done(true))
                                            .item(TaskItem::new("t2", "Write docs").meta("docs"))
                )
                .into_any_element(),
            Demo::Checklist => Card::new()
                .title("Checklist")
                .description("Simple checklist.")
                .child(
                                        Checklist::new("cl")
                                            .title("Setup")
                                            .w(px(200.0))
                                            .item(ChecklistItem::new("Install toolchain").checked(true))
                                            .item(ChecklistItem::new("Run gallery"))
                )
                .into_any_element(),
            Demo::ConversationList => Card::new()
                .title("ConversationList")
                .description("Conversation inbox list.")
                .child(
                                        ConversationList::new("conv")
                                            .w(px(260.0))
                                            .item(
                                                ConversationItem::new("c1", "Design sync")
                                                    .preview("Can we tighten the inspector?")
                                                    .time("2m")
                                                    .unread(true),
                                            )
                                            .item(
                                                ConversationItem::new("c2", "CI bot")
                                                    .preview("Build passed on main")
                                                    .time("1h"),
                                            )
                )
                .into_any_element(),
            Demo::NotificationCenter => Card::new()
                .title("NotificationCenter")
                .description("Notification tray.")
                .child(
                                        NotificationCenter::new("nc")
                                            .item(
                                                ActivityItem::new("n1", "PR ready for review")
                                                    .time("now")
                                                    .unread(true),
                                            )
                )
                .into_any_element(),
            Demo::WorkspaceSwitcher => Card::new()
                .title("WorkspaceSwitcher")
                .description("Workspace picker.")
                .child(
                                        WorkspaceSwitcher::new("ws")
                                            .item(
                                                WorkspaceItem::new("w1", "celestia-starter")
                                                    .path("~/Desktop/project")
                                                    .active(true),
                                            )
                                            .item(WorkspaceItem::new("w2", "notes").path("~/notes"))
                )
                .into_any_element(),
            Demo::UserMenu => Card::new()
                .title("UserMenu")
                .description("User account menu.")
                .child(
                                        UserMenu::new("um", "Ada Lovelace")
                                            .email("ada@celestia.dev")
                                            .avatar(Initials::new("um-av", "AL"))
                                            .action(
                                                Button::new("um-set")
                                                    .variant(ButtonVariant::Ghost)
                                                    .label("Settings"),
                                            )
                )
                .into_any_element(),
            Demo::FindReplaceBar => Card::new()
                .title("FindReplaceBar")
                .description("Find and replace bar.")
                .child(
                                FindReplaceBar::new("fr")
                                    .match_label("3 of 12")
                                    .action(
                                        Button::new("fr-next")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Next"),
                                    )
                                    .replace(div().text_sm().child("Replace with…"))
                )
                .into_any_element(),
            Demo::TagInput => Card::new()
                .title("TagInput")
                .description("Tag entry field.")
                .child(
                                TagInput::new("tags")
                                    .tag(Chip::new("tg-rust", "rust").soft())
                                    .tag(Chip::new("tg-ui", "ui").soft())
                                    .placeholder("Add label…")
                )
                .into_any_element(),
            Demo::TerminalPanel => Card::new()
                .title("TerminalPanel")
                .description("Terminal panel chrome.")
                .child(
                                        TerminalPanel::new("term")
                                            .w(px(280.0))
                                            .line("$ cargo check -p celestia-ui")
                                            .line("Finished dev profile in 1.2s")
                )
                .into_any_element(),
            Demo::LogViewer => Card::new()
                .title("LogViewer")
                .description("Log stream viewer.")
                .child(
                                        LogViewer::new("logs")
                                            .w(px(320.0))
                                            .row(
                                                LogRow::new("l1", "12:01:02", "server listening")
                                                    .level(LogLevel::Info),
                                            )
                                            .row(
                                                LogRow::new("l2", "12:01:03", "cache miss")
                                                    .level(LogLevel::Warn),
                                            )
                )
                .into_any_element(),
            Demo::OutlineView => Card::new()
                .title("OutlineView")
                .description("Document outline.")
                .child(
                                        OutlineView::new("out")
                                            .w(px(200.0))
                                            .item(OutlineItem::new("o1", "main").kind("fn").active(true))
                                            .item(OutlineItem::new("o2", "init").kind("fn").depth(1))
                )
                .into_any_element(),
            Demo::PropertyList => Card::new()
                .title("PropertyList")
                .description("Key/value properties.")
                .child(
                                PropertyList::new("props")
                                    .row(PropertyRow::new("Variant").text("Primary"))
                                    .row(PropertyRow::new("Disabled").text("false"))
                )
                .into_any_element(),
            Demo::ProjectCard => Card::new()
                .title("ProjectCard")
                .description("Project summary card.")
                .child(
                                        ProjectCard::new("pc", "celestia-ui")
                                            .description("GPUI component library")
                                            .meta("Rust · GPUI")
                                            .action(
                                                Button::new("pc-open")
                                                    .variant(ButtonVariant::Outline)
                                                    .label("Open"),
                                            )
                )
                .into_any_element(),
            Demo::IssueCard => Card::new()
                .title("IssueCard")
                .description("Issue / ticket card.")
                .child(
                                        IssueCard::new("is1", "DESK-42", "Tighten inspector gaps")
                                            .tone(IssueTone::Open)
                                            .meta("Assigned to Ada")
                )
                .into_any_element(),
            Demo::CommentThread => Card::new()
                .title("CommentThread")
                .description("Comment thread.")
                .child(
                                CommentThread::new("ct")
                                    .item(
                                        CommentItem::new("cm1", "Ada", "Looks good — ship it.")
                                            .time("1h")
                                            .avatar(Initials::new("cm-av", "A")),
                                    )
                )
                .into_any_element(),
            Demo::CommitRow => Card::new()
                .title("CommitRow")
                .description("VCS commit row.")
                .child(
                                CommitRow::new("cr1", "a1b2c3d", "feat(ui): add twenty composites")
                                    .author("Ada")
                                    .time("just now")
                )
                .into_any_element(),
            Demo::BulkActionBar => Card::new()
                .title("BulkActionBar")
                .description("Bulk selection actions.")
                .child(
                                BulkActionBar::new("bulk", 3)
                                    .action(
                                        Button::new("bulk-del")
                                            .variant(ButtonVariant::Destructive)
                                            .label("Delete"),
                                    )
                                    .action(
                                        Button::new("bulk-move")
                                            .variant(ButtonVariant::Outline)
                                            .label("Move"),
                                    )
                )
                .into_any_element(),
            Demo::AppHeader => Card::new()
                .title("AppHeader")
                .description("App brand + nav header.")
                .child(
                                AppHeader::new("demo-app-header")
                                    .brand("Celestia")
                                    .title("Desktop")
                                    .nav_item(
                                        Button::new("nav-home")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Home"),
                                    )
                                    .nav_item(
                                        Button::new("nav-docs")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Docs"),
                                    )
                                    .action(
                                        Button::new("hdr-new")
                                            .variant(ButtonVariant::Outline)
                                            .label("New"),
                                    )
                )
                .into_any_element(),
            Demo::Toolbar => Card::new()
                .title("Toolbar")
                .description("Mid-content toolbar.")
                .child(
                                Toolbar::new("demo-toolbar")
                                    .title("main.rs")
                                    .leading(
                                        Button::icon("tb-back", PhosphorIcon::ArrowLeft)
                                            .variant(ButtonVariant::Ghost),
                                    )
                                    .trailing(
                                        Button::icon("tb-more", PhosphorIcon::DotsThree)
                                            .variant(ButtonVariant::Ghost),
                                    )
                )
                .into_any_element(),
            Demo::StartBar => Card::new()
                .title("StartBar")
                .description("Windows-style taskbar / start bar.")
                .child(
                    StartBar::new("demo-start-bar")
                        .start(
                            Button::icon("sb-start", PhosphorIcon::WindowsLogo)
                                .variant(ButtonVariant::Ghost),
                        )
                        .search(
                            div()
                                .h(px(32.0))
                                .px(px(10.0))
                                .rounded(cx.theme().radius)
                                .border_1()
                                .border_color(cx.theme().border)
                                .bg(cx.theme().input)
                                .flex()
                                .flex_row()
                                .items_center()
                                .gap(px(6.0))
                                .child(
                                    Phosphor::new(PhosphorIcon::MagnifyingGlass)
                                        .size(px(14.0))
                                        .color(cx.theme().muted_foreground),
                                )
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Search"),
                                ),
                        )
                        .item(
                            StartBarItem::new("sb-term", "Terminal")
                                .icon(PhosphorIcon::Terminal)
                                .active(true)
                                .running(true),
                        )
                        .item(
                            StartBarItem::new("sb-code", "Editor")
                                .icon(PhosphorIcon::Code)
                                .running(true),
                        )
                        .item(
                            StartBarItem::new("sb-files", "Files")
                                .icon(PhosphorIcon::Folder)
                                .badge("2"),
                        )
                        .tray(
                            SystemTray::new("sb-tray")
                                .chevron(true)
                                .item(SystemTrayItem::new("net", PhosphorIcon::WifiHigh))
                                .item(SystemTrayItem::new("vol", PhosphorIcon::SpeakerHigh))
                                .item(
                                    SystemTrayItem::new("bell", PhosphorIcon::Bell).badge(true),
                                )
                                .clock(
                                    SystemTrayClock::new("clock", "3:34 PM").date("Tue 20 Oct"),
                                ),
                        ),
                )
                .into_any_element(),
            Demo::SystemTray => Card::new()
                .title("SystemTray")
                .description("Notification area + clock.")
                .child(
                    SystemTray::new("demo-tray")
                        .chevron(true)
                        .item(SystemTrayItem::new("tray-wifi", PhosphorIcon::WifiHigh))
                        .item(SystemTrayItem::new("tray-vol", PhosphorIcon::SpeakerHigh))
                        .item(
                            SystemTrayItem::new("tray-bell", PhosphorIcon::Bell)
                                .badge(true)
                                .active(true),
                        )
                        .clock(
                            SystemTrayClock::new("tray-clock", "3:34 PM").date("Tue 20 Oct"),
                        ),
                )
                .into_any_element(),
            Demo::StartMenu => Card::new()
                .title("StartMenu")
                .description("Start menu flyout.")
                .child(
                    StartMenu::new("demo-start-menu")
                        .search(
                            div()
                                .h(px(36.0))
                                .px(px(12.0))
                                .rounded(cx.theme().radius)
                                .border_1()
                                .border_color(cx.theme().border)
                                .bg(cx.theme().input)
                                .flex()
                                .flex_row()
                                .items_center()
                                .gap(px(8.0))
                                .child(
                                    Phosphor::new(PhosphorIcon::MagnifyingGlass)
                                        .size(px(14.0))
                                        .color(cx.theme().muted_foreground),
                                )
                                .child(
                                    div()
                                        .text_sm()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Type here to search"),
                                ),
                        )
                        .pin(StartMenuPin::new("pin-term", "Terminal", PhosphorIcon::Terminal))
                        .pin(StartMenuPin::new("pin-code", "Editor", PhosphorIcon::Code))
                        .pin(StartMenuPin::new("pin-files", "Files", PhosphorIcon::Folder))
                        .pin(StartMenuPin::new("pin-set", "Settings", PhosphorIcon::Gear))
                        .recommended(
                            StartMenuItem::new("rec-readme", "README.md")
                                .icon(PhosphorIcon::FileText)
                                .hint("Recently opened"),
                        )
                        .recommended(
                            StartMenuItem::new("rec-proj", "celestia-starter")
                                .icon(PhosphorIcon::FolderOpen)
                                .hint("Yesterday"),
                        )
                        .footer_leading(
                            div()
                                .flex()
                                .flex_row()
                                .items_center()
                                .gap(px(8.0))
                                .child(Initials::new("sm-user", "Ada Lovelace"))
                                .child(
                                    div()
                                        .text_sm()
                                        .text_color(cx.theme().foreground)
                                        .child("Ada"),
                                ),
                        )
                        .footer_action(
                            Button::icon("sm-power", PhosphorIcon::Power)
                                .variant(ButtonVariant::Ghost),
                        ),
                )
                .into_any_element(),
            Demo::ActionBar => Card::new()
                .title("ActionBar")
                .description("Sticky footer actions.")
                .child(
                                ActionBar::new("demo-action-bar")
                                    .hint("Unsaved changes")
                                    .trailing(
                                        Button::new("ab-cancel")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Cancel"),
                                    )
                                    .trailing(
                                        Button::new("ab-save")
                                            .variant(ButtonVariant::Primary)
                                            .label("Save"),
                                    )
                )
                .into_any_element(),
            Demo::ButtonGroup => Card::new()
                .title("ButtonGroup")
                .description("Joined button group.")
                .child(
                                ButtonGroup::new("demo-bg")
                                    .child(
                                        Button::new("bg-cut")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Cut"),
                                    )
                                    .child(
                                        Button::new("bg-copy")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Copy"),
                                    )
                                    .child(
                                        ButtonGroupText::new().child("or"),
                                    )
                                    .child(
                                        Button::new("bg-paste")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Paste"),
                                    )
                )
                .into_any_element(),
            Demo::InputGroup => Card::new()
                .title("InputGroup")
                .description("Input with addons.")
                .child(
                                InputGroup::new("demo-ig")
                                    .addon(
                                        InputGroupAddon::new()
                                            .start()
                                            .child(
                                                Phosphor::new(PhosphorIcon::MagnifyingGlass)
                                                    .size(px(14.0)),
                                            ),
                                    )
                                    .control(
                                        div()
                                            .text_sm()
                                            .child("Search packages…"),
                                    )
                                    .addon(
                                        InputGroupAddon::new()
                                            .end()
                                            .child("⌘K"),
                                    )
                )
                .into_any_element(),
            Demo::ActivityFeed => Card::new()
                .title("ActivityFeed")
                .description("Activity / notification feed.")
                .child(
                                ActivityFeed::new("demo-feed")
                                    .title("Activity")
                                    .item(
                                        ActivityItem::new("a1", "CI finished on main")
                                            .body("All checks passed")
                                            .time("2m")
                                            .icon(PhosphorIcon::CheckCircle)
                                            .unread(true),
                                    )
                                    .item(
                                        ActivityItem::new("a2", "Design review requested")
                                            .body("Inspector panel spacing")
                                            .time("1h")
                                            .icon(PhosphorIcon::Palette),
                                    )
                )
                .into_any_element(),
            Demo::CodeBlock => Card::new()
                .title("CodeBlock")
                .description("Read-only code block.")
                .child(
                                CodeBlock::new(
                                    "demo-code-block",
                                    "fn main() {\n    println!(\"hello\");\n}",
                                )
                                .language("rust")
                                .line_numbers(true)
                                .on_copy(|_, _, _| {})
                )
                .into_any_element(),
            Demo::ChatComposer => Card::new()
                .title("ChatComposer")
                .description("Message compose chrome.")
                .child(
                                ChatComposer::new("demo-composer")
                                    .hint("Ask Celestia…")
                                    .tool(
                                        Button::icon("cmp-attach", PhosphorIcon::Paperclip)
                                            .variant(ButtonVariant::Ghost),
                                    )
                                    .on_send(|_, _, _| {})
                                    .send_label("Send")
                )
                .into_any_element(),
            Demo::CommandPalette => {
                let query = self
                    .demo_command_palette
                    .read(cx)
                    .value()
                    .to_string()
                    .to_lowercase();
                let all = [
                    (
                        "new",
                        "New file",
                        "Create an empty buffer",
                        PhosphorIcon::File,
                        false,
                    ),
                    (
                        "theme",
                        "Toggle theme",
                        "Switch light / dark",
                        PhosphorIcon::Moon,
                        false,
                    ),
                    (
                        "palette",
                        "Focus search",
                        "Jump back to the filter field",
                        PhosphorIcon::MagnifyingGlass,
                        false,
                    ),
                    (
                        "quit",
                        "Quit",
                        "Disabled in the gallery",
                        PhosphorIcon::SignOut,
                        true,
                    ),
                ];
                let filtered: Vec<_> = all
                    .into_iter()
                    .filter(|(_, label, hint, _, _)| {
                        query.is_empty()
                            || label.to_lowercase().contains(&query)
                            || hint.to_lowercase().contains(&query)
                    })
                    .collect();
                let selected = self
                    .demo_command_selected
                    .filter(|&ix| ix < filtered.len())
                    .or(if filtered.is_empty() {
                        None
                    } else {
                        Some(0)
                    });

                let mut palette = CommandPalette::new("demo-cmd")
                    .selected_index(selected)
                    .empty_label("No matching commands")
                    .search(
                        Input::new(&self.demo_command_palette)
                            .cleanable(true)
                            .appearance(false),
                    )
                    .on_select(cx.listener(|this, id: &SharedString, window, cx| {
                        let filtered_ids: Vec<&str> = {
                            let query = this
                                .demo_command_palette
                                .read(cx)
                                .value()
                                .to_string()
                                .to_lowercase();
                            [
                                ("new", "New file", "Create an empty buffer"),
                                ("theme", "Toggle theme", "Switch light / dark"),
                                ("palette", "Focus search", "Jump back to the filter field"),
                                ("quit", "Quit", "Disabled in the gallery"),
                            ]
                            .into_iter()
                            .filter(|(_, label, hint)| {
                                query.is_empty()
                                    || label.to_lowercase().contains(&query)
                                    || hint.to_lowercase().contains(&query)
                            })
                            .map(|(id, _, _)| id)
                            .collect()
                        };
                        this.demo_command_selected =
                            filtered_ids.iter().position(|fid| *fid == id.as_ref());
                        match id.as_ref() {
                            "theme" => {
                                Showcase::toggle_theme(cx);
                                this.demo_command_status = "Ran Toggle theme.".into();
                            }
                            "new" => {
                                this.demo_command_status = "Ran New file (demo).".into();
                            }
                            "palette" => {
                                this.demo_command_palette.update(cx, |state, cx| {
                                    state.set_value("", window, cx);
                                });
                                this.demo_command_status =
                                    "Cleared filter — type to search again.".into();
                            }
                            other => {
                                this.demo_command_status = format!("Selected “{other}”.").into();
                            }
                        }
                        cx.notify();
                    }));

                for (id, label, hint, icon, disabled) in filtered {
                    palette = palette.item(
                        CommandPaletteItem::new(id, label)
                            .icon(icon)
                            .hint(hint)
                            .disabled(disabled),
                    );
                }

                Card::new()
                    .title("Command palette")
                    .description("Type to filter, then click a command.")
                    .child(
                        v_flex()
                            .gap_2()
                            .child(palette)
                            .child(
                                div()
                                    .text_xs()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(self.demo_command_status.clone()),
                            ),
                    )
                    .into_any_element()
            }
            Demo::TabBar => Card::new()
                .title("TabBar")
                .description("Document tab bar.")
                .child(
                                TabBar::new("demo-tabs")
                                    .active(self.demo_composite_tab.clone())
                                    .item(TabBarItem::new("main", "main.rs").dirty(true))
                                    .item(TabBarItem::new("lib", "lib.rs"))
                                    .item(TabBarItem::new("toml", "Cargo.toml").closable(false))
                                    .on_select(cx.listener(|this, id: &SharedString, _, cx| {
                                        this.demo_composite_tab = id.clone();
                                        cx.notify();
                                    }))
                )
                .into_any_element(),
            Demo::BreadcrumbBar => Card::new()
                .title("BreadcrumbBar")
                .description("Path breadcrumb bar.")
                .child(
                                BreadcrumbBar::new("demo-crumbs")
                                    .item(BreadcrumbBarItem::new("c1", "packages"))
                                    .item(BreadcrumbBarItem::new("c2", "desktop"))
                                    .item(BreadcrumbBarItem::new("c3", "crates"))
                                    .item(BreadcrumbBarItem::new("c4", "ui"))
                                    .item(BreadcrumbBarItem::new("c5", "composite"))
                )
                .into_any_element(),
            Demo::SplitPane => Card::new()
                .title("SplitPane")
                .description("Fixed-ratio split panes.")
                .child(
                        SplitPane::new("demo-split")
                            .leading_size(px(160.0))
                            .h(px(140.0))
                            .leading(
                                div()
                                    .p_3()
                                    .text_sm()
                                    .child("Leading pane"),
                            )
                            .trailing(
                                div()
                                    .p_3()
                                    .text_sm()
                                    .child("Trailing pane"),
                            )
                )
                .into_any_element(),
            Demo::InspectorPanel => Card::new()
                .title("InspectorPanel")
                .description("Inspector property panel.")
                .child(
                        InspectorPanel::new("demo-inspector", "Button")
                            .subtitle("Selected element")
                            .h(px(180.0))
                            .row(
                                InspectorRow::new("Variant").control(
                                    div().text_sm().child("Primary"),
                                ),
                            )
                            .row(
                                InspectorRow::new("Disabled").control(
                                    Switch::new("insp-disabled").checked(false),
                                ),
                            )
                            .row(
                                InspectorRow::new("Label").control(
                                    div().text_sm().child("Save changes"),
                                ),
                            )
                )
                .into_any_element(),
            Demo::FormField => Card::new()
                .title("FormField")
                .description("Labelled form field.")
                .child(
                                FormField::new("ff-name")
                                    .label("Display name")
                                    .required(true)
                                    .description("Shown on your profile and in the title bar.")
                                    .control(
                                        div()
                                            .h(px(32.0))
                                            .px_3()
                                            .rounded_md()
                                            .border_1()
                                            .flex()
                                            .items_center()
                                            .text_sm()
                                            .child("Ada Lovelace"),
                                    )
                )
                .into_any_element(),
            Demo::SearchField => Card::new()
                .title("SearchField")
                .description("Search input chrome.")
                .child(
                                SearchField::new("demo-search")
                                    .hint("Search components…")
                                    .chip(
                                        FilterChip::new("chip-rust", "Rust").active(true),
                                    )
                                    .chip(FilterChip::new("chip-ui", "UI"))
                )
                .into_any_element(),
            Demo::SettingsPage => Card::new()
                .title("SettingsPage")
                .description("Settings page layout.")
                .child(
                                SettingsPage::new("demo-settings", "Preferences")
                                    .description("Gallery stand-in for an app settings surface.")
                                    .h(px(220.0))
                                    .section(
                                        SettingsSection::new("Appearance")
                                            .description("Theme and density.")
                                            .child(
                                                FormField::new("set-theme")
                                                    .horizontal()
                                                    .label("Dark mode")
                                                    .control(
                                                        Switch::new("set-dark").checked(true),
                                                    ),
                                            ),
                                    )
                                    .section(
                                        SettingsSection::new("Editor")
                                            .child(
                                                FormField::new("set-wrap")
                                                    .horizontal()
                                                    .label("Word wrap")
                                                    .control(
                                                        Switch::new("set-wrap").checked(false),
                                                    ),
                                            ),
                                    )
                )
                .into_any_element(),
            Demo::KeybindingRecorder => Card::new()
                .title("KeybindingRecorder")
                .description("Shortcut recorder.")
                .child(
                        v_flex()
                            .gap_3()
                            .child(
                                KeybindingRecorder::new("kb-save", "Save file").binding(Some(
                                    Keystroke::parse("cmd-s").expect("valid keystroke"),
                                )),
                            )
                            .child(
                                KeybindingRecorder::new("kb-rec", "Command palette")
                                    .state(KeybindingState::Recording),
                            )
                            .child(
                                KeybindingRecorder::new("kb-conflict", "Quick open")
                                    .binding(Some(
                                        Keystroke::parse("cmd-p").expect("valid keystroke"),
                                    ))
                                    .conflict_with("Print"),
                            )
                )
                .into_any_element(),
            Demo::DataTableToolbar => Card::new()
                .title("DataTableToolbar")
                .description("Table toolbar.")
                .child(
                        DataTableToolbar::new("demo-tt")
                            .search(SearchField::new("tt-search").hint("Filter rows…"))
                            .selected_count(2)
                            .trailing(
                                Button::new("tt-export")
                                    .variant(ButtonVariant::Outline)
                                    .label("Export"),
                            )
                            .trailing(
                                Button::new("tt-delete")
                                    .variant(ButtonVariant::Destructive)
                                    .label("Delete"),
                            )
                )
                .into_any_element(),
            Demo::FileBrowser => Card::new()
                .title("FileBrowser")
                .description("Dual-pane breadcrumb + tree + list chrome.")
                .child(
                        FileBrowser::new("demo-fb")
                            .breadcrumb(
                                BreadcrumbBar::new("fb-crumbs")
                                    .root_icon(Some(PhosphorIcon::Folder))
                                    .item(BreadcrumbBarItem::new("fb1", "src"))
                                    .item(BreadcrumbBarItem::new("fb2", "components")),
                            )
                            .tree(
                                FileTree::new("fb-tree")
                                    .child(
                                        FileTreeFolder::new("src", "src")
                                            .expanded(true)
                                            .child(
                                                FileTreeFolder::new("src/components", "components")
                                                    .expanded(true)
                                                    .selected(true)
                                                    .child(FileTreeFile::new(
                                                        "src/components/button.rs",
                                                        "button.rs",
                                                    )),
                                            )
                                            .child(FileTreeFolder::new("src/theme", "theme")),
                                    ),
                            )
                            .row(
                                FileBrowserRow::new("r1", "button.rs")
                                    .meta("12 KB")
                                    .selected(true),
                            )
                            .row(FileBrowserRow::new("r2", "badge.rs").meta("4 KB"))
                            .row(
                                FileBrowserRow::new("r3", "composite")
                                    .directory(true)
                                    .meta("20 items"),
                            )
                )
                .into_any_element(),
            Demo::FileTree => Card::new()
                .title("FileTree")
                .description(
                    "Workspace directory hierarchy (web ai/file-tree.tsx). Host owns expand/select.",
                )
                .child(
                    FileTree::new("demo-file-tree").w(px(320.0)).child(
                        FileTreeFolder::new("apps", "apps")
                            .expanded(true)
                            .child(
                                FileTreeFolder::new("apps/api", "api")
                                    .expanded(true)
                                    .child(
                                        FileTreeFile::new("apps/api/src/index.ts", "index.ts")
                                            .selected(true),
                                    )
                                    .child(FileTreeFile::new(
                                        "apps/api/src/auth.ts",
                                        "auth.ts",
                                    )),
                            )
                            .child(
                                FileTreeFolder::new("apps/web", "web").child(
                                    FileTreeFile::new("apps/web/app/page.tsx", "page.tsx"),
                                ),
                            ),
                    )
                    .child(
                        FileTreeFolder::new("packages", "packages")
                            .expanded(true)
                            .child(FileTreeFile::new(
                                "packages/ui/src/index.ts",
                                "ui/index.ts",
                            )),
                    ),
                )
                .into_any_element(),
            Demo::KanbanBoard => {
                const BOARD: &str = "showcase-board";
                let mut board = KanbanBoard::new("demo-kanban");
                for (col_id, col_title, cards) in &self.demo_kanban {
                    let mut column = KanbanColumn::new(col_id.clone(), col_title.clone())
                        .column_id(col_id.clone())
                        .board_id(BOARD)
                        .count(cards.len())
                        .on_card_drop(cx.listener(|this, drop: &KanbanDrop, _, cx| {
                            let mut cols: Vec<(SharedString, Vec<_>)> = this
                                .demo_kanban
                                .iter()
                                .map(|(id, _, cards)| (id.clone(), cards.clone()))
                                .collect();
                            apply_kanban_drop(&mut cols, drop, |c| c.id.clone());
                            for (i, (_, cards)) in cols.into_iter().enumerate() {
                                this.demo_kanban[i].2 = cards;
                            }
                            cx.notify();
                        }));
                    for (index, card) in cards.iter().enumerate() {
                        let mut kcard = KanbanCard::new(card.id.clone(), card.title.clone())
                            .selected(card.selected)
                            .draggable(BOARD, col_id.clone(), card.id.clone(), index)
                            .on_card_drop(cx.listener(|this, drop: &KanbanDrop, _, cx| {
                                let mut cols: Vec<(SharedString, Vec<_>)> = this
                                    .demo_kanban
                                    .iter()
                                    .map(|(id, _, cards)| (id.clone(), cards.clone()))
                                    .collect();
                                apply_kanban_drop(&mut cols, drop, |c| c.id.clone());
                                for (i, (_, cards)) in cols.into_iter().enumerate() {
                                    this.demo_kanban[i].2 = cards;
                                }
                                cx.notify();
                            }));
                        if let Some(body) = &card.body {
                            kcard = kcard.body(body.clone());
                        }
                        if let Some(meta) = &card.meta {
                            kcard = kcard.meta(meta.clone());
                        }
                        column = column.card(kcard);
                    }
                    board = board.column(column);
                }
                Card::new()
                    .title("KanbanBoard")
                    .description("Drag a card. The column washes accent, a line appears above the destination, and empty columns say “Drop here” before you release.")
                    .child(board)
                    .into_any_element()
            }
            Demo::Timeline => Card::new()
                .title("Timeline")
                .description("Event timeline.")
                .child(
                                Timeline::new("demo-timeline")
                                    .item(
                                        TimelineItem::new("t1", "Release v0.4 tagged")
                                            .body("desktop composites landed")
                                            .time("2h ago")
                                            .icon(PhosphorIcon::Tag),
                                    )
                                    .item(
                                        TimelineItem::new("t2", "CI passed on main")
                                            .time("5h ago")
                                            .icon(PhosphorIcon::CheckCircle),
                                    )
                                    .item(
                                        TimelineItem::new("t3", "Design review notes")
                                            .body("Tighten inspector row gaps")
                                            .time("Yesterday")
                                            .icon(PhosphorIcon::Note),
                                    )
                )
                .into_any_element(),
            Demo::StatCard => Card::new()
                .title("StatCard")
                .description("Metric stat card.")
                .child(
                                StatCardGroup::new("demo-stats")
                                    .card(
                                        StatCard::new("s1", "Active users", "12.4k")
                                            .delta("+8.2%", StatDeltaTone::Up)
                                            .sparkline([0.2, 0.35, 0.3, 0.55, 0.5, 0.7, 0.85]),
                                    )
                                    .card(
                                        StatCard::new("s2", "Error rate", "0.4%")
                                            .delta("-0.1%", StatDeltaTone::Down)
                                            .sparkline([0.8, 0.7, 0.6, 0.65, 0.4, 0.35, 0.3]),
                                    )
                                    .card(
                                        StatCard::new("s3", "Latency p95", "142ms")
                                            .delta("stable", StatDeltaTone::Neutral),
                                    )
                )
                .into_any_element(),
            Demo::ToastStack => Card::new()
                .title("ToastStack")
                .description("In-view toast stack.")
                .child(
                                div()
                                    .relative()
                                    .w(px(360.0))
                                    .h(px(180.0))
                                    .rounded_md()
                                    .border_1()
                                    .child(
                                        ToastStack::new("demo-toasts")
                                            .placement(ToastPlacement::TopRight)
                                            .item(
                                                ToastItem::new("toast-1", "Saved")
                                                    .body("Preferences updated.")
                                                    .tone(
                                                        celestia_ui::components::composite::toast_stack::ToastTone::Success,
                                                    ),
                                            )
                                            .item(
                                                ToastItem::new("toast-2", "Sync delayed")
                                                    .body("Retrying in 5s…")
                                                    .tone(
                                                        celestia_ui::components::composite::toast_stack::ToastTone::Warning,
                                                    ),
                                            ),
                                    )
                )
                .into_any_element(),
            Demo::Banner => Card::new()
                .title("Banner")
                .description("Page banner.")
                .child(
                        v_flex()
                            .gap_3()
                            .child(
                                Banner::new("ban-info", "Desktop composites are ready")
                                    .tone(BannerTone::Info)
                                    .body("App shells and data surfaces in celestia-ui::components::composite.")
                                    .action("View docs", |_, _, _| {}),
                            )
                            .child(
                                Banner::new("ban-warn", "Build cache is stale")
                                    .tone(BannerTone::Warning)
                                    .body("Run cargo clean if icons look wrong."),
                            )
                )
                .into_any_element(),
            Demo::OnboardingTip => {
                const TIPS: &[(&str, &str)] = &[
                    (
                        "Meet the inspector",
                        "Select any element to edit its properties live.",
                    ),
                    (
                        "Try the command palette",
                        "Press ⌘K to jump to any action without leaving the keyboard.",
                    ),
                    (
                        "Pin your workspace",
                        "Star projects in the switcher so they stay one click away.",
                    ),
                    (
                        "You’re ready",
                        "That’s the tour — open Docs anytime for deeper component notes.",
                    ),
                ];
                const TOTAL: usize = TIPS.len();
                let step = self.demo_onboarding_step;
                let dismissed = step == 0 || step > TOTAL;

                let content = if dismissed {
                    v_flex()
                        .gap_2()
                        .child(
                            div()
                                .text_sm()
                                .text_color(cx.theme().muted_foreground)
                                .child("Tour finished — restart to walk it again."),
                        )
                        .child(
                            Button::new("tip-restart")
                                .variant(ButtonVariant::Outline)
                                .label("Restart tour")
                                .on_click(cx.listener(|this, _, _, cx| {
                                    this.demo_onboarding_step = 1;
                                    cx.notify();
                                })),
                        )
                        .into_any_element()
                } else {
                    let (title, body) = TIPS[step - 1];
                    let is_last = step == TOTAL;
                    OnboardingTip::new("tip-1", title)
                        .body(body)
                        .step(step, TOTAL)
                        .next_label(if is_last { "Done" } else { "Continue" })
                        .skip_label("Skip tour")
                        .on_next(cx.listener(move |this, _, _, cx| {
                            this.demo_onboarding_step = if is_last { 0 } else { step + 1 };
                            cx.notify();
                        }))
                        .on_skip(cx.listener(|this, _, _, cx| {
                            this.demo_onboarding_step = 0;
                            cx.notify();
                        }))
                        .into_any_element()
                };

                Card::new()
                    .title("OnboardingTip")
                    .description("Click Continue / Skip to walk the coachmark.")
                    .child(content)
                    .into_any_element()
            }

            Demo::Panel => {
                let muted = cx.theme().muted;
                Card::new()
                    .title("Panel")
                    .description("Titled content panel.")
                    .child(
                        Panel::new("demo-panel", "Release checklist")
                            .description("Ship blockers for 0.5")
                            .header_action(
                                Button::new("panel-refresh")
                                    .variant(ButtonVariant::Ghost)
                                    .label("Refresh"),
                            )
                            .child(
                                MediaObject::new("mo-1", "Ada Lovelace")
                                    .description("Opened a PR against desktop/ui")
                                    .media(
                                        div()
                                            .size(px(36.0))
                                            .rounded_full()
                                            .bg(muted)
                                            .flex()
                                            .items_center()
                                            .justify_center()
                                            .child(
                                                Phosphor::new(PhosphorIcon::User).size(px(16.0)),
                                            ),
                                    )
                                    .action(
                                        Button::new("mo-view")
                                            .variant(ButtonVariant::Outline)
                                            .label("View"),
                                    ),
                            )
                            .footer(
                                ActionBar::new("panel-footer")
                                    .bordered(false)
                                    .trailing(
                                        Button::new("panel-done")
                                            .variant(ButtonVariant::Primary)
                                            .label("Mark done"),
                                    ),
                            ),
                    )
                    .into_any_element()
            }
            Demo::MediaObject => {
                let muted = cx.theme().muted;
                Card::new()
                    .title("MediaObject")
                    .description("Media + body row.")
                    .child(
                        MediaObject::new("mo-1", "Ada Lovelace")
                            .description("Opened a PR against desktop/ui")
                            .media(
                                div()
                                    .size(px(36.0))
                                    .rounded_full()
                                    .bg(muted)
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .child(Phosphor::new(PhosphorIcon::User).size(px(16.0))),
                            )
                            .action(
                                Button::new("mo-view")
                                    .variant(ButtonVariant::Outline)
                                    .label("View"),
                            ),
                    )
                    .into_any_element()
            }
            Demo::FilterBar => {
                let filter = self.demo_composite_filter;
                Card::new()
                    .title("FilterBar")
                    .description("Filter chip bar.")
                    .child(
                        FilterBar::new("demo-filters")
                            .chip(
                                FilterChip::new("all", "All")
                                    .active(filter == 0)
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_composite_filter = 0;
                                        cx.notify();
                                    })),
                            )
                            .chip(
                                FilterChip::new("open", "Open")
                                    .active(filter == 1)
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_composite_filter = 1;
                                        cx.notify();
                                    })),
                            )
                            .chip(
                                FilterChip::new("done", "Done")
                                    .active(filter == 2)
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_composite_filter = 2;
                                        cx.notify();
                                    })),
                            )
                            .trailing(
                                Button::new("filter-more")
                                    .variant(ButtonVariant::Outline)
                                    .label("More"),
                            ),
                    )
                    .into_any_element()
            }
            Demo::TrafficLights => Card::new()
                .title("TrafficLights")
                .description("Close, minimize, zoom. Inactive grays them. Edited draws the unsaved dot.")
                .child(
                    div()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(24.))
                        .child(labeled_lights(cx, "Active", TrafficLights::new("tl-active")))
                        .child(labeled_lights(
                            cx,
                            "Inactive",
                            TrafficLights::new("tl-inactive").active(false),
                        ))
                        .child(labeled_lights(
                            cx,
                            "Edited",
                            TrafficLights::new("tl-edited").edited(true),
                        )),
                )
                .into_any_element(),
            Demo::Window => {
                let preview = MacAppMenu::standard("Celestia")
                    .menu(gpui::Menu::new("Window").items([
                        gpui::MenuItem::action("Minimize", MinimizeWindow),
                        gpui::MenuItem::action("Zoom", ZoomWindow),
                    ]));
                let muted = cx.theme().muted_foreground;
                Card::new()
                    .title("Window")
                    .description(
                        "composite/window — Embedded previews, this window's OS chrome, and MacAppMenu.",
                    )
                    .child(
                        v_flex()
                            .gap_5()
                            .child(window_try_it(cx))
                            .child(
                                v_flex()
                                    .gap_2()
                                    .child(window_caption("App menu", muted))
                                    .child(
                                        div()
                                            .text_xs()
                                            .text_color(muted)
                                            .child(
                                                "MacAppMenu::standard → install. In fullscreen, move the pointer to the top edge to reveal the menu bar.",
                                            ),
                                    )
                                    .child(MacMenuBarPreview::new(&preview)),
                            )
                            .child(
                                v_flex()
                                    .gap_2()
                                    .child(window_caption("Embedded · Unified", muted))
                                    .child(
                                        MacWindow::new("notes", "Notes")
                                            .subtitle("iCloud")
                                            .kind(MacWindowKind::Unified)
                                            .h(px(200.))
                                            .on_close(|_, _| {})
                                            .on_minimize(|window, _| window.minimize_window())
                                            .on_zoom(|window, _| window.zoom_window())
                                            .sidebar(
                                                div()
                                                    .px(px(12.))
                                                    .py(px(8.))
                                                    .flex()
                                                    .flex_col()
                                                    .gap(px(6.))
                                                    .text_xs()
                                                    .child("All Notes")
                                                    .child("Today"),
                                            )
                                            .child(
                                                div()
                                                    .p(px(12.))
                                                    .text_sm()
                                                    .text_color(muted)
                                                    .child(
                                                        "Sidebar runs under the lights. Yellow minimizes this gallery; green zooms it.",
                                                    ),
                                            ),
                                    ),
                            )
                            .child(
                                v_flex()
                                    .gap_2()
                                    .child(window_caption("Embedded · Tabs", muted))
                                    .child(
                                        MacWindow::new("docs", "Docs")
                                            .h(px(160.))
                                            .tab(MacWindowTab::new("notes", "Notes"))
                                            .tab(MacWindowTab::new("todo", "Todo"))
                                            .active_tab("notes")
                                            .toolbar_item(
                                                div()
                                                    .text_xs()
                                                    .text_color(muted)
                                                    .child("Share"),
                                            )
                                            .child(
                                                div()
                                                    .p(px(12.))
                                                    .text_sm()
                                                    .text_color(muted)
                                                    .child(
                                                        "Title-bar tabs replace the centered title.",
                                                    ),
                                            ),
                                    ),
                            ),
                    )
                    .into_any_element()
            }
            _ => v_flex()
                .child(div().text_sm().child("Not a composites demo."))
                .into_any_element(),
        }
    }
}

fn labeled_lights(cx: &App, label: &str, lights: TrafficLights) -> impl IntoElement {
    div()
        .flex()
        .flex_col()
        .items_center()
        .gap(px(8.))
        .child(lights)
        .child(
            div()
                .text_xs()
                .text_color(cx.theme().muted_foreground)
                .child(label.to_string()),
        )
}

fn window_caption(label: &str, muted: Hsla) -> impl IntoElement {
    div()
        .text_xs()
        .font_weight(FontWeight::SEMIBOLD)
        .text_color(muted)
        .child(label.to_string())
}

/// Buttons that drive this gallery window (minimize / zoom / fullscreen).
fn window_try_it(cx: &App) -> impl IntoElement {
    let muted = cx.theme().muted_foreground;
    v_flex()
        .gap_2()
        .child(window_caption("This window", muted))
        .child(
            div()
                .text_xs()
                .text_color(muted)
                .child(
                    "Controls the gallery itself. Window → Minimize / Zoom, View → Enter Full Screen (⌃⌘F).",
                ),
        )
        .child(
            div()
                .flex()
                .flex_row()
                .flex_wrap()
                .gap(px(8.))
                .child(
                    Button::new("win-minimize")
                        .variant(ButtonVariant::Outline)
                        .label("Minimize")
                        .on_click(|_, window, _| window.minimize_window()),
                )
                .child(
                    Button::new("win-zoom")
                        .variant(ButtonVariant::Outline)
                        .label("Zoom")
                        .on_click(|_, window, _| window.zoom_window()),
                )
                .child(
                    Button::new("win-fullscreen")
                        .variant(ButtonVariant::Outline)
                        .label("Full Screen")
                        .on_click(|_, window, _| window.toggle_fullscreen()),
                ),
        )
}
