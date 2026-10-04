use celestia_ui::components::Card;
use celestia_ui::components::composite::color_picker::ColorPickerState;
use celestia_ui::components::composite::date_picker::DatePickerState;
use celestia_ui::components::composite::sidebar_layout::{
    SidebarFooter, SidebarHeader, SidebarLayout, SidebarNav, SidebarNavItem, SidebarSection,
};
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::calendar::CalendarState;
use celestia_ui::components::primitive::icon::PhosphorWeight;
use celestia_ui::components::primitive::input::InputState;
use celestia_ui::components::primitive::input_otp::OtpState;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::select::SelectState;
use celestia_ui::components::primitive::slider::SliderState;
use celestia_ui::components::primitive::table::DataTable;
use celestia_ui::components::primitive::textarea::TextareaState;
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use celestia_ui::components::{CodeEditor, SectionHeading, TextEditor};
use celestia_ui::motion;
use celestia_ui::state::StoreHandle;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::theme::AppTheme;
use gpui_base::spring;
use gpui_component::input::{Editor, EditorState, InputEvent};
use gpui_component::{ActiveTheme, IndexPath, Root, Theme, ThemeMode, TitleBar, h_flex, v_flex};
use gpui::*;

use crate::actions::ToggleTheme;
use crate::section::{SECTIONS, Section};
use crate::sections::data_display::VirtualListDemo;
use crate::sections::state::GalleryState;

#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub enum ShowcaseTab {
    #[default]
    View,
    Code,
}

pub struct Showcase {
    pub(crate) focus_handle: FocusHandle,
    pub(crate) selected: Section,
    pub(crate) active_tab: ShowcaseTab,
    pub(crate) code_view: Entity<EditorState>,
    pub(crate) demo_switch: bool,
    pub(crate) demo_checkbox: bool,
    pub(crate) demo_radio: usize,
    pub(crate) demo_rating: usize,
    pub(crate) demo_tab_segmented: usize,
    pub(crate) demo_tab_line: usize,
    pub(crate) demo_input: Entity<InputState>,
    pub(crate) demo_select: Entity<SelectState<Vec<&'static str>>>,
    pub(crate) demo_editor: Entity<TextEditor>,
    pub(crate) demo_code: Entity<CodeEditor>,
    pub(crate) demo_number: Entity<InputState>,
    pub(crate) demo_date: Entity<DatePickerState>,
    pub(crate) demo_color: Entity<ColorPickerState>,
    pub(crate) demo_textarea: Entity<TextareaState>,
    pub(crate) demo_otp: Entity<OtpState>,
    pub(crate) demo_slider: Entity<SliderState>,
    pub(crate) demo_calendar: Entity<CalendarState>,
    pub(crate) demo_table: Entity<DataTable>,
    pub(crate) demo_virtual_list: Entity<VirtualListDemo>,
    pub(crate) demo_state: StoreHandle<GalleryState>,
    pub(crate) state_count: u32,
    pub(crate) state_label: SharedString,
    pub(crate) state_count_notifications: usize,
    pub(crate) state_label_notifications: usize,
    pub(crate) icon_search: Entity<InputState>,
    pub(crate) icon_weight: PhosphorWeight,
    /// The live global theme config (see sections/theming.rs). Applied with
    /// `AppTheme::apply` on every change — the whole window re-themes.
    pub(crate) theme: AppTheme,
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

        let demo_table = cx.new(|cx| {
            DataTable::from_key_value(
                [
                    ("INV-001 (Acme Corp)", "$1,200.00"),
                    ("INV-002 (Globex Inc)", "$850.00"),
                    ("INV-003 (Soylent LLC)", "$340.00"),
                    ("INV-004 (Initech)", "$920.00"),
                ],
                window,
                cx,
            )
        });

        let code_view = cx.new(|cx| EditorState::new(window, cx).language("rust"));
        code_view.update(cx, |e, cx| {
            e.replace_all(Section::Buttons.code(), window, cx);
        });

