"""Data coordinator for Assistant Cooker integration."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    CONF_PROBE_SENSOR,
    CONF_AMBIENT_SENSOR,
    CONF_BATTERY_SENSOR,
    CONF_RSSI_SENSOR,
    CONF_NOTIFY_MOBILE,
    CONF_NOTIFY_HA,
    CONF_NOTIFY_VOICE,
    CONF_NOTIFY_5MIN_BEFORE,
    CONF_NOTIFY_DISCONNECT,
    STATE_DISCONNECTED,
    STATE_IDLE,
    STATE_COOKING,
    STATE_DONE,
    UPDATE_INTERVAL,
    NOTIFICATION_COOLDOWN_DISCONNECT,
    CARRYOVER_TYPE_WEIGHTS,
    CARRYOVER_BASE_RATE,
    AMBIENT_AFTER_REMOVAL,
    DEFAULT_NOTIFY_5MIN_BEFORE,
    DEFAULT_NOTIFY_DISCONNECT,
    DEFAULT_CARRYOVER_COMPENSATION,
    STORAGE_KEY_CARRYOVER_ENABLED,
    STORAGE_KEY_MANUAL_TEMP,
    STORAGE_KEY_FOOD_CATEGORY,
    STORAGE_KEY_FOOD_TYPE,
    STORAGE_KEY_FOOD_DONENESS,
    STORAGE_KEY_DESIRED_TEMP,
    STORAGE_KEY_IS_MANUAL_MODE,
)
from .calculations import CookingCalculator
from .food_data import get_temperature, get_carryover_type, is_manual_mode, MANUAL_CATEGORY, MANUAL_FOOD, MANUAL_DONENESS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


class AssistantCookerCoordinator(DataUpdateCoordinator):
    """Coordinator for Assistant Cooker data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )

        self.entry = entry
        self.config = entry.data
        self._calculator = CookingCalculator()
        self._store = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self._stored_data: dict[str, Any] = {}

        # State machine
        self._state: str = STATE_DISCONNECTED
        self._cooking_started: bool = False

        # Cooking data
        self._start_time: datetime | None = None
        self._start_probe_temp: float | None = None
        self._start_ambient_temp: float | None = None
        self._cooking_end_time: datetime | None = None  # When cooking finished
        
        # Temperature model:
        # - _desired_temp: the final temperature user wants (what they input/select)
        # - _withdrawal_temp: calculated temperature at which to remove (with carryover)
        # - In manual mode or carryover disabled: withdrawal = desired
        self._desired_temp: float = 57.0
        self._withdrawal_temp: float = 57.0
        self._is_manual_mode: bool = False
        
        # Carryover compensation toggle (persistent)
        self._carryover_enabled: bool = DEFAULT_CARRYOVER_COMPENSATION
        
        # Manual mode memory (persistent)
        self._manual_temp_memory: float = 60.0
        
        self._food_category: str = "beef"
        self._food_type: str = "steak"
        self._food_doneness: str = "medium"

        # Temperature history for calculations (kept even outside cooking for graph)
        self._temp_history: list[tuple[datetime, float]] = []
        self._ambient_history: list[tuple[datetime, float]] = []

        # Notification flags
        self._notified_5min: bool = False
        self._notified_done: bool = False
        self._last_disconnect_notification: datetime | None = None
        self._disconnect_start: datetime | None = None

        # Set up state listeners
        self._setup_listeners()

    async def async_load_stored_data(self) -> None:
        """Load persistent data from storage."""
        data = await self._store.async_load()
        if data:
            self._stored_data = data
            self._carryover_enabled = data.get(STORAGE_KEY_CARRYOVER_ENABLED, DEFAULT_CARRYOVER_COMPENSATION)
            self._manual_temp_memory = data.get(STORAGE_KEY_MANUAL_TEMP, 60.0)
            self._food_category = data.get(STORAGE_KEY_FOOD_CATEGORY, "beef")
            self._food_type = data.get(STORAGE_KEY_FOOD_TYPE, "steak")
            self._food_doneness = data.get(STORAGE_KEY_FOOD_DONENESS, "medium")
            self._desired_temp = data.get(STORAGE_KEY_DESIRED_TEMP, 57.0)
            self._is_manual_mode = data.get(STORAGE_KEY_IS_MANUAL_MODE, False)
            # Recalculate withdrawal temp based on loaded data
            self._update_withdrawal_temp()
            _LOGGER.debug("Loaded stored data: carryover=%s, manual_temp=%s, category=%s, food=%s, doneness=%s, desired_temp=%s, manual_mode=%s", 
                         self._carryover_enabled, self._manual_temp_memory, self._food_category, 
                         self._food_type, self._food_doneness, self._desired_temp, self._is_manual_mode)

    async def async_save_stored_data(self) -> None:
        """Save persistent data to storage."""
        self._stored_data[STORAGE_KEY_CARRYOVER_ENABLED] = self._carryover_enabled
        self._stored_data[STORAGE_KEY_MANUAL_TEMP] = self._manual_temp_memory
        self._stored_data[STORAGE_KEY_FOOD_CATEGORY] = self._food_category
        self._stored_data[STORAGE_KEY_FOOD_TYPE] = self._food_type
        self._stored_data[STORAGE_KEY_FOOD_DONENESS] = self._food_doneness
        self._stored_data[STORAGE_KEY_DESIRED_TEMP] = self._desired_temp
        self._stored_data[STORAGE_KEY_IS_MANUAL_MODE] = self._is_manual_mode
        await self._store.async_save(self._stored_data)

    def _setup_listeners(self) -> None:
        """Set up state change listeners for source sensors."""
        entities_to_track = [self.config[CONF_PROBE_SENSOR]]
        
        if self.config.get(CONF_AMBIENT_SENSOR):
            entities_to_track.append(self.config[CONF_AMBIENT_SENSOR])
        if self.config.get(CONF_RSSI_SENSOR):
            entities_to_track.append(self.config[CONF_RSSI_SENSOR])

        @callback
        def async_state_changed_listener(event) -> None:
            """Handle state changes."""
            self.async_set_updated_data(self._build_data())

        self.entry.async_on_unload(
            async_track_state_change_event(
                self.hass, entities_to_track, async_state_changed_listener
            )
        )

    @property
    def device_name(self) -> str:
        """Return the device name."""
        return self.config.get("name", "Assistant Cooker")

    @property
    def unique_id_prefix(self) -> str:
        """Return unique ID prefix for entities."""
        return self.entry.entry_id

    def _is_sensor_available(self, entity_id: str | None) -> bool:
        """Check if a sensor is available."""
        if not entity_id:
            return False
        state = self.hass.states.get(entity_id)
        if state is None:
            return False
        return state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN, None, "")

    def _get_sensor_value(self, entity_id: str | None) -> float | None:
        """Get numeric value from a sensor."""
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None:
            return None
        if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN, None, ""):
            return None
        try:
            return float(state.state)
        except (ValueError, TypeError):
            return None

    def _is_probe_connected(self) -> bool:
        """Check if probe is connected based on probe temperature availability."""
        return self._is_sensor_available(self.config[CONF_PROBE_SENSOR])

    def _update_state(self) -> None:
        """Update the state machine."""
        probe_connected = self._is_probe_connected()
        
        if self._state == STATE_DISCONNECTED:
            if probe_connected:
                self._state = STATE_IDLE
                self._disconnect_start = None
                
        elif self._state == STATE_IDLE:
            if not probe_connected:
                self._state = STATE_DISCONNECTED
                
        elif self._state == STATE_COOKING:
            # Check if withdrawal temp reached
            probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
            if probe_temp is not None and probe_temp >= self._withdrawal_temp:
                self._state = STATE_DONE
                self._cooking_end_time = dt_util.utcnow()
                self._handle_cooking_done()
            
            # Handle disconnection during cooking
            if not probe_connected:
                if self._disconnect_start is None:
                    self._disconnect_start = dt_util.utcnow()
                self._maybe_notify_disconnect()
            else:
                self._disconnect_start = None
                
        elif self._state == STATE_DONE:
            if not probe_connected:
                self._state = STATE_DISCONNECTED
                self._reset_cooking_data()

    def _handle_cooking_done(self) -> None:
        """Handle when cooking is done."""
        if not self._notified_done:
            self._notified_done = True
            self.hass.async_create_task(self._send_notification("done"))

    def _maybe_notify_disconnect(self) -> None:
        """Send disconnect notification if enabled and cooldown passed."""
        if not self.config.get(CONF_NOTIFY_DISCONNECT, DEFAULT_NOTIFY_DISCONNECT):
            return
            
        now = dt_util.utcnow()
        
        if self._disconnect_start is None:
            return
        if (now - self._disconnect_start).total_seconds() < 30:
            return
            
        if self._last_disconnect_notification is not None:
            elapsed = (now - self._last_disconnect_notification).total_seconds()
            if elapsed < NOTIFICATION_COOLDOWN_DISCONNECT:
                return
        
        self._last_disconnect_notification = now
        self.hass.async_create_task(self._send_notification("disconnect"))

    def _check_5min_notification(self) -> None:
        """Check and send 5-minute notification if needed."""
        if not self.config.get(CONF_NOTIFY_5MIN_BEFORE, DEFAULT_NOTIFY_5MIN_BEFORE):
            return
        if self._notified_5min:
            return
        if self._state != STATE_COOKING:
            return
            
        remaining = self._calculate_remaining_time()
        if remaining is not None and remaining <= 5:
            self._notified_5min = True
            self.hass.async_create_task(self._send_notification("5min"))

    async def _send_notification(self, notification_type: str) -> None:
        """Send notification to configured services."""
        messages = {
            "5min": {
                "title": "🍖 Assistant Cooker",
                "message": "Plus que 5 minutes !",
            },
            "done": {
                "title": "✅ Assistant Cooker",
                "message": "Cuisson terminée ! Retirer maintenant.",
            },
            "disconnect": {
                "title": "⚠️ Assistant Cooker",
                "message": "Sonde déconnectée !",
            },
        }
        
        msg = messages.get(notification_type, {})
        if not msg:
            return

        mobile_service = self.config.get(CONF_NOTIFY_MOBILE)
        if mobile_service:
            try:
                await self.hass.services.async_call(
                    "notify",
                    mobile_service.replace("notify.", ""),
                    {
                        "title": msg["title"],
                        "message": msg["message"],
                        "data": {"ttl": 0, "priority": "high"},
                    },
                )
            except Exception as e:
                _LOGGER.error("Failed to send mobile notification: %s", e)

        ha_notify = self.config.get(CONF_NOTIFY_HA)
        if ha_notify:
            try:
                await self.hass.services.async_call(
                    "persistent_notification",
                    "create",
                    {
                        "title": msg["title"],
                        "message": msg["message"],
                        "notification_id": f"assistant_cooker_{notification_type}",
                    },
                )
            except Exception as e:
                _LOGGER.error("Failed to send HA notification: %s", e)

        voice_service = self.config.get(CONF_NOTIFY_VOICE)
        if voice_service:
            try:
                await self.hass.services.async_call(
                    "notify",
                    voice_service.replace("notify.", ""),
                    {
                        "message": msg["message"],
                    },
                )
            except Exception as e:
                _LOGGER.error("Failed to send voice notification: %s", e)

    def _calculate_remaining_time(self) -> float | None:
        """Calculate remaining cooking time in minutes."""
        if self._state != STATE_COOKING:
            return None
            
        probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
        if probe_temp is None:
            return None
            
        ambient_temp = None
        if self.config.get(CONF_AMBIENT_SENSOR):
            ambient_temp = self._get_sensor_value(self.config[CONF_AMBIENT_SENSOR])
        
        return self._calculator.calculate_remaining_time(
            current_temp=probe_temp,
            target_temp=self._withdrawal_temp,
            temp_history=self._temp_history,
            ambient_temp=ambient_temp,
            ambient_history=self._ambient_history,
        )

    def _calculate_heating_rate(self) -> float | None:
        """Calculate current heating rate in °C/min."""
        return self._calculator.calculate_heating_rate(self._temp_history)

    def _calculate_dynamic_carryover(self) -> float:
        """
        Calculate dynamic carryover compensation based on:
        1. Heating rate (faster = more thermal energy stored)
        2. Ambient/cooking temperature (higher = more heat differential)
        3. Food type weight (larger mass = more heat retention)
        
        Returns the degrees to subtract from desired temp to get withdrawal temp.
        Returns 0 if not enough data or carryover is disabled.
        """
        if not self._carryover_enabled:
            return 0.0
        
        # Get current heating rate
        heating_rate = self._calculate_heating_rate()
        if heating_rate is None or heating_rate <= 0:
            # No data yet - withdrawal = desired until we have data
            return 0.0
        
        # Get food type weight factor
        carryover_type = get_carryover_type(self._food_category, self._food_type)
        type_weight = CARRYOVER_TYPE_WEIGHTS.get(carryover_type, 1.0)
        
        # Get ambient cooking temperature
        ambient_temp = None
        if self.config.get(CONF_AMBIENT_SENSOR):
            ambient_temp = self._get_sensor_value(self.config[CONF_AMBIENT_SENSOR])
        
        # Base carryover calculation from heating rate
        # At 1°C/min rate, expect ~2°C carryover as baseline
        # Scale with rate: faster heating = more stored energy
        rate_factor = min(3.0, max(0.3, heating_rate / CARRYOVER_BASE_RATE))
        base_carryover = 2.0 * rate_factor
        
        # Adjust based on ambient temperature if available
        # Higher ambient = larger temp differential = more carryover
        ambient_factor = 1.0
        if ambient_temp is not None and ambient_temp > 100:
            # Scale: 100°C -> factor 0.7, 200°C -> factor 1.0, 300°C -> factor 1.3
            ambient_factor = 0.5 + (ambient_temp / 400)
            ambient_factor = min(1.5, max(0.5, ambient_factor))
        
        # Calculate final carryover with all factors
        dynamic_carryover = base_carryover * type_weight * ambient_factor
        
        # Cap between reasonable bounds (0 to 8°C)
        return min(8.0, max(0.0, dynamic_carryover))

    def _update_withdrawal_temp(self) -> None:
        """Update the withdrawal temperature based on dynamic carryover."""
        if not self._carryover_enabled:
            self._withdrawal_temp = self._desired_temp
            return
            
        carryover = self._calculate_dynamic_carryover()
        self._withdrawal_temp = self._desired_temp - carryover
        
        # Ensure withdrawal temp doesn't go below a reasonable minimum
        self._withdrawal_temp = max(30.0, self._withdrawal_temp)

    def _calculate_progress(self) -> float:
        """Calculate cooking progress percentage."""
        if self._state != STATE_COOKING and self._state != STATE_DONE:
            return 0.0
            
        if self._start_probe_temp is None:
            return 0.0
            
        probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
        if probe_temp is None:
            return 0.0
            
        temp_range = self._withdrawal_temp - self._start_probe_temp
        if temp_range <= 0:
            return 100.0
            
        progress = ((probe_temp - self._start_probe_temp) / temp_range) * 100
        return min(100.0, max(0.0, progress))

    def _update_temp_history(self) -> None:
        """Update temperature history."""
        now = dt_util.utcnow()
        
        probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
        if probe_temp is not None:
            self._temp_history.append((now, probe_temp))
            # Keep history based on state
            if self._state == STATE_COOKING:
                # During cooking: keep all data since start
                if self._start_time:
                    cutoff = self._start_time - timedelta(minutes=1)
                    self._temp_history = [(t, v) for t, v in self._temp_history if t >= cutoff]
            elif self._state == STATE_DONE and self._cooking_end_time:
                # After cooking: keep cooking duration + 1 hour
                cutoff = self._start_time - timedelta(minutes=1) if self._start_time else now - timedelta(hours=2)
                max_time = self._cooking_end_time + timedelta(hours=1)
                self._temp_history = [(t, v) for t, v in self._temp_history if t >= cutoff and t <= max_time]
            else:
                # Idle: keep only last 2 minutes for display
                cutoff = now - timedelta(minutes=2)
                self._temp_history = [(t, v) for t, v in self._temp_history if t > cutoff]
        
        if self.config.get(CONF_AMBIENT_SENSOR):
            ambient_temp = self._get_sensor_value(self.config[CONF_AMBIENT_SENSOR])
            if ambient_temp is not None:
                self._ambient_history.append((now, ambient_temp))
                # Same cleanup logic as probe
                if self._state == STATE_COOKING and self._start_time:
                    cutoff = self._start_time - timedelta(minutes=1)
                    self._ambient_history = [(t, v) for t, v in self._ambient_history if t >= cutoff]
                elif self._state == STATE_DONE and self._cooking_end_time:
                    cutoff = self._start_time - timedelta(minutes=1) if self._start_time else now - timedelta(hours=2)
                    max_time = self._cooking_end_time + timedelta(hours=1)
                    self._ambient_history = [(t, v) for t, v in self._ambient_history if t >= cutoff and t <= max_time]
                else:
                    cutoff = now - timedelta(minutes=2)
                    self._ambient_history = [(t, v) for t, v in self._ambient_history if t > cutoff]

    def _build_data(self) -> dict[str, Any]:
        """Build the data dictionary."""
        self._update_state()
        
        # Always update history when connected
        if self._is_probe_connected():
            self._update_temp_history()
        
        if self._state == STATE_COOKING:
            self._update_withdrawal_temp()
            self._check_5min_notification()
        
        probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
        ambient_temp = None
        if self.config.get(CONF_AMBIENT_SENSOR):
            ambient_temp = self._get_sensor_value(self.config[CONF_AMBIENT_SENSOR])
        
        battery = None
        if self.config.get(CONF_BATTERY_SENSOR):
            battery = self._get_sensor_value(self.config[CONF_BATTERY_SENSOR])
            
        rssi = None
        if self.config.get(CONF_RSSI_SENSOR):
            rssi = self._get_sensor_value(self.config[CONF_RSSI_SENSOR])

        remaining_time = self._calculate_remaining_time()
        heating_rate = self._calculate_heating_rate()
        progress = self._calculate_progress()
        
        estimated_end = None
        total_estimated = None
        if remaining_time is not None and self._start_time is not None:
            estimated_end = dt_util.utcnow() + timedelta(minutes=remaining_time)
            total_estimated = (estimated_end - self._start_time).total_seconds() / 60

        disconnect_duration = None
        if self._disconnect_start is not None:
            disconnect_duration = (dt_util.utcnow() - self._disconnect_start).total_seconds()

        # Convert history to serializable format for frontend
        temp_history_data = [(t.isoformat(), v) for t, v in self._temp_history[-500:]]  # Limit to last 500 points
        ambient_history_data = [(t.isoformat(), v) for t, v in self._ambient_history[-500:]]

        return {
            "state": self._state,
            "probe_connected": self._is_probe_connected(),
            "probe_temp": probe_temp,
            "ambient_temp": ambient_temp,
            "battery": battery,
            "rssi": rssi,
            "desired_temp": self._desired_temp,
            "withdrawal_temp": self._withdrawal_temp,
            "is_manual_mode": self._is_manual_mode,
            "carryover_enabled": self._carryover_enabled,
            "manual_temp_memory": self._manual_temp_memory,
            "food_category": self._food_category,
            "food_type": f"{self._food_category}_{self._food_type}" if self._food_category and self._food_type else "manual",
            "food_doneness": self._food_doneness,
            "start_time": self._start_time,
            "start_probe_temp": self._start_probe_temp,
            "start_ambient_temp": self._start_ambient_temp,
            "cooking_end_time": self._cooking_end_time,
            "estimated_end": estimated_end,
            "remaining_time": remaining_time,
            "total_estimated": total_estimated,
            "progress": progress,
            "heating_rate": heating_rate,
            "disconnect_duration": disconnect_duration,
            "temp_history": temp_history_data,
            "ambient_history": ambient_history_data,
        }

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from source sensors."""
        return self._build_data()

    # Public methods for services
    def start_cooking(self) -> None:
        """Start cooking."""
        if self._state != STATE_IDLE:
            _LOGGER.warning("Cannot start cooking: not in idle state")
            return
            
        self._state = STATE_COOKING
        self._start_time = dt_util.utcnow()
        self._start_probe_temp = self._get_sensor_value(self.config[CONF_PROBE_SENSOR])
        self._cooking_end_time = None
        
        if self.config.get(CONF_AMBIENT_SENSOR):
            self._start_ambient_temp = self._get_sensor_value(self.config[CONF_AMBIENT_SENSOR])
        
        # Reset notification flags
        self._notified_5min = False
        self._notified_done = False
        self._disconnect_start = None
        
        # Clear old history, start fresh
        self._temp_history = []
        self._ambient_history = []
        
        self.async_set_updated_data(self._build_data())

    def stop_cooking(self) -> None:
        """Stop cooking and return to idle."""
        if self._state not in (STATE_COOKING, STATE_DONE):
            _LOGGER.warning("Cannot stop cooking: not cooking or done")
            return
            
        self._reset_cooking_data()
        self._state = STATE_IDLE
        self.async_set_updated_data(self._build_data())

    def _reset_cooking_data(self) -> None:
        """Reset cooking data."""
        self._start_time = None
        self._start_probe_temp = None
        self._start_ambient_temp = None
        self._cooking_end_time = None
        self._notified_5min = False
        self._notified_done = False
        self._temp_history = []
        self._ambient_history = []
        self._disconnect_start = None

    def set_target_temp(self, temperature: float) -> None:
        """Set target temperature directly - switches to manual mode."""
        # Switch to manual mode
        self._is_manual_mode = True
        self._food_category = MANUAL_CATEGORY
        self._food_type = MANUAL_FOOD
        self._food_doneness = MANUAL_DONENESS
        
        # Update manual temp memory
        self._manual_temp_memory = temperature
        
        # Set desired temp and calculate withdrawal with compensation
        self._desired_temp = temperature
        self._update_withdrawal_temp()
        
        # Reset 5min notification flag on target change
        self._notified_5min = False
        
        # Save to storage
        self.hass.async_create_task(self.async_save_stored_data())
        
        self.async_set_updated_data(self._build_data())

    def set_food(self, category: str, food: str, doneness: str) -> None:
        """Set food type and doneness."""
        if is_manual_mode(category, food):
            # Manual mode - use stored manual temperature
            self._is_manual_mode = True
            self._food_category = MANUAL_CATEGORY
            self._food_type = MANUAL_FOOD
            self._food_doneness = MANUAL_DONENESS
            self._desired_temp = self._manual_temp_memory
            self._update_withdrawal_temp()
        else:
            # Food mode - get temperature from database
            self._is_manual_mode = False
            self._food_category = category
            self._food_type = food
            self._food_doneness = doneness
            
            temp = get_temperature(category, food, doneness)
            if temp is not None:
                self._desired_temp = float(temp)
                self._update_withdrawal_temp()
        
        # Reset 5min notification flag on food change
        self._notified_5min = False
        
        # Save to storage
        self.hass.async_create_task(self.async_save_stored_data())
        
        self.async_set_updated_data(self._build_data())

    def set_carryover_enabled(self, enabled: bool) -> None:
        """Enable or disable carryover compensation."""
        self._carryover_enabled = enabled
        self._update_withdrawal_temp()
        
        # Save to storage
        self.hass.async_create_task(self.async_save_stored_data())
        
        self.async_set_updated_data(self._build_data())
