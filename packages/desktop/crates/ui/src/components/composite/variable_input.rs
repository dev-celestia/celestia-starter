//! Variable-aware text input: `{{name}}` / `{name}` spans become inline chips.
//!
//! The substitution grammar lives in the bridge (`expand_vars`); this widget
//! mirrors it so a chip and the request that consumes it always agree:
//! `{{name}}` is matched first, then `{name}` only for identifier-shaped keys
//! that are not followed by a second closing brace.

use std::cell::Cell;
use std::ops::Range;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    Anchor, AnyElement, App, Context, ElementId, Entity, FontWeight, IntoElement,
    ParentElement as _, RenderOnce, SharedString, Styled as _, Window, div, px,
};
use gpui_component::menu::PopupMenuItem;

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::components::primitive::input::{
    InlineToken, InlineTokenContext, Input, InputContent, InputState,
};
use crate::theme::ActiveTheme as _;

/// One insertable variable: the identifier written in braces plus its value.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VariableOption {
    /// Identifier used between braces, e.g. `host`.
    pub name: String,
    /// Current value from the active environment, when known.
    pub value: Option<String>,
}

impl VariableOption {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            value: None,
        }
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    fn menu_label(&self) -> String {
        match self.value.as_deref() {
            Some(value) if !value.is_empty() => format!("{} = {}", self.name, value),
            _ => self.name.clone(),
        }
    }
}

fn is_var_ident(name: &str) -> bool {
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    (first.is_ascii_alphabetic() || first == '_')
        && chars.all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '_' | '-' | '.'))
}

/// Byte ranges of variable placeholders, in the same order/precedence as
/// `expand_vars` in the bridge.
fn scan_variables(text: &str) -> Vec<(Range<usize>, String)> {
    let bytes = text.as_bytes();
    let mut found = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'{' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
            if let Some(end) = text[i + 2..].find("}}") {
                let key = text[i + 2..i + 2 + end].trim();
                if !key.is_empty() {
                    found.push((i..i + 2 + end + 2, key.to_string()));
                    i = i + 2 + end + 2;
                    continue;
                }
            }
        } else if bytes[i] == b'{' {
            if let Some(end) = text[i + 1..].find('}') {
                let close = i + 1 + end;
                let followed_by_brace = text[close + 1..].starts_with('}');
                let key = text[i + 1..close].trim();
                if !followed_by_brace && is_var_ident(key) {
                    found.push((i..close + 1, key.to_string()));
                    i = close + 1;
                    continue;
                }
            }
        }
        let ch = text[i..].chars().next().unwrap_or('\u{FFFD}');
        i += ch.len_utf8();
    }
    found
}

fn token_for(name: &str, text: String) -> InlineToken {
    InlineToken::new(name.to_string(), text).with_label(name.to_string())
}

fn content_with_chips(text: SharedString) -> InputContent {
    let spans = scan_variables(&text);
    let mut content = InputContent::new(text.clone());
    for (range, name) in spans {
        let token = token_for(&name, text[range.clone()].to_string());
        // `with_token` takes the content; keep the original when a span is
        // rejected (overlap/invalid range) so later spans still get a chip.
        if let Ok(next) = content.clone().with_token(range, token) {
            content = next;
        }
    }
    content
}

thread_local! {
    /// `replace_range_with_token` emits `InputEvent::Change`, which re-enters
    /// the app's promotion subscription while we are already inside it.
    static PROMOTING: Cell<bool> = const { Cell::new(false) };
}

struct PromoteGuard;

impl PromoteGuard {
    fn enter() -> Option<Self> {
        PROMOTING
            .with(|flag| !flag.replace(true))
            .then_some(Self)
    }
}

impl Drop for PromoteGuard {
    fn drop(&mut self) {
        PROMOTING.with(|flag| flag.set(false));
    }
}

fn render_chip(
    ctx: &InlineTokenContext,
    variables: &[VariableOption],
    cx: &mut App,
) -> AnyElement {
    let theme = cx.theme();
    let known = variables
        .iter()
        .any(|option| option.name == ctx.token().id().as_ref());
    let (background, border, text) = if ctx.is_selected() {
        (theme.primary, theme.primary, theme.primary_foreground)
    } else if known {
        (
            theme.primary.opacity(0.10),
            theme.primary.opacity(0.35),
            theme.primary,
        )
    } else {
        (theme.muted, theme.border, theme.muted_foreground)
    };

    div()
        .flex()
        .items_center()
        .gap(px(2.))
        .h(ctx.line_height())
        .max_w(ctx.available_width())
        .px(px(4.))
        .rounded(theme.radius_sm())
        .border_1()
        .border_color(border)
        .bg(background)
        .text_xs()
        .font_weight(FontWeight::MEDIUM)
        .text_color(text)
        .when(ctx.is_disabled(), |this| this.opacity(0.5))
        .child(
            div()
                .min_w_0()
                .text_ellipsis()
                .child(ctx.token().label().clone()),
        )
        .into_any_element()
}

