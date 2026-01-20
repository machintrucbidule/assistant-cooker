# SPECIFICATIONS — Assistant Cooker

**Current implemented version:** 0.0.36
**Last updated:** 2026-01-20

---

## 1. Overview

### 1.1 Purpose
Develop a complete Home Assistant integration for cooking monitoring with a temperature probe (Meater, Inkbird, etc.), including:
- A Python backend handling all business logic
- A Lovelace frontend card for user interface (modular architecture v0.0.36+)
- Distribution via HACS (custom GitHub repository)

### 1.2 Identifiers
| Element | Value |
|---------|-------|
| Display name | Assistant Cooker |
| HA Domain | assistant_cooker |
| GitHub repo | assistant-cooker |
| Entity prefix | assistant_cooker |

### 1.3 Architecture
The integration and card are in the same repository. HACS installation automatically installs both components. The card is automatically registered as a Lovelace resource (storage mode).

Separation of responsibilities:
- `custom_components/assistant_cooker/`: Business logic, calculations, sensors, services
- `custom_components/assistant_cooker/frontend/`: Lovelace card (display + interactions)
  - `assistant-cooker-card.js`: Main orchestrator (~430 lines)
  - `modules/`: Modular architecture (v0.0.36+)
    - `state-manager.js`: State & translations (~150 lines)
    - `api-client.js`: HA API integration (~60 lines)
    - `chart-manager.js`: ApexCharts lifecycle (~220 lines)
    - `rendering.js`: HTML/CSS generation (~300 lines)
    - `events.js`: Event handling (~200 lines)
  - `data/`: Food database & span options
  - `translations/`: 21 language files (97 keys each)

---

## 2. Integration Configuration

### 2.1 Adding a Device (Config Flow)
When adding a new device via HA interface, user fills in:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Device name | text | ✅ | Unique identifier (e.g., "Kitchen Meater") |
| Probe temperature sensor | entity_id | ✅ | Core temperature (sensor.meater_xxx_probe) |
| Ambient temperature sensor | entity_id | ❌ | Oven/grill temperature (sensor.meater_xxx_ambient) |
| Battery sensor | entity_id | ❌ | Probe battery level (sensor.meater_xxx_battery) |
| RSSI sensor | entity_id | ❌ | Signal strength (sensor.meater_xxx_rssi) |
| Mobile notification service | text | ❌ | e.g., notify.mobile_app_pixel_9_pro_xl |
| HA notification service | text | ❌ | e.g., notify.persistent_notification |
| Voice notification service | text | ❌ | e.g., notify.alexa_media_xxx |
| Notify 5 min before | toggle | ❌ | Default: disabled |
| Carryover compensation | toggle | ❌ | Default: enabled |

**Status:** ✅ Implemented

### 2.2 Configuration Modification
All parameters are modifiable via Options Flow (standard HA interface) after initial configuration.

**Status:** ✅ Implemented

### 2.3 Probe Connection Detection
Probe connected = probe temperature sensor available (not unknown/unavailable)

**Status:** ✅ Implemented

### 2.4 Language
The integration automatically uses the language configured in Home Assistant. No separate option.

**Status:** ✅ Implemented

---

## 3. Supported Languages

The integration and card are translated in the following languages:

| Code | Language | Backend | Frontend |
|------|----------|---------|----------|
| fr | Français | ✅ | ✅ |
| en | English | ✅ | ✅ |
| de | Deutsch | ✅ | ✅ |
| es | Español | ✅ | ✅ |
| pt | Português | ✅ | ✅ |
| it | Italiano | ✅ | ✅ |
| nl | Nederlands | ✅ | ✅ |
| pl | Polski | ✅ | ✅ |
| ru | Русский | ✅ | ✅ |
| zh | 中文 | ✅ | ✅ |
| ja | 日本語 | ✅ | ✅ |
| ko | 한국어 | ✅ | ✅ |
| ar | العربية | ✅ | ✅ |
| hi | हिन्दी | ✅ | ✅ |
| tr | Türkçe | ✅ | ✅ |
| sv | Svenska | ✅ | ✅ |
| da | Dansk | ✅ | ✅ |
| nb | Norsk | ✅ | ✅ |
| fi | Suomi | ✅ | ✅ |
| cs | Čeština | ✅ | ✅ |
| uk | Українська | ✅ | ✅ |

