//! Individual component catalog for the desktop showcase gallery.
//!
//! The sidebar lists one entry per component (with search). Docs still key off
//! [`Family`] so related usage/props stay shared.

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Category {
    Actions,
    Badges,
    Inputs,
    Pickers,
    Feedback,
    Overlays,
    Menus,
    Data,
    Layout,
    Ai,
    Editors,
    Charts,
    Composites,
    System,
}

impl Category {
    pub const ALL: [Category; 14] = [
        Category::Actions,
        Category::Badges,
        Category::Inputs,
        Category::Pickers,
        Category::Feedback,
        Category::Overlays,
        Category::Menus,
        Category::Data,
        Category::Layout,
        Category::Ai,
        Category::Editors,
        Category::Charts,
        Category::Composites,
        Category::System,
    ];

    pub fn label(self) -> &'static str {
        match self {
            Category::Actions => "Actions",
            Category::Badges => "Badges",
            Category::Inputs => "Inputs",
            Category::Pickers => "Pickers",
            Category::Feedback => "Feedback",
            Category::Overlays => "Overlays",
            Category::Menus => "Menus",
            Category::Data => "Data",
            Category::Layout => "Layout",
            Category::Ai => "Chat & AI",
            Category::Editors => "Editors",
            Category::Charts => "Charts",
            Category::Composites => "Composites",
            Category::System => "System",
        }
    }
}

/// Docs / usage family — maps to the shared snippets in `section.rs`.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Family {
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
    Composites,
    Icons,
    Palette,
    Theming,
    State,
}

/// Which demo renderer to invoke for a catalog entry.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Demo {

    Button,
    Kbd,
    Link,
    Badge,
    Chip,
    Pill,
    CountLabel,
    StatusDot,
    Caption,
    Initials,
    ColorSwatch,
    FileGlyph,
    Pin,
    Disclosure,
    InlineCode,
    Quote,
    Truncate,
    RelativeTime,
    IconLabel,
    HotkeyHint,
    Input,
    Textarea,
    InputOtp,
    Select,
    Slider,
    Switch,
    Checkbox,
    Radio,
    Rating,
    Toggle,
    Item,
    AspectRatio,
    Label,
    Calendar,
    DatePicker,
    ColorPicker,
    NumberInput,
    Alert,
    Progress,
    Meter,
    Scrubber,
    SignalBars,
    Battery,
    NumberStepper,
    Fab,
    Spinner,
    Skeleton,
    Shimmer,
    Popover,
    Tooltip,
    Toast,
    Dialog,
    Sheet,
    SheetPanel,
    Drawer,
    ConfirmDialog,
    DropdownMenu,
    ToolbarMenu,
    Menubar,
    NavigationMenu,
    ContextMenu,
    DataTable,
    VirtualList,
    DescriptionList,
    Breadcrumb,
    Pagination,
    Empty,
    Hstack,
    Vstack,
    Zstack,
    Spacer,
    Vgrid,
    Tabs,
    Accordion,
    Collapsible,
    GroupBox,
    LayoutPlayground,
    Message,
    PromptInput,
    Reasoning,
    Tool,
    Suggestion,
    Plan,
    Agent,
    AiCodeBlock,
    AiTerminal,
    Conversation,
    Attachment,
    TextEditor,
    CodeEditor,
    BarChart,
    LineChart,
    PieChart,
    DonutChart,
    Wizard,
    PageHeader,
    SideNav,
    TaskList,
    Checklist,
    ConversationList,
    NotificationCenter,
    WorkspaceSwitcher,
    UserMenu,
    FindReplaceBar,
    TagInput,
    TerminalPanel,
    LogViewer,
    OutlineView,
    PropertyList,
    ProjectCard,
    IssueCard,
    CommentThread,
    CommitRow,
    BulkActionBar,
    AppHeader,
    Toolbar,
    ActionBar,
    ButtonGroup,
    InputGroup,
    Panel,
    MediaObject,
    ActivityFeed,
    CodeBlock,
    ChatComposer,
    CommandPalette,
    TabBar,
    BreadcrumbBar,
    SplitPane,
    InspectorPanel,
    FormField,
    SearchField,
    FilterBar,
    SettingsPage,
    KeybindingRecorder,
    DataTableToolbar,
    FileBrowser,
    KanbanBoard,
    Timeline,
    StatCard,
    ToastStack,
    Banner,
    OnboardingTip,
    DropZone,
    Icons,
    Palette,
    Theming,
    State,
}

