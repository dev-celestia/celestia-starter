//! The Layout section — the SwiftUI layout vocabulary (`HStack`, `VStack`,
//! `ZStack`, `Spacer`, `VGrid`) plus tabs, accordion, collapsible, and
//! group_box.
//!
//! The stack cards double as living documentation: every alignment variant
//! renders for real, each card's footer states the defaults and gotchas, and
//! the playground drives all three axes (row / column / depth) from one
//! control panel with a live-updating usage snippet.

use celestia_ui::components::Card;
use celestia_ui::components::composite::alignment::{
    HorizontalAlignment, VerticalAlignment, ZAlignment,
};
use celestia_ui::components::composite::group_box::GroupBox;
use celestia_ui::components::composite::h_stack::HStack;
use celestia_ui::components::composite::spacer::Spacer;
use celestia_ui::components::composite::status_bar::StatusBar;
use celestia_ui::components::composite::v_grid::{GridItem, VGrid};
use celestia_ui::components::composite::v_stack::VStack;
use celestia_ui::components::composite::z_stack::ZStack;
use celestia_ui::components::primitive::accordion::Accordion;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::collapsible::Collapsible;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::separator::Separator;
use celestia_ui::components::primitive::tabs::{
    Tabs, TabsContent, TabsList, TabsTrigger, TabsVariant,
};
use celestia_ui::palette;
use gpui::*;
use gpui_component::{ActiveTheme, h_flex, v_flex};

use crate::showcase::Showcase;

/// Axis selector for the interactive layout playground.
#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub enum PlaygroundAxis {
    /// `HStack` — children flow left→right, aligned on the vertical axis.
    #[default]
    Row,
    /// `VStack` — children stack top→bottom, aligned on the horizontal axis.
    Column,
    /// `ZStack` — children layer back→front, every layer pinned to one point.
    Depth,
}

/// Gap presets the playground's spacing control cycles through (px).
const PLAYGROUND_SPACINGS: [f32; 5] = [0., 4., 8., 16., 24.];

/// Stable element ids for the playground's alignment buttons — unique per
/// sibling group, shared across axes so re-keying never collides.
const ALIGNMENT_IDS: [&str; 9] = [
    "pg-align-0",
    "pg-align-1",
    "pg-align-2",
    "pg-align-3",
    "pg-align-4",
    "pg-align-5",
    "pg-align-6",
    "pg-align-7",
    "pg-align-8",
];
/// Stable element ids for the playground's spacing buttons.
const SPACING_IDS: [&str; 5] = [
    "pg-space-0",
    "pg-space-1",
    "pg-space-2",
    "pg-space-3",
    "pg-space-4",
];

const V_ALIGNMENTS: [VerticalAlignment; 3] = [
    VerticalAlignment::Top,
    VerticalAlignment::Center,
    VerticalAlignment::Bottom,
];
const V_ALIGNMENT_LABELS: [&str; 3] = ["Top", "Center", "Bottom"];

const H_ALIGNMENTS: [HorizontalAlignment; 3] = [
    HorizontalAlignment::Leading,
    HorizontalAlignment::Center,
    HorizontalAlignment::Trailing,
];
const H_ALIGNMENT_LABELS: [&str; 3] = ["Leading", "Center", "Trailing"];

const Z_ALIGNMENTS: [ZAlignment; 9] = [
    ZAlignment::Top,
    ZAlignment::Center,
    ZAlignment::Bottom,
    ZAlignment::Leading,
    ZAlignment::Trailing,
    ZAlignment::TopLeading,
    ZAlignment::TopTrailing,
    ZAlignment::BottomLeading,
    ZAlignment::BottomTrailing,
];
const Z_ALIGNMENT_LABELS: [&str; 9] = [
    "Top",
    "Center",
    "Bottom",
    "Leading",
    "Trailing",
    "TopLeading",
    "TopTrailing",
    "BottomLeading",
    "BottomTrailing",
];

/// Tile heights the playground cycles through as children are added (px).
const PLAYGROUND_TILE_HEIGHTS: [f32; 6] = [24., 56., 40., 32., 48., 28.];
/// Tile widths the playground cycles through as children are added (px).
const PLAYGROUND_TILE_WIDTHS: [f32; 6] = [48., 104., 72., 120., 56., 88.];

impl Showcase {
    pub(crate) fn render_layout(&self, cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(self.render_hstack_card(cx))
            .child(self.render_vstack_card(cx))
            .child(self.render_spacer_card(cx))
            .child(self.render_zstack_card(cx))
            .child(self.render_zstack_layers_card(cx))
            .child(self.render_vgrid_card(cx))
            .child(self.render_playground_card(cx))
            .child(self.render_tabs_card(cx))
            .child(self.render_accordion_card(cx))
            .child(self.render_group_box_card(cx))
    }

