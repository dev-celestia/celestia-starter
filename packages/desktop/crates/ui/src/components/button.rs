//! Celestia button — the desktop counterpart of
//! `packages/ui/src/components/primitive/button.tsx`.
//!
//! Features the signature clean 3D physical style with 2px hard-edged elevation
//! shadows and tactile vertical translation press animation (`active:translate-y-[2px]
//! active:shadow-none`), matching `@celestia-project/ui`.

use std::cell::Cell;
use std::rc::Rc;

use gpui_kit::component::menu::{DropdownMenu, PopupMenu};
use gpui_kit::component::select::Caret;
use gpui_kit::component::{ActiveTheme, Colorize as _, Disableable, Selectable, Sizable, Size};
use gpui_kit::{
    AnimationExt as _, AnyElement, App, BoxShadow, ClickEvent, Context, Div, ElementId,
    FocusHandle, FontWeight, Hsla, InteractiveElement, Interactivity, IntoElement, MouseButton,
    ParentElement, Pixels, RenderOnce, SharedString, SpringAnimation, SpringConfig, Stateful,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, point, px,
};

/// Spring physics configuration for tactile button press & rebound (900 stiffness, 50 damping).
/// Damped harmonic oscillator that reaches equilibrium smoothly in ~120-150ms with a subtle physical snap.
const BUTTON_SPRING: SpringConfig = SpringConfig::new(900.0, 50.0, 1.0);

/// Visual weight of the button (web `variant` prop).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ButtonVariant {
    /// Outlined brand-red action with 3D elevation shadow (`shadow-3d-primary`, web `default`).
    #[default]
    Primary,
    /// Muted fill with 3D elevation shadow (`shadow-3d`) for secondary actions.
    Secondary,
    /// Destructive solid fill with darker 3D shadow (`shadow-destructive-3d`).
    Destructive,
    /// Outlined button with 3D elevation shadow (`shadow-3d`).
    Outline,
    /// Borderless, hover-tinted quiet button.
    Ghost,
    /// De-emphasized muted label with hover accent (web `quiet`).
    Quiet,
    /// Link-styled text button with hover underline.
    Link,
}

/// Height of the button. Web `xs` / `sm` / `default` (`md`) / `lg` map to
/// `XSmall` / `Small` / `Medium` / `Large`. Dedicated icon sizes (`Icon`,
/// `IconXs`, `IconSm`, `IconLg`) are also supported.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ButtonSize {
    /// 20px height, 8px padding, 4px gap, 10px font size (web `xs`).
    XSmall,
    /// 24px height, 10px padding, 4px gap, 12px font size (web `sm`).
    Small,
    /// 26px height (h-6.5), 12px padding, 6px gap, 12px font size (web `default` / `md`).
    #[default]
    Medium,
    /// 36px height, 14px padding, 6px gap, 12px font size (web `lg`).
    Large,
    /// 32px square icon button (web `icon`).
    Icon,
    /// 20px square icon button (web `icon-xs`).
    IconXs,
    /// 24px square icon button (web `icon-sm`).
    IconSm,
    /// 36px square icon button (web `icon-lg`).
    IconLg,
}

impl From<ButtonSize> for Size {
    fn from(size: ButtonSize) -> Self {
        match size {
            ButtonSize::XSmall | ButtonSize::IconXs => Size::XSmall,
            ButtonSize::Small | ButtonSize::IconSm => Size::Small,
            ButtonSize::Medium | ButtonSize::Icon => Size::Medium,
            ButtonSize::Large | ButtonSize::IconLg => Size::Large,
        }
    }
}

type DropdownBuilder = Rc<dyn Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu>;
type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// The Celestia button. Build with [`Button::new`], chain props, drop into any
/// element tree — it mirrors the 3D elevation and tactile press of `button.tsx`.
#[derive(IntoElement)]
pub struct Button {
    id: ElementId,
    label: Option<SharedString>,
    variant: ButtonVariant,
    size: ButtonSize,
    mono: bool,
    disabled: bool,
    selected: bool,
    dropdown_caret: bool,
    tooltip: Option<SharedString>,
    on_click: Option<ClickHandler>,
    dropdown_menu: Option<DropdownBuilder>,
    children: Vec<AnyElement>,
}

