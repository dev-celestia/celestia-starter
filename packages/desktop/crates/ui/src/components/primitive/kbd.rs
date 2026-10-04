//! Keyboard key hints — the desktop counterpart of
//! `packages/ui/src/components/primitive/kbd.tsx`.
//!
//! Written directly on `gpui`. [`Kbd::format`] is the platform key-cap
//! renderer: macOS uses the `⌃⌥⇧⌘` glyph run with no separator, every other
//! platform spells the modifiers out joined with `+` — the same convention the
//! framework uses in its own menus, so a hint never disagrees with the
//! shortcut that actually fires.
//!
//! The three `binding_for_*` constructors resolve a live [`KeyBinding`] out of
//! the window, so a hint can be derived from the registered action instead of
//! being repeated as a string at the call site.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    Action, App, AsKeystroke, FocusHandle, Half, InteractiveElement as _, IntoElement, KeyBinding,
    KeyContext, Keystroke, ParentElement as _, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// A key cap for displaying a keyboard shortcut.
#[derive(Clone, Debug, IntoElement)]
pub struct Kbd {
    style: StyleRefinement,
    stroke: Keystroke,
    appearance: bool,
    outline: bool,
}

impl From<Keystroke> for Kbd {
    fn from(stroke: Keystroke) -> Self {
        Self::new(stroke)
    }
}

impl Kbd {
    /// A key cap for `stroke`.
    pub fn new(stroke: Keystroke) -> Self {
        Self {
            style: StyleRefinement::default(),
            stroke,
            appearance: true,
            outline: false,
        }
    }

    /// Render the shortcut as bare text instead of a key cap.
    pub fn appearance(mut self, appearance: bool) -> Self {
        self.appearance = appearance;
        self
    }

    /// Draw the cap with a border and a background fill.
    pub fn outline(mut self) -> Self {
        self.outline = true;
        self
    }

    /// The highest-precedence binding for `action`, optionally scoped to a key
    /// context.
    pub fn binding_for_action(
        action: &dyn Action,
        context: Option<&str>,
        window: &Window,
    ) -> Option<Self> {
        let key_context = context.and_then(|context| KeyContext::parse(context).ok());
        let binding = match key_context {
            Some(context) => {
                window.highest_precedence_binding_for_action_in_context(action, context)
            }
            None => window.highest_precedence_binding_for_action(action),
        }?;

        Self::from_binding(&binding)
    }

    /// The highest-precedence binding for `action` within `focus_handle`.
    ///
    /// The framework resolves the handle against the previously rendered frame,
    /// so this finds nothing for a handle whose element is first drawn in the
    /// current frame.
    pub fn binding_for_action_in(
        action: &dyn Action,
        focus_handle: &FocusHandle,
        window: &Window,
    ) -> Option<Self> {
        let binding = window.highest_precedence_binding_for_action_in(action, focus_handle)?;
        Self::from_binding(&binding)
    }

    /// The highest-precedence binding for `action` registered without a key
    /// context, so it applies wherever focus happens to be.
    pub fn global_binding_for_action(action: &dyn Action, window: &Window) -> Option<Self> {
        let binding = window
            .highest_precedence_binding_for_action_in_context(action, KeyContext::default())?;
        Self::from_binding(&binding)
    }

    fn from_binding(binding: &KeyBinding) -> Option<Self> {
        let key = binding.keystrokes().first()?;
        Some(Self::new(key.as_keystroke().clone()))
    }