---

## 4. Integration States

### 4.1 State Machine
```
┌─────────────────────┐
│    DISCONNECTED     │ ◄── Probe off/inaccessible
└──────────┬──────────┘
           │ Probe connected
           ▼
┌─────────────────────┐
│        IDLE         │ ◄── Waiting, cooking configuration
└──────────┬──────────┘
           │ Action: start_cooking
           ▼
┌─────────────────────┐
│      COOKING        │ ◄── Cooking in progress, active calculations
└──────────┬──────────┘
           │ Target temperature reached (with carryover compensation if enabled)
           ▼
┌─────────────────────┐
│        DONE         │ ◄── Cooking finished, notifications sent
└──────────┬──────────┘
           │ Action: stop_cooking
           ▼
┌─────────────────────┐
│        IDLE         │
└─────────────────────┘
```

**Status:** ✅ Implemented

### 4.2 Special Transitions

| Situation | Behavior | Status |
|-----------|----------|--------|
| Disconnection during COOKING | Stays in COOKING, degraded display with counter | ✅ Implemented |
| Reconnection during COOKING | Resumes normal calculations | ✅ Implemented |
| Disconnection during DONE | Goes to DISCONNECTED | ✅ Implemented |
| stop_cooking action during COOKING | Goes to IDLE (cancellation) | ✅ Implemented |
| Target temperature change during COOKING | Recalculates estimates, start time unchanged | ✅ Implemented |
| Food change during COOKING | Updates target + recalculates estimates | ✅ Implemented |

---

## 5. Created Entities

For each configured device (example with name "meater"), the following entities are created:

### 5.1 Sensors

| Entity ID | Unit | Description | Status |
|-----------|------|-------------|--------|
| sensor.assistant_cooker_meater_state | - | Current state | ✅ |
| sensor.assistant_cooker_meater_probe_temperature | °C/°F | Current probe temperature | ✅ |
| sensor.assistant_cooker_meater_ambient_temperature | °C/°F | Current ambient temperature | ✅ |
| sensor.assistant_cooker_meater_target_temperature | °C/°F | Target temperature | ✅ |
| sensor.assistant_cooker_meater_start_time | datetime | Cooking start time | ✅ |
| sensor.assistant_cooker_meater_start_probe_temp | °C/°F | Probe temp at start | ✅ |
| sensor.assistant_cooker_meater_start_ambient_temp | °C/°F | Ambient temp at start | ✅ |
| sensor.assistant_cooker_meater_estimated_end_time | datetime | Estimated end time | ✅ |
| sensor.assistant_cooker_meater_remaining_time | minutes | Remaining duration | ✅ |
| sensor.assistant_cooker_meater_progress | % | Progress 0-100 | ✅ |
| sensor.assistant_cooker_meater_heating_rate | °C/min | Temperature rise rate | ✅ |
| sensor.assistant_cooker_meater_food_type | - | Selected food | ✅ |
| sensor.assistant_cooker_meater_doneness | - | Selected doneness | ✅ |
| sensor.assistant_cooker_meater_disconnect_duration | seconds | Disconnection duration | ✅ |
| sensor.assistant_cooker_meater_battery | % | Battery level | ✅ |
| sensor.assistant_cooker_meater_signal_strength | % | Signal strength | ✅ |

### 5.2 Binary Sensors

| Entity ID | Description | Status |
|-----------|-------------|--------|
| binary_sensor.assistant_cooker_meater_probe_connected | Probe connected yes/no | ✅ |

### 5.3 Switches

| Entity ID | Description | Status |
|-----------|-------------|--------|
| switch.assistant_cooker_meater_carryover_compensation | Thermal compensation on/off | ✅ |

