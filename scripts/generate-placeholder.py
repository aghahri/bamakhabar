#!/usr/bin/env python3
"""Generate the BamaKhabar branded news placeholder image.
Produces a neutral, on-brand 1200x675 PNG for use when a news item has no image.
No person/political content; uses brand colors only.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 675
BRAND_DARK = (26, 26, 46)        # #1a1a2e
BRAND_DARK_2 = (40, 40, 70)
BRAND_RED = (196, 30, 58)        # #c41e3a
PAPER = (245, 245, 248)
PAPER_LINE = (210, 210, 220)
GOLD = (212, 175, 55)

img = Image.new('RGB', (W, H), BRAND_DARK)
draw = ImageDraw.Draw(img)

# Subtle vertical gradient
for y in range(H):
    t = y / H
    r = int(BRAND_DARK[0] + (BRAND_DARK_2[0] - BRAND_DARK[0]) * t)
    g = int(BRAND_DARK[1] + (BRAND_DARK_2[1] - BRAND_DARK[1]) * t)
    b = int(BRAND_DARK[2] + (BRAND_DARK_2[2] - BRAND_DARK[2]) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Decorative diagonal stripes (very subtle)
stripe_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(stripe_layer)
for i in range(-H, W, 60):
    sd.line([(i, 0), (i + H, H)], fill=(255, 255, 255, 8), width=20)
img = Image.alpha_composite(img.convert('RGBA'), stripe_layer).convert('RGB')
draw = ImageDraw.Draw(img)

# Centered newspaper card
card_w, card_h = 520, 360
cx, cy = W // 2, H // 2 - 30
x0 = cx - card_w // 2
y0 = cy - card_h // 2
x1 = x0 + card_w
y1 = y0 + card_h

# Card shadow
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
sdraw.rounded_rectangle([x0 + 8, y0 + 12, x1 + 8, y1 + 12], radius=14, fill=(0, 0, 0, 110))
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
img = Image.alpha_composite(img.convert('RGBA'), shadow).convert('RGB')
draw = ImageDraw.Draw(img)

# Newspaper card body
draw.rounded_rectangle([x0, y0, x1, y1], radius=14, fill=PAPER)

# Red header bar of the card
header_h = 70
draw.rounded_rectangle([x0, y0, x1, y0 + header_h + 14], radius=14, fill=BRAND_RED)
draw.rectangle([x0, y0 + header_h, x1, y0 + header_h + 14], fill=BRAND_RED)

# Header masthead lines (pure geometric, no person)
draw.rectangle([x0 + 24, y0 + 20, x0 + 200, y0 + 32], fill=(255, 255, 255))
draw.rectangle([x0 + 24, y0 + 42, x0 + 140, y0 + 50], fill=(255, 255, 255, 200))

# Article title bars
ty = y0 + header_h + 36
draw.rectangle([x0 + 30, ty, x1 - 30, ty + 18], fill=(70, 70, 90))
draw.rectangle([x0 + 30, ty + 30, x1 - 80, ty + 46], fill=(70, 70, 90))

# Article body lines
ly = ty + 80
for i in range(5):
    line_w = card_w - 60 - (i * 8 if i % 2 == 0 else 30)
    draw.rectangle([x0 + 30, ly + i * 22, x0 + 30 + line_w, ly + i * 22 + 8], fill=PAPER_LINE)

# Two-column divider
draw.line([(cx, ty + 70), (cx, y1 - 24)], fill=PAPER_LINE, width=2)

# Right-column lines
ry = ty + 80
for i in range(5):
    line_w = (card_w // 2) - 50 - (i * 6 if i % 2 == 0 else 20)
    draw.rectangle([cx + 16, ry + i * 22, cx + 16 + line_w, ry + i * 22 + 8], fill=PAPER_LINE)

# Bottom gold accent on the card
draw.rectangle([x0 + 24, y1 - 16, x0 + 80, y1 - 12], fill=GOLD)

# Latin wordmark below the card
def load_font(size, bold=False):
    candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf' if bold else '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

wordmark_font = load_font(46, bold=True)
tagline_font = load_font(20, bold=False)

wordmark = 'BamaKhabar'
bbox = draw.textbbox((0, 0), wordmark, font=wordmark_font)
tw = bbox[2] - bbox[0]
draw.text(((W - tw) // 2, y1 + 30), wordmark, font=wordmark_font, fill=(255, 255, 255))

tagline = 'Local Neighborhood News'
bbox2 = draw.textbbox((0, 0), tagline, font=tagline_font)
tw2 = bbox2[2] - bbox2[0]
draw.text(((W - tw2) // 2, y1 + 86), tagline, font=tagline_font, fill=(190, 190, 210))

# Small red underline accent under wordmark
draw.rectangle([(W // 2) - 60, y1 + 78, (W // 2) + 60, y1 + 82], fill=BRAND_RED)

out_path = 'public/images/bamakhabar-news-placeholder.png'
img.save(out_path, format='PNG', optimize=True)
print(f'Wrote {out_path} ({os.path.getsize(out_path)} bytes)')