    /// Format `key` for the running platform.
    ///
    /// macOS: `⌃⌥⇧⌘` in that order, no separator. Windows/Linux:
    /// `Ctrl+Alt+Shift+Win`, joined with `+`.
    pub fn format(key: &Keystroke) -> String {
        #[cfg(target_os = "macos")]
        const SEPARATOR: &str = "";
        #[cfg(not(target_os = "macos"))]
        const SEPARATOR: &str = "+";

        let mut parts: Vec<&str> = vec![];

        if key.modifiers.control {
            #[cfg(target_os = "macos")]
            parts.push("⌃");
            #[cfg(not(target_os = "macos"))]
            parts.push("Ctrl");
        }
        if key.modifiers.alt {
            #[cfg(target_os = "macos")]
            parts.push("⌥");
            #[cfg(not(target_os = "macos"))]
            parts.push("Alt");
        }
        if key.modifiers.shift {
            #[cfg(target_os = "macos")]
            parts.push("⇧");
            #[cfg(not(target_os = "macos"))]
            parts.push("Shift");
        }
        if key.modifiers.platform {
            #[cfg(target_os = "macos")]
            parts.push("⌘");
            #[cfg(not(target_os = "macos"))]
            parts.push("Win");
        }

        let mut keys = String::new();
        let key_str = key.key.as_str();
        match key_str {
            #[cfg(target_os = "macos")]
            "ctrl" => keys.push('⌃'),
            #[cfg(not(target_os = "macos"))]
            "ctrl" => keys.push_str("Ctrl"),
            #[cfg(target_os = "macos")]
            "alt" => keys.push('⌥'),
            #[cfg(not(target_os = "macos"))]
            "alt" => keys.push_str("Alt"),
            #[cfg(target_os = "macos")]
            "shift" => keys.push('⇧'),
            #[cfg(not(target_os = "macos"))]
            "shift" => keys.push_str("Shift"),
            #[cfg(target_os = "macos")]
            "cmd" => keys.push('⌘'),
            #[cfg(not(target_os = "macos"))]
            "cmd" => keys.push_str("Win"),
            "space" => keys.push_str("Space"),
            #[cfg(target_os = "macos")]
            "backspace" | "delete" => keys.push('⌫'),
            #[cfg(not(target_os = "macos"))]
            "backspace" => keys.push_str("Backspace"),
            #[cfg(not(target_os = "macos"))]
            "delete" => keys.push_str("Delete"),
            #[cfg(target_os = "macos")]
            "escape" => keys.push('⎋'),
            #[cfg(not(target_os = "macos"))]
            "escape" => keys.push_str("Esc"),
            #[cfg(target_os = "macos")]
            "enter" => keys.push('⏎'),
            #[cfg(not(target_os = "macos"))]
            "enter" => keys.push_str("Enter"),
            "pagedown" => keys.push_str("Page Down"),
            "pageup" => keys.push_str("Page Up"),
            #[cfg(target_os = "macos")]
            "left" => keys.push('←'),
            #[cfg(not(target_os = "macos"))]
            "left" => keys.push_str("Left"),
            #[cfg(target_os = "macos")]
            "right" => keys.push('→'),
            #[cfg(not(target_os = "macos"))]
            "right" => keys.push_str("Right"),
            #[cfg(target_os = "macos")]
            "up" => keys.push('↑'),
            #[cfg(not(target_os = "macos"))]
            "up" => keys.push_str("Up"),
            #[cfg(target_os = "macos")]
            "down" => keys.push('↓'),
            #[cfg(not(target_os = "macos"))]
            "down" => keys.push_str("Down"),
            _ => match key_str.chars().next() {
                Some(first) => {
                    keys.extend(first.to_uppercase());
                    keys.push_str(&key_str[first.len_utf8()..]);
                }
                None => keys.push_str(key_str),
            },
        }

        parts.push(&keys);
        parts.join(SEPARATOR)
    }
}

impl Styled for Kbd {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Kbd {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        if !self.appearance {
            return Self::format(&self.stroke).into_any_element();
        }

        // Lets a test ask whether a given shortcut hint was painted this frame;
        // a no-op outside test-support builds.
        let debug_label = format!("kbd:{}", self.stroke.unparse());

        let mut root = div()
            .debug_selector(move || debug_label)
            .text_color(cx.theme().muted_foreground)
            .bg(cx.theme().tokens.muted)
            .when(self.outline, |this| {
                this.border_1()
                    .border_color(cx.theme().border)
                    .bg(cx.theme().tokens.background)
            })
            .py(px(2.0))
            .px(px(4.0))
            .min_w(px(20.0))
            .text_center()
            .rounded(cx.theme().radius.half())
            .line_height(relative(1.0))
            .text_size(px(12.0))
            .whitespace_normal()
            .flex_shrink_0();
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.child(Self::format(&self.stroke)).into_any_element()
    }
}

#[cfg(test)]
mod tests {
    use gpui::Keystroke;

    use super::Kbd;

    /// Pins the platform key-cap rendering, including modifier ordering — on
    /// macOS the glyph run is always `⌃⌥⇧⌘`, never the order the user typed.
    #[test]
    fn format_matches_the_platform_convention() {
        if cfg!(target_os = "macos") {
            assert_eq!(Kbd::format(&Keystroke::parse("cmd-a").unwrap()), "⌘A");
            assert_eq!(Kbd::format(&Keystroke::parse("cmd-enter").unwrap()), "⌘⏎");
            assert_eq!(
                Kbd::format(&Keystroke::parse("shift-pagedown").unwrap()),
                "⇧Page Down"
            );
            assert_eq!(Kbd::format(&Keystroke::parse("cmd-ctrl-a").unwrap()), "⌃⌘A");
            assert_eq!(
                Kbd::format(&Keystroke::parse("cmd-ctrl-shift-alt-a").unwrap()),
                "⌃⌥⇧⌘A"
            );
        } else {
            assert_eq!(Kbd::format(&Keystroke::parse("a").unwrap()), "A");
            assert_eq!(Kbd::format(&Keystroke::parse("ctrl-a").unwrap()), "Ctrl+A");
            assert_eq!(
                Kbd::format(&Keystroke::parse("ctrl-alt-shift-win-a").unwrap()),
                "Ctrl+Alt+Shift+Win+A"
            );
        }
    }

    /// A bare letter is upper-cased; a named key keeps its spelling.
    #[test]
    fn single_letters_upper_case_named_keys_do_not() {
        assert_eq!(
            Kbd::format(&Keystroke::parse("secondary-f12").unwrap()),
            if cfg!(target_os = "macos") {
                "⌘F12"
            } else {
                "Win+F12"
            }
        );
    }
}