### 5.4 State Entity Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| probe_connected | bool | Probe connected |
| battery | float | Battery percentage (0-100) |
| rssi | int | Signal strength in dBm |
| desired_temp | float | Final target temperature |
| withdrawal_temp | float | Withdrawal temperature (with compensation) |
| carryover_enabled | bool | Compensation active |
| is_manual_mode | bool | Manual temperature mode |
| manual_temp_memory | float | Last manual temperature |
| food_category | str | Food category |
| food_type | str | Food type |
| food_doneness | str | Doneness level |
| temp_history | list | History [timestamp, temp] probe |
| ambient_history | list | History [timestamp, temp] ambient |

### 5.5 Units
All temperatures respect Home Assistant system setting (°C or °F). Conversions are handled automatically.

---

## 6. Exposed Services

| Service | Parameters | Description | Status |
|---------|------------|-------------|--------|
| assistant_cooker.start_cooking | entity_id | Start cooking | ✅ |
| assistant_cooker.stop_cooking | entity_id | Stop/cancel cooking | ✅ |
| assistant_cooker.set_target_temp | entity_id, temperature | Change target temperature | ✅ |
| assistant_cooker.set_food | entity_id, category, food, doneness | Change food and doneness | ✅ |
| assistant_cooker.set_carryover | entity_id, enabled | Enable/disable compensation | ✅ |

---

## 7. Notifications

### 7.1 Triggers

| Event | Condition | Status |
|-------|-----------|--------|
| 5 min before | Toggle enabled + never sent this cooking | ✅ Implemented |
| Cooking done | Target temp reached | ✅ Implemented |
| Probe disconnected | Disconnection > 30s during cooking | ✅ Implemented |

### 7.2 Notification Format
```yaml
# Mobile
service: notify.mobile_app_xxx
data:
  title: "Assistant Cooker"
  message: "{{ message }}"
  data:
    ttl: 0
    priority: high

# HA Persistent
service: notify.persistent_notification
data:
  title: "Assistant Cooker"
  message: "{{ message }}"

# Alexa/Voice assistant
service: notify.alexa_media_xxx
data:
  message: "{{ message }}"
```

### 7.3 Anti-bounce
- **"5 min before" notification**: Sent once per cooking, except if manual target temperature change (resets flag)
- **"Cooking done" notification**: Sent once per cooking
- **Disconnection notification**: 5 minute cooldown between notifications

---

## 8. Cooking Time Calculation

### 8.1 Basic Algorithm (probe temperature only)
```
heating_rate = moving_average(ΔT / Δt, over last 5 minutes)
remaining_temp = target_temp - current_temp
remaining_time = remaining_temp / heating_rate
```

**Status:** ✅ Implemented

### 8.2 Advanced Algorithm (with ambient temperature)
Uses Newton's law of heating:
```
T(t) = T_ambient - (T_ambient - T_initial) × e^(-k×t)
```

Where `k` is calculated dynamically from observed data.

**Status:** ✅ Implemented

### 8.3 Automatic Selection
- If only probe temperature available → basic algorithm
- If ambient temperature available → advanced algorithm
- Prediction smoothing to avoid jumps (moving average)

### 8.4 Carryover Compensation

When enabled, effective target temperature is reduced based on food:

| Type | Compensation |
|------|--------------|
| Beef/Lamb (large roast) | -5°C |
| Beef/Lamb (steak) | -3°C |
| Pork (roast) | -4°C |
| Poultry | -2°C |
| Fish | -2°C |
| Other | -3°C |

The `raw_target` attribute of target_temp sensor contains the value before compensation.

**Status:** ✅ Implemented

### 8.5 Implemented Constraints
- Maximum displayed remaining time: 720 minutes (12 hours)
- Minimum data before calculation: 30 seconds
- Displays "~" if heating rate not calculable

---

## 9. Food Database

### 9.1 Structure
```
Category
└── Food
    └── Doneness → Target temperature
```

**Status:** ✅ Implemented

### 9.2 Data (temperatures in °C)

