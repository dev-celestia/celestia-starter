//! Per-component demo dispatch for the individual catalog.
//!
//! [`Showcase::render_demo`] matches every [`Demo`] variant and returns a
//! focused Card (or system full-page) for that component alone.

use gpui::*;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    /// Render the focused gallery demo for one catalog entry.
    pub(crate) fn render_demo(
        &self,
        demo: Demo,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> AnyElement {
        match demo {
            // Actions
            Demo::Button => self.render_button(cx).into_any_element(),
            Demo::Kbd => self.render_kbd(cx).into_any_element(),
            Demo::Link => self.render_link(cx).into_any_element(),

            // Typography
            Demo::Typography | Demo::Heading => self.render_typography_demo(demo, cx),

            // Badges / atoms
            Demo::Badge
            | Demo::Chip
            | Demo::Pill
            | Demo::CountLabel
            | Demo::StatusDot
            | Demo::Caption
            | Demo::Initials
            | Demo::ColorSwatch
            | Demo::FileGlyph
            | Demo::Pin
            | Demo::Disclosure
            | Demo::InlineCode
            | Demo::Quote
            | Demo::Truncate
            | Demo::RelativeTime
            | Demo::IconLabel
            | Demo::ImageIcon
            | Demo::HotkeyHint => self.render_tag_demo(demo, cx),

            // Inputs
            Demo::Input
            | Demo::Textarea
            | Demo::InputOtp
            | Demo::Select
            | Demo::Slider
            | Demo::Switch
            | Demo::Checkbox
            | Demo::Radio
            | Demo::Rating
            | Demo::Toggle
            | Demo::Item
            | Demo::AspectRatio
            | Demo::Label => self.render_input_demo(demo, cx),

            // Pickers
            Demo::Calendar | Demo::DatePicker | Demo::ColorPicker | Demo::NumberInput => {
                self.render_picker_demo(demo, cx)
            }

            // Feedback
            Demo::Alert
            | Demo::Progress
            | Demo::Meter
            | Demo::Scrubber
            | Demo::SignalBars
            | Demo::Battery
            | Demo::NumberStepper
            | Demo::Fab
            | Demo::Spinner
            | Demo::Skeleton
            | Demo::Shimmer => self.render_feedback_demo(demo, cx),

            // Overlays
            Demo::Popover
            | Demo::Tooltip
            | Demo::Toast
            | Demo::Dialog
            | Demo::Modal
            | Demo::Sheet
            | Demo::SheetPanel
            | Demo::Drawer
            | Demo::ConfirmDialog => self.render_overlay_demo(demo, window, cx),

            // Menus
            Demo::DropdownMenu
            | Demo::ToolbarMenu
            | Demo::Menubar
            | Demo::NavigationMenu
            | Demo::ContextMenu => self.render_menu_demo(demo, cx),

            // Data
            Demo::DataTable
            | Demo::VirtualList
            | Demo::Breadcrumb
            | Demo::Pagination
            | Demo::Empty => self.render_data_demo(demo, cx),

            // Layout
            Demo::Hstack
            | Demo::Vstack
            | Demo::Zstack
            | Demo::Spacer
            | Demo::Vgrid
            | Demo::Tabs
            | Demo::Accordion
            | Demo::Collapsible
            | Demo::GroupBox
            | Demo::LayoutPlayground
            | Demo::Resizable
            | Demo::ResizableSplit => self.render_layout_demo(demo, cx),

            // Message — a content surface, filed with the composites
            Demo::Message => self.render_message_demo(demo, cx),

            // Editors
            Demo::TextEditor | Demo::CodeEditor => self.render_editor_demo(demo, cx),

            // Charts
            Demo::BarChart | Demo::LineChart | Demo::PieChart | Demo::DonutChart => {
                self.render_chart_demo(demo, cx)
            }

            // Composites
            Demo::Wizard
            | Demo::PageHeader
            | Demo::SideNav
            | Demo::TaskList
            | Demo::Checklist
            | Demo::ConversationList
            | Demo::NotificationCenter
            | Demo::WorkspaceSwitcher
            | Demo::UserMenu
            | Demo::FindReplaceBar
            | Demo::TagInput
            | Demo::TerminalPanel
            | Demo::LogViewer
            | Demo::OutlineView
            | Demo::PropertyList
            | Demo::ProjectCard
            | Demo::IssueCard
            | Demo::CommentThread
            | Demo::CommitRow
            | Demo::BulkActionBar
            | Demo::AppHeader
            | Demo::Toolbar
            | Demo::ActionBar
            | Demo::StartBar
            | Demo::SystemTray
            | Demo::StartMenu
            | Demo::TrafficLights
            | Demo::Window
            | Demo::ButtonGroup
            | Demo::InputGroup
            | Demo::Panel
            | Demo::MediaObject
            | Demo::ActivityFeed
            | Demo::CodeBlock
            | Demo::ChatComposer
            | Demo::CommandPalette
            | Demo::TabBar
            | Demo::BreadcrumbBar
            | Demo::SplitPane
            | Demo::InspectorPanel
            | Demo::FormField
            | Demo::SearchField
            | Demo::FilterBar
            | Demo::SettingsPage
            | Demo::KeybindingRecorder
            | Demo::DataTableToolbar
            | Demo::FileBrowser
            | Demo::FileTree
            | Demo::KanbanBoard
            | Demo::Timeline
            | Demo::StatCard
            | Demo::ToastStack
            | Demo::Banner
            | Demo::OnboardingTip => self.render_composite_demo(demo, cx),

            // Drag & Drop
            Demo::DragHandle
            | Demo::DropIndicator
            | Demo::Draggable
            | Demo::DropTarget
            | Demo::DropZone
            | Demo::SortableList => self.render_dnd_demo(demo, cx),

            // System — keep existing full-page renders
            Demo::Icons => self.render_icons(window, cx).into_any_element(),
            Demo::Palette => self.render_palette(cx).into_any_element(),
            Demo::Theming => self.render_theming(cx).into_any_element(),
            Demo::State => self.render_state(cx).into_any_element(),
        }
    }
}
