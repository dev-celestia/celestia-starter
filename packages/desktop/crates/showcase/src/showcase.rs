use celestia_ui::components::Card;
use celestia_ui::components::composite::color_picker::ColorPickerState;
use celestia_ui::components::composite::date_picker::DatePickerState;
use celestia_ui::components::composite::search_field::SearchField;
use celestia_ui::components::composite::sidebar_layout::{
    SidebarFooter, SidebarHeader, SidebarLayout, SidebarNav, SidebarNavItem, SidebarSection,
};
use celestia_ui::components::composite::title_bar::TitleBar;
use celestia_ui::components::composite::virtual_list::VirtualListScrollHandle;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::calendar::CalendarState;
use celestia_ui::components::primitive::icon::PhosphorWeight;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::components::primitive::input::{Input, InputState};
use celestia_ui::components::primitive::input_otp::OtpState;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::select::SelectState;
use celestia_ui::components::primitive::slider::SliderState;
use celestia_ui::components::primitive::textarea::TextareaState;
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use celestia_ui::components::{CodeEditor, SectionHeading, TextEditor};
use celestia_ui::motion;
use celestia_ui::state::StoreHandle;
use celestia_ui::theme::{ActiveTheme as _, AppTheme, Theme};
use gpui::*;
use gpui_base::spring;
use gpui_component::input::{Editor, EditorState, InputEvent};
use gpui_component::{IndexPath, Theme as WidgetTheme, h_flex, v_flex};

use crate::actions::ToggleTheme;
use crate::section::{Category, DocProp, SECTION_COUNT, Section};
use crate::sections::data_display::VirtualListDemo;
use crate::sections::layout::PlaygroundAxis;
use crate::sections::state::GalleryState;

#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub enum ShowcaseTab {
    #[default]
    View,
    Docs,
}

pub struct Showcase {
    pub(crate) focus_handle: FocusHandle,
    pub(crate) selected: Section,
    pub(crate) active_tab: ShowcaseTab,
    pub(crate) code_view: Entity<EditorState>,
    pub(crate) demo_switch: bool,
    pub(crate) demo_checkbox: bool,
    pub(crate) demo_radio: usize,
    pub(crate) demo_toggle_bold: bool,
    pub(crate) demo_toggle_italic: bool,
    /// Exclusive toggle-group selection (0 = left, 1 = center, 2 = right).
    pub(crate) demo_toggle_align: usize,
    /// Active document tab id in the App Composites demo.
    pub(crate) demo_composite_tab: SharedString,
    /// Active filter chip index in the App Composites demo (0 = All).
    pub(crate) demo_composite_filter: usize,
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
    pub(crate) demo_virtual_list: Entity<VirtualListDemo>,
    pub(crate) demo_state: StoreHandle<GalleryState>,
    pub(crate) state_count: u32,
    pub(crate) state_label: SharedString,
    pub(crate) state_count_notifications: usize,
    pub(crate) state_label_notifications: usize,
    pub(crate) icon_search: Entity<InputState>,
    pub(crate) nav_search: Entity<InputState>,
    pub(crate) icon_weight: PhosphorWeight,
    pub(crate) icon_scroll_handle: VirtualListScrollHandle,
    /// The interactive layout playground (see sections/layout.rs): the stack
    /// axis, the index into that axis's alignment vocabulary, the index into
    /// `PLAYGROUND_SPACINGS`, and the number of preview children (2–6).
    pub(crate) layout_axis: PlaygroundAxis,
    pub(crate) layout_align: usize,
    pub(crate) layout_spacing_ix: usize,
    pub(crate) layout_children: usize,
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

        let code_view = cx.new(|cx| EditorState::new(window, cx).language("rust"));
        code_view.update(cx, |e, cx| {
            e.replace_all(Section::BUTTON.code(), window, cx);
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
        let icon_scroll_handle = VirtualListScrollHandle::new();
        let scroll_handle_for_sub = icon_scroll_handle.clone();
        cx.subscribe(&icon_search, move |_, _, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                scroll_handle_for_sub.scroll_to_item(0, ScrollStrategy::Top);
                cx.notify();
            }
        })
        .detach();

