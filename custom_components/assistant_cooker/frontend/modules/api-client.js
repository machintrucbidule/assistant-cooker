/**
 * API Client Module
 * Handles Home Assistant service calls and history fetching
 */

export class ApiClient {
  constructor(stateManager) {
    this._stateManager = stateManager;
  }

  /**
   * Call Home Assistant service
   */
  async callService(service, entityId, data = {}) {
    const hass = this._stateManager.getHass();
    if (!hass) return;
    await hass.callService("assistant_cooker", service, { entity_id: entityId, ...data });
  }

  /**
   * Fetch history from Home Assistant
   */
  async fetchHistory(entityId, hoursBack) {
    const hass = this._stateManager.getHass();
    if (!hass || !entityId) return [];

    try {
      const end = new Date();
      const start = new Date(end.getTime() - hoursBack * 3600000);
      const url = `history/period/${start.toISOString()}?filter_entity_id=${entityId}&end_time=${end.toISOString()}&minimal_response`;
      
      const response = await hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: [entityId], minimal_response: true });
      
      if (!response || !response[entityId] || response[entityId].length === 0) return [];
      
      return response[entityId]
        .map(item => {
          const val = parseFloat(item.s);
          if (isNaN(val)) return null;
          return [new Date(item.lu * 1000).getTime(), val];
        })
        .filter(item => item !== null);
    } catch (e) {
      console.error("[assistant-cooker-card] Error fetching history:", e);
      return [];
    }
  }

  /**
   * Fire more-info dialog for entity
   */
  fireMoreInfo(entityId) {
    const hass = this._stateManager.getHass();
    if (!hass || !entityId) return;

    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId };
    document.querySelector("home-assistant")?.dispatchEvent(event);
  }
}