impl Button {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            label: None,
            variant: ButtonVariant::default(),
            size: ButtonSize::default(),
            mono: false,
            disabled: false,
            selected: false,
            dropdown_caret: false,
            tooltip: None,
            on_click: None,
            dropdown_menu: None,
            children: Vec::new(),
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn variant(mut self, variant: ButtonVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: ButtonSize) -> Self {
        self.size = size;
        self
    }

    pub fn mono(mut self, mono: bool) -> Self {
        self.mono = mono;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn dropdown_caret(mut self, caret: bool) -> Self {
        self.dropdown_caret = caret;
        self
    }

    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Attach a dropdown menu (opens below the button, mirroring the web
    /// dropdown-menu composite). The closure receives gpui-kit's `PopupMenu`.
    pub fn dropdown_menu(
        mut self,
        build: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.dropdown_menu = Some(Rc::new(build));
        self
    }
}

impl Selectable for Button {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl Sizable for Button {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = match size.into() {
            Size::XSmall => ButtonSize::XSmall,
            Size::Small => ButtonSize::Small,
            Size::Large => ButtonSize::Large,
            _ => ButtonSize::Medium,
        };
        self
    }
}

impl Disableable for Button {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl ParentElement for Button {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

/// Persistent per-button state storing the focus handle and spring impulse tracking.
struct ButtonState {
    focus_handle: FocusHandle,
    pressed: Cell<bool>,
    impulse_id: Cell<usize>,
    rendered_impulse_id: Cell<usize>,
}

/// Helper wrapper allowing DropdownMenu trait to attach popup menus to the styled button.
struct ButtonTrigger {
    element: Stateful<Div>,
    selected: bool,
}

impl Styled for ButtonTrigger {
    fn style(&mut self) -> &mut StyleRefinement {
        self.element.style()
    }
}

impl Selectable for ButtonTrigger {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl InteractiveElement for ButtonTrigger {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.element.interactivity()
    }
}

impl IntoElement for ButtonTrigger {
    type Element = Stateful<Div>;

    fn into_element(self) -> Self::Element {
        self.element
    }
}

impl DropdownMenu for ButtonTrigger {}

impl RenderOnce for Button {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let (h, px_pad, gap, text_size, _icon_size, is_icon_only) = match self.size {
            ButtonSize::XSmall => (px(20.), px(8.), px(4.), px(10.), px(10.), false),
            ButtonSize::Small => (px(24.), px(10.), px(4.), px(12.), px(12.), false),
            ButtonSize::Medium => (px(26.), px(12.), px(6.), px(12.), px(14.), false),
            ButtonSize::Large => (px(36.), px(14.), px(8.), px(14.), px(16.), false),
            ButtonSize::Icon => (px(32.), px(0.), px(0.), px(12.), px(14.), true),
            ButtonSize::IconXs => (px(20.), px(0.), px(0.), px(10.), px(10.), true),
            ButtonSize::IconSm => (px(24.), px(0.), px(0.), px(12.), px(12.), true),
            ButtonSize::IconLg => (px(36.), px(0.), px(0.), px(14.), px(16.), true),
        };

        let is_dark = cx.theme().mode.is_dark();
        let elevation_edge = if is_dark {
            gpui_kit::hsla(0., 0., 1., 0.18)
        } else {
            gpui_kit::hsla(0., 0., 0., 0.15)
        };

        let (
            bg,
            border,
            text,
            shadow,
            hover_bg,
            hover_border,
            hover_text,
            hover_underline,
            active_bg,
            active_border,
            active_text,
            has_3d_press,
        ) = match self.variant {
            ButtonVariant::Primary => {
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: cx.theme().primary,
                };
                let white: Hsla = gpui_kit::rgb(0xffffff).into();
                (
                    cx.theme().background,
                    cx.theme().primary,
                    cx.theme().primary,
                    Some(shadow),
                    cx.theme().primary,
                    cx.theme().primary,
                    white,
                    false,
                    cx.theme().primary.opacity(0.90),
                    cx.theme().primary,
                    white,
                    true,
                )
            }
            ButtonVariant::Destructive => {
                let dark_black: Hsla = gpui_kit::rgba(0x0000_00ff).into();
                let shadow_color = cx.theme().danger.mix_oklab(dark_black, 0.3);
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: shadow_color,
                };
                (
                    cx.theme().danger,
                    cx.theme().danger,
                    cx.theme().danger_foreground,
                    Some(shadow),
                    cx.theme().danger.opacity(0.90),
                    cx.theme().danger,
                    cx.theme().danger_foreground,
                    false,
                    cx.theme().danger.opacity(0.85),
                    cx.theme().danger,
                    cx.theme().danger_foreground,
                    true,
                )
            }
            ButtonVariant::Outline => {
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: elevation_edge,
                };
                if is_dark {
                    (
                        cx.theme().input.opacity(0.30),
                        cx.theme().input,
                        cx.theme().foreground,
                        Some(shadow),
                        cx.theme().input.opacity(0.50),
                        cx.theme().input,
                        cx.theme().foreground,
                        false,
                        cx.theme().input.opacity(0.60),
                        cx.theme().input,
                        cx.theme().foreground,
                        true,
                    )
                } else {
                    (
                        cx.theme().background,
                        cx.theme().border,
                        cx.theme().foreground,
                        Some(shadow),
                        cx.theme().accent,
                        cx.theme().border,
                        cx.theme().accent_foreground,
                        false,
                        cx.theme().accent.opacity(0.80),
                        cx.theme().border,
                        cx.theme().accent_foreground,
                        true,
                    )
                }
            }
            ButtonVariant::Secondary => {
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: elevation_edge,
                };
                (
                    cx.theme().secondary,
                    cx.theme().secondary,
                    cx.theme().secondary_foreground,
                    Some(shadow),
                    cx.theme().secondary.opacity(0.80),
                    cx.theme().secondary,
                    cx.theme().secondary_foreground,
                    false,
                    cx.theme().secondary.opacity(0.70),
                    cx.theme().secondary,
                    cx.theme().secondary_foreground,
                    true,
                )
            }
            ButtonVariant::Ghost => {
                let hover_bg = if is_dark {
                    cx.theme().accent.opacity(0.50)
                } else {
                    cx.theme().accent
                };
                let active_bg = if is_dark {
                    cx.theme().accent.opacity(0.70)
                } else {
                    cx.theme().accent.opacity(0.80)
                };
                (
                    cx.theme().transparent,
                    cx.theme().transparent,
                    cx.theme().foreground,
                    None,
                    hover_bg,
                    cx.theme().transparent,
                    cx.theme().accent_foreground,
                    false,
                    active_bg,
                    cx.theme().transparent,
                    cx.theme().accent_foreground,
                    false,
                )
            }
            ButtonVariant::Quiet => {
                let hover_bg = if is_dark {
                    cx.theme().accent.opacity(0.50)
                } else {
                    cx.theme().accent
                };
                let active_bg = if is_dark {
                    cx.theme().accent.opacity(0.70)
                } else {
                    cx.theme().accent.opacity(0.80)
                };
                (
                    cx.theme().transparent,
                    cx.theme().transparent,
                    cx.theme().muted_foreground,
                    None,
                    hover_bg,
                    cx.theme().transparent,
                    cx.theme().foreground,
                    false,
                    active_bg,
                    cx.theme().transparent,
                    cx.theme().foreground,
                    false,
                )
            }
            ButtonVariant::Link => (
                cx.theme().transparent,
                cx.theme().transparent,
                cx.theme().primary,
                None,
                cx.theme().transparent,
                cx.theme().transparent,
                cx.theme().primary,
                true,
                cx.theme().transparent,
                cx.theme().transparent,
                cx.theme().link_active,
                false,
            ),
        };

