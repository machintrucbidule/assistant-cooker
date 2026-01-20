# Scripts Directory

This directory contains maintenance scripts for the Assistant Cooker project.

## Structure

- **`/scripts/`** - Reusable, production-ready scripts
- **`/scripts/temp/`** - Temporary one-shot scripts (gitignored)

## Available Scripts

### `generate_food_database.py`

**Purpose:** Generates the frontend `food-database.js` from the backend `food_data.py`.

**When to use:** Every time you modify `custom_components/assistant_cooker/food_data.py`

**Usage:**
```bash
cd /path/to/assistant-cooker
python scripts/generate_food_database.py
```

**Output:**
- Generates: `custom_components/assistant_cooker/frontend/data/food-database.js`
- Displays statistics: categories, foods, doneness options

**Why it exists:**
- Eliminates manual synchronization between backend and frontend
- Prevents temperature mismatches and desynchronization errors
- Single source of truth: `food_data.py`

**Important:**
- DO NOT edit `food-database.js` manually - it will be overwritten
- Always run this script after modifying `food_data.py`
- Commit both files: `food_data.py` + `food-database.js`

## Adding New Scripts

### Production Scripts (in `/scripts/`)
- Must be reusable and well-documented
- Should have clear purpose and usage instructions
- Will be committed to Git

### Temporary Scripts (in `/scripts/temp/`)
- For debugging, one-time migrations, or testing
- Can be .gitignored
- Document in comments why the script exists

## Example Workflow

When adding a new food to the database:

1. Edit `custom_components/assistant_cooker/food_data.py`
2. Run `python scripts/generate_food_database.py`
3. Add translations to all 21 language files
4. Commit all changes

See `AI_DEVELOPMENT_GUIDE.md` for detailed documentation.
