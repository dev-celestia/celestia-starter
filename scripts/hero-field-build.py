#!/usr/bin/env python3
"""Build the landing hero band artwork.

Takes the two 1536x1024 masters (dark + light) and produces:

  1. the 16:9 WebP files the hero section imports
     (apps/web/illustrations-source/hero-field-{dark,light}.webp), and
  2. a self-contained review harness
     (.workbuddy-ai/artifacts/hero-field-preview.html) that renders the real
     hero markup in both themes with the artwork embedded as base64.

Usage:
    python scripts/hero-field-build.py <dark-master.png> <light-master.png> [saturation]

The masters are cropped to 16:9 (centre crop) and desaturated so the blues
settle onto the design system's steel-blue accent (--brand #89aacc /
--brand-deep #4e85bf). Generated art tends to come back far more saturated
than that token, so the default grade is fairly strong; `saturation` is a
multiplier on the source (1.0 = untouched, 0.8 = noticeably muted).
"""

from __future__ import annotations

import base64
import sys
from pathlib import Path

from PIL import Image, ImageEnhance

TARGET_W, TARGET_H = 1536, 864
TARGET_RATIO = TARGET_W / TARGET_H
# Generated art comes back much more saturated than --brand (#89aacc, a muted
# steel blue), so the default grade pulls it most of the way there.
SATURATION = 0.80
WEBP_QUALITY = 86
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "apps" / "web" / "illustrations-source"
PREVIEW_PATH = ROOT / ".workbuddy-ai" / "artifacts" / "hero-field-preview.html"


def build(src: Path, dest: Path, saturation: float = SATURATION) -> None:
    img = Image.open(src).convert("RGB")

    # Centre crop to 16:9.
    w, h = img.size
    if w / h > TARGET_RATIO:
        new_w = round(h * TARGET_RATIO)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    else:
        new_h = round(w / TARGET_RATIO)
        top = (h - new_h) // 2
        img = img.crop((0, top, w, top + new_h))

    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)

    img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    print(
        f"{dest.name}: {dest.stat().st_size / 1024:.0f} KB  "
        f"{img.size[0]}x{img.size[1]}  sat={saturation}"
    )


HERO_BODY = """
        <span class="badge"><span class="dot"></span>Enterprise Software Development</span>
        <h1>Enterprise&#x2011;grade software that scales with your business.</h1>
        <p class="sub">
          From concept to production, we deliver full-stack web, mobile, and cloud
          solutions backed by rigorous engineering standards — on time, on budget,
          with the architecture built to last.
        </p>
        <div class="actions">
          <span class="btn btn--primary">Book a Free Strategy Call &rarr;</span>
          <span class="btn btn--ghost">Explore Services</span>
        </div>
        <ul class="stats">
          <li><span class="v">120+</span><span class="k">Projects delivered</span></li>
          <li><span class="v">99.99%</span><span class="k">Uptime SLA</span></li>
          <li><span class="v">12 yrs</span><span class="k">Avg. engineer experience</span></li>
          <li><span class="v">4.9/5</span><span class="k">Average client rating</span></li>
        </ul>
        <div class="band"><img src="data:image/webp;base64,{data}" alt="" /></div>
"""

