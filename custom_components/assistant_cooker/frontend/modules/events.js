/**
 * Event Handler Module
 * Manages all user interactions and event listeners
 */

import { FOOD_DATABASE } from '../data/food-database.js';

export class EventHandler {
  constructor(stateManager, apiClient, chartManager, renderer) {
    this._stateManager = stateManager;
    this._apiClient = apiClient;
    this._chartManager = chartManager;
    this._renderer = renderer;
  }

  /**
   * Attach all event listeners to the shadow root
   */
  attachAllListeners(shadowRoot, entities, config, callbacks) {
    const batteryInfo = shadowRoot.querySelector(".battery-info");
    const rssiInfo = shadowRoot.querySelector(".rssi-info");
    const categorySelect = shadowRoot.querySelector(".select-category");
    const foodSelect = shadowRoot.querySelector(".select-food");
    const donenessSelect = shadowRoot.querySelector(".select-doneness");
    const targetInput = shadowRoot.querySelector(".target-input");
    const compToggle = shadowRoot.querySelector(".comp-toggle");
    const compHelp = shadowRoot.querySelector(".comp-help");
    const startBtn = shadowRoot.querySelector(".btn-start");
    const stopBtn = shadowRoot.querySelector(".btn-stop");
    const graphToggle = shadowRoot.querySelector(".graph-toggle");
    const spanSelect = shadowRoot.querySelector(".span-select");

    // Clickable elements for more-info
    shadowRoot.querySelectorAll(".clickable[data-entity]").forEach(el => {
      el.addEventListener("click", (e) => {
        const entityKey = el.dataset.entity;
        if (entityKey && entities[entityKey]) {
          e.stopPropagation();
          this._apiClient.fireMoreInfo(entities[entityKey]);
        }
      });
    });

    // Battery and RSSI clicks
    batteryInfo?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._apiClient.fireMoreInfo(entities.battery);
    });
    rssiInfo?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._apiClient.fireMoreInfo(entities.rssi);
    });

    // Category change
    categorySelect?.addEventListener("change", (e) => {
      const category = e.target.value;
      if (category === "manual") {
        foodSelect.innerHTML = '<option value="manual">--</option>';
        foodSelect.disabled = true;
        donenessSelect.innerHTML = '<option value="manual">--</option>';
        donenessSelect.disabled = true;
        const temp = parseFloat(targetInput.value) || 60;
        this._apiClient.callService("set_target_temp", entities.state, { temperature: temp });
      } else if (FOOD_DATABASE[category]) {
        const firstFood = Object.keys(FOOD_DATABASE[category].foods)[0];
        if (firstFood) {
          this._populateFoodSelect(shadowRoot, category, firstFood);
          const firstDoneness = Object.keys(FOOD_DATABASE[category].foods[firstFood].doneness)[0];
          if (firstDoneness) {
            this._populateDonenessSelect(shadowRoot, category, firstFood, firstDoneness);
            // Update temperature field
            const temp = FOOD_DATABASE[category].foods[firstFood].doneness[firstDoneness].temp;
            if (temp !== null && targetInput) {
              targetInput.value = Math.round(temp);
            }
            const foodType = `${category}_${firstFood}`;
            this._apiClient.callService("set_food", entities.state, { food_type: foodType, doneness: firstDoneness });
          }
        }
      }
    });

    // Food change
    foodSelect?.addEventListener("change", (e) => {
      const category = categorySelect.value;
      const food = e.target.value;
      if (food && FOOD_DATABASE[category]?.foods[food]) {
        const firstDoneness = Object.keys(FOOD_DATABASE[category].foods[food].doneness)[0];
        if (firstDoneness) {
          this._populateDonenessSelect(shadowRoot, category, food, firstDoneness);
          // Update temperature field
          const temp = FOOD_DATABASE[category].foods[food].doneness[firstDoneness].temp;
          if (temp !== null && targetInput) {
            targetInput.value = Math.round(temp);
          }
          const foodType = `${category}_${food}`;
          this._apiClient.callService("set_food", entities.state, { food_type: foodType, doneness: firstDoneness });
        }
      }
    });

    // Doneness change
    donenessSelect?.addEventListener("change", (e) => {
      const category = categorySelect.value;
      const food = foodSelect.value;
      const doneness = e.target.value;
      if (category && food && doneness) {
        // Update the temperature field with the selected doneness temp
        if (FOOD_DATABASE[category]?.foods[food]?.doneness[doneness]) {
          const temp = FOOD_DATABASE[category].foods[food].doneness[doneness].temp;
          if (temp !== null && targetInput) {
            targetInput.value = Math.round(temp);
          }
        }
        const foodType = `${category}_${food}`;
        this._apiClient.callService("set_food", entities.state, { food_type: foodType, doneness });
      }
    });

    // Target temperature change
    targetInput?.addEventListener("change", (e) => {
      const temp = parseFloat(e.target.value);
      if (temp >= 30 && temp <= 100) {
        this._apiClient.callService("set_target_temp", entities.state, { temperature: temp });
      }
    });

    // Carryover toggle
    compToggle?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const stateEntity = this._stateManager.getEntityState(entities.state);
      const currentEnabled = stateEntity?.attributes?.carryover_enabled;
      this._apiClient.callService("set_carryover", entities.state, { enabled: !currentEnabled });
    });

    // Help button
    compHelp?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._showHelpPopup(shadowRoot);
    });

    // Start/Stop buttons
    startBtn?.addEventListener("click", () => {
      this._apiClient.callService("start_cooking", entities.state);
    });
    stopBtn?.addEventListener("click", () => {
      this._apiClient.callService("stop_cooking", entities.state);
    });

    // Graph toggle
    graphToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (callbacks.onGraphToggle) {
        callbacks.onGraphToggle();
      }
    });

    // Span change
    spanSelect?.addEventListener("change", (e) => {
      if (callbacks.onSpanChange) {
        callbacks.onSpanChange(e.target.value);
      }
    });
  }

  /**
   * Populate food select with options for a category
   */
  _populateFoodSelect(shadowRoot, category, selectedFood) {
    const foodSelect = shadowRoot.querySelector(".select-food");
    if (!foodSelect || !FOOD_DATABASE[category]) return;
    
    foodSelect.innerHTML = this._renderer.generateFoodOptions(category, selectedFood);
    foodSelect.disabled = false;
  }

  /**
   * Populate doneness select with options for a food
   */
  _populateDonenessSelect(shadowRoot, category, food, selectedDoneness) {
    const donenessSelect = shadowRoot.querySelector(".select-doneness");
    if (!donenessSelect || !FOOD_DATABASE[category]?.foods[food]) return;
    
    donenessSelect.innerHTML = this._renderer.generateDonenessOptions(category, food, selectedDoneness);
    donenessSelect.disabled = false;
  }

  /**
   * Show help popup for carryover
   */
  _showHelpPopup(shadowRoot) {
    const t = (key) => this._stateManager.t(key);
    
    const overlay = document.createElement("div");
    overlay.className = "help-popup-overlay";
    overlay.innerHTML = `
      <div class="help-popup">
        <div class="help-popup-title">${t("compensation_help_title")}</div>
        <div class="help-popup-text">${t("compensation_help_text").replace(/\n/g, "<br/>")}</div>
        <button class="help-popup-close">${t("close")}</button>
      </div>
    `;
    
    const closeBtn = overlay.querySelector(".help-popup-close");
    closeBtn.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    
    shadowRoot.appendChild(overlay);
  }
}
