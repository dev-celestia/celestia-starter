//! The minimap's scanner: one pass over the buffer, turned into runs of ink.
//!
//! This is deliberately parser-free. The editor's own tree-sitter highlighter
//! is private to the input state, so the overview reads the text itself and
//! classifies it with a small heuristic lexer — enough to tell a comment block
//! from a string literal from a wall of identifiers, which is all a 68px strip
//! can show anyway. The colours those classes paint in come from the real
//! highlight theme (see the parent module).

use gpui_component::input::{Rope, RopeExt};

const MAX_COLS: u16 = 260;
const TAB_COLS: u16 = 4;

/// The ink classes the overview distinguishes. Each maps to one colour.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
#[repr(u8)]
pub(super) enum Ink {
    /// Identifiers and other plain words.
    #[default]
    Text = 0,
    Comment,
    /// String and char literals.
    Str,
    Number,
    Keyword,
    /// Identifiers immediately followed by `(`.
    Function,
    /// Identifiers that start with an upper-case letter.
    Type,
    /// Brackets, operators and other glue.
    Punct,
}

pub(super) const INK_COUNT: usize = 8;

/// One horizontal run of same-class ink on a line, in source columns.
#[derive(Clone, Copy, Debug, Default)]
pub(super) struct MinimapRun {
    pub(super) start: u16,
    pub(super) len: u16,
    pub(super) ink: Ink,
}

/// Where one source line's runs live in the shared run arena.
#[derive(Clone, Copy, Debug, Default)]
pub(super) struct MinimapLine {
    first: u32,
    count: u16,
    /// Inked columns on this line — used to pick the densest line of a band.
    pub(super) ink: u16,
}

/// A scanned copy of the buffer, cheap to paint from.
///
/// Rebuilt on a debounced background task after edits (see [`super::CodeEditor`]),
/// so typing never pays for it.
#[derive(Default)]
pub(crate) struct MinimapSnapshot {
    runs: Vec<MinimapRun>,
    lines: Vec<MinimapLine>,
    max_cols: u16,
}

impl MinimapSnapshot {
    /// Scan `rope` into ink runs, one pass over the text.
    pub(crate) fn build(rope: &Rope) -> Self {
        let mut snapshot = Self::default();
        snapshot.rebuild(rope);
        snapshot
    }

    pub(crate) fn rebuild(&mut self, rope: &Rope) {
        let line_count = rope.lines_len().max(1);
        self.runs.clear();
        self.lines.clear();
        self.lines.reserve(line_count);

        let mut scan = ScanState::default();
        let mut chars: Vec<char> = Vec::new();
        let mut max_cols = 1u16;

        for row in 0..line_count {
            chars.clear();
            chars.extend(rope.slice_line(row).chars());

            let first = self.runs.len() as u32;
            let cols = scan_line(&chars, &mut scan, &mut self.runs);
            let count = (self.runs.len() as u32 - first) as u16;
            let ink = self.runs[first as usize..first as usize + count as usize]
                .iter()
                .map(|run| run.len)
                .sum::<u16>();

            self.lines.push(MinimapLine { first, count, ink });
            max_cols = max_cols.max(cols);
        }

        self.max_cols = max_cols;
    }

    pub(crate) fn line_count(&self) -> usize {
        self.lines.len().max(1)
    }

    pub(super) fn max_cols(&self) -> u16 {
        self.max_cols.max(1)
    }

    pub(super) fn line(&self, row: usize) -> Option<&MinimapLine> {
        self.lines.get(row)
    }

    pub(super) fn runs(&self, line: &MinimapLine) -> &[MinimapRun] {
        let start = line.first as usize;
        &self.runs[start..start + line.count as usize]
    }

    /// The most inked line in `start..end` — the one worth showing when a
    /// whole band of lines has to collapse into a single pixel row.
    pub(super) fn densest(&self, start: usize, end: usize) -> usize {
        let mut best = start;
        let mut best_ink = 0;
        for row in start..end.min(self.lines.len()) {
            let ink = self.lines[row].ink;
            if ink > best_ink {
                best_ink = ink;
                best = row;
            }
        }
        best
    }
}

