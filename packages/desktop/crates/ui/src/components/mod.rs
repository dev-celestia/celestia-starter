//! Reusable components for Celestia desktop apps.
//!
//! Two categories, mirroring the web package's `packages/ui/src/components/`:
//!
//! - [`primitive`] — one control, or one visual atom, per file. The counterpart
//!   of `packages/ui/src/components/primitive/*.tsx`.
//! - [`composite`] — surfaces assembled from several primitives, plus
//!   application-level assemblies (chrome, shells, editors). The counterpart of
//!   `packages/ui/src/components/composite/*.tsx`.
//!
//! The split is by **composition, not size**: a file that renders two or more
//! primitives, or that owns a layout region rather than a control, belongs in
//! `composite`. The web package's own placement of the same component settles
//! every case that has a counterpart there.
//!
//! ## Dependency layers
//!
//! There is no facade crate. Each dependency is named for what it is:
//!
//! | Layer | Crate | Used for |
//! | --- | --- | --- |
//! | Framework | `gpui` (`gpui-pre`) | everything a component draws |
//! | Base | `gpui-base` | **the inner component library** — `Checkbox`, `Popover`, `Tree`, `Resizable`, `Slider`, `Tabs`, `Table`, `VirtualList`, the motion stack, scroll. The free style helpers are *gone* from this list: [`traits`] now owns `Size` / `Sizable` / `Disableable` / `Selectable` and `h_flex` / `v_flex`, so component files import those from [`traits`] instead of naming either widget layer |
//! | Widgets | `gpui-component` | a thin styling layer *over* `gpui-base`; the styled controls a file still re-exports |
//!
//! A file that imports nothing but `gpui` is **written on raw gpui**; the rest
//! re-export `gpui-component` and are still being rewritten, one family at a
//! time. Written on raw gpui so far:
//!
//! - **Feedback** — `alert`, `progress`, `skeleton`, `spinner`, `shimmer`,
//!   `icon`, `tooltip` (primitive); `loaders`, `notice`, `context_badge`
//!   (composite).
//! - **Structural** — `separator`, `kbd`, `link`, `breadcrumb` (primitive);
//!   `group_box`, `status_bar`, `title_bar`, `description_list`, `empty`
//!   (composite).
//! - **Display** — `badge`, `label`, `rating`, `avatar` (+ its own
//!   `AvatarGroup` and the OkLCH identity ring) (primitive).
//! - **Layout** — `card` (primitive); `section_heading`, `sidebar_layout`, and
//!   the SwiftUI vocabulary `h_stack`, `v_stack`, `z_stack`, `spacer`,
//!   `scroll_view`, `v_grid`, `frame`, `alignment` (composite).
//! - **Conversation** — `bubble` (primitive); `message`, `marker` (composite);
//!   `message_scroller` (composite, one tolerated `gpui_base::motion`
//!   value-transition).
//! - **Controls** — `button`, `checkbox`, `switch`, `radio`, `slider`
//!   (primitive); `stepper`, `pagination`, `collapsible` (composite/primitive).
//!   `button` keeps two deliberate upstreams: the dropdown menu still rides
//!   `gpui-component`'s `PopupMenu` (menu family pending) and the value
//!   transition is `gpui_base::motion::transition` (motion stack pending).
//! - **Content** — `attachment` (composite).
//!
//! Pick the next family by **transitive cost, not file size**, measured on two
//! independent axes:
//!
//! 1. **What the closure drags in.** A one-line re-export is not automatically
//!    cheap — follow the target's own `crate::` imports and add up what they
//!    reach. The question that settles the cost is not "how big is it" but
//!    **"does the closure reach a `gpui-base` state machine"**. `StyledExt`,
//!    `h_flex` / `v_flex`, `RoleOverride`, `AxisExt` and the sizing traits are
//!    base-layer *style helpers* and cost nothing to inline; `Checkbox`,
//!    `Slider`, `Popover`, `Tree`, `ResizableState` and the motion stack are
//!    *state machines* and have to be reimplemented rather than inlined.
//! 2. **Who else imports the target.** A module the rest of the tree leans on
//!    cannot move alone. `bubble` and `message` import each other
//!    (`MessageContent::bubble` takes the crate's `Bubble`), so they migrated
//!    together. `menu` is imported by ten upstream modules and `input` by six,
//!    which is exactly why the heavy shims stay heavy.
//!
//! Measured against that rule, the remaining 24 shims all close over real
//! `gpui-base` state machines (the input stack alone drags in 11 at depth 1
//! and is imported by six upstream modules), so the base layer is the
//! milestone, not another component batch. The two conventions that keep the
//! remaining files portable are already in place: [`traits`] owns the sizing
//! and interaction traits plus `h_flex` / `v_flex`, and `crate::motion` owns
//! the design-system timing — a rewritten file stops naming either widget
//! layer for both.
//!
//! This is a measurement, not an impression:
//! `scripts/ui-audit/gpui-migration-cost.py` re-derives it. Read its **`gb1`**
//! column — the `gpui-base` modules the target's *own* files import, at depth 1.
//! Not the closure columns: a closure total saturates at ~45k lines for nearly
//! every shim *and* over-reaches (`stepper`'s closure claims `markdown_ext`,
//! `number_input` and `virtual_list`, which a stepper plainly does not use).
//! Depth 1 cannot be inflated transitively, so `gb1 == 0` means a one-file port
//! and nothing else does. (`resizable` reports a false zero: `gpui_component::
//! resizable` is an inline `pub mod` over `gpui-base`, not a file. A name that
//! resolves to nothing is a red flag, not a cheap target.)
//!
//! A correction that reframes that whole list: **`gpui-base` is not a helper
//! crate, it is the inner component library.** `gpui-component` is a thin
//! styling layer over it — upstream `checkbox.rs` is a struct holding
//! `base: gpui_base::Checkbox`, and `popover.rs` does
//! `use gpui_base::Popover as BasePopover`. Only the style helpers listed above
//! are free to inline, which is exactly why `title_bar` — zero of them — cost
//! one file and no reimplementation.
//!
//! What a raw-gpui file looks like:
//!
//! - `use crate::theme::ActiveTheme as _;` for `cx.theme()`. The theme service
//!   is gpui-component's and is the **last** thing scheduled to move; it is
//!   re-exported from [`crate::theme`] so component files never name
//!   `gpui_component` just to read a colour.
//! - `use crate::components::primitive::icon::{Phosphor, PhosphorIcon}` for
//!   glyphs — Phosphor is the only icon catalog in the crate.
//! - `el.style().refine(&self.style)` — core gpui — rather than gpui-base's
//!   `StyledExt::refine_style`.
//! - `.tooltip(|_, cx| cx.new(|_| MyHint).into())` — gpui's native tooltip —
//!   rather than `gpui_component::tooltip::Tooltip`.
//! - `div().flex().flex_row()` / `div().flex().flex_col()` rather than
//!   gpui-base's `h_flex()` / `v_flex()` — **plus whatever cross-axis rule the
//!   helper supplied**. `h_flex()` is `.flex().flex_row().items_center()`, so a
//!   row that relied on that centering keeps an explicit `.items_center()`
//!   (while one that already overrides it with `.items_start()` does not);
//!   `v_flex()` is plain `.flex().flex_col()`. Dropping the `items_center()`
//!   silently re-aligns every row in the file.
//! - `ParentElement` imported by name (not `as _`) whenever a file implements
//!   it.
//!
//! Colors always come from `cx.theme()` / `crate::palette(cx)` — never from a
//! hex literal at a call site.

