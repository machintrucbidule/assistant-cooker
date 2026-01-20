"""Config flow for Assistant Cooker integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
    BooleanSelector,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    SelectOptionDict,
)
from homeassistant.const import CONF_NAME

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
    DEFAULT_NOTIFY_5MIN_BEFORE,
    DEFAULT_NOTIFY_DISCONNECT,
)

_LOGGER = logging.getLogger(__name__)

TEMP_SENSOR_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        domain="sensor",
        device_class="temperature",
        multiple=False,
    )
)

ANY_SENSOR_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        domain="sensor",
        multiple=False,
    )
)

TEXT_SELECTOR = TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))
BOOL_SELECTOR = BooleanSelector()


def get_notify_services(hass, prefix_filter: list[str] | None = None) -> list[SelectOptionDict]:
    """Get available notify services as options for selector."""
    options: list[SelectOptionDict] = [SelectOptionDict(value="", label="-- Aucun --")]
    
    services = hass.services.async_services().get("notify", {})
    
    for service_name in sorted(services.keys()):
        full_service = f"notify.{service_name}"
        
        if service_name == "persistent_notification":
            continue
            
        if prefix_filter:
            if not any(service_name.startswith(p) for p in prefix_filter):
                continue
        
        label = service_name.replace("_", " ").title()
        options.append(SelectOptionDict(value=full_service, label=label))
    
    return options


class AssistantCookerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Assistant Cooker."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            probe_state = self.hass.states.get(user_input[CONF_PROBE_SENSOR])
            if probe_state is None:
                errors[CONF_PROBE_SENSOR] = "sensor_not_found"
            else:
                await self.async_set_unique_id(user_input[CONF_PROBE_SENSOR])
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=user_input[CONF_NAME],
                    data=user_input,
                )

        mobile_options = get_notify_services(self.hass, ["mobile_app_"])
        voice_options = get_notify_services(self.hass, ["alexa_", "google_", "tts_"])
        
        if len(mobile_options) <= 1:
            mobile_options = get_notify_services(self.hass)
        if len(voice_options) <= 1:
            voice_options = get_notify_services(self.hass)

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME): TEXT_SELECTOR,
                vol.Required(CONF_PROBE_SENSOR): TEMP_SENSOR_SELECTOR,
                vol.Optional(CONF_AMBIENT_SENSOR): TEMP_SENSOR_SELECTOR,
                vol.Optional(CONF_BATTERY_SENSOR): ANY_SENSOR_SELECTOR,
                vol.Optional(CONF_RSSI_SENSOR): ANY_SENSOR_SELECTOR,
                vol.Optional(CONF_NOTIFY_HA, default=False): BOOL_SELECTOR,
                vol.Optional(CONF_NOTIFY_MOBILE, default=""): SelectSelector(
                    SelectSelectorConfig(
                        options=mobile_options,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(CONF_NOTIFY_VOICE, default=""): SelectSelector(
                    SelectSelectorConfig(
                        options=voice_options,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(CONF_NOTIFY_5MIN_BEFORE, default=DEFAULT_NOTIFY_5MIN_BEFORE): BOOL_SELECTOR,
                vol.Optional(CONF_NOTIFY_DISCONNECT, default=DEFAULT_NOTIFY_DISCONNECT): BOOL_SELECTOR,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> AssistantCookerOptionsFlow:
        """Get the options flow for this handler."""
        return AssistantCookerOptionsFlow()


class AssistantCookerOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Assistant Cooker."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            new_data = {**self.config_entry.data, **user_input}
            self.hass.config_entries.async_update_entry(
                self.config_entry,
                data=new_data,
            )
            return self.async_create_entry(title="", data={})

        data = self.config_entry.data

        mobile_options = get_notify_services(self.hass, ["mobile_app_"])
        voice_options = get_notify_services(self.hass, ["alexa_", "google_", "tts_"])
        
        if len(mobile_options) <= 1:
            mobile_options = get_notify_services(self.hass)
        if len(voice_options) <= 1:
            voice_options = get_notify_services(self.hass)

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=data.get(CONF_NAME, "")): TEXT_SELECTOR,
                vol.Required(CONF_PROBE_SENSOR, default=data.get(CONF_PROBE_SENSOR, "")): TEMP_SENSOR_SELECTOR,
                vol.Optional(CONF_AMBIENT_SENSOR, default=data.get(CONF_AMBIENT_SENSOR, "")): TEMP_SENSOR_SELECTOR,
                vol.Optional(CONF_BATTERY_SENSOR, default=data.get(CONF_BATTERY_SENSOR, "")): ANY_SENSOR_SELECTOR,
                vol.Optional(CONF_RSSI_SENSOR, default=data.get(CONF_RSSI_SENSOR, "")): ANY_SENSOR_SELECTOR,
                vol.Optional(CONF_NOTIFY_HA, default=data.get(CONF_NOTIFY_HA, False)): BOOL_SELECTOR,
                vol.Optional(CONF_NOTIFY_MOBILE, default=data.get(CONF_NOTIFY_MOBILE, "")): SelectSelector(
                    SelectSelectorConfig(
                        options=mobile_options,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(CONF_NOTIFY_VOICE, default=data.get(CONF_NOTIFY_VOICE, "")): SelectSelector(
                    SelectSelectorConfig(
                        options=voice_options,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(CONF_NOTIFY_5MIN_BEFORE, default=data.get(CONF_NOTIFY_5MIN_BEFORE, DEFAULT_NOTIFY_5MIN_BEFORE)): BOOL_SELECTOR,
                vol.Optional(CONF_NOTIFY_DISCONNECT, default=data.get(CONF_NOTIFY_DISCONNECT, DEFAULT_NOTIFY_DISCONNECT)): BOOL_SELECTOR,
            }
        )

        return self.async_show_form(
            step_id="init",
            data_schema=schema,
        )
