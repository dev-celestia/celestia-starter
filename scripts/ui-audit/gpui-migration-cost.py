#!/usr/bin/env python3
"""Rank the remaining gpui-component shims by migration cost.

Why this exists
---------------
`crates/ui/src/components/**` is being migrated onto raw `gpui`. A file is either
a **wrapper** (owns its types, already migrated) or a **shim** (`pub use
gpui_component::X::*;`). Choosing the next family by *file size* is wrong, and so
is choosing it by *closure size* alone. Two axes decide it:

  1. **What the closure drags in.** The deciding question is whether it reaches a
     **`gpui-base` component** — something that has to be reimplemented rather
     than inlined. `gpui-base` is not a helper crate: it is the *inner component
     library* (Accordion, Checkbox, Popover, Input, Slider, Resizable, Tree,
     Table, Tabs, VirtualList, motion, text, …) and `gpui-component` is a thin
     styling layer over it (`gpui-component/src/checkbox.rs` literally holds
     `base: gpui_base::Checkbox`). Pure style helpers re-exported from
     `gpui-base` (`h_flex`, `v_flex`, `StyledExt`, `RoleOverride`,
     `FocusableExt`, `box_shadow`, `AxisExt`, …) are free to inline and are
     excluded — see `FREE_GPUI_BASE`.

  2. **Who else imports it.** A target imported by ten other shims cannot move
     alone.

Traps this script exists to avoid
---------------------------------
Each of these silently produced a *wrong cheap verdict* before it was fixed:

* **Brace lists.** `use gpui_base::{Accordion, AccordionTrigger, spring};` is how
  almost every upstream file imports from the base crate. A parser that takes
  only the text before `{` sees an empty head and drops the edge — `accordion`
  scored a **0-coupling** verdict while importing four base components. Brace
  groups must be expanded.
* **Case-insensitive filesystems.** `Path.is_file()` returns true for `Icon.rs`
  on macOS even though only `icon.rs` exists, so a *type* named `Icon` resolved
  to the wrong module. Resolved names are compared case-sensitively.
* **A module name that resolves to no file is a red flag, not a cheap target.**
  `gpui_component::calendar` / `date_picker` are `pub use time::{…}` and
  `resizable` is an inline `pub mod` over `gpui-base`; all three used to report a
  0-module closure. Re-exports are followed, and an unresolved target is reported
  rather than scored as free.
* **A facade module can be a directory.** Scan every file under it, not just
  `mod.rs` (`button/` is a directory).
* **BSD grep has no BRE `\\|`.** A silently-empty grep reads as "nothing to
  report" — hence Python, not shell.

Usage
-----
    python3 scripts/ui-audit/gpui-migration-cost.py              # ranked table
    python3 scripts/ui-audit/gpui-migration-cost.py --detail X    # one target
    python3 scripts/ui-audit/gpui-migration-cost.py --ours composite/tree.rs
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import deque
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
OUR_DIR = REPO / "packages/desktop/crates/ui/src/components"

# Pure style/geometry helpers re-exported from gpui-base. Free to inline: they
# are functions over `StyleRefinement`, not components.
FREE_GPUI_BASE = {
    "FocusableExt",
    "RoleOverride",
    "StyledExt",
    "box_shadow",
    "h_flex",
    "v_flex",
    "AxisExt",
    "LengthExt",
    "Edges",
    "Placement",
    "Side",
    "Measure",
    "measure",
    "measure_if",
    "InteractiveElementExt",
    "OngoingScrollExt",
    "FocusTrapElement",
    "animation",
    "AutoScroll",
    "ElementExt",
    "StateStyle",
    "styled_ext_reflection_methods",
    "style_helpers",
    "geometry",
    "actions",
    "async_util",
    "test_support",
    "theme_tokens",
    "apply_system_reduce_motion",
    "measurement_enabled",
    "install_window_hit_test_forwarder",
}

# Modules that only shape style, even though they live in gpui-base.
FREE_GPUI_BASE_MODULES = {"styled", "sizing", "component_traits", "theme"}

DECL_RE = re.compile(r"^\s*pub (struct|enum) ", re.M)
ENTITY_RE = re.compile(r"\b(Entity<|WeakEntity<|Context<Self>|use_keyed_state)")


def registry_dir() -> Path:
    root = Path.home() / ".cargo/registry/src"
    for cand in sorted(root.iterdir()):
        if (cand / "gpui-component-0.6.6/src").is_dir():
            return cand
    sys.exit("could not locate gpui-component-0.6.6 in the cargo registry")


REG = registry_dir()
UP = REG / "gpui-component-0.6.6/src"
GB = REG / "gpui-base-0.6.6/src"

USE_RE = re.compile(r"(?:pub(?:\s*\([^)]*\))?\s+)?use\b")
VIS_RE = re.compile(r"^(pub(?:\s*\([^)]*\))?\s+)?use\s+")

_TEXT: dict[Path, str] = {}
_MODULE: dict[tuple[Path, str], tuple[Path, ...]] = {}
_DEPS: dict[Path, frozenset[tuple[str, str]]] = {}


def read_text(path: Path) -> str:
    if path not in _TEXT:
        try:
            _TEXT[path] = path.read_text(errors="ignore")
        except OSError:
            _TEXT[path] = ""
    return _TEXT[path]


def strip_use_spans(text: str) -> list[str]:
    """Every `use …;` statement, newlines collapsed, `pub use` prefix intact."""
    out, i = [], 0
    while True:
        m = USE_RE.search(text, i)
        if not m:
            return out
        end = text.find(";", m.end())
        if end == -1:
            return out
        out.append(" ".join(text[m.start() : end].split()))
        i = end + 1


def use_parts(stmt: str) -> tuple[bool, str]:
    m = VIS_RE.match(stmt)
    return (False, stmt) if not m else (m.group(1) is not None, stmt[m.end() :])


def _split_top(inner: str, head: str) -> list[str]:
    parts, depth, buf = [], 0, ""
    for ch in inner:
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(buf)
            buf = ""
        else:
            buf += ch
    parts.append(buf)

    out: list[str] = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if "{" in p:
            sub_head, sub_inner = p.split("{", 1)
            out.extend(_split_top(sub_inner.rsplit("}", 1)[0], head + sub_head))
        else:
            out.append(head + p)
    return out


def expand_braces(body: str) -> list[str]:
    """`a::{b, c::{d, e}, f}` -> `a::b`, `a::c::d`, `a::c::e`, `a::f`.

    Brace groups are how upstream imports from `gpui_base`, so dropping them
    silently loses every component edge.
    """
    out: list[str] = []
    buf, stack = "", []
    for ch in body:
        if ch == "{":
            stack.append(buf)
            buf = ""
        elif ch == "}":
            head = stack.pop() if stack else ""
            out.extend(_split_top(buf, head))
            buf = ""
        elif ch == "," and not stack:
            if buf.strip():
                out.append(buf.strip())
            buf = ""
        else:
            buf += ch
    if buf.strip():
        out.append(buf.strip())
    return [p for p in (x.strip().rstrip(",") for x in out) if p]


def _case_exact(p: Path) -> bool:
    """Guard against case-insensitive filesystems resolving `Icon.rs` -> `icon.rs`."""
    try:
        return p.name in {c.name for c in p.parent.iterdir()}
    except OSError:
        return False


def _module_root(f: Path, root: Path) -> Path:
    """The module root for a declaration found at `f`.

    A declaration inside a directory module (`button/button.rs`) belongs to
    `button/mod.rs`, whose sibling files are part of the same module.
    """
    if f.name != "mod.rs" and f.parent != root and (f.parent / "mod.rs").is_file():
        return f.parent / "mod.rs"
    return f


def module_files(root: Path, name: str, _seen: frozenset[str] = frozenset()) -> tuple[Path, ...]:
    """Resolve a module *or* type name to its module root file(s) in `root`."""
    key = (root, name)
    if key in _MODULE:
        return _MODULE[key]
    if name in _seen:
        return ()
    seen = _seen | {name}

    for p in (root / f"{name}.rs", root / name / "mod.rs"):
        if p.is_file() and _case_exact(p):
            _MODULE[key] = (p,)
            return _MODULE[key]

    # `pub use <other>::…` alias chains (`pub use time::{calendar, date_picker}`).
    for src in sorted(root.glob("*.rs")):
        for stmt in strip_use_spans(read_text(src)):
            is_pub, body = use_parts(stmt)
            if not is_pub or name not in body:
                continue
            for path in expand_braces(body):
                segs = path.split("::")
                if len(segs) < 2 or segs[-1].split(" as ")[0].strip() != name:
                    continue
                hop = module_files(root, segs[0], seen)
                if hop:
                    _MODULE[key] = hop
                    return hop

    # A re-exported *type* (`pub use gpui_component::TitleBar`). Only worth
    # trying for type-shaped names: a snake_case name is a module path, and a
    # crate-wide declaration scan for it happily matches `pub fn theme` in an
    # unrelated file and drags in the wrong subtree.
    if not name[:1].isupper():
        _MODULE[key] = ()
        return ()
    pat = re.compile(rf"^\s*pub (struct|enum|type|fn|trait|const) {re.escape(name)}\b", re.M)
    for p in sorted(root.rglob("*.rs")):
        if pat.search(read_text(p)):
            _MODULE[key] = (_module_root(p, root),)
            return _MODULE[key]

    _MODULE[key] = ()
    return ()


def module_dirs(root: Path, name: str) -> list[Path]:
    """Every .rs file belonging to a module (a directory module has many)."""
    out: list[Path] = []
    for f in module_files(root, name):
        if f.name == "mod.rs":
            out.extend(sorted(p for p in f.parent.glob("*.rs")))
        else:
            out.append(f)
            if f.with_suffix("").is_dir():
                out.extend(sorted(f.with_suffix("").rglob("*.rs")))
    return out


def deps_of(path: Path, crate: str) -> frozenset[tuple[str, str]]:
    """(crate, name) pairs this file imports, within the two-crate graph."""
    if path in _DEPS:
        return _DEPS[path]
    out: set[tuple[str, str]] = set()
    for stmt in strip_use_spans(read_text(path)):
        _, body = use_parts(stmt)
        for prefix, tag in (
            ("gpui_component::", "gpui-component"),
            ("gpui_base::", "gpui-base"),
            ("crate::", crate),
            ("super::", crate),
        ):
            if not body.startswith(prefix):
                continue
            for path_expr in expand_braces(body[len(prefix) :]):
                segs = [s.split(" as ")[0].strip() for s in path_expr.split("::")]
                head = segs[0]
                if not head or head in {"prelude", "self", "*"}:
                    continue
                out.add((tag, path.parent.name if prefix == "super::" else head))
            break
    _DEPS[path] = frozenset(out)
    return _DEPS[path]


def closure(seed: tuple[str, str], max_files: int = 2000) -> set[Path]:
    seen: set[Path] = set()
    q = deque([seed])
    done: set[tuple[str, str]] = set()
    while q:
        node = q.popleft()
        if node in done:
            continue
        done.add(node)
        crate, name = node
        root = UP if crate == "gpui-component" else GB
        for f in module_dirs(root, name):
            if f in seen:
                continue
            seen.add(f)
            if len(seen) > max_files:
                return seen
            for dep in deps_of(f, crate):
                if dep[1] not in done:
                    q.append(dep)
    return seen


def classify(files: set[Path]) -> dict:
    """Split the closure into our-crate vs gpui-base, and helpers vs components."""
    up_lines = gb_lines = 0
    up_entity, gb_helpers, gb_components = [], set(), []
    for f in sorted(files):
        text = read_text(f)
        n = text.count("\n") + 1
        if GB in f.parents:
            gb_lines += n
            mod = f.parent.name if f.name in {"mod.rs", "lib.rs"} else f.stem
            if mod in FREE_GPUI_BASE_MODULES or mod in FREE_GPUI_BASE:
                gb_helpers.add(mod)
            elif DECL_RE.search(text):
                gb_components.append(f"{mod} ({n})")
            else:
                gb_helpers.add(mod)
        else:
            up_lines += n
            if ENTITY_RE.search(text):
                up_entity.append(f"{f.stem} ({n})")
    return {
        "up_lines": up_lines,
        "gb_lines": gb_lines,
        "up_entity": sorted(set(up_entity)),
        "gb_helpers": sorted(gb_helpers),
        "gb_components": sorted(set(gb_components)),
        "gb_component_names": {c.split(" (")[0] for c in gb_components},
        "files": len(files),
    }


def our_shims() -> dict[str, list[tuple[str, str]]]:
    out: dict[str, list[tuple[str, str]]] = {}
    for f in sorted(OUR_DIR.rglob("*.rs")):
        if f.name == "mod.rs":
            continue
        text = read_text(f)
        if re.search(r"^\s*(pub )?(struct|enum|fn|impl|trait|type|const) ", text, re.M):
            continue  # wrapper, already migrated
        targets = []
        for stmt in strip_use_spans(text):
            is_pub, body = use_parts(stmt)
            if not is_pub:
                continue
            for prefix, crate in (
                ("gpui_component::", "gpui-component"),
                ("gpui_base::", "gpui-base"),
            ):
                if body.startswith(prefix):
                    for path_expr in expand_braces(body[len(prefix) :]):
                        head = path_expr.split("::")[0].split(" as ")[0].strip()
                        if head and head != "*":
                            targets.append((crate, head))
        if targets:
            out[str(f.relative_to(OUR_DIR))] = sorted(set(targets))
    return out


def fan_in() -> dict[tuple[str, str], int]:
    counts: dict[tuple[str, str], int] = {}
    for f in OUR_DIR.rglob("*.rs"):
        for stmt in strip_use_spans(read_text(f)):
            _, body = use_parts(stmt)
            for prefix, crate in (
                ("gpui_component::", "gpui-component"),
                ("gpui_base::", "gpui-base"),
            ):
                if body.startswith(prefix):
                    for path_expr in expand_braces(body[len(prefix) :]):
                        head = path_expr.split("::")[0].split(" as ")[0].strip()
                        if head and head != "*":
                            counts[(crate, head)] = counts.get((crate, head), 0) + 1
    return counts


def direct_base_modules(targets: list[tuple[str, str]]) -> set[str]:
    """`gpui-base` modules the target's OWN files import — depth 1, no closure.

    This is the metric that actually ranks a target, and the one to read first.
    A closure total saturates (~45k lines for nearly every shim, because they all
    reach the same text/input/dialog infrastructure) *and* over-reaches: stepper's
    closure claims `markdown_ext`, `number_input` and `virtual_list`, which a
    stepper plainly does not use. Depth 1 cannot be inflated transitively.
    `title_bar` and `attachment` both score 0 here, and both port in one file.
    """
    out: set[str] = set()
    for crate, name in targets:
        root = UP if crate == "gpui-component" else GB
        for f in module_dirs(root, name):
            for stmt in strip_use_spans(read_text(f)):
                _, body = use_parts(stmt)
                if not body.startswith("gpui_base::"):
                    continue
                for path_expr in expand_braces(body[len("gpui_base::") :]):
                    head = path_expr.split("::")[0].split(" as ")[0].strip()
                    # A multi-line `use` can leave a fragment of a fn signature
                    # in a brace group; only real identifiers are module names.
                    if not head.isidentifier():
                        continue
                    if head in FREE_GPUI_BASE or head in FREE_GPUI_BASE_MODULES:
                        continue
                    out.add(head)
    return out


def report_one(ours: str, targets: list[tuple[str, str]], fan: dict) -> dict:
    files: set[Path] = set()
    unresolved = []
    for t in targets:
        if not module_files(UP if t[0] == "gpui-component" else GB, t[1]):
            unresolved.append(f"{t[0]}::{t[1]}")
            continue
        files |= closure(t)
    return {
        "ours": ours,
        "targets": targets,
        "unresolved": unresolved,
        "fan": max((fan.get(t, 0) for t in targets), default=0),
        "gb1": sorted(direct_base_modules(targets)),
        **classify(files),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--detail", help="show the closure for one upstream module")
    ap.add_argument("--ours", help="show the closure for one of our shim files")
    args = ap.parse_args()

    if args.detail:
        for crate, root in (("gpui-component", UP), ("gpui-base", GB)):
            if not module_files(root, args.detail):
                continue
            files = closure((crate, args.detail))
            info = classify(files)
            print(f"{crate}::{args.detail}  ({info['files']} files)")
            print(f"  our-crate lines      : {info['up_lines']}")
            print(f"  gpui-base lines      : {info['gb_lines']}")
            print(f"  gpui-base components : {info['gb_components'] or '— none —'}")
            print(f"  gpui-base helpers    : {info['gb_helpers'] or '— none —'}")
            print("  closure:")
            for f in sorted(files):
                tag = "GB" if GB in f.parents else "UP"
                rel = str(f.relative_to(REG)).split("/", 2)[-1]
                print(f"    {tag}  {rel:56} {read_text(f).count(chr(10)) + 1:>6}")
            return 0
        print(f"unresolved target: {args.detail!r}")
        return 1

    shims = our_shims()
    if args.ours:
        if args.ours not in shims:
            print(f"not a shim: {args.ours!r}\nknown: {', '.join(sorted(shims))}")
            return 1
        shims = {args.ours: shims[args.ours]}

    fan = fan_in()
    rows = [report_one(o, t, fan) for o, t in shims.items()]

    # A raw closure total is useless: nearly every shim transitively reaches the
    # same text/input/dialog/theme infrastructure, so everything reports ~45k
    # lines. What decides the next family is the **marginal** cost — the
    # gpui-base components this target needs that the rest of the library does
    # not. Those reached by most shims are a shared floor you pay for once.
    n = len(rows)
    reach: dict[str, int] = {}
    for r in rows:
        for c in r["gb_component_names"]:
            reach[c] = reach.get(c, 0) + 1
    shared = {c for c, k in reach.items() if k * 2 >= n} if n > 1 else set()

    for r in rows:
        r["marginal"] = sorted(r["gb_component_names"] - shared)
        r["shared_hits"] = len(r["gb_component_names"] & shared)

    # Rank by **depth-1** cost first. A closure total is useless as a ranking
    # (see `direct_base_modules`), and so is the marginal-closure column derived
    # from it — keep both only as context. A target with gb1 == 0 needs no
    # gpui-base component reimplemented at all, which is a one-file port.
    rows.sort(key=lambda r: (len(r["gb1"]), len(r["marginal"]), r["up_lines"]))

    print(
        f"{'our shim':34} {'ours':>6} {'gb1':>4} {'gb#':>4} {'marg':>5} {'fan':>4}"
        f"  depth-1 gpui-base modules"
    )
    print("-" * 118)
    for r in rows:
        direct = ", ".join(r["gb1"]) or "— none —"
        warn = f"  !! UNRESOLVED {r['unresolved']}" if r["unresolved"] else ""
        print(
            f"{r['ours']:34} {r['up_lines']:>6} {len(r['gb1']):>4} "
            f"{len(r['gb_component_names']):>4} {len(r['marginal']):>5} {r['fan']:>4}  "
            f"{direct}{warn}"
        )
    print()
    print(f"{len(rows)} shims.  ours = lines of OUR-crate upstream code pulled in.")
    print("gb1 = gpui-base modules the target's own files import — THE ranking metric.")
    print("      gb1 == 0 means no gpui-base component has to be reimplemented.")
    print(f"gb#/marg = closure-based context. Over-reaching: floor={len(shared)} of gb# is")
    print("      shared by >=50% of shims, so gb# ranks almost nothing. Prefer gb1.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