        // Sidebar component filter.
        let nav_search = cx.new(|cx| InputState::new(window, cx).placeholder("Search components…"));
        cx.subscribe(&nav_search, move |_, _, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                cx.notify();
            }
        })
        .detach();

        Self {
            focus_handle: cx.focus_handle(),
            selected: Section::BUTTON,
            active_tab: ShowcaseTab::View,
            code_view,
            demo_switch: true,
            demo_checkbox: true,
            demo_radio: 0,
            demo_toggle_bold: true,
            demo_toggle_italic: false,
            demo_toggle_align: 0,
            demo_composite_tab: "main".into(),
            demo_composite_filter: 0,
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
            demo_virtual_list: cx.new(|_| VirtualListDemo::new()),
            demo_state,
            state_count,
            state_label,
            state_count_notifications: 0,
            state_label_notifications: 0,
            icon_search,
            nav_search,
            icon_weight: PhosphorWeight::Regular,
            icon_scroll_handle,
            layout_axis: PlaygroundAxis::Row,
            layout_align: 1,
            layout_spacing_ix: 2,
            layout_children: 3,
            theme: AppTheme::default(),
        }
    }

    pub fn toggle_theme(cx: &mut App) {
        Theme::toggle(cx);
    }

    pub fn switch_tab(&mut self, tab: ShowcaseTab, window: &mut Window, cx: &mut Context<Self>) {
        if self.active_tab != tab {
            self.active_tab = tab;
            if self.active_tab == ShowcaseTab::Docs {
                let usage = self.selected.docs().usage;
                self.code_view.update(cx, |editor, cx| {
                    editor.replace_all(usage, window, cx);
                });
            }
            cx.notify();
        }
    }
}

impl Render for Showcase {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // Dialog, sheet, notification and tooltip overlays are mounted by the
        // root plugin `gpui_component::init` registers (0.7 root architecture);
        // they are no longer rendered by the app view.

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
    }
}

