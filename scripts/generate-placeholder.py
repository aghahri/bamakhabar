#!/usr/bin/env python3
"""Deterministic BamaKhabar branded news placeholder generator.

Produces a clean, neutral 1200x675 PNG used as the fallback image for news
items that have no picture. The design is intentionally minimal:

  * light background with a very subtle dot grid
  * centered Persian wordmark on two lines:
        «باما»  -> brand dark navy  (#1a1a2e)
        «خبر»   -> brand red        (#c41e3a)
  * a short red rule as a media/news accent
  * the Latin wordmark "BAMA KHABAR" beneath the rule

Persian text is rendered with proper complex-text layout: Pillow's RAQM
layout engine (HarfBuzz shaping + FriBiDi bidi). The raw Unicode strings are
passed in logical order with direction='rtl' so letters join cursively and
read right-to-left exactly like native Persian typography. No manual
reshaping / bidi reordering is done (that path breaks cursive joins).

No people, no political imagery, no photographs. Output is byte-stable for a
given Pillow/HarfBuzz version because every coordinate, color and the
embedded font are fixed (font vendored at scripts/assets/Vazirmatn-Bold.ttf,
SIL OFL 1.1).

Dev dependencies (not part of the app runtime):
    pip install Pillow            # official wheel bundles raqm/harfbuzz/fribidi

Run:  python scripts/generate-placeholder.py
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont, features

W, H = 1200, 675
BG = (255, 255, 255)            # clean white
DOT = (233, 235, 240)           # very subtle pattern
BRAND_DARK = (26, 26, 46)       # #1a1a2e  -> «باما»
BRAND_RED = (196, 30, 58)       # #c41e3a  -> «خبر»
FRAME = (228, 230, 236)         # hairline border

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = os.path.join(HERE, 'assets', 'Vazirmatn-Bold.ttf')
OUT_PATH = os.path.join(os.path.dirname(HERE), 'public', 'images',
                        'bamakhabar-news-placeholder.png')

RAQM = ImageFont.Layout.RAQM


def main() -> None:
    if not features.check('raqm'):
        sys.exit('Pillow is missing RAQM (HarfBuzz/FriBiDi) support; '
                 'install a Pillow build with raqm for correct Persian shaping.')

    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Very subtle dot grid (deterministic, non-figurative texture).
    for y in range(40, H, 40):
        for x in range(40, W, 40):
            draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=DOT)

    # Thin inner frame -> tidy media/news look.
    draw.rectangle([24, 24, W - 25, H - 25], outline=FRAME, width=2)

    cx = W // 2
    word_font = ImageFont.truetype(FONT_PATH, 156, layout_engine=RAQM)
    latin_font = ImageFont.truetype(FONT_PATH, 46, layout_engine=RAQM)

    # Raw logical-order Persian; RAQM does shaping + bidi (direction='rtl').
    line1 = 'باما'
    line2 = 'خبر'
    tb = dict(direction='rtl', language='fa')

    b1 = draw.textbbox((0, 0), line1, font=word_font, **tb)
    b2 = draw.textbbox((0, 0), line2, font=word_font, **tb)
    h1 = b1[3] - b1[1]
    h2 = b2[3] - b2[1]
    gap = 32
    block_h = h1 + gap + h2
    top = (H - block_h) // 2 - 70

    y1 = top - b1[1]
    y2 = top + h1 + gap - b2[1]
    draw.text((cx, y1), line1, font=word_font, fill=BRAND_DARK,
              anchor='ma', **tb)
    draw.text((cx, y2), line2, font=word_font, fill=BRAND_RED,
              anchor='ma', **tb)

    # Short red accent rule beneath the wordmark.
    rule_y = top + block_h + 44
    draw.rectangle([cx - 90, rule_y, cx + 90, rule_y + 6], fill=BRAND_RED)

    # Latin wordmark "BAMA KHABAR" with deterministic letter spacing (LTR).
    latin = 'BAMA KHABAR'
    tracking = 10
    widths = [draw.textlength(ch, font=latin_font) for ch in latin]
    total = sum(widths) + tracking * (len(latin) - 1)
    pen = cx - total / 2
    latin_y = rule_y + 40
    for ch, w in zip(latin, widths):
        draw.text((pen, latin_y), ch, font=latin_font, fill=BRAND_DARK)
        pen += w + tracking

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    img.save(OUT_PATH, format='PNG', optimize=True)
    print(f'Wrote {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)')


if __name__ == '__main__':
    main()
