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

No people, no political imagery, no photographs. Output is byte-stable for a
given Pillow version because every coordinate, color and the embedded font
are fixed (font vendored at scripts/assets/Vazirmatn-Bold.ttf, SIL OFL 1.1).

Dev dependencies (not part of the app runtime):
    pip install Pillow arabic-reshaper python-bidi

Run:  python scripts/generate-placeholder.py
"""
import os

from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

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


def fa(text: str) -> str:
    """Shape + bidi-order Persian text for correct rendering with Pillow."""
    return get_display(arabic_reshaper.reshape(text))


def main() -> None:
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Very subtle dot grid (deterministic, non-figurative texture).
    for y in range(40, H, 40):
        for x in range(40, W, 40):
            draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=DOT)

    # Thin inner frame -> tidy media/news look.
    draw.rectangle([24, 24, W - 25, H - 25], outline=FRAME, width=2)

    cx = W // 2
    word_font = ImageFont.truetype(FONT_PATH, 156)
    latin_font = ImageFont.truetype(FONT_PATH, 46)

    line1 = fa('باما')
    line2 = fa('خبر')

    # Stack the two Persian words, optically centered as a single block.
    b1 = draw.textbbox((0, 0), line1, font=word_font)
    b2 = draw.textbbox((0, 0), line2, font=word_font)
    h1 = b1[3] - b1[1]
    h2 = b2[3] - b2[1]
    gap = 32
    block_h = h1 + gap + h2
    top = (H - block_h) // 2 - 70

    y1 = top - b1[1]
    y2 = top + h1 + gap - b2[1]
    draw.text((cx, y1), line1, font=word_font, fill=BRAND_DARK, anchor='ma')
    draw.text((cx, y2), line2, font=word_font, fill=BRAND_RED, anchor='ma')

    # Short red accent rule beneath the wordmark.
    rule_y = top + block_h + 44
    draw.rectangle([cx - 90, rule_y, cx + 90, rule_y + 6], fill=BRAND_RED)

    # Latin wordmark "BAMA KHABAR" with deterministic letter spacing.
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
