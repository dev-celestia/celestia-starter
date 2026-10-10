use celestia_ui::components::Card;
use celestia_ui::components::primitive::badge::{Badge, BadgeVariant};
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::input::Input;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::link::Link;
use celestia_ui::theme::{AppTheme, Scheme, active, families, hex, select};
use gpui::*;
use gpui_component::{ActiveTheme, h_flex, v_flex};

use crate::showcase::Showcase;

/// (id, label, light hex, dark hex) accent presets — the live swap writes the
/// `primary` token into both schemes and re-applies the config.
const ACCENTS: &[(&str, &str, u32, u32)] = &[
    ("celestia", "Celestia", 0xd40c1a, 0xff4d46),
    ("blue", "Blue", 0x2563eb, 0x6aa5ff),
    ("violet", "Violet", 0x7c3aed, 0xa78bfa),
    ("green", "Green", 0x16a34a, 0x4ade80),
    ("amber", "Amber", 0xd97706, 0xfbbf24),
    ("graphite", "Graphite", 0x525252, 0xa3a3a3),
];

/// (label, radius px) presets for the radius knob.
const RADII: &[(&str, f32)] = &[
    ("Sharp", 0.),
    ("Small", 4.),
    ("Medium", 8.),
    ("Large", 12.),
    ("XL", 16.),
    ("Round", 24.),
];

impl Showcase {
    pub(crate) fn render_theming(&self, cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(self.render_families_card(cx))
            .child(self.render_radius_card(cx))
            .child(self.render_accent_card(cx))
            .child(self.render_specimen_card(cx))
    }

    /// Multi-theme: registered families (named light+dark pairs) with the
    /// active one highlighted, plus a one-click custom theme built from
    /// semantic tokens.
    fn render_families_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let active_name = active(cx).to_string();
        let names = families(cx);

        let chips = names
            .iter()
            .map(|name| {
                let name = name.to_string();
                let is_active = name == active_name;
                Button::new(format!("family-{name}"))
                    .variant(if is_active {
                        ButtonVariant::Primary
                    } else {
                        ButtonVariant::Outline
                    })
                    .size(ButtonSize::Small)
                    .label(name.clone())
                    .on_click(cx.listener(move |_, _, _, cx| {
                        select(&name, cx);
                        cx.notify();
                    }))
            })
            .collect::<Vec<_>>();