/// An [`Input`] that renders `{{name}}` / `{name}` as variable chips, with an
/// optional "manage variables" affordance in the trailing slot.
#[derive(IntoElement)]
pub struct VariableInput {
    state: Entity<InputState>,
    variables: Vec<VariableOption>,
    on_manage: Option<Rc<dyn Fn(&mut Window, &mut App) + 'static>>,
}

impl VariableInput {
    pub fn new(state: &Entity<InputState>) -> Self {
        Self {
            state: state.clone(),
            variables: Vec::new(),
            on_manage: None,
        }
    }

    pub fn variables(mut self, variables: Vec<VariableOption>) -> Self {
        self.variables = variables;
        self
    }

    pub fn on_manage(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_manage = Some(Rc::new(f));
        self
    }

    /// Set the whole value (chips included) without emitting `Change`, so
    /// programmatic loads do not look like typing.
    pub fn set_value(
        state: &mut InputState,
        value: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<InputState>,
    ) {
        state.set_value(content_with_chips(value.into()), window, cx);
    }

    /// Turn typed `{{name}}` / `{name}` spans into chips in place.
    pub fn promote_tokens(
        state: &mut InputState,
        window: &mut Window,
        cx: &mut Context<InputState>,
    ) {
        let Some(_guard) = PromoteGuard::enter() else {
            return;
        };

        let text = state.value();
        let existing = state.tokens().to_vec();
        let selection = state.selected_range();
        let mut ranges = scan_variables(&text);
        ranges.retain(|(range, _)| {
            !existing.iter().any(|span| {
                let span = span.range();
                span.start < range.end && range.start < span.end
            })
        });

        // Length is unchanged by a replacement, so offsets stay valid; walking
        // backwards keeps the carets stable for any future length-changing token.
        for (range, name) in ranges.into_iter().rev() {
            let token = token_for(&name, text[range.clone()].to_string());
            let _ = state.replace_range_with_token(range, token, window, cx);
        }

        state.set_selected_range(selection, cx);
    }

    /// The text inserted for `name`, parsed by [`Self::promote_tokens`].
    pub fn placeholder(name: &str) -> String {
        format!("{{{{{name}}}}}")
    }

    /// A menu button that inserts a variable placeholder at the cursor.
    pub fn insert_button(
        id: impl Into<ElementId>,
        options: Vec<VariableOption>,
        on_pick: impl Fn(String, &mut Window, &mut App) + 'static,
    ) -> VariableInsertButton {
        VariableInsertButton::new(id, options, on_pick)
    }
}

impl RenderOnce for VariableInput {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let Self {
            state,
            variables,
            on_manage,
        } = self;

        let input = Input::new(&state)
            .token(move |ctx, _window, cx| render_chip(ctx, &variables, cx));

        let input = if let Some(on_manage) = on_manage {
            input.suffix(
                Button::icon(("variable-manage", state.entity_id()), PhosphorIcon::BracketsCurly)
                    .variant(ButtonVariant::Ghost)
                    .size(ButtonSize::IconXs)
                    .tooltip("Manage variables")
                    .on_click(move |_, window, cx| on_manage(window, cx)),
            )
        } else {
            input
        };

        div().w_full().min_w_0().child(input)
    }
}

/// Dropdown trigger for inserting a variable into any input.
#[derive(IntoElement)]
pub struct VariableInsertButton {
    id: ElementId,
    options: Vec<VariableOption>,
    on_pick: Rc<dyn Fn(String, &mut Window, &mut App) + 'static>,
    on_manage: Option<Rc<dyn Fn(&mut Window, &mut App) + 'static>>,
}

impl VariableInsertButton {
    pub fn new(
        id: impl Into<ElementId>,
        options: Vec<VariableOption>,
        on_pick: impl Fn(String, &mut Window, &mut App) + 'static,
    ) -> Self {
        Self {
            id: id.into(),
            options,
            on_pick: Rc::new(on_pick),
            on_manage: None,
        }
    }

    pub fn on_manage(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_manage = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for VariableInsertButton {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let Self {
            id,
            options,
            on_pick,
            on_manage,
        } = self;
        let disabled = options.is_empty() && on_manage.is_none();

        let mut button = Button::icon(id, PhosphorIcon::BracketsCurly)
            .variant(ButtonVariant::Ghost)
            .size(ButtonSize::IconXs)
            .tooltip("Insert variable")
            .disabled(disabled);

        if !disabled {
            button = button.dropdown_menu_with_anchor(Anchor::TopRight, move |menu, _window, _cx| {
                let mut menu = menu.max_h(px(280.)).scrollable(true);
                for option in &options {
                    let name = option.name.clone();
                    let pick = on_pick.clone();
                    menu = menu.item(
                        PopupMenuItem::new(option.menu_label())
                            .on_click(move |_, window, cx| pick(name.clone(), window, cx)),
                    );
                }
                if let Some(manage) = on_manage.clone() {
                    if !options.is_empty() {
                        menu = menu.separator();
                    }
                    menu = menu.item(
                        PopupMenuItem::new("Manage variables…")
                            .on_click(move |_, window, cx| manage(window, cx)),
                    );
                }
                menu
            });
        }

        button
    }
}