impl Showcase {
    /// The SidebarLayout shell: nav column + the selected component's pane.
    fn render_shell(&self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let is_dark = cx.theme().is_dark();
        let query = self.nav_search.read(cx).value().to_string();
        let query_trimmed = query.trim().to_string();
        let mut nav_children: Vec<AnyElement> = Vec::new();
        let mut visible = 0usize;

        for category in Category::ALL {
            let items: Vec<Section> = (0..SECTION_COUNT)
                .map(|i| Section(i as u16))
                .filter(|s| s.category() == category && s.matches_query(&query_trimmed))
                .collect();
            if items.is_empty() {
                continue;
            }
            visible += items.len();
            nav_children.push(SidebarSection::new(category.label()).into_any_element());
            for section in items {
                nav_children.push(
                    SidebarNavItem::new(section.id(), section.label())
                        .selected(self.selected == section)
                        .on_click(cx.listener(move |this, _, window, cx| {
                            this.selected = section;
                            if this.active_tab == ShowcaseTab::Docs {
                                let usage = section.docs().usage;
                                this.code_view.update(cx, |editor, cx| {
                                    editor.replace_all(usage, window, cx);
                                });
                            }
                            cx.notify();
                        }))
                        .into_any_element(),
                );
            }
        }

        if visible == 0 {
            nav_children.push(
                div()
                    .px_3()
                    .py_2()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child("No components match.")
                    .into_any_element(),
            );
        }

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
            .sidebar(
                div()
                    .id("nav-search")
                    .flex_none()
                    .px_2()
                    .pt_2()
                    .pb_1()
                    .border_b_1()
                    .border_color(cx.theme().sidebar_border)
                    .child(
                        SearchField::new("sidebar-search")
                            .clearable(true)
                            .on_clear(cx.listener(|this, _, window, cx| {
                                this.nav_search.update(cx, |state, cx| {
                                    state.set_value("", window, cx);
                                });
                                cx.notify();
                            }))
                            .input(Input::new(&self.nav_search).cleanable(false)),
                    ),
            )
            .sidebar(SidebarNav::new("nav").children(nav_children))
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
        let is_docs = self.active_tab == ShowcaseTab::Docs;

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
            // Motion tokens still live on the gpui-component theme (synced
            // mode/palette by Theme::change); colors come from Celestia.
            (
                WidgetTheme::global(cx).motion_tokens().spring_move,
                theme.tab_bar,
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
            (ElementId::from("view-docs-toggle"), "indicator-left"),
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
            .id("view-docs-toggle")
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
                "btn-trigger-docs",
                "Docs",
                PhosphorIcon::BookOpen,
                is_docs,
                ShowcaseTab::Docs,
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
            .items_start()
            .gap_4()
            .child(heading)
            .child(self.render_toolbar_card(window, cx));

        let body: AnyElement = match self.active_tab {
            ShowcaseTab::View => self.render_demo(self.selected.demo(), window, cx),
            ShowcaseTab::Docs => self.render_docs_view(cx).into_any_element(),
        };

        let anim_key = match self.active_tab {
            ShowcaseTab::View => "tab-content-view",
            ShowcaseTab::Docs => "tab-content-docs",
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

    /// Right-side toolbar on Visual/Docs: package chip + view toggle.
    fn render_toolbar_card(
        &self,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let package = self.selected.package();
        let muted = cx.theme().muted_foreground;
        let fg = cx.theme().foreground;
        let border = cx.theme().border;
        let tab_bar = cx.theme().tab_bar;
        let radius = cx.theme().radius;

        Card::new()
            .size(celestia_ui::components::CardSize::Small)
            .title("Package")
            .description("Click to copy — paste into AI to pick this component.")
            .action(self.render_toggle_button(window, cx))
            .child(
                div()
                    .id("toolbar-package")
                    .px_2()
                    .py_0p5()
                    .rounded(radius)
                    .bg(tab_bar)
                    .border_1()
                    .border_color(border)
                    .hover(|style| style.bg(cx.theme().accent.opacity(0.15)))
                    .cursor_pointer()
                    .on_click(move |_, window, cx| {
                        cx.write_to_clipboard(gpui::ClipboardItem::new_string(package.to_string()));
                        window.push_notification(
                            Notification::success(format!("Copied {package}")),
                            cx,
                        );
                    })
                    .child(
                        h_flex()
                            .gap_1()
                            .items_center()
                            .child(
                                Phosphor::new(PhosphorIcon::Copy)
                                    .size(px(10.))
                                    .color(muted),
                            )
                            .child(
                                div()
                                    .text_xs()
                                    .font_family("monospace")
                                    .text_color(fg)
                                    .child(package),
                            ),
                    ),
            )
    }

    fn render_docs_view(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let docs = self.selected.docs();
        let line_count = docs.usage.lines().count();
        let editor_height = (line_count as f32 * 22.0 + 40.0).clamp(280.0, 680.0);

        v_flex()
            .gap_4()
            .child(self.render_docs_props(docs.props, cx))
            .child(self.render_docs_usage(line_count, editor_height, cx))
            .child(self.render_docs_notes(docs.notes, cx))
    }

    fn render_docs_props(
        &self,
        props: &'static [DocProp],
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let fg = cx.theme().foreground;
        let border = cx.theme().border;
        let tab_bar = cx.theme().tab_bar;
        let radius = cx.theme().radius;

        Card::new()
            .title("Props")
            .description("Builder methods and types for this section.")
            .child(
                v_flex().gap_2().children(props.iter().enumerate().map(|(ix, prop)| {
                    let name = prop.name;
                    let ty = prop.ty;
                    let description = prop.description;
                    h_flex()
                        .id(ElementId::Name(format!("doc-prop-{ix}").into()))
                        .w_full()
                        .gap_3()
                        .items_start()
                        .px_3()
                        .py_2()
                        .rounded(radius)
                        .bg(tab_bar)
                        .border_1()
                        .border_color(border)
                        .child(
                            v_flex()
                                .gap_0p5()
                                .min_w(px(200.))
                                .max_w(px(260.))
                                .child(
                                    div()
                                        .text_xs()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .text_color(fg)
                                        .child(name),
                                )
                                .child(
                                    div()
                                        .text_xs()
                                        .font_family("monospace")
                                        .text_color(muted)
                                        .child(ty),
                                ),
                        )
                        .child(
                            div()
                                .flex_1()
                                .text_xs()
                                .text_color(muted)
                                .child(description),
                        )
                })),
            )
    }

    fn render_docs_usage(
        &self,
        line_count: usize,
        editor_height: f32,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        Card::new()
            .title("Usage")
            .description("Copy-paste Rust snippets for this section.")
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
                            .bg(cx.theme().tab_bar)
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
                                        Button::new("copy-usage-btn")
                                            .variant(ButtonVariant::Ghost)
                                            .size(ButtonSize::XSmall)
                                            .label("Copy Usage")
                                            .on_click(cx.listener(move |this, _, window, cx| {
                                                let usage = this.selected.docs().usage;
                                                cx.write_to_clipboard(
                                                    gpui::ClipboardItem::new_string(
                                                        usage.to_string(),
                                                    ),
                                                );
                                                window.push_notification(
                                                    Notification::success(
                                                        "Usage copied to clipboard",
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
                            // Same rule as CodeEditor: the height must sit on
                            // the Editor itself or it lays out one line tall.
                            .child(
                                Editor::new(&self.code_view)
                                    .readonly(true)
                                    .bordered(false)
                                    .h(px(editor_height)),
                            ),
                    ),
            )
    }

    fn render_docs_notes(
        &self,
        notes: &'static [&'static str],
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let fg = cx.theme().foreground;
        let accent = cx.theme().accent;
        let radius = cx.theme().radius;

        Card::new()
            .title("Notes")
            .description("Gotchas and tips that help when wiring these components.")
            .child(
                v_flex().gap_2().children(notes.iter().enumerate().map(|(ix, note)| {
                    let note = *note;
                    h_flex()
                        .id(ElementId::Name(format!("doc-note-{ix}").into()))
                        .w_full()
                        .gap_2()
                        .items_start()
                        .px_3()
                        .py_2()
                        .rounded(radius)
                        .bg(accent.opacity(0.12))
                        .child(
                            Phosphor::new(PhosphorIcon::Info)
                                .size(px(14.))
                                .color(fg),
                        )
                        .child(
                            div()
                                .flex_1()
                                .text_xs()
                                .text_color(muted)
                                .child(note),
                        )
                })),
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
