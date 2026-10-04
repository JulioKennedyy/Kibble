import json

# Define exact spheres mapped to Kibble reference
# Coordinates in viewBox 0 0 100 100
SPHERES = [
    # --- Antenna (5 spheres curling at the tip) ---
    {"cx": 47.0, "cy": 24.5, "r": 3.4, "g": "s-light"},
    {"cx": 45.5, "cy": 19.5, "r": 3.4, "g": "s-light"},
    {"cx": 45.0, "cy": 14.5, "r": 3.6, "g": "s-light"},
    {"cx": 48.5, "cy": 10.5, "r": 3.8, "g": "s-light"},
    {"cx": 53.5, "cy": 11.5, "r": 3.2, "g": "s-light"},

    # --- Top Head Rim ---
    {"cx": 40.0, "cy": 26.5, "r": 3.6, "g": "s-light"},
    {"cx": 34.0, "cy": 30.5, "r": 3.8, "g": "s-light"},
    {"cx": 53.0, "cy": 26.0, "r": 3.5, "g": "s-light"},
    {"cx": 59.0, "cy": 28.5, "r": 3.3, "g": "s-light"},
    {"cx": 64.5, "cy": 33.0, "r": 3.0, "g": "s-light"},

    # --- Outer Back (Left edge chubby curve) ---
    {"cx": 28.5, "cy": 35.5, "r": 4.0, "g": "s-light"},
    {"cx": 24.5, "cy": 42.0, "r": 4.2, "g": "s-mid"},
    {"cx": 22.0, "cy": 49.0, "r": 4.4, "g": "s-mid"},
    {"cx": 22.5, "cy": 56.5, "r": 4.4, "g": "s-dark"},
    {"cx": 25.5, "cy": 63.5, "r": 4.2, "g": "s-dark"},
    {"cx": 30.0, "cy": 69.5, "r": 4.0, "g": "s-dark"},
    {"cx": 36.0, "cy": 74.0, "r": 3.8, "g": "s-dark"},

    # --- Inner Back Layer ---
    {"cx": 33.0, "cy": 39.0, "r": 4.2, "g": "s-light"},
    {"cx": 30.5, "cy": 46.5, "r": 4.5, "g": "s-mid"},
    {"cx": 29.5, "cy": 54.5, "r": 4.6, "g": "s-mid"},
    {"cx": 34.0, "cy": 62.0, "r": 4.4, "g": "s-dark"},
    {"cx": 37.0, "cy": 46.0, "r": 4.4, "g": "s-light"},
    {"cx": 37.5, "cy": 54.5, "r": 4.5, "g": "s-mid"},

    # --- Bottom Rim ---
    {"cx": 42.5, "cy": 75.5, "r": 3.7, "g": "s-dark"},
    {"cx": 48.5, "cy": 75.0, "r": 3.6, "g": "s-dark"},
    {"cx": 54.5, "cy": 72.5, "r": 3.5, "g": "s-dark"},
    {"cx": 60.5, "cy": 68.0, "r": 3.3, "g": "s-dark"},

    # --- Right Cheek / Chin Rim ---
    {"cx": 68.0, "cy": 38.5, "r": 2.8, "g": "s-light"},
    {"cx": 70.0, "cy": 45.0, "r": 2.7, "g": "s-light"},
    {"cx": 67.5, "cy": 58.0, "r": 3.0, "g": "s-mid"},
    {"cx": 64.0, "cy": 63.5, "r": 3.2, "g": "s-mid"},

    # --- Forehead & Mid Accents ---
    {"cx": 46.0, "cy": 33.0, "r": 3.8, "g": "s-light"},
    {"cx": 52.5, "cy": 33.5, "r": 3.7, "g": "s-light"},
    {"cx": 43.5, "cy": 63.0, "r": 4.2, "g": "s-dark"},
    {"cx": 50.0, "cy": 64.0, "r": 4.0, "g": "s-dark"},
    {"cx": 56.5, "cy": 62.5, "r": 3.6, "g": "s-mid"},

    # --- Tiny loose particles near edge ---
    {"cx": 18.5, "cy": 58.0, "r": 1.8, "g": "s-dark"},
    {"cx": 20.0, "cy": 65.5, "r": 1.6, "g": "s-dark"},
    {"cx": 71.5, "cy": 51.0, "r": 1.8, "g": "s-mid"},
]

with open("frontend/src/components/mascot_dots.json", "w") as f:
    json.dump({"spheres": SPHERES}, f, indent=2)

print(f"Saved {len(SPHERES)} precise spheres to mascot_dots.json")
