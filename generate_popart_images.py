import sys
sys.path.append('/Users/Dublin-Osx/Library/Python/3.9/lib/python/site-packages')
import os
import math
import urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

OUTPUT_DIR = '/Users/Dublin-Osx/code/meetfriendsplanner/public/images'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper: Download and convert image to B&W high contrast editorial portrait
def fetch_bw_photo(url, width=800, height=600):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            img = Image.open(resp).convert('RGB')
            img = ImageOps.fit(img, (width, height), Image.Resampling.LANCZOS)
            # Desaturate
            bw = ImageEnhance.Color(img).enhance(0.0)
            # Increase contrast for editorial look
            bw = ImageEnhance.Contrast(bw).enhance(1.25)
            return bw
    except Exception as e:
        print(f"Error fetching image: {e}")
        # Return fallback neutral image
        img = Image.new('RGB', (width, height), color=(200, 200, 200))
        return img

# Helper: Draw Pop-Art Radiating Teardrop Rays
def draw_radiating_teardrops(draw, center, radius=280):
    cx, cy = center
    colors = [(29, 78, 216), (56, 189, 248), (244, 63, 94), (251, 146, 60), (245, 158, 11), (251, 207, 232)]
    num_rays = 24
    for i in range(num_rays):
        angle_deg = (i / num_rays) * 360 - 90
        angle_rad = math.radians(angle_deg)
        color = colors[i % len(colors)]
        
        # Calculate teardrop start & end points
        r1 = radius * 0.5
        r2 = radius * 1.05
        x1 = cx + r1 * math.cos(angle_rad)
        y1 = cy + r1 * math.sin(angle_rad)
        x2 = cx + r2 * math.cos(angle_rad)
        y2 = cy + r2 * math.sin(angle_rad)
        
        # Teardrop shape points
        perp_angle = angle_rad + math.pi / 2
        w = 18
        p1 = (x1 + w * math.cos(perp_angle), y1 + w * math.sin(perp_angle))
        p2 = (x2, y2)
        p3 = (x1 - w * math.cos(perp_angle), y1 - w * math.sin(perp_angle))
        
        draw.polygon([p1, p2, p3], fill=color)

# Helper: Draw Organic Contour Auras
def draw_popart_auras(draw, width, height):
    cx, cy = width // 2, height // 2 + 20
    
    # 1. Outer Mustard Contour Line
    draw.ellipse([cx - 320, cy - 240, cx + 320, cy + 240], outline=(245, 158, 11), width=18)
    
    # 2. Middle Cobalt Polka Dot Aura
    for angle in range(0, 360, 12):
        rad = math.radians(angle)
        dx = cx + 290 * math.cos(rad)
        dy = cy + 210 * math.sin(rad)
        draw.ellipse([dx - 8, dy - 8, dx + 8, dy + 8], fill=(37, 99, 235))
        
    # 3. Inner Coral Stripe Aura
    draw.ellipse([cx - 260, cy - 180, cx + 260, cy + 180], outline=(244, 63, 94), width=12)

# Helper: Draw Hand-Drawn Eyebrows & Star Eyes
def draw_star_eye_doodles(draw, left_eye, right_eye, color=(244, 63, 94)):
    for eye in [left_eye, right_eye]:
        ex, ey = eye
        # Star Points
        pts = []
        for i in range(10):
            r = 14 if i % 2 == 0 else 6
            ang = i * (math.pi / 5) - math.pi / 2
            pts.append((ex + r * math.cos(ang), ey + r * math.sin(ang)))
        draw.polygon(pts, fill=color, outline=(9, 9, 11))
        
        # Eyebrow Arch above eye
        draw.arc([ex - 20, ey - 35, ex + 20, ey - 15], start=190, end=350, fill=(29, 78, 216), width=6)
        
        # Cheek Sunburst Lines
        for offset in [-12, 0, 12]:
            draw.line([(ex + offset, ey + 25), (ex + offset, ey + 42)], fill=(244, 63, 94), width=3)