PREVIEW_TEMPLATE = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Celestia &mdash; hero band review</title>
    <style>
      :root {{ --brand: 210 40% 67%; --brand-deep: 211 47% 53%; }}
      * {{ box-sizing: border-box; }}
      body {{
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: hsl(0 0% 4%);
      }}
      .panel {{ padding: 40px 24px 56px; }}
      .panel--dark {{ background: hsl(0 0% 4%); color: hsl(0 0% 96%); }}
      .panel--light {{ background: #ffffff; color: #252525; }}
      .label {{
        max-width: 960px; margin: 0 auto 28px;
        font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.1em; text-transform: uppercase;
      }}
      .panel--dark .label {{ color: hsl(210 40% 67%); }}
      .panel--light .label {{ color: #4e85bf; }}
      .hero {{ max-width: 960px; margin: 0 auto; }}
      .badge {{
        display: inline-flex; align-items: center; gap: 8px;
        padding: 5px 12px; border-radius: 999px;
        border: 1px solid hsl(var(--brand) / 0.25);
        background: hsl(var(--brand) / 0.05);
        color: hsl(var(--brand));
        font: 500 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.08em; text-transform: uppercase;
      }}
      .dot {{ width: 6px; height: 6px; border-radius: 999px; background: hsl(var(--brand)); }}
      h1 {{
        margin: 32px 0 0; max-width: 700px;
        font-size: clamp(2.625rem, 6vw, 3.75rem); line-height: 1.08;
        font-weight: 600; letter-spacing: -0.03em; text-wrap: balance;
      }}
      p.sub {{ margin: 24px 0 0; max-width: 36rem; font-size: 1.125rem; line-height: 1.625; }}
      .panel--dark p.sub {{ color: hsl(0 0% 53%); }}
      .panel--light p.sub {{ color: #6f6f6f; }}
      .actions {{ display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }}
      .btn {{
        display: inline-flex; align-items: center; gap: 8px;
        padding: 11px 20px; border-radius: 8px;
        font-size: 14px; font-weight: 500; border: 1px solid transparent;
      }}
      .btn--primary {{ background: hsl(var(--brand-deep)); color: #fff; }}
      .panel--dark .btn--ghost {{ border-color: hsl(0 0% 24%); color: hsl(0 0% 96%); }}
      .panel--light .btn--ghost {{ border-color: #d8d8d8; color: #252525; }}
      ul.stats {{
        list-style: none; display: flex; flex-wrap: wrap; gap: 24px 40px;
        margin: 64px 0 0; padding: 32px 0 0; border-top: 1px solid;
      }}
      .panel--dark ul.stats {{ border-color: hsl(0 0% 15%); }}
      .panel--light ul.stats {{ border-color: #e6e6e6; }}
      ul.stats li {{ display: flex; flex-direction: column; gap: 2px; }}
      ul.stats .v {{ font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }}
      ul.stats .k {{ font-size: 12px; }}
      .panel--dark ul.stats .k {{ color: hsl(0 0% 53%); }}
      .panel--light ul.stats .k {{ color: #6f6f6f; }}
      .band {{ margin-top: 72px; }}
      .band img {{
        display: block; width: 100%; aspect-ratio: 16 / 9;
        object-fit: cover; object-position: center;
        border-radius: 1.125rem;
      }}
    </style>
  </head>
  <body>
    <section class="panel panel--dark">
      <p class="label">Dark theme &mdash; hero-field-dark.webp</p>
      <div class="hero">{dark}</div>
    </section>
    <section class="panel panel--light">
      <p class="label">Light theme &mdash; hero-field-light.webp</p>
      <div class="hero">{light}</div>
    </section>
  </body>
</html>
"""


def emit_preview(dark: Path, light: Path) -> None:
    def b64(p: Path) -> str:
        return base64.b64encode(p.read_bytes()).decode("ascii")

    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW_PATH.write_text(
        PREVIEW_TEMPLATE.format(
            dark=HERO_BODY.format(data=b64(dark)),
            light=HERO_BODY.format(data=b64(light)),
        ),
        encoding="utf-8",
    )
    print(f"{PREVIEW_PATH.relative_to(ROOT)}: {PREVIEW_PATH.stat().st_size / 1024:.0f} KB")


def main() -> None:
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    saturation = float(sys.argv[3]) if len(sys.argv) == 4 else SATURATION
    dark_out = OUT_DIR / "hero-field-dark.webp"
    light_out = OUT_DIR / "hero-field-light.webp"
    build(Path(sys.argv[1]), dark_out, saturation)
    build(Path(sys.argv[2]), light_out, saturation)
    emit_preview(dark_out, light_out)


if __name__ == "__main__":
    main()