#[derive(Clone, Copy, Debug)]
pub struct SectionMeta {
    pub id: &'static str,
    pub label: &'static str,
    pub category: Category,
    pub family: Family,
    pub demo: Demo,
    pub package: &'static str,
    pub description: &'static str,
}

/// Index into [`SECTIONS`].
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Section(pub u16);

impl Section {
    pub const BUTTON: Section = Section(0);

    pub fn meta(self) -> &'static SectionMeta {
        &SECTIONS[self.0 as usize]
    }

    pub fn id(self) -> &'static str {
        self.meta().id
    }

    pub fn label(self) -> &'static str {
        self.meta().label
    }

    pub fn description(self) -> &'static str {
        self.meta().description
    }

    pub fn demo(self) -> Demo {
        self.meta().demo
    }

    pub fn family(self) -> Family {
        self.meta().family
    }

    pub fn category(self) -> Category {
        self.meta().category
    }

    pub fn package(self) -> &'static str {
        self.meta().package
    }

    pub fn matches_query(self, query: &str) -> bool {
        if query.is_empty() {
            return true;
        }
        let q = query.to_ascii_lowercase();
        let m = self.meta();
        m.label.to_ascii_lowercase().contains(&q)
            || m.id.to_ascii_lowercase().contains(&q)
            || m.package.to_ascii_lowercase().contains(&q)
            || m.description.to_ascii_lowercase().contains(&q)
            || m.category.label().to_ascii_lowercase().contains(&q)
    }
}