pub mod composite;
pub mod primitive;
pub mod traits;

// Flat re-exports — `use celestia_ui::components::Button` works, mirroring the
// web package's index. Only files with typed exports are globbed here;
// module-only components (avatar, table, tree, empty, …) are reached through
// their module path (`components::primitive::table`,
// `components::composite::empty`).
pub use composite::alignment::*;
pub use composite::code_editor::*;
pub use composite::color_picker::*;
pub use composite::context_badge::*;
pub use composite::date_picker::*;
pub use composite::frame::*;
pub use composite::h_stack::*;
pub use composite::loaders::*;
pub use composite::menu::*;
pub use composite::notice::*;
pub use composite::scroll_view::*;
pub use composite::section_heading::*;
pub use composite::sidebar_layout::*;
pub use composite::spacer::*;
pub use composite::text_editor::*;
pub use composite::title_bar::*;
pub use composite::v_grid::*;
pub use composite::v_stack::*;
pub use composite::virtual_list::*;
pub use composite::z_stack::*;

pub use primitive::accordion::*;
pub use primitive::alert::*;
pub use primitive::badge::*;
pub use primitive::button::*;
pub use primitive::card::*;
pub use primitive::checkbox::*;
pub use primitive::dialog::*;
pub use primitive::icon::*;
pub use primitive::input::*;
pub use primitive::input_otp::*;
pub use primitive::kbd::*;
pub use primitive::link::*;
pub use primitive::popover::*;
pub use primitive::progress::*;
pub use primitive::radio::*;
pub use primitive::rating::*;
pub use primitive::select::*;
pub use primitive::separator::*;
pub use primitive::sheet::*;
pub use primitive::skeleton::*;
pub use primitive::spinner::*;
pub use primitive::switch::*;
pub use primitive::tabs::*;
pub use primitive::textarea::*;
pub use primitive::toast::*;
pub use primitive::tooltip::*;