#### Beef
| Food | Doneness | Temperature |
|------|----------|-------------|
| Steak | Blue | 46 |
| Steak | Rare | 52 |
| Steak | Medium Rare | 55 |
| Steak | Medium | 57 |
| Steak | Medium Well | 63 |
| Steak | Well Done | 68 |
| Roast | Rare | 52 |
| Roast | Medium Rare | 55 |
| Roast | Medium | 57 |
| Roast | Medium Well | 63 |
| Roast | Well Done | 68 |
| Burger | Medium | 63 |
| Burger | Well Done | 71 |
| Burger | Safe | 71 |
| Prime Rib | Rare | 52 |
| Prime Rib | Medium Rare | 55 |
| Prime Rib | Medium | 57 |
| Prime Rib | Medium Well | 63 |
| Prime Rib | Well Done | 68 |
| Brisket | Pulled | 93 |

#### Pork
| Food | Doneness | Temperature |
|------|----------|-------------|
| Chop | Medium | 63 |
| Chop | Well done | 71 |
| Tenderloin | Medium | 63 |
| Tenderloin | Well done | 68 |
| Roast | Medium | 63 |
| Roast | Well done | 71 |
| Ribs | Tender | 88 |
| Pulled pork | Pulled | 93 |
| Ham | Reheated | 60 |

#### Poultry
| Food | Doneness | Temperature |
|------|----------|-------------|
| Whole Chicken | Done | 74 |
| Chicken Breast | Done | 74 |
| Chicken Thigh | Done | 74 |
| Chicken Thigh | Tender | 76 |
| Turkey Breast | Done | 74 |
| Duck Breast | Pink | 57 |
| Duck Breast | Medium | 63 |

#### Lamb
| Food | Doneness | Temperature |
|------|----------|-------------|
| Leg | Rare | 52 |
| Leg | Pink | 57 |
| Leg | Medium | 63 |
| Leg | Well Done | 68 |
| Chops | Rare | 52 |
| Chops | Pink | 57 |
| Chops | Medium | 63 |
| Rack | Rare | 52 |
| Rack | Pink | 57 |
| Rack | Medium | 63 |

#### Veal
| Food | Doneness | Temperature |
|------|----------|-------------|
| Roast | Medium | 63 |
| Roast | Well done | 68 |
| Chop | Medium | 63 |
| Cutlet | Medium | 63 |

#### Fish
| Food | Doneness | Temperature |
|------|----------|-------------|
| Salmon | Mi-Cuit | 46 |
| Salmon | Medium | 52 |
| Salmon | Well Done | 60 |
| Tuna | Rare | 43 |
| Tuna | Medium | 52 |

**Database Synchronization:**
- **Status:** ✅ Automated (v0.0.35)
- Frontend `food-database.js` is AUTO-GENERATED from backend `food_data.py`
- **DO NOT edit `food-database.js` manually** - it will be overwritten
- **Source of truth:** `food_data.py` (Python backend)
- **Generation:** Run `python scripts/generate_food_database.py` after modifying `food_data.py`
- **Why:** Eliminates manual synchronization errors and duplication
- Previous issues (v0.0.34): Manual sync led to temperature mismatches (duck breast, lamb, etc.)

### 9.3 Extensibility
The architecture allows easy addition of new foods via JSON translation files. Planned for future "favorites" custom feature.

---

## 10. User Interface (Lovelace Card)

### 10.1 Card Configuration (GUI)

The card has a complete visual editor.

| Option | Type | Description | Status |
|--------|------|-------------|--------|
| Entity prefix | text | Entity prefix | ✅ |
| Name | text | Displayed name (optional) | ✅ |
| Show battery | toggle | Show/hide battery | ✅ |
| Show signal | toggle | Show/hide RSSI | ✅ |
| Show graph | toggle | Show/hide graph | ✅ |
| Show ambient | toggle | Show ambient temp | ✅ |
| Show rate | toggle | Show heating rate | ✅ |

### 10.2 Display by State

#### DISCONNECTED State
- Centered message "Please connect the cooking probe"
- Gray background/badge

**Status:** ✅ Implemented

#### IDLE State
- Blue "READY" badge
- Circle with current temperature (160px, 32px font)
- Selectors: Category → Food → Doneness
- Settings: Target temperature + Compensation
- "Start" button

**Status:** ✅ Implemented

#### COOKING State
- Orange "COOKING" badge
- Header: State badge, battery, signal (food display removed - space reserved for future)
- 3-column CSS Grid layout (1fr 2fr 1fr):
  - Left: Elapsed, Start, Ambient
  - Center: Progress circle (always centered)
  - Right: Remaining, Est. end, Rate
