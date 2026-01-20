"""Assistant Cooker integration for Home Assistant."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, CoreState, EVENT_HOMEASSISTANT_STARTED
from homeassistant.components import websocket_api
import voluptuous as vol

from .const import (
    DOMAIN,
    INTEGRATION_VERSION,
    PLATFORMS,
)
from .coordinator import AssistantCookerCoordinator
from .frontend import JSModuleRegistration

if TYPE_CHECKING:
    from homeassistant.helpers.typing import ConfigType

_LOGGER = logging.getLogger(__name__)

PLATFORMS_LIST: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.SWITCH]


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register frontend modules after HA startup."""
    module_register = JSModuleRegistration(hass)
    await module_register.async_register()


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/version",
    }
)
@websocket_api.async_response
async def websocket_get_version(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle version request from frontend."""
    connection.send_result(
        msg["id"],
        {"version": INTEGRATION_VERSION},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/food_data",
    }
)
@websocket_api.async_response
async def websocket_get_food_data(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle food data request from frontend."""
    from .food_data import FOOD_DATABASE
    connection.send_result(
        msg["id"],
        {"food_database": FOOD_DATABASE},
    )


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Assistant Cooker component."""
    hass.data.setdefault(DOMAIN, {})

    # Register websocket commands
    websocket_api.async_register_command(hass, websocket_get_version)
    websocket_api.async_register_command(hass, websocket_get_food_data)

    async def _setup_frontend(_event=None) -> None:
        await async_register_frontend(hass)

    # If HA is already running, register immediately
    if hass.state == CoreState.running:
        await _setup_frontend()
    else:
        # Otherwise, wait for STARTED event
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _setup_frontend)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Assistant Cooker from a config entry."""
    _LOGGER.debug("Setting up Assistant Cooker entry: %s", entry.entry_id)

    # Create coordinator
    coordinator = AssistantCookerCoordinator(hass, entry)
    
    # Load persistent data
    await coordinator.async_load_stored_data()
    
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS_LIST)

    # Register services
    await async_register_services(hass)

    # Listen for options updates
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading Assistant Cooker entry: %s", entry.entry_id)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS_LIST)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_register_services(hass: HomeAssistant) -> None:
    """Register services for Assistant Cooker."""
    from .services import (
        async_start_cooking,
        async_stop_cooking,
        async_set_target_temp,
        async_set_food,
        async_set_carryover,
    )

    # Only register if not already registered
    if hass.services.has_service(DOMAIN, "start_cooking"):
        return

    hass.services.async_register(
        DOMAIN,
        "start_cooking",
        async_start_cooking,
        schema=vol.Schema({
            vol.Required("entity_id"): str,
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "stop_cooking",
        async_stop_cooking,
        schema=vol.Schema({
            vol.Required("entity_id"): str,
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "set_target_temp",
        async_set_target_temp,
        schema=vol.Schema({
            vol.Required("entity_id"): str,
            vol.Required("temperature"): vol.Coerce(float),
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "set_food",
        async_set_food,
        schema=vol.Schema({
            vol.Required("entity_id"): str,
            vol.Required("food_type"): str,
            vol.Required("doneness"): str,
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "set_carryover",
        async_set_carryover,
        schema=vol.Schema({
            vol.Required("entity_id"): str,
            vol.Required("enabled"): bool,
        }),
    )