        let button_state = window.use_keyed_state(self.id.clone(), cx, |_, cx| ButtonState {
            focus_handle: cx.focus_handle(),
            pressed: Cell::new(false),
            impulse_id: Cell::new(0),
            rendered_impulse_id: Cell::new(0),
        });

        let (focus_handle, is_pressed, impulse_id, is_quick_tap) = {
            let state = button_state.read(cx);
            let p = state.pressed.get();
            let imp = state.impulse_id.get();
            let rend = state.rendered_impulse_id.get();
            let quick_tap = !p && (imp != rend) && imp > 0;
            state.rendered_impulse_id.set(imp);
            (state.focus_handle.clone(), p, imp, quick_tap)
        };

        let mut el = div()
            .id(self.id.clone())
            .flex()
            .flex_shrink_0()
            .items_center()
            .justify_center()
            .whitespace_nowrap()
            .font_weight(FontWeight::MEDIUM)
            .text_size(text_size);

        if self.mono {
            el = el.font_family(cx.theme().mono_font_family.clone());
        }

        if self.variant == ButtonVariant::Link {
            el = el.cursor_pointer();
        } else if is_icon_only {
            el = el.size(h).rounded(px(4.));
        } else {
            el = el.h(h).px(px_pad).gap(gap).rounded(px(4.));
        }

