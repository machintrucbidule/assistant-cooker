"""Binary sensor platform for Assistant Cooker integration."""
from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import AssistantCookerCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensor entities."""
    coordinator: AssistantCookerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        AssistantCookerProbeConnectedSensor(coordinator),
    ]

    async_add_entities(entities)


class AssistantCookerProbeConnectedSensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor for probe connection status."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_has_entity_name = True
        self._attr_name = "Probe Connected"
        self._attr_unique_id = f"{coordinator.unique_id_prefix}_probe_connected"
        self._attr_device_class = BinarySensorDeviceClass.CONNECTIVITY

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.unique_id_prefix)},
            name=self.coordinator.device_name,
            manufacturer="Assistant Cooker",
            model="Cooking Probe Monitor",
        )

    @property
    def is_on(self) -> bool:
        """Return True if probe is connected."""
        return self.coordinator.data.get("probe_connected", False)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()