    /// HStack: all three cross-axis alignments, rendered with tiles of
    /// different heights so the alignment argument is visible.
    fn render_hstack_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        let rows = V_ALIGNMENTS
            .iter()
            .zip(V_ALIGNMENT_LABELS)
            .map(|(alignment, label)| {
                v_flex()
                    .gap_1p5()
                    .child(api_caption(format!("VerticalAlignment::{label}"), muted))
                    .child(
                        div()
                            .h(px(80.))
                            .w_full()
                            .rounded_md()
                            .border_1()
                            .border_color(border_col)
                            .bg(cx.theme().background)
                            .p_2()
                            .child(
                                HStack::new(*alignment)
                                    .spacing(px(8.))
                                    .child(demo_tile("h 24", px(72.), px(24.), cx))
                                    .child(demo_tile("h 56", px(72.), px(56.), cx))
                                    .child(demo_tile("h 40", px(72.), px(40.), cx))
                                    .child(demo_tile("h 32", px(72.), px(32.), cx)),
                            ),
                    )
            })
            .collect::<Vec<_>>();

        Card::new()
            .title("HStack — cross-axis alignment")
            .description(
                "SwiftUI's horizontal stack, mapped to a gpui flex row: spacing becomes the \
                 flex gap, and the alignment argument positions children of different heights \
                 on the vertical cross axis.",
            )
            .child(v_flex().gap_4().children(rows))
            .footer(info_note(
                "Defaults: alignment Center, spacing 8px. HStack is layout-only (no Styled \
                 impl) — wrap it in a div for width, padding, or background.",
                cx,
            ))
    }

    /// VStack: all three cross-axis alignments, side by side, with tiles of
    /// different widths.
    fn render_vstack_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        let columns = H_ALIGNMENTS
            .iter()
            .zip(H_ALIGNMENT_LABELS)
            .map(|(alignment, label)| {
                v_flex()
                    .gap_1p5()
                    .flex_1()
                    .min_w_0()
                    .child(api_caption(format!("HorizontalAlignment::{label}"), muted))
                    .child(
                        div()
                            .h(px(104.))
                            .w_full()
                            .rounded_md()
                            .border_1()
                            .border_color(border_col)
                            .bg(cx.theme().background)
                            .p_2()
                            .child(
                                VStack::new(*alignment)
                                    .spacing(px(6.))
                                    .child(demo_tile("w 48", px(48.), px(22.), cx))
                                    .child(demo_tile("w 104", px(104.), px(22.), cx))
                                    .child(demo_tile("w 72", px(72.), px(22.), cx)),
                            ),
                    )
            })
            .collect::<Vec<_>>();

        Card::new()
            .title("VStack — cross-axis alignment")
            .description(
                "The vertical twin: a flex column whose spacing becomes the row gap and whose \
                 alignment argument positions children of different widths on the horizontal \
                 cross axis.",
            )
            .child(
                HStack::new(VerticalAlignment::Top)
                    .spacing(px(12.))
                    .children(columns),
            )
            .footer(info_note(
                "Defaults: alignment Leading, spacing 8px. Like HStack, alignment is the \
                 cross axis — to distribute along the column (top→bottom), wrap children in \
                 Spacers or size the container.",
                cx,
            ))
    }

    /// Spacer: push-apart, even distribution, and the minLength floor.
    fn render_spacer_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        let toolbar_row = |children: AnyElement| {
            div()
                .h(px(52.))
                .w_full()
                .rounded_md()
                .border_1()
                .border_color(border_col)
                .bg(cx.theme().background)
                .px_3()
                .child(children)
        };

        Card::new()
            .title("Spacer — the flexible gap")
            .description(
                "An invisible view that expands along the parent stack's main axis. It has \
                 no look of its own — it is the flexible-space primitive that turns a \
                 static row into a toolbar.",
            )
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Push-apart — one Spacer between content and trailing actions",
                                muted,
                            ))
                            .child(toolbar_row(
                                HStack::new(VerticalAlignment::Center)
                                    .spacing(px(8.))
                                    .child(
                                        Phosphor::new(PhosphorIcon::Sliders)
                                            .size(px(14.))
                                            .color(muted),
                                    )
                                    .child(
                                        div()
                                            .text_sm()
                                            .font_weight(FontWeight::MEDIUM)
                                            .text_color(cx.theme().foreground)
                                            .child("Export"),
                                    )
                                    .child(Spacer::new())
                                    .child(Kbd::new(
                                        Keystroke::parse("cmd-e").expect("valid keystroke"),
                                    ))
                                    .child(
                                        Button::new("sp-export-btn")
                                            .variant(ButtonVariant::Primary)
                                            .size(ButtonSize::XSmall)
                                            .label("Export"),
                                    )
                                    .into_any_element(),
                            )),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Even distribution — multiple Spacers share the free space equally",
                                muted,
                            ))
                            .child(toolbar_row(
                                HStack::new(VerticalAlignment::Center)
                                    .child(demo_tile("Start", px(64.), px(30.), cx))
                                    .child(Spacer::new())
                                    .child(demo_tile("Center", px(64.), px(30.), cx))
                                    .child(Spacer::new())
                                    .child(demo_tile("End", px(64.), px(30.), cx))
                                    .into_any_element(),
                            )),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "min_length — the gap never shrinks below the floor",
                                muted,
                            ))
                            .child(toolbar_row(
                                HStack::new(VerticalAlignment::Center)
                                    .child(demo_tile("Left", px(64.), px(30.), cx))
                                    .child(Spacer::new().min_length(px(64.)))
                                    .child(demo_tile("Right", px(64.), px(30.), cx))
                                    .into_any_element(),
                            )),
                    ),
            )
            .footer(info_note(
                "minLength floors the expanded size on BOTH axes (it sets min-width and \
                 min-height), which is why a Spacer inside a tight VStack still reserves \
                 vertical room. Use Spacers in HStack/VStack — ZStack layers are full-bleed \
                 and ignore them.",
                cx,
            ))
    }

    /// ZStack: all nine alignments rendered as a 3×3 gallery (the gallery
    /// itself is a VGrid).
    fn render_zstack_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;
        let brand = palette(cx).brand();

        let cells = Z_ALIGNMENTS
            .iter()
            .zip(Z_ALIGNMENT_LABELS)
            .map(|(alignment, label)| {
                v_flex()
                    .gap_1p5()
                    .min_w_0()
                    .child(
                        div()
                            .h(px(64.))
                            .w_full()
                            .rounded_md()
                            .border_1()
                            .border_color(border_col)
                            .bg(cx.theme().background)
                            .child(
                                ZStack::new(*alignment)
                                    .child(
                                        div()
                                            .size(px(40.))
                                            .rounded_sm()
                                            .bg(cx.theme().primary.opacity(0.15))
                                            .border_1()
                                            .border_color(cx.theme().primary.opacity(0.35)),
                                    )
                                    .child(
                                        div()
                                            .size(px(12.))
                                            .rounded_full()
                                            .bg(brand)
                                            .border_1()
                                            .border_color(cx.theme().background),
                                    ),
                            ),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(muted)
                            .child(format!("ZAlignment::{label}")),
                    )
            })
            .collect::<Vec<_>>();

        Card::new()
            .title("ZStack — the nine layer alignments")
            .description(
                "The depth stack: children render back-to-front, and the single alignment \
                 argument pins EVERY layer — the large square and the brand dot below share \
                 the same anchor in each cell.",
            )
            .child(
                VGrid::new([GridItem::Flexible; 3])
                    .spacing(px(12.))
                    .children(cells),
            )
            .footer(info_note(
                "Each child becomes an absolutely-positioned full-bleed layer, and ZStack \
                 fills its parent (size_full) — always give it a bounded frame, or it \
                 collapses. This gallery grid is itself rendered by VGrid.",
                cx,
            ))
    }

    /// ZStack composition: a layer may itself be a stack, which is how one
    /// ZStack yields content on independent edges.
    fn render_zstack_layers_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;
        let brand = palette(cx).brand();

        Card::new()
            .title("ZStack — layered composition")
            .description(
                "Layers are plain children, so a layer can itself be a stack. One \
                 BottomTrailing ZStack + an inner HStack gives a photo card with a caption \
                 pinned to the bottom edge and a badge on the trailing side.",
            )
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Photo card — caption bar as one composed layer",
                                muted,
                            ))
                            .child(
                                div()
                                    .h(px(132.))
                                    .w_full()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(border_col)
                                    .overflow_hidden()
                                    .child(
                                        ZStack::new(ZAlignment::BottomTrailing)
                                            // Layer 1 — the "photo".
                                            .child(
                                                div()
                                                    .size_full()
                                                    .bg(cx.theme().primary.opacity(0.10)),
                                            )
                                            // Layer 2 — a composed caption bar.
                                            .child(
                                                div().w_full().p_3().child(
                                                    HStack::new(VerticalAlignment::Bottom)
                                                        .spacing(px(8.))
                                                        .child(
                                                            v_flex()
                                                                .gap_0p5()
                                                                .min_w_0()
                                                                .child(
                                                                    div()
                                                                        .text_sm()
                                                                        .font_weight(FontWeight::SEMIBOLD)
                                                                        .text_color(cx.theme().foreground)
                                                                        .child("Layers can be stacks"),
                                                                )
                                                                .child(
                                                                    div()
                                                                        .text_xs()
                                                                        .text_color(muted)
                                                                        .child(
                                                                            "One alignment pins every \
                                                                             layer — compose inside a \
                                                                             layer to mix edges.",
                                                                        ),
                                                                ),
                                                        )
                                                        .child(Spacer::new())
                                                        .child(
                                                            div()
                                                                .px_2()
                                                                .py_0p5()
                                                                .rounded_full()
                                                                .bg(brand)
                                                                .text_color(cx.theme().primary_foreground)
                                                                .text_xs()
                                                                .font_weight(FontWeight::MEDIUM)
                                                                .child("BottomTrailing"),
                                                        ),
                                                ),
                                            ),
                                    ),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Centering — float an overlay chip above base content",
                                muted,
                            ))
                            .child(
                                div()
                                    .h(px(96.))
                                    .w_full()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(border_col)
                                    .bg(cx.theme().background)
                                    .child(
                                        ZStack::new(ZAlignment::Center)
                                            .child(
                                                div()
                                                    .size_full()
                                                    .flex()
                                                    .items_center()
                                                    .justify_center()
                                                    .child(
                                                        div()
                                                            .text_xs()
                                                            .text_color(muted)
                                                            .child("Base layer content"),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .px_2()
                                                    .py_0p5()
                                                    .rounded_full()
                                                    .bg(cx.theme().muted)
                                                    .text_xs()
                                                    .font_weight(FontWeight::MEDIUM)
                                                    .text_color(cx.theme().foreground)
                                                    .child("Overlay"),
                                            ),
                                    ),
                            ),
                    ),
            )
            .footer(info_note(
                "A child that is not full-size is positioned by the alignment; a full-bleed \
                 child (size_full / w_full) simply covers the layer. Same model as SwiftUI's \
                 ZStack(alignment:).",
                cx,
            ))
    }

    /// VGrid: Fixed vs Flexible column rules, and row wrapping.
    fn render_vgrid_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        let mixed_rules = VGrid::new([
            GridItem::Fixed(px(88.)),
            GridItem::Fixed(px(88.)),
            GridItem::Flexible,
        ])
        .spacing(px(8.))
        .children([
            demo_tile("Fixed 88", px(88.), px(36.), cx),
            demo_tile("Fixed 88", px(88.), px(36.), cx),
            demo_tile_fill("Flexible — fills the rest", px(36.), cx),
            demo_tile("Fixed 88", px(88.), px(36.), cx),
            demo_tile("Fixed 88", px(88.), px(36.), cx),
            demo_tile_fill("Flexible", px(36.), cx),
        ]);

        let wrapped = VGrid::new([GridItem::Flexible; 4])
            .spacing(px(8.))
            .children((1..=12).map(|ix| demo_tile_fill(format!("{ix}"), px(32.), cx)));

        Card::new()
            .title("VGrid — LazyVGrid column rules")
            .description(
                "Children are chunked into rows sized by a list of GridItem rules: \
                 Fixed(px) pins a column width, Flexible shares what's left (flex_1). Rows \
                 wrap in child order, so a short last row is left-aligned.",
            )
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Mixed rules — two Fixed(px(88.)) columns + one Flexible",
                                muted,
                            ))
                            .child(
                                div()
                                    .w_full()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(border_col)
                                    .bg(cx.theme().background)
                                    .p_2()
                                    .child(mixed_rules),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Four Flexible columns, twelve children — rows wrap automatically",
                                muted,
                            ))
                            .child(
                                div()
                                    .w_full()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(border_col)
                                    .bg(cx.theme().background)
                                    .p_2()
                                    .child(wrapped),
                            ),
                    ),
            )
            .footer(info_note(
                "spacing applies both between rows and between columns; Flexible approximates \
                 SwiftUI's flexible(minimum:maximum:) with a plain flex. The grid grows \
                 vertically — wrap long content in a ScrollView.",
                cx,
            ))
    }

    /// The interactive playground: pick an axis, an alignment, a spacing and
    /// a child count; the preview and the usage snippet update live.
    fn render_playground_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let is_depth = self.layout_axis == PlaygroundAxis::Depth;

        // -- Axis + children count ------------------------------------------
        let axis_row = h_flex()
            .gap_3()
            .items_start()
            .child(
                v_flex()
                    .gap_1p5()
                    .flex_1()
                    .min_w_0()
                    .child(api_caption("Axis", muted))
                    .child(
                        h_flex()
                            .gap_1p5()
                            .child(self.playground_axis_button(
                                "pg-axis-row",
                                "HStack",
                                PlaygroundAxis::Row,
                                cx,
                            ))
                            .child(self.playground_axis_button(
                                "pg-axis-column",
                                "VStack",
                                PlaygroundAxis::Column,
                                cx,
                            ))
                            .child(self.playground_axis_button(
                                "pg-axis-depth",
                                "ZStack",
                                PlaygroundAxis::Depth,
                                cx,
                            )),
                    ),
            )
            .child(if is_depth {
                v_flex()
                    .gap_1p5()
                    .child(api_caption("Layers", muted))
                    .child(
                        div()
                            .text_xs()
                            .text_color(muted)
                            .child("Base tile + overlay dot"),
                    )
                    .into_any_element()
            } else {
                v_flex()
                    .gap_1p5()
                    .child(api_caption("Children", muted))
                    .child(
                        h_flex()
                            .gap_1p5()
                            .items_center()
                            .child(
                                Button::new("pg-minus")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::XSmall)
                                    .child(Phosphor::new(PhosphorIcon::Minus).size(px(12.)))
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.layout_children = (this.layout_children - 1).max(2);
                                        cx.notify();
                                    })),
                            )
                            .child(
                                div()
                                    .flex()
                                    .justify_center()
                                    .w(px(24.))
                                    .text_sm()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(cx.theme().foreground)
                                    .child(format!("{}", self.layout_children)),
                            )
                            .child(
                                Button::new("pg-plus")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::XSmall)
                                    .child(Phosphor::new(PhosphorIcon::Plus).size(px(12.)))
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.layout_children = (this.layout_children + 1).min(6);
                                        cx.notify();
                                    })),
                            ),
                    )
                    .into_any_element()
            });

        // -- Alignment -------------------------------------------------------
        let alignment_picker: AnyElement =
            if is_depth {
                // The nine ZAlignments — laid out by a VGrid, naturally.
                v_flex()
                    .gap_1p5()
                    .child(api_caption("Layer alignment", muted))
                    .child(
                        VGrid::new([GridItem::Fixed(px(104.)); 3])
                            .spacing(px(4.))
                            .children(Z_ALIGNMENT_LABELS.iter().enumerate().map(|(ix, label)| {
                                self.playground_alignment_button(ALIGNMENT_IDS[ix], label, ix, cx)
                            })),
                    )
                    .into_any_element()
            } else {
                let (labels, caption) = match self.layout_axis {
                    PlaygroundAxis::Row => (V_ALIGNMENT_LABELS, "Vertical alignment"),
                    _ => (H_ALIGNMENT_LABELS, "Horizontal alignment"),
                };
                v_flex()
                    .gap_1p5()
                    .child(api_caption(caption, muted))
                    .child(h_flex().gap_1p5().children(labels.iter().enumerate().map(
                        |(ix, label)| {
                            self.playground_alignment_button(ALIGNMENT_IDS[ix], label, ix, cx)
                        },
                    )))
                    .into_any_element()
            };

        // -- Spacing ---------------------------------------------------------
        let spacing_picker: AnyElement = if is_depth {
            v_flex()
                .gap_1p5()
                .child(api_caption("Spacing", muted))
                .child(
                    div()
                        .text_xs()
                        .text_color(muted)
                        .child("ZStack has no spacing argument — layers are full-bleed."),
                )
                .into_any_element()
        } else {
            v_flex()
                .gap_1p5()
                .child(api_caption("Spacing (gap, px)", muted))
                .child(
                    h_flex()
                        .gap_1p5()
                        .children(PLAYGROUND_SPACINGS.iter().enumerate().map(|(ix, spacing)| {
                            self.playground_spacing_button(
                                SPACING_IDS[ix],
                                &(*spacing as u32).to_string(),
                                ix,
                                cx,
                            )
                        })),
                )
                .into_any_element()
        };

        Card::new()
            .title("Layout playground")
            .description(
                "Drive the three stack axes live — every control below maps one argument of \
                 the constructors, and the snippet at the bottom is the exact configuration \
                 you are looking at.",
            )
            .child(
                v_flex()
                    .gap_3()
                    .child(axis_row)
                    .child(alignment_picker)
                    .child(spacing_picker)
                    .child(self.render_playground_preview(cx))
                    .child(self.render_playground_code(cx)),
            )
    }

    /// One axis toggle for the playground.
    fn playground_axis_button(
        &self,
        id: &'static str,
        label: &'static str,
        axis: PlaygroundAxis,
        cx: &mut Context<Self>,
    ) -> Button {
        Button::new(id)
            .variant(if self.layout_axis == axis {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Outline
            })
            .size(ButtonSize::XSmall)
            .label(label)
            .on_click(cx.listener(move |this, _, _, cx| {
                if this.layout_axis != axis {
                    this.layout_axis = axis;
                    // Re-anchor to the center of whichever alignment
                    // vocabulary the new axis speaks.
                    this.layout_align = match axis {
                        PlaygroundAxis::Depth => 4,
                        _ => 1,
                    };
                    cx.notify();
                }
            }))
    }

    /// One alignment toggle for the playground.
    fn playground_alignment_button(
        &self,
        id: &'static str,
        label: &str,
        ix: usize,
        cx: &mut Context<Self>,
    ) -> Button {
        Button::new(id)
            .variant(if self.layout_align == ix {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Outline
            })
            .size(ButtonSize::XSmall)
            .label(label.to_string())
            .on_click(cx.listener(move |this, _, _, cx| {
                this.layout_align = ix;
                cx.notify();
            }))
    }

    /// One spacing toggle for the playground.
    fn playground_spacing_button(
        &self,
        id: &'static str,
        label: &str,
        ix: usize,
        cx: &mut Context<Self>,
    ) -> Button {
        Button::new(id)
            .variant(if self.layout_spacing_ix == ix {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Outline
            })
            .size(ButtonSize::XSmall)
            .label(label.to_string())
            .on_click(cx.listener(move |this, _, _, cx| {
                this.layout_spacing_ix = ix;
                cx.notify();
            }))
    }

    /// The playground preview frame for the selected axis.
    fn render_playground_preview(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let border_col = cx.theme().border;
        let spacing =
            px(PLAYGROUND_SPACINGS[self.layout_spacing_ix.min(PLAYGROUND_SPACINGS.len() - 1)]);

        let (frame_height, preview): (Pixels, AnyElement) = match self.layout_axis {
            PlaygroundAxis::Row => {
                let alignment = V_ALIGNMENTS[self.layout_align.min(2)];
                let children = (0..self.layout_children).map(|ix| {
                    demo_tile(
                        format!("{}", ix + 1),
                        px(56.),
                        px(PLAYGROUND_TILE_HEIGHTS[ix % PLAYGROUND_TILE_HEIGHTS.len()]),
                        cx,
                    )
                });
                (
                    px(80.),
                    HStack::new(alignment)
                        .spacing(spacing)
                        .children(children)
                        .into_any_element(),
                )
            }
            PlaygroundAxis::Column => {
                let alignment = H_ALIGNMENTS[self.layout_align.min(2)];
                let children = (0..self.layout_children).map(|ix| {
                    demo_tile(
                        format!("{}", ix + 1),
                        px(PLAYGROUND_TILE_WIDTHS[ix % PLAYGROUND_TILE_WIDTHS.len()]),
                        px(24.),
                        cx,
                    )
                });
                (
                    // 6 tiles × 24px + 5 gaps × 24px + 2×8px padding.
                    px(280.),
                    VStack::new(alignment)
                        .spacing(spacing)
                        .children(children)
                        .into_any_element(),
                )
            }
            PlaygroundAxis::Depth => {
                let alignment = Z_ALIGNMENTS[self.layout_align.min(8)];
                (
                    px(150.),
                    ZStack::new(alignment)
                        .child(
                            div()
                                .size(px(72.))
                                .rounded_md()
                                .bg(cx.theme().primary.opacity(0.15))
                                .border_1()
                                .border_color(cx.theme().primary.opacity(0.35)),
                        )
                        .child(
                            div()
                                .size(px(14.))
                                .rounded_full()
                                .bg(palette(cx).brand())
                                .border_1()
                                .border_color(cx.theme().background),
                        )
                        .into_any_element(),
                )
            }
        };

        div()
            .w_full()
            .h(frame_height)
            .rounded_md()
            .border_1()
            .border_color(border_col)
            .bg(cx.theme().background)
            .p_2()
            .overflow_hidden()
            .child(preview)
    }

    /// The live-updating constructor snippet for the playground state.
    fn render_playground_code(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let spacing =
            PLAYGROUND_SPACINGS[self.layout_spacing_ix.min(PLAYGROUND_SPACINGS.len() - 1)];
        let code_line: SharedString = match self.layout_axis {
            PlaygroundAxis::Row => format!(
                "HStack::new(VerticalAlignment::{}).spacing(px({}.))",
                V_ALIGNMENT_LABELS[self.layout_align.min(2)],
                spacing,
            )
            .into(),
            PlaygroundAxis::Column => format!(
                "VStack::new(HorizontalAlignment::{}).spacing(px({}.))",
                H_ALIGNMENT_LABELS[self.layout_align.min(2)],
                spacing,
            )
            .into(),
            PlaygroundAxis::Depth => format!(
                "ZStack::new(ZAlignment::{})",
                Z_ALIGNMENT_LABELS[self.layout_align.min(8)]
            )
            .into(),
        };

        h_flex()
            .w_full()
            .gap_2()
            .items_start()
            .rounded_sm()
            .bg(cx.theme().tokens.tab_bar)
            .border_1()
            .border_color(cx.theme().border)
            .px_2()
            .py_1p5()
            .child(
                Phosphor::new(PhosphorIcon::Code)
                    .size(px(12.))
                    .color(cx.theme().muted_foreground),
            )
            .child(
                div()
                    .min_w_0()
                    .flex_1()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(cx.theme().foreground)
                    .child(code_line),
            )
    }

    /// Tabs (segmented pill and line variants) with content panels.
    fn render_tabs_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        Card::new()
            .title("Tabs & Separators")
            .description("Shadcn-styled tab lists (segmented pill and line underline variants) with interactive selection and content panels.")
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        v_flex()
                            .gap_2()
                            .child(
                                div()
                                    .text_xs()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(muted)
                                    .child("Segmented Track (Default):"),
                            )
                            .child(
                                Tabs::new("tabs-segmented")
                                    .child(
                                        TabsList::new("tabs-demo-default")
                                            .child(
                                                TabsTrigger::new("t-overview")
                                                    .label("Overview")
                                                    .selected(self.demo_tab_segmented == 0)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_segmented = 0;
                                                        cx.notify();
                                                    })),
                                            )
                                            .child(
                                                TabsTrigger::new("t-config")
                                                    .label("Configuration")
                                                    .selected(self.demo_tab_segmented == 1)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_segmented = 1;
                                                        cx.notify();
                                                    })),
                                            )
                                            .child(
                                                TabsTrigger::new("t-security")
                                                    .label("Security")
                                                    .selected(self.demo_tab_segmented == 2)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_segmented = 2;
                                                        cx.notify();
                                                    })),
                                            ),
                                    )
                                    .child(match self.demo_tab_segmented {
                                        0 => TabsContent::new("tc-overview").child(
                                            div()
                                                .p_3()
                                                .rounded_md()
                                                .bg(cx.theme().tokens.tab_bar)
                                                .border_1()
                                                .border_color(border_col)
                                                .child(
                                                    v_flex()
                                                        .gap_1()
                                                        .child(
                                                            div()
                                                                .text_sm()
                                                                .font_weight(FontWeight::MEDIUM)
                                                                .text_color(cx.theme().foreground)
                                                                .child("Overview Dashboard"),
                                                        )
                                                        .child(
                                                            div()
                                                                .text_xs()
                                                                .text_color(muted)
                                                                .child("Central project metrics, recent deployments, and operational telemetry."),
                                                        ),
                                                ),
                                        ),
                                        1 => TabsContent::new("tc-config").child(
                                            div()
                                                .p_3()
                                                .rounded_md()
                                                .bg(cx.theme().tokens.tab_bar)
                                                .border_1()
                                                .border_color(border_col)
                                                .child(
                                                    v_flex()
                                                        .gap_1()
                                                        .child(
                                                            div()
                                                                .text_sm()
                                                                .font_weight(FontWeight::MEDIUM)
                                                                .text_color(cx.theme().foreground)
                                                                .child("Configuration Settings"),
                                                        )
                                                        .child(
                                                            div()
                                                                .text_xs()
                                                                .text_color(muted)
                                                                .child("Configure build targets, environment parameters, and runtime optimization profiles."),
                                                        ),
                                                ),
                                        ),
                                        _ => TabsContent::new("tc-security").child(
                                            div()
                                                .p_3()
                                                .rounded_md()
                                                .bg(cx.theme().tokens.tab_bar)
                                                .border_1()
                                                .border_color(border_col)
                                                .child(
                                                    v_flex()
                                                        .gap_1()
                                                        .child(
                                                            div()
                                                                .text_sm()
                                                                .font_weight(FontWeight::MEDIUM)
                                                                .text_color(cx.theme().foreground)
                                                                .child("Security & Access Control"),
                                                        )
                                                        .child(
                                                            div()
                                                                .text_xs()
                                                                .text_color(muted)
                                                                .child("Review cryptographic keys, audit logging events, and fine-grained permissions."),
                                                        ),
                                                ),
                                        ),
                                    }),
                            ),
                    )
                    .child(Separator::horizontal())
                    .child(
                        v_flex()
                            .gap_2()
                            .child(
                                div()
                                    .text_xs()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(muted)
                                    .child("Line Underline Track:"),
                            )
                            .child(
                                Tabs::new("tabs-line")
                                    .child(
                                        TabsList::new("tabs-demo-line")
                                            .variant(TabsVariant::Line)
                                            .child(
                                                TabsTrigger::new("tl-overview")
                                                    .label("Overview")
                                                    .variant(TabsVariant::Line)
                                                    .selected(self.demo_tab_line == 0)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_line = 0;
                                                        cx.notify();
                                                    })),
                                            )
                                            .child(
                                                TabsTrigger::new("tl-config")
                                                    .label("Configuration")
                                                    .variant(TabsVariant::Line)
                                                    .selected(self.demo_tab_line == 1)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_line = 1;
                                                        cx.notify();
                                                    })),
                                            )
                                            .child(
                                                TabsTrigger::new("tl-security")
                                                    .label("Security")
                                                    .variant(TabsVariant::Line)
                                                    .selected(self.demo_tab_line == 2)
                                                    .on_click(cx.listener(|this, _, _, cx| {
                                                        this.demo_tab_line = 2;
                                                        cx.notify();
                                                    })),
                                            ),
                                    )
                                    .child(match self.demo_tab_line {
                                        0 => TabsContent::new("tlc-overview").child(
                                            div()
                                                .py_2()
                                                .text_xs()
                                                .text_color(muted)
                                                .child("Active Line Tab: Overview telemetry and performance gauges."),
                                        ),
                                        1 => TabsContent::new("tlc-config").child(
                                            div()
                                                .py_2()
                                                .text_xs()
                                                .text_color(muted)
                                                .child("Active Line Tab: Service configuration and infrastructure parameters."),
                                        ),
                                        _ => TabsContent::new("tlc-security").child(
                                            div()
                                                .py_2()
                                                .text_xs()
                                                .text_color(muted)
                                                .child("Active Line Tab: Encryption keys, access certificates, and auth rules."),
                                        ),
                                    }),
                            ),
                    ),
            )
    }

    /// Accordion + collapsible panels.
    fn render_accordion_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Accordion & Collapsible")
            .description("Expandable accordion sections and animated collapsible disclosure panels.")
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        Accordion::new("acc-demo")
                            .item(|item| {
                                item.title("What is Celestia Desktop?")
                                    .open(true)
                                    .child(div().text_sm().child("It is a high-performance native desktop UI library built on GPUI."))
                            })
                            .item(|item| {
                                item.title("Does it use Chromium or WebViews?")
                                    .child(div().text_sm().child("No! It is fully GPU-rendered without any webview overhead."))
                            }),
                    )
                    .child(
                        Collapsible::new()
                            .open(true)
                            .content(
                                div()
                                    .p_3()
                                    .rounded_md()
                                    .bg(cx.theme().muted)
                                    .text_sm()
                                    .child("Collapsible panel revealed with smooth layout transitions."),
                            ),
                    ),
            )
    }

    /// GroupBox + status bar.
    fn render_group_box_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;

        Card::new()
            .title("Group Box & Status Bar")
            .description("Surrounding content groups and window footer status bars.")
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        GroupBox::new().child(
                            h_flex().p_3().gap_4().child(
                                div().text_sm().text_color(muted).child(
                                    "Grouped content section inside a unified bordered box.",
                                ),
                            ),
                        ),
                    )
                    .child(
                        StatusBar::new()
                            .left("Git: main* (clean)")
                            .right("UTF-8  •  LF  •  Rust"),
                    ),
            )
    }
}

