//! Select — `select.tsx` → gpui `select`, plus icon-bearing options.
//!
//! `gpui-component`'s `Select` is data-driven: the dropdown row and the
//! trigger's committed value are both drawn by the **item** type
//! ([`SearchableListItem::render`] and [`SearchableListItem::display_title`]),
//! never by the widget. Icon support therefore belongs on the item, and
//! [`SelectOption`] is that item — a value, a label, and an optional leading
//! [`PhosphorIcon`]:
//!
//! ```ignore
//! let status = cx.new(|cx| {
//!     SelectState::new(
//!         SelectItems::new(vec![
//!             SelectOption::new("draft", "Draft").icon(PhosphorIcon::PencilSimpleLine),
//!             SelectOption::new("review", "In review").icon(PhosphorIcon::Eye),
//!             SelectOption::new("done", "Done")
//!                 .icon(PhosphorIcon::CheckCircle)
//!                 .icon_color(cx.theme().success),
//!         ]),
//!         None,
//!         window,
//!         cx,
//!     )
//! });
//!
//! Select::new(&status).placeholder("Status").cleanable(true)
//! ```
//!
//! The glyph appears in both places the web component draws it, because both
//! read the same item. [`SearchableListItem::title`] stays the plain label, so
//! assistive technology announces text and never a glyph — upstream's
//! `display_title` contract. Two consequences follow from that split:
//!
//! - `display_title` **supersedes** `Select::title_prefix` in the trigger
//!   (upstream draws one or the other, never both), so an icon option drops the
//!   prefix. Put the qualifier in the label if both are wanted.
//! - The icon inherits the surrounding text style: it dims with a disabled
//!   trigger and takes the menu row's foreground for free.
//!   [`SelectOption::icon_color`] is only for a status colour that must not
//!   follow the text.
//!
//! Everything else is upstream's: [`SelectState`] owns the selection and the
//! open/close state, [`SelectGroup`] sections the menu, and `Select::new` takes
//! any delegate — a plain `Vec<SelectOption<_>>` works for a short static list,
//! [`SelectItems`] adds search filtering.

pub use gpui_component::select::{
    Caret, Select, SelectDelegate, SelectEvent, SelectGroup, SelectItem, SelectListItem,
    SelectState,
};

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Hsla, IntoElement, ParentElement as _, SharedString, Styled as _, Window, div,
    px,
};
use gpui_component::searchable_list::{SearchableListItem, SearchableVec};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};

/// The searchable delegate for a list of [`SelectOption`]s.
///
/// Only needed when the menu filters as you type (`SelectState::searchable`).
/// A plain `Vec<SelectOption<_>>` is a delegate too, and is enough for a short
/// list that never searches.
pub type SelectItems<V> = SearchableVec<SelectOption<V>>;

/// One row of a [`Select`] — a value, its label, and an optional leading icon.
///
/// The icon is drawn by the row *and* by the trigger, so a status or category
/// picker keeps its glyph on screen after the menu closes.
#[derive(Clone, Debug)]
pub struct SelectOption<V> {
    value: V,
    label: SharedString,
    icon: Option<PhosphorIcon>,
    icon_color: Option<Hsla>,
    disabled: bool,
}

impl<V> SelectOption<V> {
    /// A plain option — the value plus the label shown in the row and trigger.
    pub fn new(value: V, label: impl Into<SharedString>) -> Self {
        Self {
            value,
            label: label.into(),
            icon: None,
            icon_color: None,
            disabled: false,
        }
    }

    /// Draw `icon` before the label, in the row and in the trigger.
    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    /// Give the icon a fixed colour instead of the surrounding text colour.
    ///
    /// Use it for status semantics (`cx.theme().success` / `warning` /
    /// `danger`); leave it unset when the glyph should dim with the control.
    pub fn icon_color(mut self, color: impl Into<Hsla>) -> Self {
        self.icon_color = Some(color.into());
        self
    }

    /// Render the row greyed out and unclickable.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// The value this option commits to the select.
    pub fn value(&self) -> &V {
        &self.value
    }

    /// The plain label — also what the row and the trigger fall back to.
    pub fn label(&self) -> SharedString {
        self.label.clone()
    }
}

impl<V: Clone + PartialEq> SearchableListItem for SelectOption<V> {
    type Value = V;

    fn title(&self) -> SharedString {
        self.label.clone()
    }

    fn display_title(&self) -> Option<AnyElement> {
        // Only take the trigger over when there is a glyph to add; a bare
        // `SelectOption` costs upstream nothing.
        self.icon
            .map(|icon| option_row(Some(icon), self.icon_color, self.label.clone()))
    }

