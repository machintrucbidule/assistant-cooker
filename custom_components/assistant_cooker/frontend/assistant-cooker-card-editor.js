/**
 * Assistant Cooker Card Editor
 * Visual editor for card configuration
 */

class AssistantCookerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
  }
  
  setConfig(config) {
    this._config = config;
    this._render();
  }
  
  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
  }

  _getAssistantCookerDevices() {
    if (!this._hass) return [];
    const devices = [];
    const seen = new Set();
    Object.keys(this._hass.states).forEach(entityId => {
      if (entityId.startsWith("sensor.") && entityId.endsWith("_state")) {
        const state = this._hass.states[entityId];
        if (state.attributes && "probe_connected" in state.attributes) {
          const prefix = entityId.replace("sensor.", "").replace("_state", "");
          if (!seen.has(prefix)) {
            seen.add(prefix);
            devices.push({ prefix, name: state.attributes.friendly_name || prefix });
          }
        }
      }
    });
    return devices;
  }

  _render() {
    if (!this._hass) return;
    this._rendered = true;
    const devices = this._getAssistantCookerDevices();
    const lang = this._hass?.language?.startsWith("fr") ? "fr" : "en";
    const labels = {
      fr: { device: "Appareil", battery: "Afficher batterie", rssi: "Afficher signal", graph: "Afficher historique" },
      en: { device: "Device", battery: "Show battery", rssi: "Show signal", graph: "Show history" }
    };
    const l = labels[lang];

    this.shadowRoot.innerHTML = `
      <style>
        .editor { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 12px; color: var(--secondary-text-color); font-weight: 500; }
        .field select { padding: 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 14px; }
        .checkbox-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
        .checkbox-row input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        .checkbox-row label { font-size: 14px; color: var(--primary-text-color); cursor: pointer; }
      </style>
      <div class="editor">
        <div class="field">
          <label>${l.device}</label>
          <select id="entity_prefix">
            <option value="">-- ${l.device} --</option>
            ${devices.map(d => `<option value="${d.prefix}" ${this._config.entity_prefix === d.prefix ? "selected" : ""}>${d.name}</option>`).join("")}
          </select>
        </div>
        <div class="checkbox-row">
          <input type="checkbox" id="show_battery" ${this._config.show_battery !== false ? "checked" : ""} />
          <label for="show_battery">${l.battery}</label>
        </div>
        <div class="checkbox-row">
          <input type="checkbox" id="show_rssi" ${this._config.show_rssi !== false ? "checked" : ""} />
          <label for="show_rssi">${l.rssi}</label>
        </div>
        <div class="checkbox-row">
          <input type="checkbox" id="show_graph" ${this._config.show_graph !== false ? "checked" : ""} />
          <label for="show_graph">${l.graph}</label>
        </div>
      </div>
    `;

    const select = this.shadowRoot.querySelector("#entity_prefix");
    select?.addEventListener("change", (e) => {
      e.stopPropagation();
      this._updateConfig();
    });
    
    this.shadowRoot.querySelectorAll("input[type='checkbox']").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        this._updateConfig();
      });
    });
  }

  _updateConfig() {
    const config = {
      ...this._config,
      entity_prefix: this.shadowRoot.querySelector("#entity_prefix")?.value || "",
      show_battery: this.shadowRoot.querySelector("#show_battery")?.checked ?? true,
      show_rssi: this.shadowRoot.querySelector("#show_rssi")?.checked ?? true,
      show_graph: this.shadowRoot.querySelector("#show_graph")?.checked ?? true,
    };
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

customElements.define("assistant-cooker-card-editor", AssistantCookerCardEditor);