/// A small muted caption naming the API being demonstrated.
fn api_caption(text: impl Into<SharedString>, muted: Hsla) -> Div {
    div()
        .text_xs()
        .font_weight(FontWeight::MEDIUM)
        .text_color(muted)
        .child(text.into())
}

/// A bordered content tile used to make alignment and spacing visible.
fn demo_tile(label: impl Into<SharedString>, w: Pixels, h: Pixels, cx: &App) -> Div {
    div()
        .flex()
        .flex_none()
        .items_center()
        .justify_center()
        .w(w)
        .h(h)
        .rounded_sm()
        .border_1()
        .border_color(cx.theme().border)
        .bg(cx.theme().muted)
        .text_xs()
        .text_color(cx.theme().muted_foreground)
        .child(label.into())
}

/// [`demo_tile`], but filling its parent cell — for showing how VGrid's
/// Flexible columns share the leftover width.
fn demo_tile_fill(label: impl Into<SharedString>, h: Pixels, cx: &App) -> Div {
    div()
        .flex()
        .flex_1()
        .min_w_0()
        .items_center()
        .justify_center()
        .h(h)
        .rounded_sm()
        .border_1()
        .border_color(cx.theme().border)
        .bg(cx.theme().muted)
        .text_xs()
        .text_color(cx.theme().muted_foreground)
        .child(label.into())
}

/// An info-icon footnote stating defaults and gotchas for a demo card.
fn info_note(text: impl Into<SharedString>, cx: &App) -> AnyElement {
    h_flex()
        .gap_1p5()
        .items_start()
        .child(
            Phosphor::new(PhosphorIcon::Info)
                .size(px(12.))
                .color(cx.theme().muted_foreground),
        )
        .child(
            div()
                .min_w_0()
                .flex_1()
                .text_xs()
                .line_height(px(16.))
                .text_color(cx.theme().muted_foreground)
                .child(text.into()),
        )
        .into_any_element()
}