        // Shared app state (see sections/state.rs): one store entity observed
        // twice — unfiltered to re-render the shell on any change, and per
        // slice to count gated notifications for the demo.
        let demo_state = StoreHandle::new(GalleryState::default(), cx);
        cx.observe(&demo_state, |_, _, cx| cx.notify()).detach();
        demo_state
            .observe_slice(
                cx,
                |s| s.count,
                |this: &mut Self, count, cx| {
                    this.state_count = count;
                    this.state_count_notifications += 1;
                    cx.notify();
                },
            )
            .detach();
        demo_state
            .observe_slice(
                cx,
                |s| s.label.clone(),
                |this: &mut Self, label, cx| {
                    this.state_label = label;
                    this.state_label_notifications += 1;
                    cx.notify();
                },
            )
            .detach();
        let state_count = demo_state.read(cx).count;
        let state_label = demo_state.read(cx).label.clone();

        // Phosphor gallery search: re-render the icons grid on every keystroke.
        let icon_search = cx.new(|cx| InputState::new(window, cx).placeholder("Search glyphs…"));
        cx.subscribe(&icon_search, |_, _, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                cx.notify();
            }
        })
        .detach();

        Self {
            focus_handle: cx.focus_handle(),
            selected: Section::Buttons,
            active_tab: ShowcaseTab::View,
            code_view,
            demo_switch: true,
            demo_checkbox: true,
            demo_radio: 0,
            demo_rating: 4,
            demo_tab_segmented: 0,
            demo_tab_line: 0,
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
            demo_textarea: cx
                .new(|cx| TextareaState::new(window, cx).placeholder("Multi-line textarea input…")),
            demo_otp: cx.new(|cx| OtpState::new(6, window, cx)),
            demo_slider: cx.new(|_| SliderState::new()),
            demo_calendar: cx.new(|cx| CalendarState::new(window, cx)),
            demo_table,
            demo_virtual_list: cx.new(|_| VirtualListDemo::new()),
            demo_state,
            state_count,
            state_label,
            state_count_notifications: 0,
            state_label_notifications: 0,
            icon_search,
            icon_weight: PhosphorWeight::Regular,
            theme: AppTheme::default(),
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

    pub fn switch_tab(&mut self, tab: ShowcaseTab, window: &mut Window, cx: &mut Context<Self>) {
        if self.active_tab != tab {
            self.active_tab = tab;
            if self.active_tab == ShowcaseTab::Code {
                let code = self.selected.code();
                self.code_view.update(cx, |editor, cx| {
                    editor.replace_all(code, window, cx);
                });
            }
            cx.notify();
        }
    }
}

impl Render for Showcase {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let dialog_layer = Root::render_dialog_layer(window, cx);
        let sheet_layer = Root::render_sheet_layer(window, cx);
        let notification_layer = Root::render_notification_layer(window, cx);

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
            .child(self.render_shell(window, cx))
            .children(dialog_layer)
            .children(sheet_layer)
            .children(notification_layer)
    }
}

