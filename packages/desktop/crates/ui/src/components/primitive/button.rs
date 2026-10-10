//! Celestia button — the desktop counterpart of
//! `packages/ui/src/components/primitive/button.tsx`.
//!
//! Features the signature clean 3D physical style with 2px hard-edged elevation
//! shadows and tactile vertical translation press animation (`active:translate-y-[2px]
//! active:shadow-none`), matching `@celestia-project/ui`.
//!
//! Three surfaces go beyond the web primitive, and are marked as such below:
//!
//! - **Status variants.** `Success` / `Warning` / `Info` complete the status set
//!   that [`crate::components::primitive::alert`] and
//!   [`crate::components::primitive::badge`] already carry; web's button only
//!   ships `destructive`.
//! - **Icon slots.** [`Button::leading_icon`] / [`Button::trailing_icon`] are the
//!   typed form of web's `data-icon="inline-start"` / `"inline-end"` children,
//!   and [`Button::icon`] builds an icon-only button.
//! - **Loading.** [`Button::loading`] swaps the leading slot for a
//!   [`Spinner`] and blocks interaction. Web has no `loading` prop at all; the
//!   state is assembled there from `disabled` plus a hand-placed spinner.
//!
//! One dependency is still deliberate: [`Button::dropdown_menu`] opens
//! `gpui-component`'s `PopupMenu`, because the menu family (popup surfaces,
//! item rendering, anchoring) has not been rewritten onto raw gpui yet. The
//! rendering, press spring, caret and tooltip of the button itself are all
//! crate-owned.

use std::cell::Cell;
use std::rc::Rc;

use gpui::{
    AnimationExt as _, AnyElement, App, BoxShadow, ClickEvent, Context, Div, ElementId,
    FocusHandle, FontWeight, Hsla, InteractiveElement, Interactivity, IntoElement, MouseButton,
    ParentElement, Pixels, RenderOnce, Role, SharedString, SpringAnimation, SpringConfig, Stateful,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, point, px,
};
use gpui_base::motion::transition;
// The menu family has not moved to raw gpui yet; until it does, the dropdown
// trigger keeps gpui-component's `Selectable` bound alongside the crate's own.
use gpui_component::Selectable as GpuiSelectable;
use gpui_component::menu::{DropdownMenu, PopupMenu};

use crate::components::primitive::icon::PhosphorIcon;
use crate::components::primitive::spinner::Spinner;
use crate::components::traits::{Disableable, Selectable, Sizable, Size};
use crate::motion;
use crate::theme::ActiveTheme as _;

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
    /// Success solid fill — the `success` accent with its paired foreground.
    /// No web counterpart; see the module docs.
    Success,
    /// Warning solid fill — the `warning` accent with its paired foreground.
    /// No web counterpart; see the module docs.
    Warning,
    /// Info solid fill — the `info` accent with its paired foreground. No web
    /// counterpart; see the module docs.
    Info,
    /// Outlined button with 3D elevation shadow (`shadow-3d`).
    Outline,
    /// Borderless, hover-tinted quiet button.
    Ghost,
    /// De-emphasized muted label with hover accent (web `quiet`).
    Quiet,
    /// Link-styled text button with hover underline.
    Link,
}

impl ButtonVariant {
    /// The status accents, in the order the design system lists them. Every
    /// other accent in `globals.css` already has a variant here; these are the
    /// four that share the "accent fills the surface" recipe.
    const STATUS: [Self; 4] = [Self::Destructive, Self::Success, Self::Warning, Self::Info];

    /// Whether this variant is one of the solid status fills.
    pub fn is_status(self) -> bool {
        Self::STATUS.contains(&self)
    }
}

/// The resolved style of one [`ButtonVariant`], before the hover fade is
/// blended in.
///
/// Named fields rather than a tuple because eleven of the twelve slots share
/// three types — positional order would be silently transposable.
struct VariantStyle {
    bg: Hsla,
    border: Hsla,
    text: Hsla,
    shadow: Option<BoxShadow>,
    hover_bg: Hsla,
    hover_border: Hsla,
    hover_text: Hsla,
    /// Web `link`'s `hover:underline` — only that variant sets it.
    hover_underline: bool,
    active_bg: Hsla,
    active_border: Hsla,
    active_text: Hsla,
    /// Whether the press is a spring translation plus a shadow drop rather than
    /// a colour swap (web `active:translate-y-[2px] active:shadow-none`).
    has_3d_press: bool,
}

