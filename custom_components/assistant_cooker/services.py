"""Service handlers for Assistant Cooker integration."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN
from .coordinator import AssistantCookerCoordinator

_LOGGER = logging.getLogger(__name__)


def _get_coordinator_for_entity(
    hass: HomeAssistant,
    entity_id: str,
) -> AssistantCookerCoordinator | None:
    """Get coordinator for an entity ID."""
    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)
    
    if entry is None:
        _LOGGER.error("Entity not found: %s", entity_id)
        return None
    
    config_entry_id = entry.config_entry_id
    if config_entry_id is None:
        _LOGGER.error("No config entry for entity: %s", entity_id)
        return None
    
    coordinator = hass.data[DOMAIN].get(config_entry_id)
    if coordinator is None:
        _LOGGER.error("No coordinator for config entry: %s", config_entry_id)
        return None
    
    return coordinator


async def async_start_cooking(call: ServiceCall) -> None:
    """Handle start_cooking service call."""
    hass = call.hass
    entity_id = call.data["entity_id"]
    
    coordinator = _get_coordinator_for_entity(hass, entity_id)
    if coordinator is None:
        return
    
    coordinator.start_cooking()
    _LOGGER.info("Started cooking for %s", entity_id)


async def async_stop_cooking(call: ServiceCall) -> None:
    """Handle stop_cooking service call."""
    hass = call.hass
    entity_id = call.data["entity_id"]
    
    coordinator = _get_coordinator_for_entity(hass, entity_id)
    if coordinator is None:
        return
    
    coordinator.stop_cooking()
    _LOGGER.info("Stopped cooking for %s", entity_id)


async def async_set_target_temp(call: ServiceCall) -> None:
    """Handle set_target_temp service call."""
    hass = call.hass
    entity_id = call.data["entity_id"]
    temperature = call.data["temperature"]
    
    coordinator = _get_coordinator_for_entity(hass, entity_id)
    if coordinator is None:
        return
    
    coordinator.set_target_temp(temperature)
    _LOGGER.info("Set target temperature to %s for %s", temperature, entity_id)


async def async_set_food(call: ServiceCall) -> None:
    """Handle set_food service call."""
    hass = call.hass
    entity_id = call.data["entity_id"]
    food_type = call.data["food_type"]
    doneness = call.data["doneness"]
    
    # Parse food_type to extract category and food
    # Expected format: "beef_steak", "pork_chop", "poultry_chicken_breast", etc.
    if "_" in food_type and food_type != "manual":
        parts = food_type.split("_", 1)  # Split on first underscore only
        category = parts[0]
        food = parts[1]
    else:
        # Fallback for manual mode or legacy format
        category = food_type
        food = food_type
    
    coordinator = _get_coordinator_for_entity(hass, entity_id)
    if coordinator is None:
        return
    
    coordinator.set_food(category, food, doneness)
    _LOGGER.info(
        "Set food to %s (category=%s, food=%s, doneness=%s) for %s",
        food_type, category, food, doneness, entity_id
    )


async def async_set_carryover(call: ServiceCall) -> None:
    """Handle set_carryover service call."""
    hass = call.hass
    entity_id = call.data["entity_id"]
    enabled = call.data["enabled"]
    
    coordinator = _get_coordinator_for_entity(hass, entity_id)
    if coordinator is None:
        return
    
    coordinator.set_carryover_enabled(enabled)
    _LOGGER.info("Set carryover compensation to %s for %s", enabled, entity_id)
