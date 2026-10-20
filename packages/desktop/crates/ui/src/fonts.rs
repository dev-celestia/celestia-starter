//! Geist, the default UI face.
//!
//! Static instances of the variable font published at
//! <https://fonts.google.com/specimen/Geist> (SIL Open Font License — see
//! `assets/fonts/OFL.txt`). They are embedded so a machine that does not have
//! Geist installed still draws it. Every file shares the family name `Geist`;
//! weight and italic live on the face, which is how GPUI matches
//! [`gpui::FontWeight`].

use std::borrow::Cow;

use gpui::App;

/// Family name of the embedded default UI font.
pub const DEFAULT_FONT_FAMILY: &str = "Geist";

const FACES: &[&[u8]] = &[
    include_bytes!("../assets/fonts/Geist-Regular.ttf"),
    include_bytes!("../assets/fonts/Geist-Medium.ttf"),
    include_bytes!("../assets/fonts/Geist-SemiBold.ttf"),
    include_bytes!("../assets/fonts/Geist-Bold.ttf"),
    include_bytes!("../assets/fonts/Geist-Italic.ttf"),
];

/// Register the embedded faces with the text system. Call before any window
/// lays out text.
pub(crate) fn install(cx: &App) {
    let fonts = FACES.iter().copied().map(Cow::Borrowed).collect();
    cx.text_system()
        .add_fonts(fonts)
        .expect("embedded Geist faces must load");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn each_face_is_a_truetype_font() {
        for face in FACES {
            assert!(face.len() > 12);
            assert_eq!(&face[..4], b"\x00\x01\x00\x00", "expected a TTF");
        }
    }

    #[test]
    fn default_family_is_geist() {
        assert_eq!(DEFAULT_FONT_FAMILY, "Geist");
    }
}
