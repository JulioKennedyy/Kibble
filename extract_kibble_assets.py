"""
Re-extract Kibble poses with better crops from both reference images.
"""
import os
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

os.makedirs("frontend/public/kibble", exist_ok=True)

def extract_clean(img, crop_box, out_path, bg_thresh=18.0, blur=1.0):
    """Extract foreground from dark background with flood fill + feathering."""
    cropped = img.crop(crop_box)
    w, h = cropped.size
    arr = np.array(cropped, dtype=float)
    
    # Sample background from corners
    corners = [arr[2, 2], arr[2, w-3], arr[h-3, 2], arr[h-3, w-3]]
    bg = np.mean(corners, axis=0)
    
    diff = np.sqrt(np.sum((arr - bg)**2, axis=2))
    
    # Flood fill from edges
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if diff[0, x] < bg_thresh + 8: q.append((0, x)); visited[0, x] = True
        if diff[h-1, x] < bg_thresh + 8: q.append((h-1, x)); visited[h-1, x] = True
    for y in range(h):
        if diff[y, 0] < bg_thresh + 8: q.append((y, 0)); visited[y, 0] = True
        if diff[y, w-1] < bg_thresh + 8: q.append((y, w-1)); visited[y, w-1] = True
    
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if diff[ny, nx] < bg_thresh:
                    visited[ny, nx] = True
                    q.append((ny, nx))
    
    fg_mask = (~visited).astype(np.uint8) * 255
    fg_img = Image.fromarray(fg_mask, mode="L").filter(ImageFilter.GaussianBlur(blur))
    alpha_arr = np.array(fg_img, dtype=float)
    
    # Feather boundary
    boundary = (alpha_arr > 0) & (alpha_arr < 250)
    alpha_arr[boundary] = np.clip(diff[boundary] / 20.0, 0, 1) * alpha_arr[boundary]
    
    out_rgba = np.dstack([arr, alpha_arr]).astype(np.uint8)
    result = Image.fromarray(out_rgba)
    
    # Trim transparent edges
    bbox = result.split()[-1].getbbox()
    if bbox:
        result = result.crop(bbox)
    
    result.save(out_path)
    print(f"  [OK] {out_path} ({result.size[0]}x{result.size[1]})")
    return result


# --- Source images ---
img1 = Image.open(
    r"C:\Users\Júlio Kennedy\.gemini\antigravity-ide\brain\4733ee02-e87c-412e-ba4a-7dd4de2e1437\.user_uploaded\media_1791145295672.png"
).convert("RGB")
w1, h1 = img1.size  # 1024 x 682

img2 = Image.open(
    r"C:\Users\Júlio Kennedy\.gemini\antigravity-ide\brain\4733ee02-e87c-412e-ba4a-7dd4de2e1437\.user_uploaded\media_1791145586430.jpg"
).convert("RGB")
w2, h2 = img2.size  # 1024 x 682


print("=== Extracting from image 1 (media_1791145295672.png) ===")

# Eating / Comendo tokens — main hero top
extract_clean(img1, (280, 110, 530, 355), "frontend/public/kibble/eating.png", bg_thresh=16)

# Satisfied / Cheio de tokens — bottom row, 2nd from left
extract_clean(img1, (320, 390, 500, 580), "frontend/public/kibble/satisfied.png", bg_thresh=16)

# Thinking / Pensando — bottom row, 3rd from left
extract_clean(img1, (540, 380, 710, 575), "frontend/public/kibble/thinking.png", bg_thresh=16)

# Sleeping / Dormindo — bottom row, rightmost
extract_clean(img1, (745, 395, 945, 580), "frontend/public/kibble/sleeping.png", bg_thresh=16)

# Comendo tokens — bottom row, 1st from left (nice forward-facing with tokens flying)
extract_clean(img1, (60, 390, 260, 575), "frontend/public/kibble/eating_small.png", bg_thresh=16)


print("\n=== Extracting from image 2 (media_1791145586430.jpg) ===")

# "Feliz" expression (idle happy face) — expressions row, leftmost
# Row is at roughly y: 0.46 to 0.60, first expression x: 0.01 to 0.09
extract_clean(img2, (int(w2*0.015), int(h2*0.46), int(w2*0.085), int(h2*0.585)), 
              "frontend/public/kibble/idle.png", bg_thresh=20)

# "Surpreso" expression — expressions row, rightmost
extract_clean(img2, (int(w2*0.345), int(h2*0.455), int(w2*0.42), int(h2*0.59)),
              "frontend/public/kibble/scared.png", bg_thresh=20)

# "Curioso" expression  
extract_clean(img2, (int(w2*0.195), int(h2*0.455), int(w2*0.27), int(h2*0.59)),
              "frontend/public/kibble/curious.png", bg_thresh=20)


print("\n=== All assets extracted! ===")