#[cfg(test)]
mod migrated_family_tests {
    //! Smoke tests for the families rewritten onto raw `gpui`. Each family adds
    //! its members here as it migrates, so one render pass proves the whole
    //! group still mounts — the same shape as the per-component tests, but
    //! spanning a family. `#[gpui::test]` rather than a facade-provided macro,
    //! so the test itself stays off the facade.

    use gpui::{
        Context, IntoElement, Keystroke, ParentElement as _, Render, Role, Styled as _,
        TestAppContext, Window, div, px,
    };

    use crate::components::composite::context_badge::{BadgeDetail, MessageBadge, context_badge};
    use crate::components::composite::description_list::DescriptionList;
    use crate::components::composite::empty::{Empty, EmptyDescription, EmptyHeader, EmptyTitle};
    use crate::components::composite::group_box::{GroupBox, GroupBoxVariants as _};
    use crate::components::composite::marker::{
        Marker, MarkerContent, MarkerIcon, MarkerLoadingStyle, MarkerVariant,
    };
    use crate::components::composite::message::{
        Message, MessageAlignment, MessageAvatar, MessageContent, MessageFooter, MessageGroup,
        MessageHeader,
    };
    use crate::components::composite::notice::{NoticeChipIcon, notice_chip};
    use crate::components::composite::status_bar::StatusBar;
    use crate::components::composite::title_bar::TitleBar;
    use crate::components::primitive::alert::Alert;
    use crate::components::primitive::badge::{Badge, BadgeVariant, GpuiBadge, GpuiBadgeSize};
    use crate::components::primitive::breadcrumb::{Breadcrumb, BreadcrumbItem};
    use crate::components::primitive::bubble::{
        Bubble, BubbleGroup, BubbleReactionSide, BubbleReactions, BubbleVariant,
    };
    use crate::components::primitive::icon::PhosphorIcon;
    use crate::components::primitive::kbd::Kbd;
    use crate::components::primitive::label::{HighlightsMatch, Label};
    use crate::components::primitive::link::Link;
    use crate::components::primitive::progress::{Progress, ProgressCircle};
    use crate::components::primitive::rating::{Rating, RatingSize};
    use crate::components::primitive::separator::Separator;
    use crate::components::primitive::shimmer::ShimmerText;
    use crate::components::primitive::skeleton::Skeleton;
    use crate::components::primitive::spinner::Spinner;

    struct FeedbackFamily;