impl Showcase {
    /// The SidebarLayout shell: nav column + the selected section's pane.
    fn render_shell(&self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
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
                    .on_click(cx.listener(move |this, _, window, cx| {
                        this.selected = section;
                        if this.active_tab == ShowcaseTab::Code {
                            let code = section.code();
                            this.code_view.update(cx, |editor, cx| {
                                editor.replace_all(code, window, cx);
                            });
                        }
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
                    .child(self.render_section(window, cx)),
            )
    }

    fn render_toggle_button(
        &self,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let is_view = self.active_tab == ShowcaseTab::View;
        let is_code = self.active_tab == ShowcaseTab::Code;

        let (
            policy,
            tab_bar_bg,
            border_color,
            radius,
            primary_bg,
            primary_fg,
            muted_fg,
            accent_color,
            fg_color,
        ) = {
            let theme = cx.theme();
            (
                theme.motion_tokens().spring_move,
                theme.tokens.tab_bar,
                theme.border,
                theme.radius,
                theme.primary,
                theme.primary_foreground,
                theme.muted_foreground,
                theme.accent,
                theme.foreground,
            )
        };

        // 76px segment width + 2.5px track padding + 2px gap = 80.5px offset for tab 1.
        let to_left = if is_view { px(2.5) } else { px(80.5) };
        let left = spring(
            (ElementId::from("view-code-toggle"), "indicator-left"),
            to_left,
            policy,
            window,
            cx,
        );

        let render_segment = |id: &'static str,
                              label: &'static str,
                              icon: PhosphorIcon,
                              is_active: bool,
                              tab: ShowcaseTab,
                              cx: &mut Context<Self>| {
            let (text_color, icon_color, font_weight) = if is_active {
                (primary_fg, primary_fg, FontWeight::SEMIBOLD)
            } else {
                (muted_fg, muted_fg, FontWeight::MEDIUM)
            };

            let mut el = h_flex()
                .id(id)
                .relative()
                .w(px(76.))
                .h(px(26.))
                .items_center()
                .justify_center()
                .gap(px(5.))
                .rounded(px(5.))
                .cursor_pointer()
                .child(Phosphor::new(icon).size(px(13.)).color(icon_color))
                .child(
                    div()
                        .text_xs()
                        .font_weight(font_weight)
                        .text_color(text_color)
                        .child(label),
                );

            if !is_active {
                el = el
                    .hover(move |style| style.bg(accent_color.opacity(0.35)).text_color(fg_color))
                    .active(move |style| style.bg(accent_color.opacity(0.6)));
            }

            el.on_click(cx.listener(move |this, _, window, cx| {
                this.switch_tab(tab, window, cx);
            }))
        };

        h_flex()
            .id("view-code-toggle")
            .relative()
            .items_center()
            .gap(px(2.))
            .p(px(2.5))
            .bg(tab_bar_bg)
            .border_1()
            .border_color(border_color)
            .rounded(radius)
            .child(
                div()
                    .absolute()
                    .top(px(2.5))
                    .bottom(px(2.5))
                    .left(left)
                    .w(px(76.))
                    .rounded(px(5.))
                    .bg(primary_bg),
            )
            .child(render_segment(
                "btn-trigger-view",
                "Visual",
                PhosphorIcon::Eye,
                is_view,
                ShowcaseTab::View,
                cx,
            ))
            .child(render_segment(
                "btn-trigger-code",
                "Code",
                PhosphorIcon::Code,
                is_code,
                ShowcaseTab::Code,
                cx,
            ))
    }

    fn render_section(&self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let heading = SectionHeading::new(self.selected.label())
            .eyebrow("CELESTIA DESKTOP")
            .description(self.selected.description());

        let header = h_flex()
            .w_full()
            .justify_between()
            .items_end()
            .child(heading)
            .child(self.render_toggle_button(window, cx));

        let body: AnyElement = match self.active_tab {
            ShowcaseTab::View => match self.selected {
                Section::Buttons => self.render_buttons(cx).into_any_element(),
                Section::TagsBadges => self.render_tags(cx).into_any_element(),
                Section::Inputs => self.render_inputs(cx).into_any_element(),
                Section::Pickers => self.render_pickers(cx).into_any_element(),
                Section::Feedback => self.render_feedback(cx).into_any_element(),
                Section::Overlays => self.render_overlays(cx).into_any_element(),
                Section::MenusDialogs => self.render_menus(cx).into_any_element(),
                Section::DataDisplay => self.render_data_display(cx).into_any_element(),
                Section::Layout => self.render_layout(cx).into_any_element(),
                Section::ChatAI => self.render_chat(cx).into_any_element(),
                Section::Editors => self.render_editors(cx).into_any_element(),
                Section::Charts => self.render_charts(cx).into_any_element(),
                Section::Icons => self.render_icons(cx).into_any_element(),
                Section::Palette => self.render_palette(cx).into_any_element(),
                Section::Theming => self.render_theming(cx).into_any_element(),
                Section::State => self.render_state(cx).into_any_element(),
            },
            ShowcaseTab::Code => self.render_code_view(cx).into_any_element(),
        };

        let anim_key = match self.active_tab {
            ShowcaseTab::View => "tab-content-view",
            ShowcaseTab::Code => "tab-content-code",
        };
        let anim_id = ElementId::Name(format!("{}-{anim_key}", self.selected.id()).into());

        let animated_body = div()
            .id(anim_id.clone())
            .w_full()
            .with_animation(anim_id, motion::SLIDE.animation(), |el, t| {
                el.opacity(t).relative().top(px(4.0 * (1.0 - t)))
            })
            .child(body);

        v_flex().gap_6().child(header).child(animated_body)
    }

    fn render_code_view(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let code = self.selected.code();
        let line_count = code.lines().count();
        let editor_height = (line_count as f32 * 22.0 + 40.0).clamp(280.0, 680.0);

        Card::new()
            .title(format!("{} — Code", self.selected.label()))
            .description("Rust implementation and component usage.")
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        h_flex()
                            .justify_between()
                            .items_center()
                            .px_3()
                            .py_1p5()
                            .rounded(cx.theme().radius)
                            .bg(cx.theme().tokens.tab_bar)
                            .border_1()
                            .border_color(cx.theme().border)
                            .child(
                                h_flex()
                                    .gap_2()
                                    .items_center()
                                    .child(
                                        Phosphor::new(PhosphorIcon::Code)
                                            .size(px(14.0))
                                            .color(cx.theme().muted_foreground),
                                    )
                                    .child(
                                        div()
                                            .text_xs()
                                            .font_weight(FontWeight::MEDIUM)
                                            .text_color(cx.theme().foreground)
                                            .child("Rust"),
                                    )
                                    .child(
                                        div()
                                            .text_xs()
                                            .text_color(cx.theme().muted_foreground)
                                            .child(format!("· {line_count} lines")),
                                    ),
                            )
                            .child(
                                h_flex()
                                    .gap_2()
                                    .items_center()
                                    .child(
                                        Button::new("switch-to-visual-btn")
                                            .variant(ButtonVariant::Outline)
                                            .size(ButtonSize::XSmall)
                                            .child(
                                                h_flex()
                                                    .gap_1p5()
                                                    .items_center()
                                                    .child(
                                                        Phosphor::new(PhosphorIcon::Eye)
                                                            .size(px(12.))
                                                            .color(cx.theme().foreground),
                                                    )
                                                    .child("Visual View"),
                                            )
                                            .on_click(cx.listener(|this, _, window, cx| {
                                                this.switch_tab(ShowcaseTab::View, window, cx);
                                            })),
                                    )
                                    .child(
                                        Button::new("copy-code-btn")
                                            .variant(ButtonVariant::Ghost)
                                            .size(ButtonSize::XSmall)
                                            .label("Copy Code")
                                            .on_click(cx.listener(move |this, _, window, cx| {
                                                let code = this.selected.code();
                                                cx.write_to_clipboard(
                                                    gpui::ClipboardItem::new_string(
                                                        code.to_string(),
                                                    ),
                                                );
                                                window.push_notification(
                                                    Notification::success(
                                                        "Code copied to clipboard",
                                                    ),
                                                    cx,
                                                );
                                            })),
                                    ),
                            ),
                    )
                    .child(
                        div()
                            .w_full()
                            .h(px(editor_height))
                            .bg(cx.theme().background)
                            .border_1()
                            .border_color(cx.theme().border)
                            .rounded(cx.theme().radius)
                            .overflow_hidden()
                            .child(Editor::new(&self.code_view).readonly(true).bordered(false)),
                    ),
            )
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