/// Scanner state that survives from one line to the next.
#[derive(Default)]
struct ScanState {
    /// Inside a `/* … */` block comment.
    block: bool,
    /// An unterminated multi-line string: the delimiter and its length.
    quote: Option<(char, u8)>,
}

/// Scan one line into ink runs, returning the last column it reached.
fn scan_line(chars: &[char], st: &mut ScanState, out: &mut Vec<MinimapRun>) -> u16 {
    let n = chars.len();
    let mut i = 0usize;
    let mut col = 0u16;
    let mut cur: Option<MinimapRun> = None;

    while i < n && col < MAX_COLS {
        // A token carried over from the previous line.
        if st.block {
            let start = col;
            let mut j = i;
            let mut closed = false;
            while j + 1 < n {
                if chars[j] == '*' && chars[j + 1] == '/' {
                    j += 2;
                    closed = true;
                    break;
                }
                j += 1;
            }
            if !closed {
                j = n;
            }
            let len = clamp_cols(j - i);
            push_run(out, &mut cur, Ink::Comment, start, len);
            col = col.saturating_add(len);
            i = j;
            st.block = !closed;
            continue;
        }
        if let Some((quote, quote_len)) = st.quote {
            let start = col;
            let (j, closed) = find_delim(chars, i, quote, quote_len as usize);
            let len = clamp_cols(j - i);
            push_run(out, &mut cur, Ink::Str, start, len);
            col = col.saturating_add(len);
            i = j;
            if closed {
                st.quote = None;
            }
            continue;
        }

        let c = chars[i];
        match c {
            '\n' | '\r' => break,
            ' ' => {
                col += 1;
                i += 1;
                continue;
            }
            '\t' => {
                col = (col / TAB_COLS + 1) * TAB_COLS;
                i += 1;
                continue;
            }
            _ => {}
        }

        // `//` and `--` run to the end of the line.
        if (c == '/' && chars.get(i + 1) == Some(&'/'))
            || (c == '-' && chars.get(i + 1) == Some(&'-'))
        {
            let len = clamp_cols(n - i);
            push_run(out, &mut cur, Ink::Comment, col, len);
            break;
        }

        // `#` is a comment almost everywhere; `#[…]` is a Rust attribute and
        // keeps its punctuation ink.
        if c == '#' {
            if chars.get(i + 1) == Some(&'[') {
                push_run(out, &mut cur, Ink::Punct, col, 1);
                col += 1;
                i += 1;
                continue;
            }
            let len = clamp_cols(n - i);
            push_run(out, &mut cur, Ink::Comment, col, len);
            break;
        }

        if c == '/' && chars.get(i + 1) == Some(&'*') {
            push_run(out, &mut cur, Ink::Comment, col, 2);
            col += 2;
            i += 2;
            st.block = true;
            continue;
        }

        if c == '"' || c == '\'' || c == '`' {
            let triple = c != '`' && chars.get(i + 1) == Some(&c) && chars.get(i + 2) == Some(&c);
            // A lone `'` is a lifetime far more often than a string.
            if c == '\'' && !triple && !looks_like_char_literal(chars, i) {
                push_run(out, &mut cur, Ink::Punct, col, 1);
                col += 1;
                i += 1;
                continue;
            }
            let quote_len = if triple { 3 } else { 1 };
            let start = col;
            let (j, closed) = find_delim(chars, i, c, quote_len);
            let len = clamp_cols(j - i);
            push_run(out, &mut cur, Ink::Str, start, len);
            col = col.saturating_add(len);
            i = j;
            if !closed && (c == '`' || triple) {
                st.quote = Some((c, quote_len as u8));
            }
            continue;
        }

        if c.is_ascii_digit() {
            let start = i;
            let mut j = i + 1;
            while j < n && (chars[j].is_ascii_alphanumeric() || chars[j] == '.' || chars[j] == '_')
            {
                j += 1;
            }
            let len = clamp_cols(j - start);
            push_run(out, &mut cur, Ink::Number, col, len);
            col = col.saturating_add(len);
            i = j;
            continue;
        }

        if is_word_start(c) {
            let start = i;
            let mut j = i + 1;
            while j < n && is_word_char(chars[j]) {
                j += 1;
            }
            let ink = classify(chars, start, j);
            let len = clamp_cols(j - start);
            push_run(out, &mut cur, ink, col, len);
            col = col.saturating_add(len);
            i = j;
            continue;
        }

        push_run(out, &mut cur, Ink::Punct, col, 1);
        col += 1;
        i += 1;
    }

    if let Some(run) = cur {
        out.push(run);
    }
    col
}

