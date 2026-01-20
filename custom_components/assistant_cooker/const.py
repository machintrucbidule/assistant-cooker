"""Constants for Assistant Cooker integration."""
from __future__ import annotations

from pathlib import Path
import json
from typing import Final

# Read version from manifest.json
MANIFEST_PATH = Path(__file__).parent / "manifest.json"
with open(MANIFEST_PATH, encoding="utf-8") as f:
    INTEGRATION_VERSION: Final[str] = json.load(f).get("version", "0.0.0")

DOMAIN: Final[str] = "assistant_cooker"
NAME: Final[str] = "Assistant Cooker"

# Base URL for frontend resources
URL_BASE: Final[str] = "/assistant-cooker"

# JavaScript modules to register
JSMODULES: Final[list[dict[str, str]]] = [
    {
        "name": "Assistant Cooker Card",
        "filename": "assistant-cooker-card.js",
        "version": INTEGRATION_VERSION,
    },
]

# Platforms
PLATFORMS: Final[list[str]] = ["sensor", "binary_sensor", "switch"]

# Configuration keys
CONF_PROBE_SENSOR: Final[str] = "probe_sensor"
CONF_AMBIENT_SENSOR: Final[str] = "ambient_sensor"
CONF_BATTERY_SENSOR: Final[str] = "battery_sensor"
CONF_RSSI_SENSOR: Final[str] = "rssi_sensor"
CONF_NOTIFY_MOBILE: Final[str] = "notify_mobile"
CONF_NOTIFY_HA: Final[str] = "notify_ha"
CONF_NOTIFY_VOICE: Final[str] = "notify_voice"
CONF_NOTIFY_5MIN_BEFORE: Final[str] = "notify_5min_before"
CONF_NOTIFY_DISCONNECT: Final[str] = "notify_disconnect"

# States
STATE_DISCONNECTED: Final[str] = "disconnected"
STATE_IDLE: Final[str] = "idle"
STATE_COOKING: Final[str] = "cooking"
STATE_DONE: Final[str] = "done"

# Defaults
DEFAULT_NOTIFY_5MIN_BEFORE: Final[bool] = False
DEFAULT_NOTIFY_DISCONNECT: Final[bool] = False
DEFAULT_CARRYOVER_COMPENSATION: Final[bool] = True

# Update interval in seconds
UPDATE_INTERVAL: Final[int] = 5

# Notification cooldowns (seconds)
NOTIFICATION_COOLDOWN_DISCONNECT: Final[int] = 300  # 5 minutes

# Carryover type weights for dynamic calculation (relative factors, not absolute temps)
# These are used as multipliers in the dynamic carryover calculation
# Higher values = food retains more heat after removal
CARRYOVER_TYPE_WEIGHTS: Final[dict[str, float]] = {
    "beef_roast": 1.5,      # Large mass, retains a lot of heat
    "beef_steak": 0.8,      # Thin, less heat retention
    "pork_roast": 1.3,      # Medium-large mass
    "pork_other": 0.9,      # Variable, medium
    "poultry": 0.7,         # Lower density, less retention
    "fish": 0.5,            # Low mass, quick heat loss
    "lamb_roast": 1.4,      # Similar to beef roast
    "lamb_other": 0.8,      # Similar to steak
    "veal": 1.0,            # Medium
    "other": 1.0,           # Default baseline
}

# Sensor attributes
ATTR_RAW_TARGET: Final[str] = "raw_target"
ATTR_CATEGORY: Final[str] = "category"
ATTR_TREND: Final[str] = "trend"
ATTR_TOTAL_ESTIMATED: Final[str] = "total_estimated"
ATTR_DESIRED_TEMP: Final[str] = "desired_temp"
ATTR_IS_MANUAL: Final[str] = "is_manual"

# Trend values
TREND_INCREASING: Final[str] = "increasing"
TREND_STABLE: Final[str] = "stable"
TREND_DECREASING: Final[str] = "decreasing"

# Carryover calculation parameters
CARRYOVER_BASE_RATE: Final[float] = 1.0  # °C/min reference heating rate
AMBIENT_AFTER_REMOVAL: Final[float] = 22.0  # Room temperature °C

# Storage keys for persistent data
STORAGE_KEY_CARRYOVER_ENABLED: Final[str] = "carryover_compensation_enabled"
STORAGE_KEY_MANUAL_TEMP: Final[str] = "manual_temp"
STORAGE_KEY_FOOD_CATEGORY: Final[str] = "food_category"
STORAGE_KEY_FOOD_TYPE: Final[str] = "food_type"
STORAGE_KEY_FOOD_DONENESS: Final[str] = "food_doneness"
STORAGE_KEY_DESIRED_TEMP: Final[str] = "desired_temp"
STORAGE_KEY_IS_MANUAL_MODE: Final[str] = "is_manual_mode"