        Card::new()
            .title("Theme families")
            .description(
                "Light, dark and custom themes as named light+dark pairs, built from \
                 semantic tokens — not per-component style fields. ⌘D flips light/dark \
                 within whichever family is active.",
            )
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        h_flex()
                            .flex_wrap()
                            .gap_2()
                            .children(chips)
                            .child(div().flex_1())
                            .child(
                                Button::new("theme-register-nocturne")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::Small)
                                    .label("Register “Nocturne”")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.nocturne().register("Nocturne", cx);
                                        cx.notify();
                                    })),
                            ),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(format!(
                                "Active family: {active_name}. Accent and radius below \
                                 overlay whichever family is active and are stored on it.",
                            )),
                    ),
            )
    }

    /// A demo custom theme: a slate-and-sky dark scheme over the Celestia
    /// light base, driven entirely by `Scheme` tokens.
    fn nocturne(&self) -> AppTheme {
        AppTheme {
            dark: Scheme {
                background: Some(hex(0x0b1120)),
                foreground: Some(hex(0xe2e8f0)),
                surface: Some(hex(0x131c31)),
                popover: Some(hex(0x0f172a)),
                primary: Some(hex(0x38bdf8)),
                secondary: Some(hex(0x1e293b)),
                muted: Some(hex(0x1e293b)),
                muted_foreground: Some(hex(0x94a3b8)),
                accent: Some(hex(0x1e293b)),
                border: Some(hex(0x273449)),
                input: Some(hex(0x273449)),
                sidebar: Some(hex(0x0d1526)),
                ..Default::default()
            },
            ..Default::default()
        }
    }

    /// The single radius knob (shadcn's `--radius`) — one click re-corners
    /// every element in the window; dialogs follow via the derived `radius_lg`.
    fn render_radius_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let current = f32::from(self.theme.radius);

        let presets = RADII.iter().map(|(label, value)| {
            let active = current == *value;
            Button::new(format!("radius-{label}"))
                .variant(if active {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Outline
                })
                .size(ButtonSize::Small)
                .label(format!("{label} · {}", *value as i32))
                .on_click(cx.listener(move |this, _, _, cx| {
                    this.theme.radius = px(*value);
                    this.theme.apply(cx);
                    cx.notify();
                }))
        });

        Card::new()
            .title("Radius")
            .description(
                "One knob, shadcn-style: theme.radius everywhere, dialogs/notifications \
                 follow on the derived +4px radius_lg.",
            )
            .child(
                v_flex()
                    .gap_3()
                    .child(h_flex().gap_2().children(presets))
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(format!(
                                "Applying radius {}px → radius_lg {}px. Watch the sidebar, buttons \
                         and inputs re-corner — the whole window reads cx.theme().",
                                current as i32,
                                f32::from(self.theme.radius + px(4.)) as i32,
                            )),
                    ),
            )
    }

    /// Accent presets: one `primary` override per mode, everything the token
    /// drives (ring, caret, links, selection, active rows…) follows.
    fn render_accent_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let mut swatches = Vec::with_capacity(ACCENTS.len());
        for (id, label, light, dark) in ACCENTS {
            swatches.push(self.accent_swatch(id, label, *light, *dark, cx));
        }

        Card::new()
            .title("Accent")
            .description(
                "Sets the `primary` token for light and dark; hover/active steps, ring, \
                 caret, links and selection re-derive from it. Pair with ⌘D to check both \
                 modes.",
            )
            .child(
                h_flex()
                    .flex_wrap()
                    .gap_4()
                    .children(swatches)
                    .child(div().flex_1())
                    .child(
                        Button::new("theme-reset")
                            .variant(ButtonVariant::Ghost)
                            .size(ButtonSize::Small)
                            .label("Reset to Celestia defaults")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.theme = AppTheme::default();
                                this.theme.apply(cx);
                                cx.notify();
                            })),
                    ),
            )
    }

    /// One swatch. Returns `AnyElement` (not `impl IntoElement`) so the
    /// loop in `render_accent_card` can borrow `cx` once per iteration —
    /// the edition-2024 RPIT capture rules would otherwise pin `cx` for the
    /// whole loop.
    fn accent_swatch(
        &self,
        id: &'static str,
        label: &'static str,
        light: u32,
        dark: u32,
        cx: &mut Context<Self>,
    ) -> AnyElement {
        let selected = self.accent_id() == id;
        let swatch_color = if cx.theme().is_dark() { dark } else { light };

        v_flex()
            .gap_1()
            .items_center()
            .w(px(56.))
            .child(
                div()
                    .id(format!("accent-{id}"))
                    .cursor_pointer()
                    .h_9()
                    .w_9()
                    .rounded_full()
                    .bg(rgb(swatch_color))
                    .border_2()
                    .border_color(if selected {
                        cx.theme().foreground
                    } else {
                        cx.theme().border
                    })
                    .hover(|style| style.border_color(cx.theme().foreground))
                    .on_click(cx.listener(move |this, _, _, cx| {
                        this.theme.light.primary = Some(hex(light));
                        this.theme.dark.primary = Some(hex(dark));
                        this.theme.apply(cx);
                        cx.notify();
                    })),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(if selected {
                        cx.theme().foreground
                    } else {
                        cx.theme().muted_foreground
                    })
                    .child(label),
            )
            .into_any_element()
    }

    /// Which accent preset (if any) the live config currently carries.
    /// `None` on the token means the Celestia default.
    fn accent_id(&self) -> &'static str {
        let Some(primary) = self.theme.light.primary else {
            return ACCENTS[0].0;
        };
        let rgba = gpui::Rgba::from(primary);
        let code = ((rgba.r * 255.0).round() as u32) << 16
            | ((rgba.g * 255.0).round() as u32) << 8
            | (rgba.b * 255.0).round() as u32;
        ACCENTS
            .iter()
            .find(|(_, _, light, _)| *light == code)
            .map(|(id, ..)| *id)
            .unwrap_or("custom")
    }
}

/// Static specimens that show the applied config at a glance — they take
/// every color and radius from `cx.theme()`, like the rest of the window.
impl Showcase {
    fn render_specimen_card(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        let buttons = h_flex().flex_wrap().gap_2().children([
            Button::new("th-btn-primary")
                .variant(ButtonVariant::Primary)
                .label("Primary"),
            Button::new("th-btn-secondary")
                .variant(ButtonVariant::Secondary)
                .label("Secondary"),
            Button::new("th-btn-outline")
                .variant(ButtonVariant::Outline)
                .label("Outline"),
            Button::new("th-btn-ghost")
                .variant(ButtonVariant::Ghost)
                .label("Ghost"),
            Button::new("th-btn-danger")
                .variant(ButtonVariant::Destructive)
                .label("Destructive"),
        ]);

        let badges = h_flex().flex_wrap().gap_2().children([
            Badge::new("Primary"),
            Badge::new("Secondary").variant(BadgeVariant::Secondary),
            Badge::new("Success").variant(BadgeVariant::Success),
            Badge::new("Warning").variant(BadgeVariant::Warning),
            Badge::new("Info").variant(BadgeVariant::Info),
            Badge::new("Destructive").variant(BadgeVariant::Destructive),
            Badge::new("Brand").variant(BadgeVariant::Brand),
        ]);

        let extras = h_flex()
            .flex_wrap()
            .items_center()
            .gap_3()
            .child(Input::new(&self.demo_input).cleanable(true))
            .child(Kbd::new(
                Keystroke::parse("cmd-d").expect("valid keystroke"),
            ))
            .child(
                Link::new("th-link")
                    .href("https://gpui.rs")
                    .child("gpui.rs"),
            );

        Card::new()
            .title("Live specimen")
            .description(
                "Everything below resolves colors and radii from cx.theme() at render time — \
                 the same path the config drives. Nothing here changed when AppTheme shipped.",
            )
            .child(v_flex().gap_4().child(buttons).child(badges).child(extras))
    }
}