/// The recipe shared by every [`ButtonVariant::STATUS`] fill: the accent is the
/// surface *and* the border, the paired `*_foreground` token is the text, and
/// the 3D edge is the accent darkened toward black (`shadow-destructive-3d`).
fn solid_status_style(accent: Hsla, foreground: Hsla) -> VariantStyle {
    let dark_black: Hsla = gpui::rgba(0x0000_00ff).into();
    VariantStyle {
        bg: accent,
        border: accent,
        text: foreground,
        shadow: Some(BoxShadow {
            offset: point(px(0.), px(2.)),
            blur_radius: px(0.),
            spread_radius: px(0.),
            inset: false,
            color: motion::mix(accent, dark_black, 0.3),
        }),
        // `hover:bg-destructive/90`; the press only translates and drops the
        // shadow (`active:transition-none`), so the fill is shared.
        hover_bg: accent.opacity(0.90),
        hover_border: accent,
        hover_text: foreground,
        hover_underline: false,
        active_bg: accent.opacity(0.90),
        active_border: accent,
        active_text: foreground,
        has_3d_press: true,
    }
}

/// Height of the button. Web `xs` / `sm` / `default` / `md` / `lg` map to
/// `XSmall` / `Small` / `Medium` / `Md` / `Large`. Dedicated icon sizes
/// (`Icon`, `IconXs`, `IconSm`, `IconLg`) are also supported.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ButtonSize {
    /// 20px height, 8px padding, 4px gap, 10px font size (web `xs`).
    XSmall,
    /// 24px height, 10px padding, 4px gap, 12px font size (web `sm`).
    Small,
    /// 26px height (h-6.5), 12px padding, 6px gap, 12px font size (web `default`).
    #[default]
    Medium,
    /// 28px height (h-7), 10px padding, 4px gap, 12px font size (web `md`).
    ///
    /// Note this is *not* the same step as [`ButtonSize::Medium`], which is web
    /// `default` (h-6.5). Web's `md` is "`sm` with one more step of height and
    /// nothing else changed", so it takes `sm`'s padding, gap and icon size.
    Md,
    /// 36px height, 14px padding, 8px gap, 14px font size.
    ///
    /// Web `lg` is the same 36px height but keeps `text-xs` (12px) and
    /// `gap-1.5` (6px) — the desktop widens both, so this is the one step that
    /// is deliberately *not* a straight port. See the metrics test.
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

/// Resolved metrics for one [`ButtonSize`] step.
#[derive(Clone, Copy, Debug, PartialEq)]
struct ButtonMetrics {
    /// Fixed height — the square edge for the icon-only steps.
    height: Pixels,
    /// Horizontal padding, or zero for the icon-only steps.
    padding_x: Pixels,
    /// Gap between the label and an icon slot, or zero when icon-only.
    gap: Pixels,
    /// Label font size.
    text_size: Pixels,
    /// Icon size handed to [`Button::leading_icon`] / [`Button::trailing_icon`].
    ///
    /// Web sets this with a descendant selector
    /// (`[&_svg:not([class*='size-'])]:size-*`); GPUI has no descendant styling,
    /// so the ladder is applied to the slot wrapper instead.
    icon_size: Pixels,
    /// Whether the button is a square with no label.
    icon_only: bool,
}

