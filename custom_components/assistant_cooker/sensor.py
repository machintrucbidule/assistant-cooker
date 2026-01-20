"""Sensor platform for Assistant Cooker integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    PERCENTAGE,
    UnitOfTemperature,
    UnitOfTime,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    ATTR_RAW_TARGET,
    ATTR_CATEGORY,
    ATTR_TREND,
    ATTR_TOTAL_ESTIMATED,
)
from .coordinator import AssistantCookerCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor entities."""
    coordinator: AssistantCookerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        AssistantCookerStateSensor(coordinator),
        AssistantCookerProbeTempSensor(coordinator),
        AssistantCookerTargetTempSensor(coordinator),
        AssistantCookerStartTimeSensor(coordinator),
        AssistantCookerStartProbeTempSensor(coordinator),
        AssistantCookerEstimatedEndSensor(coordinator),
        AssistantCookerRemainingTimeSensor(coordinator),
        AssistantCookerProgressSensor(coordinator),
        AssistantCookerHeatingRateSensor(coordinator),
        AssistantCookerFoodTypeSensor(coordinator),
        AssistantCookerDonenessSensor(coordinator),
        AssistantCookerDisconnectDurationSensor(coordinator),
    ]

    # Add ambient temperature sensors if configured
    if coordinator.config.get("ambient_sensor"):
        entities.extend([
            AssistantCookerAmbientTempSensor(coordinator),
            AssistantCookerStartAmbientTempSensor(coordinator),
        ])

    # Add battery sensor if configured
    if coordinator.config.get("battery_sensor"):
        entities.append(AssistantCookerBatterySensor(coordinator))

    # Add RSSI sensor if configured
    if coordinator.config.get("rssi_sensor"):
        entities.append(AssistantCookerRSSISensor(coordinator))

    async_add_entities(entities)


class AssistantCookerBaseSensor(CoordinatorEntity, SensorEntity):
    """Base class for Assistant Cooker sensors."""

    def __init__(
        self,
        coordinator: AssistantCookerCoordinator,
        key: str,
        name_suffix: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._key = key
        self._attr_has_entity_name = True
        self._attr_name = name_suffix
        self._attr_unique_id = f"{coordinator.unique_id_prefix}_{key}"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.unique_id_prefix)},
            name=self.coordinator.device_name,
            manufacturer="Assistant Cooker",
            model="Cooking Probe Monitor",
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()


class AssistantCookerStateSensor(AssistantCookerBaseSensor):
    """Sensor for cooking state."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "state", "State")
        self._attr_icon = "mdi:pot-steam"

    @property
    def native_value(self) -> str | None:
        """Return the state."""
        return self.coordinator.data.get("state")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes for frontend access."""
        data = self.coordinator.data
        return {
            "probe_connected": data.get("probe_connected"),
            "battery": data.get("battery"),
            "rssi": data.get("rssi"),
            "desired_temp": data.get("desired_temp"),
            "withdrawal_temp": data.get("withdrawal_temp"),
            "is_manual_mode": data.get("is_manual_mode"),
            "carryover_enabled": data.get("carryover_enabled"),
            "manual_temp_memory": data.get("manual_temp_memory"),
            "food_category": data.get("food_category"),
            "food_type": data.get("food_type"),
            "food_doneness": data.get("food_doneness"),
            "temp_history": data.get("temp_history"),
            "ambient_history": data.get("ambient_history"),
        }


class AssistantCookerProbeTempSensor(AssistantCookerBaseSensor):
    """Sensor for probe temperature."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "probe_temp", "Probe Temperature")
        self._attr_device_class = SensorDeviceClass.TEMPERATURE
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS

    @property
    def native_value(self) -> float | None:
        """Return the temperature."""
        return self.coordinator.data.get("probe_temp")


class AssistantCookerAmbientTempSensor(AssistantCookerBaseSensor):
    """Sensor for ambient temperature."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "ambient_temp", "Ambient Temperature")
        self._attr_device_class = SensorDeviceClass.TEMPERATURE
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS

    @property
    def native_value(self) -> float | None:
        """Return the temperature."""
        return self.coordinator.data.get("ambient_temp")


class AssistantCookerTargetTempSensor(AssistantCookerBaseSensor):
    """Sensor for target/withdrawal temperature."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "target_temp", "Target Temperature")
        self._attr_device_class = SensorDeviceClass.TEMPERATURE
        self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
        self._attr_icon = "mdi:thermometer-check"

    @property
    def native_value(self) -> float | None:
        """Return the withdrawal temperature (when to stop cooking)."""
        return self.coordinator.data.get("withdrawal_temp")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes."""
        return {
            "desired_temp": self.coordinator.data.get("desired_temp"),
            "is_manual_mode": self.coordinator.data.get("is_manual_mode"),
            "carryover_enabled": self.coordinator.data.get("carryover_enabled"),
        }