/// Append a run, merging it into `cur` when it continues the same ink.
fn push_run(
    out: &mut Vec<MinimapRun>,
    cur: &mut Option<MinimapRun>,
    ink: Ink,
    start: u16,
    len: u16,
) {
    if len == 0 {
        return;
    }
    if let Some(run) = cur.as_mut() {
        if run.ink == ink && run.start + run.len == start {
            run.len += len;
            return;
        }
    }
    if let Some(run) = cur.take() {
        out.push(run);
    }
    *cur = Some(MinimapRun { start, len, ink });
}

fn clamp_cols(len: usize) -> u16 {
    len.min(MAX_COLS as usize) as u16
}

/// Index just past the closing delimiter starting at `from`, plus whether it
/// was found. Stops at the end of the line.
fn find_delim(chars: &[char], from: usize, quote: char, quote_len: usize) -> (usize, bool) {
    let n = chars.len();
    let mut j = from + quote_len;
    while j < n {
        let c = chars[j];
        if c == '\\' {
            j += 2;
            continue;
        }
        if c == '\n' || c == '\r' {
            return (j, false);
        }
        if c == quote {
            if quote_len == 3 {
                if chars.get(j + 1) == Some(&quote) && chars.get(j + 2) == Some(&quote) {
                    return (j + 3, true);
                }
                j += 1;
                continue;
            }
            return (j + 1, true);
        }
        j += 1;
    }
    (n, false)
}

fn looks_like_char_literal(chars: &[char], i: usize) -> bool {
    match chars.get(i + 1) {
        Some('\\') => chars.get(i + 3) == Some(&'\''),
        Some(_) => chars.get(i + 2) == Some(&'\''),
        None => false,
    }
}

fn is_word_start(c: char) -> bool {
    c.is_alphabetic() || c == '_'
}

fn is_word_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_'
}

/// Decide how a word should read in the overview.
fn classify(chars: &[char], start: usize, end: usize) -> Ink {
    let len = end - start;
    if len <= 16 {
        let mut buf = [0u8; 16];
        let mut ascii = true;
        for (slot, ch) in chars[start..end].iter().enumerate() {
            let code = *ch as u32;
            if code > 0x7f {
                ascii = false;
                break;
            }
            buf[slot] = code as u8;
        }
        if ascii {
            // Safe to unwrap: every byte written above is ASCII.
            let word = std::str::from_utf8(&buf[..len]).unwrap_or_default();
            if KEYWORDS.binary_search(&word).is_ok() {
                return Ink::Keyword;
            }
        }
    }

    // `name(` reads as a call; capitalised words read as types.
    let mut next = end;
    while next < chars.len() && chars[next] == ' ' {
        next += 1;
    }
    if next < chars.len() && chars[next] == '(' {
        return Ink::Function;
    }
    if chars[start].is_uppercase() {
        return Ink::Type;
    }
    Ink::Text
}

/// Keywords worth distinguishing at minimap scale. Sorted — the lookup is a
/// binary search, and the test below keeps it that way.
const KEYWORDS: &[&str] = &[
    "abstract",
    "and",
    "as",
    "async",
    "await",
    "begin",
    "bool",
    "break",
    "case",
    "catch",
    "chan",
    "char",
    "class",
    "const",
    "continue",
    "crate",
    "def",
    "default",
    "defer",
    "do",
    "dyn",
    "elif",
    "else",
    "end",
    "enum",
    "except",
    "export",
    "extends",
    "extern",
    "false",
    "final",
    "finally",
    "float",
    "fn",
    "for",
    "from",
    "func",
    "function",
    "go",
    "goto",
    "if",
    "impl",
    "implements",
    "import",
    "in",
    "instanceof",
    "int",
    "interface",
    "is",
    "lambda",
    "let",
    "local",
    "loop",
    "map",
    "match",
    "mod",
    "move",
    "mut",
    "namespace",
    "new",
    "nil",
    "none",
    "nonlocal",
    "not",
    "null",
    "or",
    "package",
    "pass",
    "private",
    "protected",
    "pub",
    "public",
    "raise",
    "range",
    "ref",
    "return",
    "select",
    "self",
    "static",
    "struct",
    "super",
    "switch",
    "then",
    "this",
    "throw",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsigned",
    "use",
    "var",
    "virtual",
    "void",
    "volatile",
    "when",
    "where",
    "while",
    "with",
    "yield",
];