pub const SECTIONS: &[SectionMeta] = &[

    SectionMeta { id: "button", label: "Button", category: Category::Actions, family: Family::Buttons, demo: Demo::Button, package: "primitive/button", description: "Dedicated button gallery — variants, sizes, icons, loading." },
    SectionMeta { id: "kbd", label: "Kbd", category: Category::Actions, family: Family::Buttons, demo: Demo::Kbd, package: "primitive/kbd", description: "Keyboard shortcut badge." },
    SectionMeta { id: "link", label: "Link", category: Category::Actions, family: Family::Buttons, demo: Demo::Link, package: "primitive/link", description: "Interactive hyperlink." },
    SectionMeta { id: "badge", label: "Badge", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Badge, package: "primitive/badge", description: "Semantic label chips." },
    SectionMeta { id: "chip", label: "Chip", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Chip, package: "primitive/chip", description: "Interactive selectable / dismissible tag." },
    SectionMeta { id: "pill", label: "Pill", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Pill, package: "primitive/pill", description: "Compact filter pill." },
    SectionMeta { id: "count-label", label: "CountLabel", category: Category::Badges, family: Family::TagsBadges, demo: Demo::CountLabel, package: "primitive/count_label", description: "Numeric count with overflow cap." },
    SectionMeta { id: "status-dot", label: "StatusDot", category: Category::Badges, family: Family::TagsBadges, demo: Demo::StatusDot, package: "primitive/status_dot", description: "Presence pip with optional label." },
    SectionMeta { id: "caption", label: "Caption", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Caption, package: "primitive/caption", description: "Muted helper text." },
    SectionMeta { id: "initials", label: "Initials", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Initials, package: "primitive/initials", description: "Avatar initials glyph." },
    SectionMeta { id: "color-swatch", label: "ColorSwatch", category: Category::Badges, family: Family::TagsBadges, demo: Demo::ColorSwatch, package: "primitive/color_swatch", description: "Color specimen with optional label." },
    SectionMeta { id: "file-glyph", label: "FileGlyph", category: Category::Badges, family: Family::TagsBadges, demo: Demo::FileGlyph, package: "primitive/file_glyph", description: "File-type glyph." },
    SectionMeta { id: "pin", label: "Pin", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Pin, package: "primitive/pin", description: "Pinned / unpinned control." },
    SectionMeta { id: "disclosure", label: "Disclosure", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Disclosure, package: "primitive/disclosure", description: "Expand / collapse chevron." },
    SectionMeta { id: "inline-code", label: "InlineCode", category: Category::Badges, family: Family::TagsBadges, demo: Demo::InlineCode, package: "primitive/inline_code", description: "Inline code span." },
    SectionMeta { id: "quote", label: "Quote", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Quote, package: "primitive/quote", description: "Block quote with cite." },
    SectionMeta { id: "truncate", label: "Truncate", category: Category::Badges, family: Family::TagsBadges, demo: Demo::Truncate, package: "primitive/truncate", description: "Single-line ellipsis truncation." },
    SectionMeta { id: "relative-time", label: "RelativeTime", category: Category::Badges, family: Family::TagsBadges, demo: Demo::RelativeTime, package: "primitive/relative_time", description: "Relative time label." },
    SectionMeta { id: "icon-label", label: "IconLabel", category: Category::Badges, family: Family::TagsBadges, demo: Demo::IconLabel, package: "primitive/icon_label", description: "Icon + text row." },
    SectionMeta { id: "hotkey-hint", label: "HotkeyHint", category: Category::Badges, family: Family::TagsBadges, demo: Demo::HotkeyHint, package: "primitive/hotkey_hint", description: "Action label with keystroke." },
    SectionMeta { id: "input", label: "Input", category: Category::Inputs, family: Family::Inputs, demo: Demo::Input, package: "primitive/input", description: "Single-line text field." },
    SectionMeta { id: "textarea", label: "Textarea", category: Category::Inputs, family: Family::Inputs, demo: Demo::Textarea, package: "primitive/textarea", description: "Multi-line text field." },
    SectionMeta { id: "input-otp", label: "InputOtp", category: Category::Inputs, family: Family::Inputs, demo: Demo::InputOtp, package: "primitive/input_otp", description: "One-time-passcode digit input." },
    SectionMeta { id: "select", label: "Select", category: Category::Inputs, family: Family::Inputs, demo: Demo::Select, package: "primitive/select", description: "Dropdown select." },
    SectionMeta { id: "slider", label: "Slider", category: Category::Inputs, family: Family::Inputs, demo: Demo::Slider, package: "primitive/slider", description: "Continuous range slider." },
    SectionMeta { id: "switch", label: "Switch", category: Category::Inputs, family: Family::Inputs, demo: Demo::Switch, package: "primitive/switch", description: "Track on/off switch." },
    SectionMeta { id: "checkbox", label: "Checkbox", category: Category::Inputs, family: Family::Inputs, demo: Demo::Checkbox, package: "primitive/checkbox", description: "Boolean checkbox." },
    SectionMeta { id: "radio", label: "Radio", category: Category::Inputs, family: Family::Inputs, demo: Demo::Radio, package: "primitive/radio", description: "Single-choice radio." },
    SectionMeta { id: "rating", label: "Rating", category: Category::Inputs, family: Family::Inputs, demo: Demo::Rating, package: "primitive/rating", description: "Star rating." },
    SectionMeta { id: "toggle", label: "Toggle", category: Category::Inputs, family: Family::Inputs, demo: Demo::Toggle, package: "primitive/toggle", description: "Pressed toggle and ToggleGroup." },
    SectionMeta { id: "item", label: "Item", category: Category::Inputs, family: Family::Inputs, demo: Demo::Item, package: "primitive/item", description: "List-row atom with media/content/actions." },
    SectionMeta { id: "aspect-ratio", label: "AspectRatio", category: Category::Inputs, family: Family::Inputs, demo: Demo::AspectRatio, package: "primitive/aspect_ratio", description: "Fixed width÷height box." },
    SectionMeta { id: "label", label: "Label", category: Category::Inputs, family: Family::Inputs, demo: Demo::Label, package: "primitive/label", description: "Form label." },
    SectionMeta { id: "calendar", label: "Calendar", category: Category::Pickers, family: Family::Pickers, demo: Demo::Calendar, package: "primitive/calendar", description: "Month grid with day selection." },
    SectionMeta { id: "date-picker", label: "DatePicker", category: Category::Pickers, family: Family::Pickers, demo: Demo::DatePicker, package: "composite/date_picker", description: "Popover date field." },
    SectionMeta { id: "color-picker", label: "ColorPicker", category: Category::Pickers, family: Family::Pickers, demo: Demo::ColorPicker, package: "composite/color_picker", description: "HSV/RGB color popup." },
    SectionMeta { id: "number-input", label: "NumberInput", category: Category::Pickers, family: Family::Pickers, demo: Demo::NumberInput, package: "primitive/input", description: "Stepper numerical input." },
    SectionMeta { id: "alert", label: "Alert", category: Category::Feedback, family: Family::Feedback, demo: Demo::Alert, package: "primitive/alert", description: "Status banners." },
    SectionMeta { id: "progress", label: "Progress", category: Category::Feedback, family: Family::Feedback, demo: Demo::Progress, package: "primitive/progress", description: "Linear progress bar." },
    SectionMeta { id: "meter", label: "Meter", category: Category::Feedback, family: Family::Feedback, demo: Demo::Meter, package: "primitive/meter", description: "Capacity meter with auto-tone." },
    SectionMeta { id: "scrubber", label: "Scrubber", category: Category::Feedback, family: Family::Feedback, demo: Demo::Scrubber, package: "primitive/scrubber", description: "Media scrubber." },
    SectionMeta { id: "signal-bars", label: "SignalBars", category: Category::Feedback, family: Family::Feedback, demo: Demo::SignalBars, package: "primitive/signal_bars", description: "Signal strength bars." },
    SectionMeta { id: "battery", label: "Battery", category: Category::Feedback, family: Family::Feedback, demo: Demo::Battery, package: "primitive/battery", description: "Battery level indicator." },
    SectionMeta { id: "number-stepper", label: "NumberStepper", category: Category::Feedback, family: Family::Feedback, demo: Demo::NumberStepper, package: "primitive/number_stepper", description: "Inline ± stepper." },
    SectionMeta { id: "fab", label: "Fab", category: Category::Feedback, family: Family::Feedback, demo: Demo::Fab, package: "primitive/fab", description: "Floating action button." },
    SectionMeta { id: "spinner", label: "Spinner", category: Category::Feedback, family: Family::Feedback, demo: Demo::Spinner, package: "primitive/spinner", description: "Indeterminate spinner." },
    SectionMeta { id: "skeleton", label: "Skeleton", category: Category::Feedback, family: Family::Feedback, demo: Demo::Skeleton, package: "primitive/skeleton", description: "Placeholder skeleton." },
    SectionMeta { id: "shimmer", label: "Shimmer", category: Category::Feedback, family: Family::Feedback, demo: Demo::Shimmer, package: "primitive/shimmer", description: "Shimmer loading effect." },
    SectionMeta { id: "popover", label: "Popover", category: Category::Overlays, family: Family::Overlays, demo: Demo::Popover, package: "primitive/popover", description: "Anchored popover." },
    SectionMeta { id: "tooltip", label: "Tooltip", category: Category::Overlays, family: Family::Overlays, demo: Demo::Tooltip, package: "primitive/tooltip", description: "Hover tooltip." },
    SectionMeta { id: "toast", label: "Toast", category: Category::Overlays, family: Family::Overlays, demo: Demo::Toast, package: "primitive/toast", description: "Floating notification toast." },
    SectionMeta { id: "dialog", label: "Dialog", category: Category::Overlays, family: Family::Overlays, demo: Demo::Dialog, package: "primitive/dialog", description: "Modal dialog host." },
    SectionMeta { id: "sheet", label: "Sheet", category: Category::Overlays, family: Family::Overlays, demo: Demo::Sheet, package: "primitive/sheet", description: "Sheet host layer." },
    SectionMeta { id: "sheet-panel", label: "SheetPanel", category: Category::Overlays, family: Family::Overlays, demo: Demo::SheetPanel, package: "composite/sheet_panel", description: "Presentational sheet chrome." },
    SectionMeta { id: "drawer", label: "Drawer", category: Category::Overlays, family: Family::Overlays, demo: Demo::Drawer, package: "composite/drawer", description: "Bottom/side drawer chrome." },
    SectionMeta { id: "confirm-dialog", label: "ConfirmDialog", category: Category::Overlays, family: Family::Overlays, demo: Demo::ConfirmDialog, package: "composite/confirm_dialog", description: "Confirm / cancel dialog." },
    SectionMeta { id: "dropdown-menu", label: "DropdownMenu", category: Category::Menus, family: Family::MenusDialogs, demo: Demo::DropdownMenu, package: "composite/menu", description: "Button dropdown PopupMenu." },
    SectionMeta { id: "toolbar-menu", label: "ToolbarMenu", category: Category::Menus, family: Family::MenusDialogs, demo: Demo::ToolbarMenu, package: "composite/toolbar_menu", description: "Icon/text toolbar strip." },
    SectionMeta { id: "menubar", label: "Menubar", category: Category::Menus, family: Family::MenusDialogs, demo: Demo::Menubar, package: "primitive/menubar", description: "Top-of-window menu strip." },
    SectionMeta { id: "navigation-menu", label: "NavigationMenu", category: Category::Menus, family: Family::MenusDialogs, demo: Demo::NavigationMenu, package: "primitive/navigation_menu", description: "Horizontal nav with flyouts." },
    SectionMeta { id: "context-menu", label: "ContextMenu", category: Category::Menus, family: Family::MenusDialogs, demo: Demo::ContextMenu, package: "composite/menu", description: "Right-click context menu." },
    SectionMeta { id: "data-table", label: "DataTable", category: Category::Data, family: Family::DataDisplay, demo: Demo::DataTable, package: "primitive/table", description: "Declarative data table." },
    SectionMeta { id: "virtual-list", label: "VirtualList", category: Category::Data, family: Family::DataDisplay, demo: Demo::VirtualList, package: "composite/virtual_list", description: "Virtualized list." },
    SectionMeta { id: "description-list", label: "DescriptionList", category: Category::Data, family: Family::DataDisplay, demo: Demo::DescriptionList, package: "composite/description_list", description: "Metadata description list." },
    SectionMeta { id: "breadcrumb", label: "Breadcrumb", category: Category::Data, family: Family::DataDisplay, demo: Demo::Breadcrumb, package: "primitive/breadcrumb", description: "Hierarchical breadcrumbs." },
    SectionMeta { id: "pagination", label: "Pagination", category: Category::Data, family: Family::DataDisplay, demo: Demo::Pagination, package: "composite/pagination", description: "Page controls." },
    SectionMeta { id: "empty", label: "Empty", category: Category::Data, family: Family::DataDisplay, demo: Demo::Empty, package: "composite/empty", description: "Empty-state placeholder." },
    SectionMeta { id: "hstack", label: "HStack", category: Category::Layout, family: Family::Layout, demo: Demo::Hstack, package: "composite/h_stack", description: "Horizontal stack with cross-axis alignment." },
    SectionMeta { id: "vstack", label: "VStack", category: Category::Layout, family: Family::Layout, demo: Demo::Vstack, package: "composite/v_stack", description: "Vertical stack with cross-axis alignment." },
    SectionMeta { id: "zstack", label: "ZStack", category: Category::Layout, family: Family::Layout, demo: Demo::Zstack, package: "composite/z_stack", description: "Depth stack with layer alignment." },
    SectionMeta { id: "spacer", label: "Spacer", category: Category::Layout, family: Family::Layout, demo: Demo::Spacer, package: "composite/spacer", description: "Main-axis flexible spacer." },
    SectionMeta { id: "vgrid", label: "VGrid", category: Category::Layout, family: Family::Layout, demo: Demo::Vgrid, package: "composite/v_grid", description: "LazyVGrid-style columns." },
    SectionMeta { id: "tabs", label: "Tabs", category: Category::Layout, family: Family::Layout, demo: Demo::Tabs, package: "primitive/tabs", description: "Segmented / line tabs." },
    SectionMeta { id: "accordion", label: "Accordion", category: Category::Layout, family: Family::Layout, demo: Demo::Accordion, package: "primitive/accordion", description: "Expandable accordion." },
    SectionMeta { id: "collapsible", label: "Collapsible", category: Category::Layout, family: Family::Layout, demo: Demo::Collapsible, package: "primitive/collapsible", description: "Single collapsible region." },
    SectionMeta { id: "group-box", label: "GroupBox", category: Category::Layout, family: Family::Layout, demo: Demo::GroupBox, package: "composite/group_box", description: "Bordered grouped content." },
    SectionMeta { id: "layout-playground", label: "Layout playground", category: Category::Layout, family: Family::Layout, demo: Demo::LayoutPlayground, package: "composite/h_stack", description: "Interactive stack playground." },
    SectionMeta { id: "message", label: "Message", category: Category::Ai, family: Family::ChatAI, demo: Demo::Message, package: "composite/message", description: "Chat message group." },
    SectionMeta { id: "prompt-input", label: "PromptInput", category: Category::Ai, family: Family::ChatAI, demo: Demo::PromptInput, package: "ai/prompt_input", description: "AI prompt composer." },
    SectionMeta { id: "reasoning", label: "Reasoning", category: Category::Ai, family: Family::ChatAI, demo: Demo::Reasoning, package: "ai/reasoning", description: "Thinking / reasoning block." },
    SectionMeta { id: "tool", label: "Tool", category: Category::Ai, family: Family::ChatAI, demo: Demo::Tool, package: "ai/tool", description: "Tool-call card." },
    SectionMeta { id: "suggestion", label: "Suggestion", category: Category::Ai, family: Family::ChatAI, demo: Demo::Suggestion, package: "ai/suggestion", description: "Suggestion chips." },
    SectionMeta { id: "plan", label: "Plan", category: Category::Ai, family: Family::ChatAI, demo: Demo::Plan, package: "ai/plan", description: "Multi-step plan." },
    SectionMeta { id: "agent", label: "Agent", category: Category::Ai, family: Family::ChatAI, demo: Demo::Agent, package: "ai/agent", description: "Agent card." },
    SectionMeta { id: "ai-code-block", label: "AiCodeBlock", category: Category::Ai, family: Family::ChatAI, demo: Demo::AiCodeBlock, package: "ai/code_block", description: "AI code block." },
    SectionMeta { id: "ai-terminal", label: "AiTerminal", category: Category::Ai, family: Family::ChatAI, demo: Demo::AiTerminal, package: "ai/terminal", description: "AI terminal chrome." },
    SectionMeta { id: "conversation", label: "Conversation", category: Category::Ai, family: Family::ChatAI, demo: Demo::Conversation, package: "ai/conversation", description: "Conversation shell." },
    SectionMeta { id: "attachment", label: "Attachment", category: Category::Ai, family: Family::ChatAI, demo: Demo::Attachment, package: "composite/attachment", description: "File attachment chip." },
    SectionMeta { id: "text-editor", label: "TextEditor", category: Category::Editors, family: Family::Editors, demo: Demo::TextEditor, package: "composite/text_editor", description: "Markdown editor with toolbar." },
    SectionMeta { id: "code-editor", label: "CodeEditor", category: Category::Editors, family: Family::Editors, demo: Demo::CodeEditor, package: "composite/code_editor", description: "Tree-sitter code editor." },
    SectionMeta { id: "bar-chart", label: "BarChart", category: Category::Charts, family: Family::Charts, demo: Demo::BarChart, package: "composite/charts", description: "Categorical bar chart." },
    SectionMeta { id: "line-chart", label: "ChartLine", category: Category::Charts, family: Family::Charts, demo: Demo::LineChart, package: "composite/charts", description: "Single-series line chart." },
    SectionMeta { id: "pie-chart", label: "ChartPie", category: Category::Charts, family: Family::Charts, demo: Demo::PieChart, package: "composite/charts", description: "Pie chart with leader labels." },
    SectionMeta { id: "donut-chart", label: "ChartDonut", category: Category::Charts, family: Family::Charts, demo: Demo::DonutChart, package: "composite/charts", description: "Donut chart with center slot." },
    SectionMeta { id: "wizard", label: "Wizard", category: Category::Composites, family: Family::Composites, demo: Demo::Wizard, package: "composite/wizard", description: "Multi-step wizard chrome." },
    SectionMeta { id: "page-header", label: "PageHeader", category: Category::Composites, family: Family::Composites, demo: Demo::PageHeader, package: "composite/page_header", description: "Page title + actions." },
    SectionMeta { id: "side-nav", label: "SideNav", category: Category::Composites, family: Family::Composites, demo: Demo::SideNav, package: "composite/side_nav", description: "Vertical side navigation." },
    SectionMeta { id: "task-list", label: "TaskList", category: Category::Composites, family: Family::Composites, demo: Demo::TaskList, package: "composite/task_list", description: "Task checklist list." },
    SectionMeta { id: "checklist", label: "Checklist", category: Category::Composites, family: Family::Composites, demo: Demo::Checklist, package: "composite/checklist", description: "Simple checklist." },
    SectionMeta { id: "conversation-list", label: "ConversationList", category: Category::Composites, family: Family::Composites, demo: Demo::ConversationList, package: "composite/conversation_list", description: "Conversation inbox list." },
    SectionMeta { id: "notification-center", label: "NotificationCenter", category: Category::Composites, family: Family::Composites, demo: Demo::NotificationCenter, package: "composite/notification_center", description: "Notification tray." },
    SectionMeta { id: "workspace-switcher", label: "WorkspaceSwitcher", category: Category::Composites, family: Family::Composites, demo: Demo::WorkspaceSwitcher, package: "composite/workspace_switcher", description: "Workspace picker." },
    SectionMeta { id: "user-menu", label: "UserMenu", category: Category::Composites, family: Family::Composites, demo: Demo::UserMenu, package: "composite/user_menu", description: "User account menu." },
    SectionMeta { id: "find-replace-bar", label: "FindReplaceBar", category: Category::Composites, family: Family::Composites, demo: Demo::FindReplaceBar, package: "composite/find_replace_bar", description: "Find and replace bar." },
    SectionMeta { id: "tag-input", label: "TagInput", category: Category::Composites, family: Family::Composites, demo: Demo::TagInput, package: "composite/tag_input", description: "Tag entry field." },
    SectionMeta { id: "terminal-panel", label: "TerminalPanel", category: Category::Composites, family: Family::Composites, demo: Demo::TerminalPanel, package: "composite/terminal_panel", description: "Terminal panel chrome." },
    SectionMeta { id: "log-viewer", label: "LogViewer", category: Category::Composites, family: Family::Composites, demo: Demo::LogViewer, package: "composite/log_viewer", description: "Log stream viewer." },
    SectionMeta { id: "outline-view", label: "OutlineView", category: Category::Composites, family: Family::Composites, demo: Demo::OutlineView, package: "composite/outline_view", description: "Document outline." },
    SectionMeta { id: "property-list", label: "PropertyList", category: Category::Composites, family: Family::Composites, demo: Demo::PropertyList, package: "composite/property_list", description: "Key/value properties." },
    SectionMeta { id: "project-card", label: "ProjectCard", category: Category::Composites, family: Family::Composites, demo: Demo::ProjectCard, package: "composite/project_card", description: "Project summary card." },
    SectionMeta { id: "issue-card", label: "IssueCard", category: Category::Composites, family: Family::Composites, demo: Demo::IssueCard, package: "composite/issue_card", description: "Issue / ticket card." },
    SectionMeta { id: "comment-thread", label: "CommentThread", category: Category::Composites, family: Family::Composites, demo: Demo::CommentThread, package: "composite/comment_thread", description: "Comment thread." },
    SectionMeta { id: "commit-row", label: "CommitRow", category: Category::Composites, family: Family::Composites, demo: Demo::CommitRow, package: "composite/commit_row", description: "VCS commit row." },
    SectionMeta { id: "bulk-action-bar", label: "BulkActionBar", category: Category::Composites, family: Family::Composites, demo: Demo::BulkActionBar, package: "composite/bulk_action_bar", description: "Bulk selection actions." },
    SectionMeta { id: "app-header", label: "AppHeader", category: Category::Composites, family: Family::Composites, demo: Demo::AppHeader, package: "composite/app_header", description: "App brand + nav header." },
    SectionMeta { id: "toolbar", label: "Toolbar", category: Category::Composites, family: Family::Composites, demo: Demo::Toolbar, package: "composite/toolbar", description: "Mid-content toolbar." },
    SectionMeta { id: "action-bar", label: "ActionBar", category: Category::Composites, family: Family::Composites, demo: Demo::ActionBar, package: "composite/action_bar", description: "Sticky footer actions." },
    SectionMeta { id: "button-group", label: "ButtonGroup", category: Category::Composites, family: Family::Composites, demo: Demo::ButtonGroup, package: "composite/button_group", description: "Joined button group." },
    SectionMeta { id: "input-group", label: "InputGroup", category: Category::Composites, family: Family::Composites, demo: Demo::InputGroup, package: "composite/input_group", description: "Input with addons." },
    SectionMeta { id: "panel", label: "Panel", category: Category::Composites, family: Family::Composites, demo: Demo::Panel, package: "composite/panel", description: "Titled content panel." },
    SectionMeta { id: "media-object", label: "MediaObject", category: Category::Composites, family: Family::Composites, demo: Demo::MediaObject, package: "composite/media_object", description: "Media + body row." },
    SectionMeta { id: "activity-feed", label: "ActivityFeed", category: Category::Composites, family: Family::Composites, demo: Demo::ActivityFeed, package: "composite/activity_feed", description: "Activity / notification feed." },
    SectionMeta { id: "code-block", label: "CodeBlock", category: Category::Composites, family: Family::Composites, demo: Demo::CodeBlock, package: "composite/code_block", description: "Read-only code block." },
    SectionMeta { id: "chat-composer", label: "ChatComposer", category: Category::Composites, family: Family::Composites, demo: Demo::ChatComposer, package: "composite/chat_composer", description: "Message compose chrome." },
    SectionMeta { id: "command-palette", label: "CommandPalette", category: Category::Composites, family: Family::Composites, demo: Demo::CommandPalette, package: "composite/command_palette", description: "Spotlight command palette." },
    SectionMeta { id: "tab-bar", label: "TabBar", category: Category::Composites, family: Family::Composites, demo: Demo::TabBar, package: "composite/tab_bar", description: "Document tab bar." },
    SectionMeta { id: "breadcrumb-bar", label: "BreadcrumbBar", category: Category::Composites, family: Family::Composites, demo: Demo::BreadcrumbBar, package: "composite/breadcrumb_bar", description: "Path breadcrumb bar." },
    SectionMeta { id: "split-pane", label: "SplitPane", category: Category::Composites, family: Family::Composites, demo: Demo::SplitPane, package: "composite/split_pane", description: "Fixed-ratio split panes." },
    SectionMeta { id: "inspector-panel", label: "InspectorPanel", category: Category::Composites, family: Family::Composites, demo: Demo::InspectorPanel, package: "composite/inspector_panel", description: "Inspector property panel." },
    SectionMeta { id: "form-field", label: "FormField", category: Category::Composites, family: Family::Composites, demo: Demo::FormField, package: "composite/form_field", description: "Labelled form field." },
    SectionMeta { id: "search-field", label: "SearchField", category: Category::Composites, family: Family::Composites, demo: Demo::SearchField, package: "composite/search_field", description: "Search input chrome." },
    SectionMeta { id: "filter-bar", label: "FilterBar", category: Category::Composites, family: Family::Composites, demo: Demo::FilterBar, package: "composite/filter_bar", description: "Filter chip bar." },
    SectionMeta { id: "settings-page", label: "SettingsPage", category: Category::Composites, family: Family::Composites, demo: Demo::SettingsPage, package: "composite/settings_page", description: "Settings page layout." },
    SectionMeta { id: "keybinding-recorder", label: "KeybindingRecorder", category: Category::Composites, family: Family::Composites, demo: Demo::KeybindingRecorder, package: "composite/keybinding_recorder", description: "Shortcut recorder." },
    SectionMeta { id: "data-table-toolbar", label: "DataTableToolbar", category: Category::Composites, family: Family::Composites, demo: Demo::DataTableToolbar, package: "composite/data_table_toolbar", description: "Table toolbar." },
    SectionMeta { id: "file-browser", label: "FileBrowser", category: Category::Composites, family: Family::Composites, demo: Demo::FileBrowser, package: "composite/file_browser", description: "File browser list." },
    SectionMeta { id: "kanban-board", label: "KanbanBoard", category: Category::Composites, family: Family::Composites, demo: Demo::KanbanBoard, package: "composite/kanban_board", description: "Kanban columns." },
    SectionMeta { id: "timeline", label: "Timeline", category: Category::Composites, family: Family::Composites, demo: Demo::Timeline, package: "composite/timeline", description: "Event timeline." },
    SectionMeta { id: "stat-card", label: "StatCard", category: Category::Composites, family: Family::Composites, demo: Demo::StatCard, package: "composite/stat_card", description: "Metric stat card." },
    SectionMeta { id: "toast-stack", label: "ToastStack", category: Category::Composites, family: Family::Composites, demo: Demo::ToastStack, package: "composite/toast_stack", description: "In-view toast stack." },
    SectionMeta { id: "banner", label: "Banner", category: Category::Composites, family: Family::Composites, demo: Demo::Banner, package: "composite/banner", description: "Page banner." },
    SectionMeta { id: "onboarding-tip", label: "OnboardingTip", category: Category::Composites, family: Family::Composites, demo: Demo::OnboardingTip, package: "composite/onboarding_tip", description: "Onboarding tip callout." },
    SectionMeta { id: "drop-zone", label: "DropZone", category: Category::Composites, family: Family::Composites, demo: Demo::DropZone, package: "composite/drop_zone", description: "File drop zone." },
    SectionMeta { id: "icons", label: "Phosphor Icons", category: Category::System, family: Family::Icons, demo: Demo::Icons, package: "primitive/icon", description: "Vendored Phosphor catalog with live search." },
    SectionMeta { id: "palette", label: "Palette", category: Category::System, family: Family::Palette, demo: Demo::Palette, package: "theme / palette", description: "Semantic theme roles and chart ramp." },
    SectionMeta { id: "theming", label: "Theming", category: Category::System, family: Family::Theming, demo: Demo::Theming, package: "theme / AppTheme", description: "AppTheme live config." },
    SectionMeta { id: "state", label: "State & Stores", category: Category::System, family: Family::State, demo: Demo::State, package: "state / StoreHandle", description: "Stores, slices, and ambient context." },
];

pub const SECTION_COUNT: usize = 147;

pub fn section_by_id(id: &str) -> Option<Section> {
    SECTIONS
        .iter()
        .position(|m| m.id == id)
        .map(|i| Section(i as u16))
}

