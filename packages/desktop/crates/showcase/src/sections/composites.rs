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
use celestia_ui::components::composite::comment_thread::{CommentItem, CommentThread};
use celestia_ui::components::composite::commit_row::CommitRow;
use celestia_ui::components::composite::command_palette::{CommandPalette, CommandPaletteItem};
use celestia_ui::components::composite::conversation_list::{ConversationItem, ConversationList};
use celestia_ui::components::composite::data_table_toolbar::DataTableToolbar;
use celestia_ui::components::composite::drop_zone::{DropZone, DropZoneState};
use celestia_ui::components::composite::file_browser::{FileBrowser, FileBrowserRow};
use celestia_ui::components::composite::file_tree::{FileTree, FileTreeFile, FileTreeFolder};
use celestia_ui::components::composite::filter_bar::{FilterBar, FilterChip};
use celestia_ui::components::composite::find_replace_bar::FindReplaceBar;
use celestia_ui::components::composite::form_field::FormField;
use celestia_ui::components::composite::input_group::{InputGroup, InputGroupAddon};
use celestia_ui::components::composite::inspector_panel::{InspectorPanel, InspectorRow};
use celestia_ui::components::composite::issue_card::{IssueCard, IssueTone};
use celestia_ui::components::composite::kanban_board::{KanbanBoard, KanbanCard, KanbanColumn};
use celestia_ui::components::composite::keybinding_recorder::{
    KeybindingRecorder, KeybindingState,
};
use celestia_ui::components::composite::log_viewer::{LogLevel, LogRow, LogViewer};
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
use celestia_ui::components::composite::stat_card::{StatCard, StatCardGroup, StatDeltaTone};
use celestia_ui::components::composite::tab_bar::{TabBar, TabBarItem};
use celestia_ui::components::composite::tag_input::TagInput;
use celestia_ui::components::composite::task_list::{TaskItem, TaskList};
use celestia_ui::components::composite::terminal_panel::TerminalPanel;
use celestia_ui::components::composite::timeline::{Timeline, TimelineItem};
use celestia_ui::components::composite::toast_stack::{ToastItem, ToastPlacement, ToastStack};
use celestia_ui::components::composite::toolbar::Toolbar;
use celestia_ui::components::composite::user_menu::UserMenu;
use celestia_ui::components::composite::wizard::Wizard;
use celestia_ui::components::composite::workspace_switcher::{WorkspaceItem, WorkspaceSwitcher};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::chip::Chip;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::components::primitive::initials::Initials;
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

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
            Demo::CommandPalette => Card::new()
                .title("Command palette")
                .description("Spotlight command palette.")
                .child(
                        CommandPalette::new("demo-cmd")
                            .selected_index(Some(0))
                            .item(
                                CommandPaletteItem::new("new", "New file")
                                    .icon(PhosphorIcon::File)
                                    .hint("Create an empty buffer"),
                            )
                            .item(
                                CommandPaletteItem::new("theme", "Toggle theme")
                                    .icon(PhosphorIcon::Moon)
                                    .hint("Switch light / dark"),
                            )
                            .item(
                                CommandPaletteItem::new("quit", "Quit")
                                    .icon(PhosphorIcon::SignOut)
                                    .disabled(true),
                            )
                )
                .into_any_element(),
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
                .description("File browser list.")
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
            Demo::KanbanBoard => Card::new()
                .title("KanbanBoard")
                .description("Kanban columns.")
                .child(
                        KanbanBoard::new("demo-kanban")
                            .column(
                                KanbanColumn::new("todo", "To do")
                                    .card(
                                        KanbanCard::new("k1", "Ship composites")
                                            .body("Twenty new surfaces")
                                            .meta("P0"),
                                    )
                                    .card(KanbanCard::new("k2", "Update docs")),
                            )
                            .column(
                                KanbanColumn::new("doing", "Doing")
                                    .card(
                                        KanbanCard::new("k3", "Showcase section")
                                            .selected(true)
                                            .meta("In review"),
                                    ),
                            )
                            .column(
                                KanbanColumn::new("done", "Done")
                                    .card(KanbanCard::new("k4", "Toolbar menu")),
                            )
                )
                .into_any_element(),
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
            Demo::OnboardingTip => Card::new()
                .title("OnboardingTip")
                .description("Onboarding tip callout.")
                .child(
                                OnboardingTip::new("tip-1", "Meet the inspector")
                                    .body("Select any element to edit its properties live.")
                                    .step(2, 4)
                                    .next_label("Continue")
                )
                .into_any_element(),
            Demo::DropZone => Card::new()
                .title("DropZone")
                .description("File drop zone.")
                .child(
                                h_flex()
                                    .gap_3()
                                    .child(
                                        DropZone::new("dz-idle")
                                            .w(px(220.0))
                                            .state(DropZoneState::Idle),
                                    )
                                    .child(
                                        DropZone::new("dz-active")
                                            .w(px(220.0))
                                            .state(DropZoneState::Active)
                                            .title("Drop to upload")
                                            .description("Release to start"),
                                    )
                                    .child(
                                        DropZone::new("dz-err")
                                            .w(px(220.0))
                                            .state(DropZoneState::Error)
                                            .title("File too large")
                                            .description("Max 10 MB"),
                                    )
                )
                .into_any_element(),

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
            _ => v_flex()
                .child(div().text_sm().child("Not a composites demo."))
                .into_any_element(),
        }
    }
}
