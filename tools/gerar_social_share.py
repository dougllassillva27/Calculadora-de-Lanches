#!/usr/bin/env python3
"""Gera a imagem de compartilhamento (1200x630) do Calculadora de Lanches.

Uso: python3 tools/gerar_social_share.py
Saida: public/social-share.webp
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = "#f4f4f9"
CARD = "#ffffff"
ACCENT = "#007bff"
TEXT = "#333333"
MUTED = "#6b7280"

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
BOLD = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")
REGULAR = os.path.join(FONT_DIR, "DejaVuSans.ttf")

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "social-share.webp")

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Card central
margin = 60
card = (margin, margin, W - margin, H - margin)
draw.rounded_rectangle(card, radius=28, fill=CARD, outline="#e3e3ea", width=2)

# Faixa de acento no topo do card
draw.rounded_rectangle((margin, margin, W - margin, margin + 14), radius=7, fill=ACCENT)

title_font = ImageFont.truetype(BOLD, 68)
sub_font = ImageFont.truetype(REGULAR, 34)
small_font = ImageFont.truetype(REGULAR, 27)
brand_font = ImageFont.truetype(BOLD, 26)

# Ícone (relógio/intervalo) desenhado com formas
cx, cy, r = 150, 320, 62
draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=ACCENT, width=8)
draw.line((cx, cy, cx, cy - 34), fill=ACCENT, width=8)
draw.line((cx, cy, cx + 26, cy + 14), fill=ACCENT, width=8)

# Textos
x = 260
draw.text((x, 210), "Calculadora", font=title_font, fill=TEXT)
draw.text((x, 288), "de Lanches", font=title_font, fill=ACCENT)
draw.text((x, 390), "Intervalos de refeicao a partir do ponto eletronico", font=sub_font, fill=MUTED)
draw.text((x, 440), "Importa .prn, .txt, .csv ou .xlsx  -  exporta CSV", font=small_font, fill=MUTED)

# Rodape
draw.text((x, 520), "dougllassillva.com.br", font=brand_font, fill=ACCENT)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, "WEBP", quality=88)
print(f"OK: {os.path.abspath(OUT)}")