    impl Render for FeedbackFamily {
        fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(Alert::info("f-info", "This is an informational alert."))
                .child(Alert::success("f-ok", "Everything went well."))
                .child(Alert::warning("f-warn", "Watch out for this."))
                .child(Alert::error("f-err", "Something failed."))
                .child(Alert::new("f-plain", "No accent.").title("Heads up"))
                .child(Progress::new("f-bar").value(0.65))
                .child(ProgressCircle::new("f-ring").value(0.65))
                .child(Skeleton::new().h_4().w(px(192.0)))
                .child(Spinner::new())
                .child(ShimmerText::new("Thinking…"))
                .child(notice_chip(
                    false,
                    "Command failed",
                    "cargo build exited with status 101: unresolved import",
                    NoticeChipIcon::Tile,
                    cx,
                ))
                .child(context_badge(
                    "f-badge",
                    &MessageBadge {
                        icon: PhosphorIcon::FileCode,
                        label: "2 comments".into(),
                        details: vec![BadgeDetail {
                            location: "src/main.rs:42".into(),
                            tag: Some("R".into()),
                            body: "early-return here".into(),
                        }],
                    },
                    cx,
                ))
        }
    }

    #[gpui::test]
    fn feedback_family_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| FeedbackFamily);
    }

    /// The Structural family — the presentational primitives. Rendered with
    /// every builder exercised, so a `when` branch that only fires under a
    /// non-default flag is still compiled and painted here.
    struct StructuralFamily;

    impl Render for StructuralFamily {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            let cmd_d = Keystroke::parse("cmd-d").expect("valid keystroke");
            let page_down = Keystroke::parse("shift-pagedown").expect("valid keystroke");

            div()
                .flex()
                .flex_col()
                .child(Separator::horizontal())
                .child(Separator::horizontal_dashed().label("or"))
                .child(Separator::vertical())
                .child(Kbd::new(cmd_d))
                .child(Kbd::new(page_down).outline())
                .child(
                    Kbd::new(Keystroke::parse("escape").expect("valid keystroke"))
                        .appearance(false),
                )
                .child(Link::new("s-link").href("https://gpui.rs").child("gpui.rs"))
                .child(Link::new("s-link-dead").disabled(true).child("inert"))
                .child(
                    GroupBox::new()
                        .title("Grouped")
                        .outline()
                        .child(div().child("Decorated content")),
                )
                .child(GroupBox::new().fill().child(div().child("Filled content")))
                .child(StatusBar::new().left("main").right("UTF-8").child("center"))
                .child(
                    TitleBar::new()
                        .child(div().child("Celestia Desktop"))
                        .on_close_window(|_, _, _| {}),
                )
                .child(
                    Breadcrumb::new()
                        .child(BreadcrumbItem::new("Home"))
                        .child(BreadcrumbItem::new("Components"))
                        .child(BreadcrumbItem::new("Structural")),
                )
                .child(
                    DescriptionList::new()
                        .item("Framework", "Celestia Desktop", 1)
                        .item("Engine", "GPUI", 2)
                        .separator()
                        .item("Architecture", "ARM64", 3),
                )
                .child(DescriptionList::vertical().item("Key", "Value", 1))
                .child(
                    Empty::new()
                        .header(
                            EmptyHeader::new()
                                .title(EmptyTitle::new().child("No records found"))
                                .description(
                                    EmptyDescription::new().child("Nothing matched the filters."),
                                ),
                        )
                        .child("Reset Filters"),
                )
        }
    }

    #[gpui::test]
    fn structural_family_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| StructuralFamily);
    }

    /// The Display family — the presentational chips, captions and the star
    /// rating. Every builder branch is exercised, including the ones a default
    /// render never reaches: a masked label, a prefix highlight, the hidden
    /// count-of-zero badge, and a disabled rating.
    struct DisplayFamily;

    impl Render for DisplayFamily {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(Label::new("Display"))
                .child(Label::new("Display").secondary("muted tail"))
                .child(Label::new("Highlighted").highlights("light"))
                .child(Label::new("Highlighted").highlights(HighlightsMatch::Prefix("High".into())))
                .child(Label::new("hunter2").masked(true))
                .child(Badge::new("Default"))
                .child(Badge::new("Secondary").variant(BadgeVariant::Secondary))
                .child(Badge::new("Destructive").variant(BadgeVariant::Destructive))
                .child(Badge::new("Outline").variant(BadgeVariant::Outline))
                .child(Badge::new("Success").variant(BadgeVariant::Success))
                .child(Badge::new("Warning").variant(BadgeVariant::Warning))
                .child(Badge::new("Info").variant(BadgeVariant::Info))
                .child(Badge::new("Ghost").variant(BadgeVariant::Ghost))
                .child(Badge::new("Link").variant(BadgeVariant::Link))
                .child(Badge::new("Brand").variant(BadgeVariant::Brand))
                .child(Badge::new("Pill").rounded_full())
                .child(GpuiBadge::new().count(0).child(div().size(px(24.))))
                .child(GpuiBadge::new().count(12).child(div().size(px(24.))))
                .child(
                    GpuiBadge::new()
                        .count(1000)
                        .max(99)
                        .child(div().size(px(24.))),
                )
                .child(GpuiBadge::new().dot().child(div().size(px(24.))))
                .child(
                    GpuiBadge::new()
                        .icon(PhosphorIcon::Star)
                        .with_size(GpuiBadgeSize::Small)
                        .child(div().size(px(24.))),
                )
                .child(Rating::new("d-rating").value(3))
                .child(
                    Rating::new("d-rating-lg")
                        .value(4)
                        .with_size(RatingSize::Large),
                )
                .child(Rating::new("d-rating-off").value(2).disabled(true))
        }
    }

    #[gpui::test]
    fn display_family_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| DisplayFamily);
    }

    /// The Conversation family — the chat stack. `bubble` and `message` are
    /// mutually coupled (`MessageContent::bubble` takes the crate's `Bubble`),
    /// so they are exercised together; `marker` rides along as the status row.
    /// Every variant and both loading styles are rendered, so the branches a
    /// default mount would skip — a ghost surface, a reaction pill, a separator
    /// rule, a shimmering non-text child — are all compiled and painted here.
    struct ConversationFamily;

    impl Render for ConversationFamily {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(
                    MessageGroup::new()
                        .child(
                            Message::new()
                                .alignment(MessageAlignment::Start)
                                .avatar(MessageAvatar::new().child(div().size(px(32.0))))
                                .header(MessageHeader::new().child("Celestia"))
                                .content(
                                    MessageContent::new()
                                        .bubble(Bubble::new().child("How can I help?"))
                                        .bubble(
                                            Bubble::new()
                                                .with_variant(BubbleVariant::Ghost)
                                                .child("surface-less body"),
                                        ),
                                )
                                .footer(MessageFooter::new().child("Delivered")),
                        )
                        .child(
                            Message::new()
                                .alignment(MessageAlignment::End)
                                .avatar(MessageAvatar::new().child(div().size(px(32.0))))
                                .content(
                                    MessageContent::new().bubble(
                                        Bubble::new()
                                            .with_variant(BubbleVariant::Secondary)
                                            .reactions(
                                                BubbleReactions::new()
                                                    .side(BubbleReactionSide::Top)
                                                    .child("👍 2"),
                                            )
                                            .child("Secondary surface"),
                                    ),
                                ),
                        ),
                )
                .child(
                    BubbleGroup::new()
                        .child(Bubble::new().child("Filled"))
                        .child(
                            Bubble::new()
                                .with_variant(BubbleVariant::Tinted)
                                .child("Tinted"),
                        )
                        .child(
                            Bubble::new()
                                .with_variant(BubbleVariant::Outline)
                                .child("Outline"),
                        )
                        .child(
                            Bubble::new()
                                .with_variant(BubbleVariant::Muted)
                                .child("Muted"),
                        )
                        .child(
                            Bubble::new()
                                .with_variant(BubbleVariant::Destructive)
                                .child("Destructive"),
                        ),
                )
                .child(
                    Marker::new()
                        .with_variant(MarkerVariant::Separator)
                        .content(MarkerContent::new().child("Today")),
                )
                .child(
                    Marker::new()
                        .id("c-status")
                        .role(Role::Status)
                        .with_variant(MarkerVariant::Border)
                        .loading(true)
                        .with_loading_style(MarkerLoadingStyle::Spinner)
                        .icon(MarkerIcon::new().child(PhosphorIcon::Sparkle))
                        .content(MarkerContent::new().text("Thinking")),
                )
                .child(
                    Marker::new()
                        .loading(true)
                        .with_loading_style(MarkerLoadingStyle::Shimmer)
                        .content(MarkerContent::new().text("Shimmering label")),
                )
                .child(
                    Marker::new()
                        .loading(true)
                        .with_loading_style(MarkerLoadingStyle::Shimmer)
                        .content(MarkerContent::new().child("an arbitrary child pulses")),
                )
        }
    }

    #[gpui::test]
    fn conversation_family_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| ConversationFamily);
    }
}
