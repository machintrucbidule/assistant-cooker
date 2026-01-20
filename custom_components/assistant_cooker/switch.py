"""Switch platform for Assistant Cooker integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.switch import SwitchEntity
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
    """Set up switch entities."""
    coordinator: AssistantCookerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        AssistantCookerCarryoverSwitch(coordinator),
    ]

    async_add_entities(entities)


class AssistantCookerCarryoverSwitch(CoordinatorEntity, SwitchEntity):
    """Switch for carryover compensation toggle."""

    def __init__(self, coordinator: AssistantCookerCoordinator) -> None:
        """Initialize the switch."""
        super().__init__(coordinator)
        self._attr_has_entity_name = True
        self._attr_name = "Carryover Compensation"
        self._attr_unique_id = f"{coordinator.unique_id_prefix}_carryover_compensation"
        self._attr_icon = "mdi:thermometer-chevron-up"

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
        """Return True if carryover compensation is enabled."""
        return self.coordinator.data.get("carryover_enabled", True)

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn on carryover compensation."""
        self.coordinator.set_carryover_enabled(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off carryover compensation."""
        self.coordinator.set_carryover_enabled(False)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()
