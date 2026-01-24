# Assistant Cooker - AI Development Guide

**Current Version:** 0.0.38  
**Last Updated:** 2026-01-23

This document provides essential context for an AI to understand, maintain, and extend this project.

**IMPORTANT:** Keep this file, README.md, and SPECIFICATIONS.md up-to-date with every code change.

---

## 1. Critical Rules

### Language Requirement
All code, comments, documentation, and commit messages **MUST be in English**. Only exception: translation files in `/translations/`.

### Version Management
- User decides when to increment version
- Source of truth: `manifest.json`
- Must sync: `manifest.json` + `assistant-cooker-card.js` (line 8: `CARD_VERSION`)
- Version markers in docs reflect when feature was first implemented (don't update retroactively)

### Documentation
SPECIFICATIONS.md is the source of truth. Read it before implementing any feature. Update it when requirements change.

### Scripts Directory
- `/scripts/` = Production scripts (committed)
- `/scripts/temp/` = Temporary debug scripts (can be .gitignored)
- Example: `generate_food_database.py` regenerates frontend database from `food_data.py`

---

## 2. Architecture Overview

### Version 0.0.36: Modular Frontend

Frontend refactored from 1,235-line monolith into 6 ES6 modules:

```
custom_components/assistant_cooker/frontend/
├── assistant-cooker-card.js       # Main orchestrator (~640 lines)
├── modules/
│   ├── state-manager.js           # State & translations (~150 lines)
│   ├── api-client.js              # HA API integration (~60 lines)
│   ├── chart-manager.js           # ApexCharts lifecycle (~325 lines)
│   ├── rendering.js               # HTML/CSS generation (~274 lines)
│   └── events.js                  # Event handling (~200 lines)
├── data/
│   ├── food-database.js           # FOOD_DATABASE (auto-generated, ~372 lines)
│   └── span-options.js            # Time span options (~15 lines)
└── translations/
    ├── en.js, fr.js, de.js...     # 21 language files (97 keys each)
```

**Module Responsibilities:**
- **state-manager.js**: HA state, language detection, lazy-load translations
- **api-client.js**: Service calls, history fetching, more-info dialogs
- **chart-manager.js**: ApexCharts CDN loading, data updates from attributes
- **rendering.js**: Complete HTML/CSS generation
- **events.js**: All event listeners and user interactions
- **assistant-cooker-card.js**: Thin orchestration layer

**Benefits:** Maintainability, testability, reduced complexity, reusability.

---

## 3. Key Technical Details

### Entity Naming (CRITICAL)
Home Assistant converts sensor `_attr_name` to snake_case entity_id:
- `"Ambient Temperature"` → `sensor.assistantcooker_ambient_temperature`
- `"Signal Strength"` → `sensor.assistantcooker_signal_strength`

**In assistant-cooker-card.js:**
```javascript
this._entities = {
  state: `sensor.${prefix}_state`,
  probe_temp: `sensor.${prefix}_probe_temperature`,
  ambient_temp: `sensor.${prefix}_ambient_temperature`,  // NOT "ambient_temp"!
  signal_strength: `sensor.${prefix}_signal_strength`,  // NOT "rssi"!
  battery: `sensor.${prefix}_battery`,
  target_temp: `sensor.${prefix}_target_temperature`,
  remaining_time: `sensor.${prefix}_remaining_time`,
  progress: `sensor.${prefix}_progress`,
  heating_rate: `sensor.${prefix}_heating_rate`,
};
```

### Cooking Time Calculator (v0.0.38+)
The `CookingCalculator` class (`calculations.py`) includes intelligent estimate handling:

**Probe Insertion Detection:**
- Detects sudden temp drop (> 5°C in 30s) = probe inserted in cold food
- Resets all history to avoid "history pollution"
- Prevents absurd estimates (e.g., 1500 min)

**Estimate Stability:**
- Waits for 20s of stable temperature rise before calculating
- Tracks estimate history over 60s
- Only displays when deviation < 30s from expected natural decline
- Formula: `deviation = |actual_decline - expected_decline|`

**Key Parameters:**
```python
_temp_drop_threshold = -5.0       # °C drop to detect insertion
_min_rising_duration_seconds = 20 # Wait for stable rise
_stability_threshold_seconds = 30 # Max acceptable deviation
_stability_period_seconds = 60    # Observation window
```

### Temperature Data Source (v0.0.36+)
Graph data comes from **attributes**, not entity state:
- `sensor.assistantcooker_state.attributes.temp_history` - Array of `[["2026-01-20T16:39:29+00:00", 18.875], ...]`
- `sensor.assistantcooker_state.attributes.ambient_history` - Same format
- Conversion handled by `chart-manager.js` `updateFromAttributes()` method

### Food Selection Synchronization (v0.0.36 Fix)
**Problem:** Re-renders destroy DOM before `setTimeout` callbacks execute.

**Solution:** Call `_syncWithBackend()` AFTER render completes:
```javascript
// In set hass() - AFTER re-render
this._stateManager.waitForTranslations().then(() => {
  this.render();  // Complete re-render first
  setTimeout(() => this._syncWithBackend(stateEntity), 50);  // THEN sync (50ms > 10ms internal delay)
});
```

### Translation System (Lazy-Loading v0.0.33+)
- **Startup:** Only English (`en.js`, ~2-3 KB) loaded
- **On-demand:** Other languages loaded via dynamic `import()` when user selects them
- **Caching:** Loaded languages cached in memory
- **Fallback:** English always available if language fails to load
- **21 Languages:** FR, EN, DE, ES, IT, PT, NL, PL, RU, ZH, JA, KO, AR, HI, TR, SV, DA, NB, FI, CS, UK

**Adding New Language:**
1. Create `translations/XX.js` with all 97 keys
2. Add language code to `supportedLangs` array in `state-manager.js`

### Food Database (v0.0.35+: Auto-Generated)
**NEVER edit `food-database.js` manually** - it's auto-generated.

**Workflow:**
1. Edit `custom_components/assistant_cooker/food_data.py`
2. Run `python scripts/generate_food_database.py`
3. Add translation keys to ALL 21 language files
4. Commit: `food_data.py` + `food-database.js` + 21 translation files

**Structure (key-based):**
```javascript
beef: {
  categoryKey: "category_beef",
  foods: {
    steak: {
      foodKey: "food_beef_steak",
      doneness: {
        rare: { donenessKey: "doneness_rare", temp: 52 }
      }
    }
  }
}
```

**CRITICAL Constraint:** Category names must NOT contain underscores (parsing splits on first underscore). Food names CAN have underscores.
- ✅ Valid: `beef`, `pork`, `poultry` (categories)
- ✅ Valid: `prime_rib`, `chicken_breast` (foods)
- ❌ Invalid: `game_meat`, `red_meat` (categories would break parsing)

---

## 4. Common Tasks

### Making Elements Clickable
```javascript
// HTML
<div class="clickable" data-entity="probe_temp">...</div>

// JavaScript (in events.js or main)
this.shadowRoot.querySelectorAll(".clickable[data-entity]").forEach(el => {
  el.addEventListener("click", (e) => {
    const entityKey = el.dataset.entity;
    if (entityKey && this._entities[entityKey]) {
      e.stopPropagation();
      this._apiClient.fireMoreInfo(this._entities[entityKey]);
    }
  });
});
```

### Calling Services
```javascript
await this._apiClient.callService("set_food", {
  category: "beef",
  food: "steak",
  doneness: "medium"
});
```

### Reading Attributes
```javascript
const stateEntity = this._stateManager.getEntityState(this._entities.state);
const attrs = stateEntity?.attributes || {};
const tempHistory = attrs.temp_history || [];
const foodType = attrs.food_type || "";  // Format: "beef_steak"
```

---

## 5. UI Specifications

### States & Display
- **DISCONNECTED**: Gray badge, "Connect probe" message
- **IDLE**: Blue "READY" badge, food selectors, settings, start button
- **COOKING**: Orange badge, 3-column grid (elapsed | circle | remaining), graph visible, stop button
- **DONE**: Green badge at 100%, stop button

### Progress Circle
- Always 160px diameter, centered in middle column
- Colors: <80% blue, 80-99% orange, 100% green
- Font: 32px for temperature

### Header (v0.0.36)
- State badge (clickable → state entity)
- Battery icon (clickable → battery entity)
- Signal icon (clickable → signal_strength entity)
- **Food display removed** - space reserved for future use

### Graph Controls (v0.0.36)
- Layout: `display: block; text-align: center;` (parent)
- Controls: `display: inline-flex;` (prevents full-width expansion)
- Compact sizing: padding 2px 6px, font-size 11px
- Zero bottom margin/padding

### Settings Section
- Target input: 52px wide, padding 6px 10px
- Comp toggle: padding 6px 10px, icon 18px
- Right-align temperature input/unit

---

## 6. Testing Checklist

Before ANY release:
- [ ] Probe connect/disconnect
- [ ] Start/stop cooking
- [ ] Change food/doneness
- [ ] Toggle compensation
- [ ] Click all elements (verify correct entity opens)
- [ ] Change graph span
- [ ] Test FR/EN translations
- [ ] Verify circle stays centered idle→cooking
- [ ] Check food selector persistence after page reload

---

## 7. Common Mistakes

| Mistake | Solution |
|---------|----------|
| Wrong entity name | Verify `sensor.py` (e.g., `signal_strength` not `rssi`) |
| Missing `stopPropagation()` | Always call on click handlers |
| Editing `food-database.js` | Run generation script instead |
| Food selectors not persisting | Call `_syncWithBackend()` AFTER render |
| Graph no data | Use `temp_history`/`ambient_history` from attributes |
| Version mismatch | `CARD_VERSION` must match `manifest.json` |

---

## 8. Resources

- [HA Custom Integration Docs](https://developers.home-assistant.io/docs/creating_integration_index)
- [Lovelace Custom Cards](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card)
- [ApexCharts Docs](https://apexcharts.com/docs/)

---

## 9. Final Reminders

1. **Always update docs** when making changes
2. **Always verify entity names** match backend
3. **Always test clickable elements** with actual entity popups
4. **Never edit auto-generated files** (`food-database.js`)
5. **All comments in English** (critical rule)