- "Stop" button
- Graph visible

**Status:** ✅ Implemented

#### COOKING with Probe Disconnected
- Warning message with real-time counter
- Temperatures display "--"
- Graph: line stops at disconnection

**Status:** ✅ Implemented

#### DONE State
- Green "DONE" badge
- Green circle at 100%
- "Stop" button to reset

**Status:** ✅ Implemented

### 10.3 Interactions (Clickable elements → more-info)

| Element | Target entity | Status |
|---------|---------------|--------|
| State badge | sensor.{prefix}_state | ✅ |
| Battery | sensor.{prefix}_battery | ✅ |
| Signal | sensor.{prefix}_signal_strength | ✅ |
| Probe temperature | sensor.{prefix}_probe_temperature | ✅ |
| Progress % | sensor.{prefix}_progress | ✅ |
| Elapsed/remaining time | sensor.{prefix}_remaining_time | ✅ |
| Start time | sensor.{prefix}_start_time | ✅ |
| End time | sensor.{prefix}_estimated_end_time | ✅ |
| Target temperature | sensor.{prefix}_target_temperature | ✅ |
| Heating rate | sensor.{prefix}_heating_rate | ✅ |
| Ambient temperature | sensor.{prefix}_ambient_temperature | ✅ |

### 10.4 Colors

