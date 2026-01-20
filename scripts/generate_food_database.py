#!/usr/bin/env python3
"""
Generate food-database.js from food_data.py
This script ensures frontend and backend food databases stay synchronized.

Usage:
    python scripts/generate_food_database.py

IMPORTANT: Run this script every time you modify food_data.py
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import from custom_components
script_dir = Path(__file__).parent
repo_root = script_dir.parent
sys.path.insert(0, str(repo_root / "custom_components" / "assistant_cooker"))

try:
    from food_data import FOOD_DATABASE
except ImportError as e:
    print(f"Error: Could not import food_data.py: {e}")
    print(f"Make sure you're running from the repository root.")
    sys.exit(1)


def generate_js_database():
    """Generate JavaScript food database from Python source."""
    
    lines = [
        "/**",
        " * Universal Food Database (language-agnostic)",
        " * AUTO-GENERATED from food_data.py - DO NOT EDIT MANUALLY",
        " * ",
        " * To update this file:",
        " * 1. Modify custom_components/assistant_cooker/food_data.py",
        " * 2. Run: python scripts/generate_food_database.py",
        " * ",
        " * Uses keys for all labels - translations handled in language-specific files",
        " * Each category/food/doneness level references a translation key",
        " */",
        "export const FOOD_DATABASE = {",
    ]
    
    # Add manual category (hardcoded since not in Python FOOD_DATABASE)
    lines.extend([
        "  manual: {",
        "    categoryKey: \"category_manual\",",
        "    foods: {",
        "      manual: {",
        "        foodKey: \"food_manual\",",
        "        doneness: {",
        "          manual: { donenessKey: \"doneness_manual\", temp: null }",
        "        }",
        "      }",
        "    }",
        "  },",
    ])
    
    # Process each category from Python FOOD_DATABASE
    categories = list(FOOD_DATABASE.keys())
    for cat_idx, category in enumerate(categories):
        cat_data = FOOD_DATABASE[category]
        lines.append(f"  {category}: {{")
        lines.append(f"    categoryKey: \"category_{category}\",")
        lines.append("    foods: {")
        
        foods = list(cat_data["foods"].keys())
        for food_idx, food in enumerate(foods):
            food_data = cat_data["foods"][food]
            lines.append(f"      {food}: {{")
            lines.append(f"        foodKey: \"food_{category}_{food}\",")
            lines.append("        doneness: {")
            
            doneness_levels = list(food_data["doneness"].keys())
            for don_idx, doneness in enumerate(doneness_levels):
                temp = food_data["doneness"][doneness]
                comma = "," if don_idx < len(doneness_levels) - 1 else ""
                lines.append(f"          {doneness}: {{ donenessKey: \"doneness_{doneness}\", temp: {temp} }}{comma}")
            
            lines.append("        }")
            
            # Close food block
            food_comma = "," if food_idx < len(foods) - 1 else ""
            lines.append(f"      }}{food_comma}")
        
        # Close category block
        lines.append("    }")
        cat_comma = "," if cat_idx < len(categories) - 1 else ""
        lines.append(f"  }}{cat_comma}")
    
    # Close main object
    lines.append("};")
    
    return "\n".join(lines) + "\n"


def main():
    """Main execution."""
    output_path = repo_root / "custom_components" / "assistant_cooker" / "frontend" / "data" / "food-database.js"
    
    print("Generating food-database.js from food_data.py...")
    js_content = generate_js_database()
    
    # Write to file
    output_path.write_text(js_content, encoding="utf-8")
    
    print(f"✅ Successfully generated: {output_path}")
    print(f"   Total size: {len(js_content)} bytes")
    
    # Count stats
    category_count = len(FOOD_DATABASE)
    food_count = sum(len(cat["foods"]) for cat in FOOD_DATABASE.values())
    doneness_count = sum(
        len(food["doneness"]) 
        for cat in FOOD_DATABASE.values() 
        for food in cat["foods"].values()
    )
    
    print(f"   Categories: {category_count + 1} (+ manual)")  # +1 for manual
    print(f"   Foods: {food_count + 1} (+ manual)")  # +1 for manual
    print(f"   Doneness options: {doneness_count + 1} (+ manual)")  # +1 for manual
    print()
    print("✅ Frontend database synchronized with backend!")


if __name__ == "__main__":
    main()