        if self.variant == ButtonVariant::Ghost
            || self.variant == ButtonVariant::Quiet
            || self.variant == ButtonVariant::Link
        {
            el = el.border_0();
        } else {
            el = el.border_1();
        }

        if self.disabled {
            el = el
                .opacity(0.5)
                .cursor_not_allowed()
                .bg(bg)
                .border_color(border)
                .text_color(text)
                .shadow_none()
                .on_mouse_down(MouseButton::Left, |_, _, cx| {
                    cx.stop_propagation();
                });
        } else {
            let normal_shadows: Vec<BoxShadow> = shadow.clone().into_iter().collect();

            el = el
                .cursor_pointer()
                .bg(bg)
                .border_color(border)
                .text_color(text)
                .track_focus(&focus_handle);

            if self.selected {
                el = el
                    .border_color(cx.theme().primary)
                    .bg(cx.theme().primary.opacity(0.15))
                    .text_color(cx.theme().primary);
            }

            let state_down = button_state.clone();
            let state_up = button_state.clone();
            let state_up_out = button_state.clone();

            el = el
                .on_mouse_down(MouseButton::Left, move |_, _, cx| {
                    state_down.update(cx, |state, cx| {
                        state.pressed.set(true);
                        state.impulse_id.set(state.impulse_id.get() + 1);
                        cx.notify();
                    });
                })
                .on_mouse_up(MouseButton::Left, move |_, _, cx| {
                    state_up.update(cx, |state, cx| {
                        state.pressed.set(false);
                        cx.notify();
                    });
                })
                .on_mouse_up_out(MouseButton::Left, move |_, _, cx| {
                    state_up_out.update(cx, |state, cx| {
                        state.pressed.set(false);
                        cx.notify();
                    });
                });

            if has_3d_press {
                if is_pressed {
                    el = el
                        .bg(active_bg)
                        .border_color(active_border)
                        .text_color(active_text);
                } else {
                    el = el.shadow(normal_shadows).hover(move |style| {
                        style
                            .bg(hover_bg)
                            .border_color(hover_border)
                            .text_color(hover_text)
                    });
                }
            } else {
                el = el
                    .shadow(normal_shadows)
                    .hover(move |mut style| {
                        style = style
                            .bg(hover_bg)
                            .border_color(hover_border)
                            .text_color(hover_text);
                        if hover_underline {
                            style = style.text_decoration_1();
                        }
                        style
                    })
                    .active(move |mut style| {
                        style = style
                            .bg(active_bg)
                            .border_color(active_border)
                            .text_color(active_text);
                        if hover_underline {
                            style = style.text_decoration_1();
                        }
                        style
                    });
            }

            if let Some(on_click) = self.on_click {
                el = el.on_click(move |event, window, cx| on_click(event, window, cx));
            }
        }

        if let Some(label) = self.label {
            el = el.child(label);
        }
        el = el.children(self.children);

        if self.dropdown_caret {
            let caret_color = if self.disabled {
                text.opacity(0.5)
            } else {
                text
            };
            el = el.child(Caret::new(Size::Small).text_color(caret_color));
        }

        if let Some(tooltip) = self.tooltip {
            el = el.tooltip(move |window, cx| {
                gpui_kit::component::tooltip::Tooltip::new(tooltip.clone()).build(window, cx)
            });
        }