impl ButtonSize {
    /// Resolve this step's metrics — the table above, in one place so it can be
    /// asserted against the web ladder instead of read off the render path.
    ///
    /// The icon step is deliberately **not** monotonic: `Md` (web `md`, 28px)
    /// carries `sm`'s 12px icon while `Medium` (web `default`, 26px) carries
    /// 14px. Web's `md` is a height-only step off `sm`, so the taller button has
    /// the *smaller* icon.
    fn metrics(self) -> ButtonMetrics {
        let (height, padding_x, gap, text_size, icon_size, icon_only) = match self {
            ButtonSize::XSmall => (px(20.), px(8.), px(4.), px(10.), px(10.), false),
            ButtonSize::Small => (px(24.), px(10.), px(4.), px(12.), px(12.), false),
            ButtonSize::Medium => (px(26.), px(12.), px(6.), px(12.), px(14.), false),
            ButtonSize::Md => (px(28.), px(10.), px(4.), px(12.), px(12.), false),
            ButtonSize::Large => (px(36.), px(14.), px(8.), px(14.), px(16.), false),
            ButtonSize::Icon => (px(32.), px(0.), px(0.), px(12.), px(14.), true),
            ButtonSize::IconXs => (px(20.), px(0.), px(0.), px(10.), px(10.), true),
            ButtonSize::IconSm => (px(24.), px(0.), px(0.), px(12.), px(12.), true),
            ButtonSize::IconLg => (px(36.), px(0.), px(0.), px(14.), px(16.), true),
        };

        ButtonMetrics {
            height,
            padding_x,
            gap,
            text_size,
            icon_size,
            icon_only,
        }
    }
}

impl From<ButtonSize> for Size {
    fn from(size: ButtonSize) -> Self {
        match size {
            ButtonSize::XSmall | ButtonSize::IconXs => Size::XSmall,
            ButtonSize::Small | ButtonSize::IconSm => Size::Small,
            // `Md` (28px) has no step of its own — `Size` only has four — and
            // sits nearer `Medium` (26px) than `Large` (36px).
            ButtonSize::Medium | ButtonSize::Md | ButtonSize::Icon => Size::Medium,
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
    loading: bool,
    selected: bool,
    dropdown_caret: bool,
    tooltip: Option<SharedString>,
    leading_icon: Option<AnyElement>,
    trailing_icon: Option<AnyElement>,
    /// Overrides the size step's icon ladder for both slots.
    icon_size: Option<Pixels>,
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
            loading: false,
            selected: false,
            dropdown_caret: false,
            tooltip: None,
            leading_icon: None,
            trailing_icon: None,
            icon_size: None,
            on_click: None,
            dropdown_menu: None,
            children: Vec::new(),
        }
    }