#[cfg(test)]
mod tests {
    use super::*;

    fn snapshot(text: &str) -> MinimapSnapshot {
        MinimapSnapshot::build(&Rope::from(text))
    }

    fn inks(snap: &MinimapSnapshot, row: usize) -> Vec<(u16, u16, Ink)> {
        snap.runs(snap.line(row).expect("line in range"))
            .iter()
            .map(|run| (run.start, run.len, run.ink))
            .collect()
    }

    #[test]
    fn keywords_are_sorted_and_unique() {
        assert!(
            KEYWORDS.windows(2).all(|pair| pair[0] < pair[1]),
            "KEYWORDS must stay sorted for the binary search lookup"
        );
    }

    #[test]
    fn a_rust_line_is_split_into_ink_runs() {
        let snap = snapshot("fn main() { // hi\n");
        let runs = inks(&snap, 0);

        assert!(
            runs.contains(&(0, 2, Ink::Keyword)),
            "fn is a keyword: {runs:?}"
        );
        assert!(
            runs.contains(&(3, 4, Ink::Function)),
            "main( is a call: {runs:?}"
        );
        assert!(
            runs.iter().any(|(_, _, ink)| *ink == Ink::Comment),
            "trailing comment is ink: {runs:?}"
        );
    }

    #[test]
    fn strings_numbers_and_indentation_survive_the_scan() {
        let snap = snapshot("    let name = \"hex\";\n    let port = 8080;\n");

        let first = inks(&snap, 0);
        assert_eq!(
            first[0].0, 4,
            "indentation offsets the first run: {first:?}"
        );
        assert!(
            first.iter().any(|(_, _, ink)| *ink == Ink::Str),
            "string literal is ink: {first:?}"
        );
        assert!(
            inks(&snap, 1).iter().any(|(_, _, ink)| *ink == Ink::Number),
            "number literal is ink"
        );
    }

    #[test]
    fn block_comments_carry_across_lines() {
        let snap = snapshot("/* start\nstill comment\n*/ done\n");
        for row in 0..3 {
            assert!(
                inks(&snap, row)
                    .iter()
                    .any(|(_, _, ink)| *ink == Ink::Comment),
                "row {row} should be comment ink"
            );
        }
    }

    #[test]
    fn a_lifetime_is_not_a_string() {
        let snap = snapshot("fn f<'a>(x: &'a str) {}\n");
        assert!(
            !inks(&snap, 0).iter().any(|(_, _, ink)| *ink == Ink::Str),
            "lifetimes must not read as string ink"
        );
    }

    #[test]
    fn blank_lines_carry_no_ink() {
        let snap = snapshot("fn a() {}\n\n   \nfn b() {}\n");
        assert_eq!(snap.line_count(), 4);
        assert_eq!(snap.line(1).unwrap().ink, 0);
        assert_eq!(snap.line(2).unwrap().ink, 0);
        assert!(snap.line(3).unwrap().ink > 0);
    }

    #[test]
    fn the_densest_line_of_a_band_wins() {
        let snap = snapshot("a\nbb\ncccccccccc\nd\n");
        assert_eq!(snap.densest(0, 4), 2);
    }

    #[test]
    fn long_lines_are_clipped_to_the_tracked_columns() {
        let long = "x".repeat(4000);
        let snap = snapshot(&format!("{long}\n"));
        assert!(snap.max_cols() <= MAX_COLS);
    }
}