        let element: AnyElement = if let Some(build) = self.dropdown_menu {
            let trigger = ButtonTrigger {
                element: el,
                selected: self.selected,
            };
            trigger
                .dropdown_menu(move |menu, window, cx| build(menu, window, cx))
                .into_any_element()
        } else if has_3d_press && !self.disabled {
            let shadow_color = shadow.as_ref().map(|s| s.color);
            let target_pos = if is_pressed { px(2.0) } else { px(0.0) };

            let mut spring_anim = SpringAnimation::new(BUTTON_SPRING)
                .to(target_pos)
                .with_epsilon(0.02);

            if is_quick_tap {
                spring_anim = spring_anim.from(px(2.0));
            }

            let spring_id = ElementId::NamedInteger(
                SharedString::from(format!("{}-spring", self.id)),
                impulse_id as u64,
            );

            el.with_spring(spring_id, spring_anim, move |this, y: Pixels| {
                let offset_y = y.clamp(px(0.0), px(2.5));
                let shadow_y = (px(2.0) - offset_y).max(px(0.0));

                let mut shadows = Vec::with_capacity(1);
                if let Some(color) = shadow_color {
                    if shadow_y > px(0.05) {
                        shadows.push(BoxShadow {
                            offset: point(px(0.), shadow_y),
                            blur_radius: px(0.),
                            spread_radius: px(0.),
                            inset: false,
                            color,
                        });
                    }
                }

                this.relative().top(offset_y).shadow(shadows)
            })
            .into_any_element()
        } else {
            el.into_any_element()
        };
        element
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui_kit::TestAppContext;

    #[test]
    fn button_sizes_convert_to_gpui_size() {
        assert_eq!(Size::from(ButtonSize::XSmall), Size::XSmall);
        assert_eq!(Size::from(ButtonSize::Small), Size::Small);
        assert_eq!(Size::from(ButtonSize::Medium), Size::Medium);
        assert_eq!(Size::from(ButtonSize::Large), Size::Large);
        assert_eq!(Size::from(ButtonSize::Icon), Size::Medium);
        assert_eq!(Size::from(ButtonSize::IconXs), Size::XSmall);
        assert_eq!(Size::from(ButtonSize::IconSm), Size::Small);
        assert_eq!(Size::from(ButtonSize::IconLg), Size::Large);
    }

    #[test]
    fn button_spring_config_is_stable_and_damped() {
        let (freq, damping_ratio) = BUTTON_SPRING.canonical();
        assert!(freq > 0.0);
        // Damping ratio ~0.83 represents a snappy Apple-style tactile rebound
        assert!(damping_ratio >= 0.75 && damping_ratio <= 1.0);
    }

    struct TestView;

    impl gpui_kit::Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            gpui_kit::div()
                .child(
                    Button::new("btn-primary")
                        .variant(ButtonVariant::Primary)
                        .label("Primary"),
                )
                .child(
                    Button::new("btn-secondary")
                        .variant(ButtonVariant::Secondary)
                        .label("Secondary"),
                )
                .child(
                    Button::new("btn-destructive")
                        .variant(ButtonVariant::Destructive)
                        .label("Destructive"),
                )
                .child(
                    Button::new("btn-outline")
                        .variant(ButtonVariant::Outline)
                        .label("Outline"),
                )
                .child(
                    Button::new("btn-ghost")
                        .variant(ButtonVariant::Ghost)
                        .label("Ghost"),
                )
                .child(
                    Button::new("btn-quiet")
                        .variant(ButtonVariant::Quiet)
                        .label("Quiet"),
                )
                .child(
                    Button::new("btn-link")
                        .variant(ButtonVariant::Link)
                        .label("Link"),
                )
                .child(Button::new("btn-disabled").disabled(true).label("Disabled"))
                .child(
                    Button::new("btn-caret")
                        .dropdown_caret(true)
                        .label("Dropdown"),
                )
                .child(Button::new("btn-mono").mono(true).label("0x1234"))
        }
    }

    #[gpui_kit::test]
    fn button_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let _window = cx.add_window(|_window, _cx| TestView);
    }
}