# 1. GENERATE HERO GIRL SQUAD POP-ART IMAGE
def generate_hero_squad():
    width, height = 1000, 750
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    # Draw Background Radiating Teardrop Rays & Organic Auras
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=340)
    draw_popart_auras(draw, width, height)
    
    # Fetch B&W Photo of Diverse Female Friends
    photo_url = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80"
    photo = fetch_bw_photo(photo_url, 640, 480)
    
    # Mask Photo into Organic Rounded Portrait Shape
    mask = Image.new('L', (640, 480), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([20, 20, 620, 460], fill=255)
    
    # Paste Photo on Canvas
    base.paste(photo, (180, 140), mask)
    
    # Draw Pop-Art Doodles over Photo (Star Eyes, Eyebrows, Stickers)
    overlay = ImageDraw.Draw(base)
    
    # Star Eyes & Makeup Doodles for Center Friend
    draw_star_eye_doodles(overlay, (460, 310), (540, 310), color=(244, 63, 94))
    
    # Polka Dot Clothing Pattern Stripe on Bottom
    for x in range(220, 780, 30):
        for y in range(540, 640, 30):
            overlay.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(37, 99, 235))
            
    # Bottom Caption Badge
    overlay.rectangle([320, 640, 680, 710], fill=(255, 255, 255), outline=(9, 9, 11), width=4)
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_hero_squad.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

# 2. GENERATE FEATURED EARLY DINNER POP-ART IMAGE
def generate_early_dinner():
    width, height = 800, 600
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=270)
    draw_popart_auras(draw, width, height)
    
    photo_url = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
    photo = fetch_bw_photo(photo_url, 520, 380)
    
    mask = Image.new('L', (520, 380), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([15, 15, 505, 365], fill=255)
    
    base.paste(photo, (140, 110), mask)
    
    overlay = ImageDraw.Draw(base)
    draw_star_eye_doodles(overlay, (360, 250), (440, 250), color=(245, 158, 11))
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_early_dinner.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

# 3. GENERATE FEATURED WHELAN'S CONCERT POP-ART IMAGE
def generate_concert_gig():
    width, height = 800, 600
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=270)
    draw_popart_auras(draw, width, height)
    
    photo_url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
    photo = fetch_bw_photo(photo_url, 520, 380)
    
    mask = Image.new('L', (520, 380), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([15, 15, 505, 365], fill=255)
    
    base.paste(photo, (140, 110), mask)
    
    overlay = ImageDraw.Draw(base)
    draw_star_eye_doodles(overlay, (370, 240), (450, 240), color=(225, 29, 72))
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_whelans_gig.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

# 4. GENERATE FEATURED WICKLOW SPA POP-ART IMAGE
def generate_wicklow_spa():
    width, height = 800, 600
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=270)
    draw_popart_auras(draw, width, height)
    
    photo_url = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
    photo = fetch_bw_photo(photo_url, 520, 380)
    
    mask = Image.new('L', (520, 380), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([15, 15, 505, 365], fill=255)
    
    base.paste(photo, (140, 110), mask)
    
    overlay = ImageDraw.Draw(base)
    draw_star_eye_doodles(overlay, (360, 240), (440, 240), color=(5, 150, 105))
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_wicklow_spa.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

# 5. GENERATE FEATURED LISBON TRIP POP-ART IMAGE
def generate_lisbon_trip():
    width, height = 800, 600
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=270)
    draw_popart_auras(draw, width, height)
    
    photo_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    photo = fetch_bw_photo(photo_url, 520, 380)
    
    mask = Image.new('L', (520, 380), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([15, 15, 505, 365], fill=255)
    
    base.paste(photo, (140, 110), mask)
    
    overlay = ImageDraw.Draw(base)
    draw_star_eye_doodles(overlay, (360, 240), (440, 240), color=(37, 99, 235))
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_lisbon_trip.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

# 6. GENERATE FEATURED COFFEE WALK POP-ART IMAGE
def generate_coffee_walk():
    width, height = 800, 600
    base = Image.new('RGB', (width, height), color=(250, 250, 250))
    draw = ImageDraw.Draw(base)
    
    draw_radiating_teardrops(draw, (width // 2, height // 2), radius=270)
    draw_popart_auras(draw, width, height)
    
    photo_url = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
    photo = fetch_bw_photo(photo_url, 520, 380)
    
    mask = Image.new('L', (520, 380), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([15, 15, 505, 365], fill=255)
    
    base.paste(photo, (140, 110), mask)
    
    overlay = ImageDraw.Draw(base)
    draw_star_eye_doodles(overlay, (360, 240), (440, 240), color=(245, 158, 11))
    
    out_path = os.path.join(OUTPUT_DIR, 'popart_coffee_walk.png')
    base.save(out_path, 'PNG')
    print(f"Saved: {out_path}")

if __name__ == '__main__':
    print("Generating Pop-Art PNG Images...")
    generate_hero_squad()
    generate_early_dinner()
    generate_concert_gig()
    generate_wicklow_spa()
    generate_lisbon_trip()
    generate_coffee_walk()
    print("All Pop-Art PNG images generated successfully!")
