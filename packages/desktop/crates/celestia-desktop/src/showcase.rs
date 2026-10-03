use celestia_ui::components::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::color_picker::ColorPickerState;
use celestia_ui::components::date_picker::DatePickerState;
use celestia_ui::components::input::InputState;
use celestia_ui::components::kbd::Kbd;
use celestia_ui::components::select::SelectState;
use celestia_ui::components::sidebar_layout::{
    SidebarFooter, SidebarHeader, SidebarLayout, SidebarNav, SidebarNavItem, SidebarSection,
};
use celestia_ui::components::{CodeEditor, SectionHeading, TextEditor};
use gpui_kit::component::{ActiveTheme, IndexPath, Root, Theme, ThemeMode, TitleBar, v_flex};
use gpui_kit::*;

use crate::actions::ToggleTheme;
use crate::section::{SECTIONS, Section};

pub struct Showcase {
    pub(crate) focus_handle: FocusHandle,
    pub(crate) selected: Section,
    pub(crate) demo_input: Entity<InputState>,
    pub(crate) demo_select: Entity<SelectState<Vec<&'static str>>>,
    pub(crate) demo_editor: Entity<TextEditor>,
    pub(crate) demo_code: Entity<CodeEditor>,
    pub(crate) demo_number: Entity<InputState>,
    pub(crate) demo_date: Entity<DatePickerState>,
    pub(crate) demo_color: Entity<ColorPickerState>,
}

impl Showcase {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let demo_editor = cx.new(|cx| TextEditor::new(window, cx));
        demo_editor.update(cx, |e, cx| {
            e.set_text(
                "## Release notes\n\n- Added **bold**, *italic* and `code` marks\n- Select text, then press a toolbar button\n\n> Markdown in, markdown out.",
                window,
                cx,
            );
        });

        let demo_code = cx.new(|cx| CodeEditor::new("rust", window, cx));
        demo_code.update(cx, |e, cx| {
            e.set_text(
                "use celestia_ui::init;\n\nfn main() {\n    // GPU-rendered, no webview\n    init(cx);\n    println!(\"Hello, Celestia!\");\n}",
                window,
                cx,
            );
        });

        Self {
            focus_handle: cx.focus_handle(),
            selected: Section::Buttons,
            demo_input: cx.new(|cx| InputState::new(window, cx).placeholder("Type something…")),
            demo_select: cx.new(|cx| {
                SelectState::new(
                    vec!["Weekly", "Daily", "Monthly"],
                    Some(IndexPath::default()),
                    window,
                    cx,
                )
            }),
            demo_editor,
            demo_code,
            demo_number: cx.new(|cx| InputState::new(window, cx).placeholder("0")),
            demo_date: cx.new(|cx| DatePickerState::new(window, cx)),
            demo_color: cx.new(|cx| ColorPickerState::new(window, cx)),
        }
    }

    pub fn toggle_theme(cx: &mut App) {
        let next = if cx.theme().is_dark() {
            ThemeMode::Light
        } else {
            ThemeMode::Dark
        };
        Theme::change(next, None, cx);
    }
}

impl Render for Showcase {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // Root::render() 不会自动画 Dialog / Sheet / Notification 层，需要消费方
        // 自己挂载（GetCat 同款）；否则 window.open_dialog 只会更新状态，画面上
        // 什么都不会出现。
        let dialog_layer = Root::render_dialog_layer(window, cx);
        let sheet_layer = Root::render_sheet_layer(window, cx);
        let notification_layer = Root::render_notification_layer(window, cx);

        // 根元素持有焦点（track_focus）：给它 id + role，否则 gpui 会在日志里
        // 提示聚焦元素缺少 role。
        div()
            .id("showcase")
            .role(Role::Group)
            .aria_label("Celestia component gallery")
            .key_context("Showcase")
            .track_focus(&self.focus_handle)
            .on_action(cx.listener(|_, _: &ToggleTheme, _, cx| Self::toggle_theme(cx)))
            .size_full()
            .flex()
            .flex_col()
            .bg(cx.theme().background)
            .text_color(cx.theme().foreground)
            .child(title_bar(cx))
            .child(self.render_shell(cx))
            .children(dialog_layer)
            .children(sheet_layer)
            .children(notification_layer)
    }
}

impl Showcase {
    /// The SidebarLayout shell: nav column + the selected section's pane.
    fn render_shell(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let is_dark = cx.theme().is_dark();

        SidebarLayout::new("shell")
            .sidebar(
                SidebarHeader::new().child(
                    v_flex()
                        .gap_0p5()
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::SEMIBOLD)
                                .child("Celestia"),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(cx.theme().muted_foreground)
                                .child("Desktop gallery"),
                        ),
                ),
            )
            .sidebar(SidebarSection::new("Components"))
            .sidebar(SidebarNav::new("nav").children(SECTIONS.map(|section| {
                SidebarNavItem::new(section.id(), section.label())
                    .selected(self.selected == section)
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.selected = section;
                        cx.notify();
                    }))
            })))
            .sidebar(
                SidebarFooter::new()
                    .child(
                        Button::new("sb-theme")
                            .variant(ButtonVariant::Ghost)
                            .size(ButtonSize::XSmall)
                            .label(if is_dark { "Light mode" } else { "Dark mode" })
                            .on_click(cx.listener(|_, _, _, cx| Self::toggle_theme(cx))),
                    )
                    .child(div().flex_1())
                    .child(Kbd::new(
                        Keystroke::parse("cmd-d").expect("valid keystroke"),
                    )),
            )
            .content(
                div()
                    .id("content")
                    .overflow_y_scroll()
                    .h_full()
                    .p_8()
                    .child(self.render_section(cx)),
            )
    }

    fn render_section(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let heading = SectionHeading::new(self.selected.label())
            .eyebrow("CELESTIA DESKTOP")
            .description(self.selected.description());

        let body: AnyElement = match self.selected {
            Section::Buttons => self.render_buttons(cx).into_any_element(),
            Section::TagsBadges => self.render_tags(cx).into_any_element(),
            Section::Inputs => self.render_inputs(cx).into_any_element(),
            Section::Feedback => self.render_feedback(cx).into_any_element(),
            Section::Editors => self.render_editors(cx).into_any_element(),
            Section::Overlays => self.render_overlays(cx).into_any_element(),
            Section::MenusDialogs => self.render_menus(cx).into_any_element(),
            Section::Tabs => self.render_tabs(cx).into_any_element(),
            Section::Accordion => self.render_accordion(cx).into_any_element(),
            Section::Pickers => self.render_pickers(cx).into_any_element(),
            Section::Palette => self.render_palette(cx).into_any_element(),
        };

        v_flex().gap_6().child(heading).child(body)
    }
}

fn title_bar(cx: &App) -> impl IntoElement {
    TitleBar::new().child(
        div().w_full().flex().justify_center().child(
            div()
                .text_sm()
                .text_color(cx.theme().muted_foreground)
                .child("Celestia Desktop"),
        ),
    )
}