class AssistantCookerStartTimeSensor(AssistantCookerBaseSensor):
    """Sensor for cooking start time."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "start_time", "Start Time")
        self._attr_device_class = SensorDeviceClass.TIMESTAMP
        self._attr_icon = "mdi:clock-start"

    @property
    def native_value(self):
        """Return the start time."""
        return self.coordinator.data.get("start_time")


class AssistantCookerStartProbeTempSensor(AssistantCookerBaseSensor):
    """Sensor for probe temperature at start."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "start_probe_temp", "Start Probe Temperature")
        self._attr_device_class = SensorDeviceClass.TEMPERATURE
        self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
        self._attr_entity_registry_enabled_default = False

    @property
    def native_value(self) -> float | None:
        """Return the temperature."""
        return self.coordinator.data.get("start_probe_temp")


class AssistantCookerStartAmbientTempSensor(AssistantCookerBaseSensor):
    """Sensor for ambient temperature at start."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "start_ambient_temp", "Start Ambient Temperature")
        self._attr_device_class = SensorDeviceClass.TEMPERATURE
        self._attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
        self._attr_entity_registry_enabled_default = False

    @property
    def native_value(self) -> float | None:
        """Return the temperature."""
        return self.coordinator.data.get("start_ambient_temp")


class AssistantCookerEstimatedEndSensor(AssistantCookerBaseSensor):
    """Sensor for estimated end time."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "estimated_end", "Estimated End Time")
        self._attr_device_class = SensorDeviceClass.TIMESTAMP
        self._attr_icon = "mdi:clock-end"

    @property
    def native_value(self):
        """Return the estimated end time."""
        return self.coordinator.data.get("estimated_end")


class AssistantCookerRemainingTimeSensor(AssistantCookerBaseSensor):
    """Sensor for remaining cooking time."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "remaining_time", "Remaining Time")
        self._attr_native_unit_of_measurement = UnitOfTime.MINUTES
        self._attr_icon = "mdi:timer-sand"
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> float | None:
        """Return remaining time in minutes."""
        return self.coordinator.data.get("remaining_time")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes."""
        return {
            ATTR_TOTAL_ESTIMATED: self.coordinator.data.get("total_estimated"),
        }


class AssistantCookerProgressSensor(AssistantCookerBaseSensor):
    """Sensor for cooking progress."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "progress", "Progress")
        self._attr_native_unit_of_measurement = PERCENTAGE
        self._attr_icon = "mdi:percent"
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> float | None:
        """Return progress percentage."""
        progress = self.coordinator.data.get("progress")
        if progress is not None:
            return round(progress, 1)
        return None


class AssistantCookerHeatingRateSensor(AssistantCookerBaseSensor):
    """Sensor for heating rate."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "heating_rate", "Heating Rate")
        self._attr_native_unit_of_measurement = "°C/min"
        self._attr_icon = "mdi:trending-up"
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> float | None:
        """Return heating rate."""
        return self.coordinator.data.get("heating_rate")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes."""
        rate = self.coordinator.data.get("heating_rate")
        if rate is None:
            trend = "unknown"
        elif rate > 0.1:
            trend = "increasing"
        elif rate < -0.1:
            trend = "decreasing"
        else:
            trend = "stable"
        return {ATTR_TREND: trend}


class AssistantCookerFoodTypeSensor(AssistantCookerBaseSensor):
    """Sensor for food type."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "food_type", "Food Type")
        self._attr_icon = "mdi:food-steak"

    @property
    def native_value(self) -> str | None:
        """Return food type."""
        if self.coordinator.data.get("is_manual_mode"):
            return "manual"
        return self.coordinator.data.get("food_type")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes."""
        return {
            ATTR_CATEGORY: self.coordinator.data.get("food_category"),
            "is_manual_mode": self.coordinator.data.get("is_manual_mode"),
        }


class AssistantCookerDonenessSensor(AssistantCookerBaseSensor):
    """Sensor for doneness level."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "doneness", "Doneness")
        self._attr_icon = "mdi:fire"

    @property
    def native_value(self) -> str | None:
        """Return doneness level."""
        return self.coordinator.data.get("food_doneness")


class AssistantCookerBatterySensor(AssistantCookerBaseSensor):
    """Sensor for probe battery level."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "battery", "Battery")
        self._attr_device_class = SensorDeviceClass.BATTERY
        self._attr_native_unit_of_measurement = PERCENTAGE
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> float | None:
        """Return battery level."""
        return self.coordinator.data.get("battery")


class AssistantCookerRSSISensor(AssistantCookerBaseSensor):
    """Sensor for probe signal strength."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "rssi", "Signal Strength")
        self._attr_device_class = SensorDeviceClass.SIGNAL_STRENGTH
        self._attr_native_unit_of_measurement = "dBm"
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> float | None:
        """Return signal strength."""
        return self.coordinator.data.get("rssi")


class AssistantCookerDisconnectDurationSensor(AssistantCookerBaseSensor):
    """Sensor for disconnect duration."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "disconnect_duration", "Disconnect Duration")
        self._attr_native_unit_of_measurement = UnitOfTime.SECONDS
        self._attr_icon = "mdi:connection"
        self._attr_entity_registry_enabled_default = False

    @property
    def native_value(self) -> float | None:
        """Return disconnect duration in seconds."""
        return self.coordinator.data.get("disconnect_duration")