| Element | Color |
|---------|-------|
| Progress < 80% | Blue (#03a9f4) |
| Progress 80-99% | Orange (#ff9800) |
| Progress 100% | Green (#4caf50) |
| Start button | Green |
| Stop button | Red |
| Error/Disconnection | Red/Orange |
| DISCONNECTED background | Gray |

### 10.5 Compensation Help Popup
- "?" button next to compensation toggle
- Modal popup with title, explanatory text, close button
- Text translated in all supported languages

**Status:** ✅ Implemented

---

## 11. Frontend Architecture: Translation System (v0.0.32+, Lazy-loading v0.0.33+)

### 11.1 Key-Based Translation Model

The frontend uses a key-based system where the FOOD_DATABASE contains only structural references (keys), and all text content comes from language-specific translation files.

**Advantages:**
- Language-agnostic core structure
- Single source of truth per language
- No multilingual label duplication
- Easy to add new languages (one file with 62+ keys)
- Easy to add new foods (add to FOOD_DATABASE structure, then add keys to all 21 language files)

### 11.2 FOOD_DATABASE Structure (frontend/data/food-database.js)

Contains only keys and temperatures - NO labels:

```javascript
export const FOOD_DATABASE = {
  manual: {
    categoryKey: "category_manual",
    foods: {
      manual: {
        foodKey: "food_manual",
        doneness: {
          manual: { donenessKey: "doneness_manual", temp: null }
        }
      }
    }
  },
  beef: {
    categoryKey: "category_beef",
    foods: {
      steak: {
        foodKey: "food_beef_steak",
        doneness: {
          blue: { donenessKey: "doneness_blue", temp: 46 },
          rare: { donenessKey: "doneness_rare", temp: 52 },
          // ... more doneness levels
        }
      },
      // ... more foods
    }
  },
  // ... more categories (pork, poultry, lamb, fish)
};
```

Key naming convention:
- Categories: `category_beef`, `category_pork`, etc.
- Foods: `food_beef_steak`, `food_pork_chop`, etc.
- Doneness: `doneness_rare`, `doneness_medium`, etc.

### 11.3 Translation Files (frontend/translations/*.js)

Each language file contains ALL 97 translation keys:

```javascript
// frontend/translations/fr.js (French - complete)
export const translations = {
  // Categories (9)
  category_manual: "🎯 Manuel",
  category_beef: "🥩 Bœuf",
  category_pork: "🐷 Porc",
  category_poultry: "🍗 Volaille",
  category_lamb: "🐑 Agneau",
  category_fish: "🐟 Poisson",
  category_veal: "🐄 Veau",
  category_game: "🦌 Gibier",
  category_other: "🥚 Autre",

  // Foods (45)
  food_manual: "Manuel",
  food_beef_steak: "Steak",
  food_beef_roast: "Rôti",
  // ... 42 more foods
  food_other_egg_hard_boiled: "Œuf Dur",

  // Doneness levels (21)
  doneness_manual: "Manuel",
  doneness_blue: "Bleu",
  doneness_rare: "Saignant",
  doneness_medium_rare: "Rosé",
  doneness_medium: "À Point",
  // ... 16 more levels
  doneness_pulled: "Effiloché",
  doneness_safe: "Sécuritaire",

  // UI strings (22)
  disconnected: "Déconnecté",
  connect_probe: "Connecter la Sonde",
  idle: "Prêt",
  cooking: "Cuisson en cours",
  done: "Fait!",
  // ... 17 more UI strings
};
```

### 11.4 Supported Languages (21)

All translation files are complete with all 97 keys translated:
FR, EN, DE, ES, IT, PT, NL, PL, RU, ZH, JA, KO, AR, HI, TR, SV, DA, NB, FI, CS, UK

**Status:** ✅ Complete (v0.0.32+)
**Updated:** v0.0.35 - Added 34 new translation keys (3 categories, 24 foods, 7 doneness levels)

### 11.5 Translation Loading (Lazy-Loading with English Fallback)

The system uses **lazy-loading to minimize initial bundle size**. English is loaded by default at startup as a fallback. Other languages are loaded dynamically on-demand when the user selects them and are cached in memory for reuse.

**Startup Behavior:**
- Only `en.js` (~2-3 KB) is imported at module initialization
- Card is guaranteed to have English translations available immediately
- All 21 language files remain in the repository and HACS package (for on-demand loading)

**Language Selection:**
- When user's Home Assistant language is detected, the card loads the corresponding language file via dynamic `import()`
- If the language is already cached (user switched before), the cached version is used
- If the language fails to load, gracefully falls back to English

```javascript
// Constructor: English always available
this._translations = enTranslations;
this._translationsCache = { en: enTranslations };

// On language change: load dynamically or use cache
if (this._lang === "en") {
  this._translations = this._translationsCache.en;  // Use cached English
} else if (this._translationsCache[this._lang]) {
  this._translations = this._translationsCache[this._lang];  // Use cached language
} else {
  // Load language dynamically
  const langModule = await import(`./translations/${this._lang}.js`);
  this._translationsCache[this._lang] = langModule.translations;
  this._translations = langModule.translations;
}

// Translation method with fallback chain
_t(key) {
  return this._translations?.[key] ||           // Try current language
         this._translationsCache.en[key] ||     // Fallback to cached English
         key;                                   // Last resort: return key name
}
```

**Status:** ✅ Implemented (v0.0.33+)

---

## 12. Graph

### 12.1 Technology
ApexCharts integration directly in the card (no external dependency).

**Status:** ✅ Implemented

### 12.2 Displayed Data

| Series | Color | Style | Status |
|--------|-------|-------|--------|
| Probe temperature | Blue | Solid line | ✅ |
| Ambient temperature | Orange | Solid line (right Y-axis) | ✅ |
| Target temperature | Red | Dashed horizontal line | ✅ |
| Projection | Light blue | Dashed line | ✅ |

**Data Source (v0.0.36+):**
- Temperature history loaded from `sensor.assistantcooker_state.attributes`
- Keys: `temp_history` and `ambient_history`
- Format: Array of `[["ISO timestamp", temperature], ...]`
- Processed by `chart-manager.js` module

### 12.3 Behavior
- **Data source**: Home Assistant History API (not just current session)
- **Update**: Throttle at 30 seconds (to allow tooltip interaction)
- **Disconnection**: Line stops, resumes on reconnection

### 12.4 Span Control

Available options: Auto, 5min, 15min, 30min, 1h, 2h, 4h, 6h, 8h, 12h, 24h

**Auto mode:**
- If estimated duration known: span from start to estimated end (dynamic)
- Otherwise: progressive steps (5min→10min→15min→30min→...)

**Manual mode:**
- Fixed span as selected
- Display: 2/3 past, 1/3 future relative to current time

**Status:** ✅ Implemented

---

## 13. File Structure

```
assistant-cooker/
├── README.md
├── LICENSE
├── SPECIFICATIONS.md          # This file
├── AI_DEVELOPMENT_GUIDE.md    # AI development guide
├── hacs.json
├── custom_components/
│   └── assistant_cooker/
│       ├── __init__.py
│       ├── manifest.json
│       ├── const.py
│       ├── config_flow.py
│       ├── coordinator.py
│       ├── sensor.py
│       ├── binary_sensor.py
│       ├── switch.py
│       ├── services.py
│       ├── services.yaml
│       ├── calculations.py
│       ├── food_data.py
│       ├── strings.json
│       ├── manifest.json
│       ├── translations/
│       │   ├── en.json, fr.json, de.json, es.json, it.json
│       │   ├── pt.json, nl.json, pl.json, ru.json
│       │   ├── zh.json, ja.json, ko.json, ar.json
│       │   ├── hi.json, tr.json, sv.json, da.json
│       │   ├── nb.json, fi.json, cs.json, uk.json
│       └── frontend/                # Modular Lovelace card (v0.0.32+)
│           ├── __init__.py          # Lovelace resource registration
│           ├── assistant-cooker-card.js  # Main card (~1,100 lines)
│           ├── data/                # Data modules
│           │   ├── food-database.js # FOOD_DATABASE (key-based, ~160 lines)
│           │   └── span-options.js  # SPAN_OPTIONS (English-only, ~15 lines)
│           └── translations/        # 21 language files (62+ keys each)
│               ├── en.js, fr.js, de.js, es.js, it.js
│               ├── pt.js, nl.js, pl.js, ru.js, zh.js
│               ├── ja.js, ko.js, ar.js, hi.js, tr.js
│               └── sv.js, da.js, nb.js, fi.js, cs.js, uk.js
└── .github/
    └── workflows/
        └── release.yml              # CI/CD (to create)
```

---

## 13. Compatibility and Requirements

### 13.1 Home Assistant
- Minimum version: 2024.1.0
- Lovelace mode: Storage (recommended) or YAML

### 13.2 HACS
- Type: Integration
- Category: Custom repository

### 13.3 Python Dependencies
No external dependencies (uses standard HA libraries).

### 13.4 Frontend Dependencies
- LitElement (provided by HA)
- ApexCharts (bundled in the card)

---

## 14. Future Enhancements (not currently included)

These features are planned in the architecture but not implemented:

1. **Cooking history**: Storage and display of past cooks
2. **Favorites/Presets**: Save custom food/doneness combinations
3. **Local sound alerts**: Playback on media_player
4. **Custom foods**: Add foods via interface
5. **Data export**: CSV/JSON of cooks
6. **Multi-probe support**: Multiple probes on one card
7. **Comparative graphs**: Overlay cooks

---

## 15. Testing and Validation

### 15.1 Unit Tests
- Time calculation algorithms
- Temperature conversions
- State machine

**Status:** ⏳ To do

### 15.2 Integration Tests
- Complete config flow
- Entity creation/deletion
- Services

**Status:** ⏳ To do

### 15.3 Manual Testing
- HACS installation
- Device configuration
- Complete cooking cycle
- Disconnection behavior
- Notifications
- Multi-language

**Status:** ✅ In progress

---

## 16. Progress Summary

### Phase 1: Foundations ✅
- [x] Repository structure
- [x] Config Flow
- [x] Base entities

### Phase 2: Business Logic ✅
- [x] State machine
- [x] Services
- [x] Calculation algorithms (basic + Newton)
- [x] Food database
- [x] Notifications

### Phase 3: Frontend ✅
- [x] Base card
- [x] Card editor
- [x] Complete interface
- [x] ApexCharts graph
- [x] Styles and themes
- [x] Disconnect warning during cooking

### Phase 4: Internationalization ✅
- [x] Translation structure
- [x] 21 languages (FR, EN, DE, ES, IT, PT, NL, PL, RU, ZH, JA, KO, AR, HI, TR, SV, DA, NB, FI, CS, UK)

### Phase 5: Finalization ⏳
- [ ] Complete tests
- [ ] Final documentation
- [ ] HACS release