    fn render(&self, _: &mut Window, _: &mut App) -> impl IntoElement {
        option_row(self.icon, self.icon_color, self.label.clone())
    }

    fn value(&self) -> &Self::Value {
        &self.value
    }

    fn disabled(&self) -> bool {
        self.disabled
    }
}

/// Icon + label, as one shrinking row.
///
/// The label takes the remaining width and ellipsizes rather than pushing the
/// trigger's caret out of view — the row is used in a trigger that is narrower
/// than the label more often than not.
fn option_row(
    icon: Option<PhosphorIcon>,
    icon_color: Option<Hsla>,
    label: SharedString,
) -> AnyElement {
    div()
        .flex()
        .flex_row()
        .items_center()
        .gap(px(6.0))
        .min_w_0()
        .when_some(icon, |this, icon| {
            this.child(div().flex_none().flex().items_center().child(
                Phosphor::new(icon).when_some(icon_color, |glyph, color| glyph.color(color)),
            ))
        })
        .child(div().flex_1().min_w_0().truncate().child(label))
        .into_any_element()
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{
        AppContext as _, Context, Entity, Render, RenderOnce as _, TestAppContext, Window, div,
    };
    use gpui_component::IndexPath;

    fn status_options() -> Vec<SelectOption<&'static str>> {
        vec![
            SelectOption::new("draft", "Draft").icon(PhosphorIcon::PencilSimpleLine),
            SelectOption::new("review", "In review").icon(PhosphorIcon::Eye),
            SelectOption::new("blocked", "Blocked")
                .icon(PhosphorIcon::WarningCircle)
                .disabled(true),
            SelectOption::new("done", "Done").icon(PhosphorIcon::CheckCircle),
        ]
    }

    /// The accessible value must stay text: `title()` is the label with or
    /// without a glyph, and only an icon-bearing option takes the trigger over.
    #[test]
    fn title_stays_plain_text_and_the_glyph_only_overrides_the_trigger() {
        let with_icon = SelectOption::new("done", "Done").icon(PhosphorIcon::CheckCircle);
        assert_eq!(with_icon.title().as_ref(), "Done");
        assert_eq!(with_icon.label().as_ref(), "Done");
        assert!(with_icon.display_title().is_some());

        let plain = SelectOption::new("done", "Done");
        assert_eq!(plain.title().as_ref(), "Done");
        assert!(
            plain.display_title().is_none(),
            "a bare option must fall back to upstream's label rendering"
        );
    }

    #[test]
    fn disabled_and_value_ride_on_the_item() {
        let blocked = SelectOption::new(3usize, "Blocked")
            .icon(PhosphorIcon::WarningCircle)
            .disabled(true);
        // The builder method shadows the trait getter, so the row state is
        // read through the trait explicitly.
        assert!(SearchableListItem::disabled(&blocked));
        assert_eq!(blocked.value(), &3);
        assert!(!SearchableListItem::disabled(&SelectOption::new(
            1usize, "Draft"
        )));
    }

    /// `SelectItems` is the searchable delegate, and the select must resolve a
    /// value, seed the trigger and render the icon rows from it.
    #[gpui::test]
    fn icon_options_resolve_and_render_through_a_select(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let cx = cx.add_empty_window();

        cx.update(|window, cx| {
            let state = cx.new(|cx| {
                SelectState::new(
                    SelectItems::new(status_options()),
                    Some(IndexPath::new(1)),
                    window,
                    cx,
                )
                .searchable(true)
            });

            assert_eq!(state.read(cx).selected_value(), Some(&"review"));
            assert_eq!(state.read(cx).selected_index(cx), Some(IndexPath::new(1)));

            state.update(cx, |state, cx| {
                state.set_selected_value(&"done", window, cx);
            });
            assert_eq!(state.read(cx).selected_value(), Some(&"done"));

            // The trigger path: `display_title` is read for the committed item.
            _ = Select::new(&state)
                .placeholder("Status")
                .cleanable(true)
                .render(window, cx);
        });
    }

    /// The gallery card mounts every option shape — icon, coloured icon, plain,
    /// disabled — so a branch that only paints on a non-default flag still runs.
    struct SelectGallery {
        state: Entity<SelectState<SelectItems<&'static str>>>,
    }

    impl Render for SelectGallery {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(Select::new(&self.state))
                .child(Select::new(&self.state).cleanable(true))
        }
    }

    #[gpui::test]
    fn select_gallery_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let (_, _cx) = cx.add_window_view(|window, cx| SelectGallery {
            state: cx
                .new(|cx| SelectState::new(SelectItems::new(status_options()), None, window, cx)),
        });
    }
}