    /// An icon-only button, sized [`ButtonSize::Icon`] (32px square) by default.
    ///
    /// `icon` fills the leading slot, so [`Self::loading`] replaces it with the
    /// spinner. The slot's size follows the size step's ladder; an icon that
    /// carries its own explicit size keeps it.
    pub fn icon(id: impl Into<ElementId>, icon: impl IntoElement) -> Self {
        Self::new(id).size(ButtonSize::Icon).leading_icon(icon)
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

    /// An icon rendered before the label (web `data-icon="inline-start"`).
    ///
    /// A bare [`crate::components::primitive::icon::PhosphorIcon`] renders at
    /// the size step's icon size and inherits the button's text color, so it
    /// tracks the hover fade and the disabled dimming for free.
    pub fn leading_icon(mut self, icon: impl IntoElement) -> Self {
        self.leading_icon = Some(icon.into_any_element());
        self
    }

    /// An icon rendered after the label and any `children` (web
    /// `data-icon="inline-end"`).
    pub fn trailing_icon(mut self, icon: impl IntoElement) -> Self {
        self.trailing_icon = Some(icon.into_any_element());
        self
    }

    /// Override the icon size the size step derives.
    ///
    /// The counterpart of web's `:not([class*='size-'])` escape hatch: use it
    /// when a glyph's own proportions need a step other than the ladder's.
    pub fn icon_size(mut self, size: impl Into<Pixels>) -> Self {
        self.icon_size = Some(size.into());
        self
    }

    /// Show a [`Spinner`] in the leading slot and block interaction.
    ///
    /// Unlike [`Self::disabled`], a loading button keeps full opacity and its
    /// elevation — it is *busy*, not *forbidden* — so only the cursor and the
    /// click handling change. `loading` is ignored when `disabled` is also set.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
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
    /// dropdown-menu composite). The closure receives `gpui-component`'s `PopupMenu`.
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
    hovered: Cell<bool>,
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

impl GpuiSelectable for ButtonTrigger {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

/// Compat bound for the not-yet-rewritten overlay shims: `Popover` /
/// `DropdownMenu` require their trigger to carry the upstream `Selectable`.
/// This impl (and the import) disappear with those families.
impl GpuiSelectable for Button {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl DropdownMenu for ButtonTrigger {}

/// Wrap a caller-supplied icon so it renders at the size step's icon size.
///
/// Web gets this from a descendant selector
/// (`[&_svg:not([class*='size-'])]:size-3.5`). GPUI has no descendant styling,
/// but a `Div`'s paint pushes its text style onto the children, and
/// [`crate::components::primitive::icon::Phosphor`] reads the surrounding text
/// style when it has no explicit size — so a wrapper carrying `text_size` is
/// the exact counterpart. An icon that *does* carry an explicit size keeps it,
/// which is what web's `:not([class*='size-'])` guard buys.
fn icon_slot(icon: AnyElement, size: Pixels) -> Div {
    div()
        .flex_none()
        .flex()
        .items_center()
        .text_size(size)
        .child(icon)
}

impl RenderOnce for Button {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let ButtonMetrics {
            height: h,
            padding_x: px_pad,
            gap,
            text_size,
            icon_size,
            icon_only: is_icon_only,
        } = self.size.metrics();
        let icon_size = self.icon_size.unwrap_or(icon_size);

        let is_dark = cx.theme().mode.is_dark();
        let elevation_edge = if is_dark {
            gpui::hsla(0., 0., 1., 0.18)
        } else {
            gpui::hsla(0., 0., 0., 0.15)
        };

        let style = match self.variant {
            ButtonVariant::Primary => {
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: cx.theme().primary,
                };
                let inv_fg = cx.theme().primary_foreground;
                VariantStyle {
                    bg: cx.theme().background,
                    border: cx.theme().primary,
                    text: cx.theme().primary,
                    shadow: Some(shadow),
                    hover_bg: cx.theme().primary,
                    hover_border: cx.theme().primary,
                    hover_text: inv_fg,
                    hover_underline: false,
                    active_bg: cx.theme().primary.opacity(0.90),
                    active_border: cx.theme().primary,
                    active_text: inv_fg,
                    has_3d_press: true,
                }
            }
            ButtonVariant::Destructive => {
                solid_status_style(cx.theme().danger, cx.theme().danger_foreground)
            }
            ButtonVariant::Success => {
                solid_status_style(cx.theme().success, cx.theme().success_foreground)
            }
            ButtonVariant::Warning => {
                solid_status_style(cx.theme().warning, cx.theme().warning_foreground)
            }
            ButtonVariant::Info => solid_status_style(cx.theme().info, cx.theme().info_foreground),
            ButtonVariant::Outline => {
                let shadow = BoxShadow {
                    offset: point(px(0.), px(2.)),
                    blur_radius: px(0.),
                    spread_radius: px(0.),
                    inset: false,
                    color: elevation_edge,
                };
                if is_dark {
                    VariantStyle {
                        bg: cx.theme().input.opacity(0.30),
                        border: cx.theme().input,
                        text: cx.theme().foreground,
                        shadow: Some(shadow),
                        hover_bg: cx.theme().input.opacity(0.50),
                        hover_border: cx.theme().input,
                        hover_text: cx.theme().foreground,
                        hover_underline: false,
                        active_bg: cx.theme().input.opacity(0.50),
                        active_border: cx.theme().input,
                        active_text: cx.theme().foreground,
                        has_3d_press: true,
                    }
                } else {
                    VariantStyle {
                        bg: cx.theme().background,
                        border: cx.theme().border,
                        text: cx.theme().foreground,
                        shadow: Some(shadow),
                        hover_bg: cx.theme().accent,
                        hover_border: cx.theme().border,
                        hover_text: cx.theme().accent_foreground,
                        hover_underline: false,
                        active_bg: cx.theme().accent,
                        active_border: cx.theme().border,
                        active_text: cx.theme().accent_foreground,
                        has_3d_press: true,
                    }
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
                VariantStyle {
                    bg: cx.theme().secondary,
                    border: cx.theme().secondary,
                    text: cx.theme().secondary_foreground,
                    shadow: Some(shadow),
                    hover_bg: cx.theme().secondary.opacity(0.80),
                    hover_border: cx.theme().secondary,
                    hover_text: cx.theme().secondary_foreground,
                    hover_underline: false,
                    active_bg: cx.theme().secondary.opacity(0.80),
                    active_border: cx.theme().secondary,
                    active_text: cx.theme().secondary_foreground,
                    has_3d_press: true,
                }
            }
            ButtonVariant::Ghost => {
                // Web `ghost` has a hover surface and no active step at all.
                let hover_bg = if is_dark {
                    cx.theme().accent.opacity(0.50)
                } else {
                    cx.theme().accent
                };
                VariantStyle {
                    bg: cx.theme().transparent,
                    border: cx.theme().transparent,
                    text: cx.theme().foreground,
                    shadow: None,
                    hover_bg,
                    hover_border: cx.theme().transparent,
                    hover_text: cx.theme().accent_foreground,
                    hover_underline: false,
                    active_bg: hover_bg,
                    active_border: cx.theme().transparent,
                    active_text: cx.theme().accent_foreground,
                    has_3d_press: false,
                }
            }
            ButtonVariant::Quiet => {
                let hover_bg = if is_dark {
                    cx.theme().accent.opacity(0.50)
                } else {
                    cx.theme().accent
                };
                VariantStyle {
                    bg: cx.theme().transparent,
                    border: cx.theme().transparent,
                    text: cx.theme().muted_foreground,
                    shadow: None,
                    hover_bg,
                    hover_border: cx.theme().transparent,
                    hover_text: cx.theme().foreground,
                    hover_underline: false,
                    active_bg: hover_bg,
                    active_border: cx.theme().transparent,
                    active_text: cx.theme().foreground,
                    has_3d_press: false,
                }
            }
            ButtonVariant::Link => VariantStyle {
                bg: cx.theme().transparent,
                border: cx.theme().transparent,
                text: cx.theme().primary,
                shadow: None,
                hover_bg: cx.theme().transparent,
                hover_border: cx.theme().transparent,
                hover_text: cx.theme().primary,
                hover_underline: true,
                active_bg: cx.theme().transparent,
                active_border: cx.theme().transparent,
                active_text: cx.theme().link_active,
                has_3d_press: false,
            },
        };
        let VariantStyle {
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
        } = style;

        let button_state = window.use_keyed_state(self.id.clone(), cx, |_, cx| ButtonState {
            focus_handle: cx.focus_handle(),
            pressed: Cell::new(false),
            hovered: Cell::new(false),
            impulse_id: Cell::new(0),
            rendered_impulse_id: Cell::new(0),
        });

        let (focus_handle, is_pressed, is_hovered, impulse_id, is_quick_tap) = {
            let state = button_state.read(cx);
            let p = state.pressed.get();
            let imp = state.impulse_id.get();
            let rend = state.rendered_impulse_id.get();
            let quick_tap = !p && (imp != rend) && imp > 0;
            state.rendered_impulse_id.set(imp);
            (
                state.focus_handle.clone(),
                p,
                state.hovered.get(),
                imp,
                quick_tap,
            )
        };

        // `disabled` wins: a button that can never be clicked cannot be
        // "loading" either, so the loading styling is not layered on top.
        let is_inert = self.disabled || self.loading;

        // `transition-colors duration-fast ease-out` — the web button fades its
        // hover surface rather than snapping to it. The press is deliberately
        // NOT faded: the web writes `active:transition-none`, and the spring
        // below owns that motion.
        let hover_t = if is_inert {
            0.0
        } else {
            transition(
                (self.id.clone(), "hover"),
                if is_hovered { 1.0 } else { 0.0 },
                motion::hover_transition(),
                window,
                cx,
            )
        };
        let (bg, border, text) = (
            motion::mix(bg, hover_bg, hover_t),
            motion::mix(border, hover_border, hover_t),
            motion::mix(text, hover_text, hover_t),
        );
        let show_underline = hover_underline && hover_t > 0.0;

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

        if matches!(
            self.variant,
            ButtonVariant::Ghost | ButtonVariant::Quiet | ButtonVariant::Link
        ) {
            el = el.border_0();
        } else {
            el = el.border_1();
        }

        let normal_shadows: Vec<BoxShadow> = shadow.clone().into_iter().collect();

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
        } else if self.loading {
            // A loading button keeps its fill, its elevation and its full
            // opacity — the web only greys a control out for `disabled`, and a
            // busy button that looks dead reads as a broken one. The cursor is
            // the plain arrow: GPUI's `CursorStyle` has no wait/progress
            // variant, and `OperationNotAllowed` is the *disabled* signal.
            el = el
                .cursor_default()
                .bg(bg)
                .border_color(border)
                .text_color(text)
                .shadow(normal_shadows)
                .on_mouse_down(MouseButton::Left, |_, _, cx| {
                    cx.stop_propagation();
                });
        } else {
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
            let state_hover = button_state.clone();

            el = el
                .on_hover(move |hovered, _, cx| {
                    if state_hover.read(cx).hovered.get() == *hovered {
                        return;
                    }
                    state_hover.update(cx, |state, cx| {
                        state.hovered.set(*hovered);
                        cx.notify();
                    });
                })
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
                // Press is a colour swap plus the spring below; hover is already
                // blended into the resting style above.
                if is_pressed {
                    el = el
                        .bg(active_bg)
                        .border_color(active_border)
                        .text_color(active_text);
                } else {
                    el = el.shadow(normal_shadows);
                }
            } else {
                el = el.shadow(normal_shadows).active(move |style| {
                    style
                        .bg(active_bg)
                        .border_color(active_border)
                        .text_color(active_text)
                });
            }

            if show_underline {
                el = el.text_decoration_1();
            }

            if let Some(on_click) = self.on_click {
                el = el.on_click(move |event, window, cx| on_click(event, window, cx));
            }
        }

        // The spinner takes the leading slot rather than being pushed in front
        // of it, so the label and the trailing icon keep their positions and
        // the button does not reflow when it enters the loading state.
        if self.loading {
            el = el.child(
                icon_slot(Spinner::new().size(icon_size).into_any_element(), icon_size)
                    // An accessibility node needs a stable identity, so the
                    // role only takes effect together with the id.
                    .id(ElementId::NamedInteger(
                        SharedString::from(format!("{}-spinner", self.id)),
                        0,
                    ))
                    .role(Role::ProgressIndicator),
            );
        } else if let Some(icon) = self.leading_icon {
            el = el.child(icon_slot(icon, icon_size));
        }

        if let Some(label) = self.label {
            el = el.child(label);
        }
        el = el.children(self.children);
        if let Some(icon) = self.trailing_icon {
            el = el.child(icon_slot(icon, icon_size));
        }

        if self.dropdown_caret {
            let caret_color = if self.disabled {
                text.opacity(0.5)
            } else {
                text
            };
            // The glyph reads the surrounding text style, so the wrapper carries
            // the resolved (hover-blended, possibly dimmed) color.
            el = el.child(
                icon_slot(PhosphorIcon::CaretDown.into_any_element(), px(12.))
                    .text_color(caret_color),
            );
        }

        if let Some(tooltip) = self.tooltip {
            el = el.tooltip(move |window, cx| {
                crate::components::primitive::tooltip::Tooltip::new(tooltip.clone())
                    .build(window, cx)
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
        } else if has_3d_press && !is_inert {
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
                if let Some(color) = shadow_color
                    && shadow_y > px(0.05)
                {
                    shadows.push(BoxShadow {
                        offset: point(px(0.), shadow_y),
                        blur_radius: px(0.),
                        spread_radius: px(0.),
                        inset: false,
                        color,
                    });
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
    use crate::components::primitive::icon::PhosphorIcon;
    use gpui::TestAppContext;

    /// Assert a step's whole metric tuple in the web CSS order
    /// `(height, padding, gap, text, icon, icon_only)`.
    fn assert_metrics(size: ButtonSize, expected: (Pixels, Pixels, Pixels, Pixels, Pixels, bool)) {
        let m = size.metrics();
        assert_eq!(
            (
                m.height,
                m.padding_x,
                m.gap,
                m.text_size,
                m.icon_size,
                m.icon_only
            ),
            expected,
            "metrics mismatch for {size:?}"
        );
    }

    #[test]
    fn button_sizes_convert_to_the_crate_size() {
        assert_eq!(Size::from(ButtonSize::XSmall), Size::XSmall);
        assert_eq!(Size::from(ButtonSize::Small), Size::Small);
        assert_eq!(Size::from(ButtonSize::Medium), Size::Medium);
        assert_eq!(Size::from(ButtonSize::Md), Size::Medium);
        assert_eq!(Size::from(ButtonSize::Large), Size::Large);
        assert_eq!(Size::from(ButtonSize::Icon), Size::Medium);
        assert_eq!(Size::from(ButtonSize::IconXs), Size::XSmall);
        assert_eq!(Size::from(ButtonSize::IconSm), Size::Small);
        assert_eq!(Size::from(ButtonSize::IconLg), Size::Large);
    }

    #[test]
    fn button_metrics_track_the_web_size_ladder() {
        // Tailwind's 4px scale: h-5/6/6.5/7/9, px-2/2.5/3/3.5, gap-1/1.5,
        // text-3xs/xs, and the `[&_svg]` steps 2.5/3/3.5/4.
        assert_metrics(
            ButtonSize::XSmall,
            (px(20.), px(8.), px(4.), px(10.), px(10.), false),
        );
        assert_metrics(
            ButtonSize::Small,
            (px(24.), px(10.), px(4.), px(12.), px(12.), false),
        );
        assert_metrics(
            ButtonSize::Medium,
            (px(26.), px(12.), px(6.), px(12.), px(14.), false),
        );
        assert_metrics(
            ButtonSize::Md,
            (px(28.), px(10.), px(4.), px(12.), px(12.), false),
        );
        // `Large` is the one deliberate step-up: web `lg` is h-9 but keeps
        // `text-xs` (12px) and `gap-1.5` (6px); the desktop widens both.
        assert_metrics(
            ButtonSize::Large,
            (px(36.), px(14.), px(8.), px(14.), px(16.), false),
        );
        assert_metrics(
            ButtonSize::Icon,
            (px(32.), px(0.), px(0.), px(12.), px(14.), true),
        );
        assert_metrics(
            ButtonSize::IconXs,
            (px(20.), px(0.), px(0.), px(10.), px(10.), true),
        );
        assert_metrics(
            ButtonSize::IconSm,
            (px(24.), px(0.), px(0.), px(12.), px(12.), true),
        );
        assert_metrics(
            ButtonSize::IconLg,
            (px(36.), px(0.), px(0.), px(14.), px(16.), true),
        );
    }

    #[test]
    fn md_is_a_height_only_step_off_sm() {
        // Web's `md` is "`sm` with one more step of height and nothing else
        // changed" — so it inherits `sm`'s icon even though it is the taller
        // button, and its icon is therefore *smaller* than `Medium`'s.
        let sm = ButtonSize::Small.metrics();
        let md = ButtonSize::Md.metrics();

        assert_eq!(md.padding_x, sm.padding_x);
        assert_eq!(md.gap, sm.gap);
        assert_eq!(md.text_size, sm.text_size);
        assert_eq!(md.icon_size, sm.icon_size);

        assert!(md.height > sm.height);
        assert!(md.icon_size < ButtonSize::Medium.metrics().icon_size);
    }

    #[test]
    fn icon_only_steps_are_square_with_no_padding_or_gap() {
        for size in [
            ButtonSize::Icon,
            ButtonSize::IconXs,
            ButtonSize::IconSm,
            ButtonSize::IconLg,
        ] {
            let m = size.metrics();
            assert!(m.icon_only, "{size:?} should be icon-only");
            assert_eq!(m.padding_x, px(0.), "padding for {size:?}");
            assert_eq!(m.gap, px(0.), "gap for {size:?}");
        }

        for size in [
            ButtonSize::XSmall,
            ButtonSize::Small,
            ButtonSize::Medium,
            ButtonSize::Md,
            ButtonSize::Large,
        ] {
            assert!(!size.metrics().icon_only, "{size:?} takes a label");
        }
    }

    #[test]
    fn status_variants_are_exactly_the_four_accents() {
        assert_eq!(
            ButtonVariant::STATUS,
            [
                ButtonVariant::Destructive,
                ButtonVariant::Success,
                ButtonVariant::Warning,
                ButtonVariant::Info,
            ]
        );

        for variant in [
            ButtonVariant::Primary,
            ButtonVariant::Secondary,
            ButtonVariant::Outline,
            ButtonVariant::Ghost,
            ButtonVariant::Quiet,
            ButtonVariant::Link,
        ] {
            assert!(!variant.is_status(), "{variant:?} is not a status variant");
        }
        for variant in ButtonVariant::STATUS {
            assert!(variant.is_status(), "{variant:?} is a status variant");
        }
    }

    #[test]
    fn solid_status_style_fills_with_the_accent_and_pairs_the_foreground() {
        // Opaque accent, so `opacity(0.90)` is a pure alpha set rather than a
        // multiply against something already translucent.
        let accent = gpui::hsla(0.30, 0.80, 0.40, 1.0);
        let foreground = gpui::hsla(0.0, 0.0, 1.0, 1.0);
        let style = solid_status_style(accent, foreground);

        assert_eq!(style.bg, accent);
        assert_eq!(style.border, accent);
        assert_eq!(style.text, foreground);
        assert_eq!(style.hover_text, foreground);
        assert_eq!(style.active_text, foreground);
        assert!(style.has_3d_press, "status variants carry the 3D press");
        assert!(!style.hover_underline);

        // The edge is the accent darkened toward black, never the accent itself.
        let edge = style.shadow.expect("status variants carry an edge").color;
        assert_ne!(edge, accent);
        assert!(edge.l < accent.l, "edge must be darker than the fill");

        // The hover step is the shared `/90` alpha, not a second colour.
        assert_eq!(style.hover_bg.h, accent.h);
        assert_eq!(style.hover_bg.a, 0.90);
        assert_eq!(style.active_bg, style.hover_bg);
    }

    #[test]
    fn button_spring_config_is_stable_and_damped() {
        let (freq, damping_ratio) = BUTTON_SPRING.canonical();
        assert!(freq > 0.0);
        // Damping ratio ~0.83 represents a snappy Apple-style tactile rebound
        assert!((0.75..=1.0).contains(&damping_ratio));
    }

    struct TestView;

    impl gpui::Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            gpui::div()
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
                    Button::new("btn-success")
                        .variant(ButtonVariant::Success)
                        .label("Success"),
                )
                .child(
                    Button::new("btn-warning")
                        .variant(ButtonVariant::Warning)
                        .label("Warning"),
                )
                .child(
                    Button::new("btn-info")
                        .variant(ButtonVariant::Info)
                        .label("Info"),
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
                // Every size step, including the new `Md`.
                .child(
                    Button::new("btn-size-xs")
                        .size(ButtonSize::XSmall)
                        .label("xs"),
                )
                .child(
                    Button::new("btn-size-sm")
                        .size(ButtonSize::Small)
                        .label("sm"),
                )
                .child(Button::new("btn-size-md").size(ButtonSize::Md).label("md"))
                .child(
                    Button::new("btn-size-lg")
                        .size(ButtonSize::Large)
                        .label("lg"),
                )
                // Icon slots, at a size step and with an explicit override.
                .child(
                    Button::new("btn-leading")
                        .leading_icon(PhosphorIcon::Plus)
                        .label("Add"),
                )
                .child(
                    Button::new("btn-trailing")
                        .trailing_icon(PhosphorIcon::ArrowRight)
                        .label("Next"),
                )
                .child(
                    Button::new("btn-both-icons")
                        .variant(ButtonVariant::Outline)
                        .leading_icon(PhosphorIcon::DownloadSimple)
                        .trailing_icon(PhosphorIcon::CaretDown)
                        .icon_size(px(12.0))
                        .label("Export"),
                )
                // Icon-only: the `icon` constructor and an explicit size.
                .child(Button::icon("btn-icon", PhosphorIcon::Gear))
                .child(Button::icon("btn-icon-sm", PhosphorIcon::X).size(ButtonSize::IconSm))
                .child(
                    Button::new("btn-icon-lg")
                        .size(ButtonSize::IconLg)
                        .leading_icon(PhosphorIcon::MagnifyingGlass),
                )
                // Loading: with a label, with a leading icon, and icon-only.
                .child(Button::new("btn-loading").loading(true).label("Saving"))
                .child(
                    Button::new("btn-loading-with-icon")
                        .loading(true)
                        .leading_icon(PhosphorIcon::FloppyDisk)
                        .label("Saving"),
                )
                .child(Button::icon("btn-loading-icon", PhosphorIcon::Gear).loading(true))
                .child(
                    Button::new("btn-loading-disabled")
                        .loading(true)
                        .disabled(true)
                        .label("Both"),
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

    #[gpui::test]
    fn button_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let _window = cx.add_window(|_window, _cx| TestView);
    }
}
