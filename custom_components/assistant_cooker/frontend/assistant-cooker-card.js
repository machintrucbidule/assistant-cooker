/**
 * Assistant Cooker Card v0.0.37
 * Modular architecture with separate modules for state, rendering, events, and charting
 */
import { StateManager } from './modules/state-manager.js';
import { ApiClient } from './modules/api-client.js';
import { ChartManager } from './modules/chart-manager.js';
import { Renderer } from './modules/rendering.js';
import { EventHandler } from './modules/events.js';
import { FOOD_DATABASE } from './data/food-database.js';
import { translations as enTranslations } from './translations/en.js';
import './assistant-cooker-card-editor.js';

const CARD_VERSION = "0.0.37";

class AssistantCookerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // Core properties
    this._config = {};
    this._entities = {};
    this._rendered = false;
    
    // Graph state
    this._graphVisible = false;  // Hidden by default, shown only during cooking
    this._userToggledGraph = false;
    
    // Timer for elapsed time update
    this._elapsedTimeInterval = null;
    
    // Initialize modules
    this._stateManager = new StateManager();
    this._apiClient = new ApiClient(this._stateManager);
    this._chartManager = new ChartManager(this._stateManager, this._apiClient);
    this._renderer = new Renderer(this._stateManager);
    this._eventHandler = new EventHandler(this._stateManager, this._apiClient, this._chartManager, this._renderer);
  }

  static getConfigElement() {
    return document.createElement("assistant-cooker-card-editor");
  }

  getCardConfig() {
    return this._config || {};
  }

  static getStubConfig() {
    return {
      entity_prefix: "",
      show_battery: true,
      show_rssi: true,
      show_graph: true,
      show_ambient: true,
      show_rate: true
    };
  }

  setConfig(config) {
    if (!config.entity_prefix) throw new Error("Please define entity_prefix");
    
    this._config = {
      show_battery: true,
      show_rssi: true,
      show_graph: true,
      show_ambient: true,
      show_rate: true,
      ...config
    };
    
    this._stateManager.setConfig(this._config);
    this._setupEntities();
    this.render();
  }

  set hass(hass) {
    const languageChanged = this._stateManager.setHass(hass);
    
    // Re-render if language changed to update all translations
    if (languageChanged && this._rendered) {
      this._stateManager.waitForTranslations().then(() => {
        this.render();
        // Sync with backend AFTER render completes
        const stateEntity = this._stateManager.getEntityState(this._entities.state);
        if (stateEntity && this._stateManager.hasBackendChanged(stateEntity)) {
          setTimeout(() => this._syncWithBackend(stateEntity), 50);
        }
      });
    }
    
    if (!this._rendered) return;
    
    const stateEntity = this._stateManager.getEntityState(this._entities.state);
    if (!stateEntity) return;
    
    // Check if backend config has changed
    if (this._stateManager.hasBackendChanged(stateEntity)) {
      this._syncWithBackend(stateEntity);
    }
    
    // Update card values
    this._updateCard(stateEntity);
  }

  _setupEntities() {
    const p = this._config.entity_prefix;
    this._entities = {
      state: `sensor.${p}_state`,
      probe_temp: `sensor.${p}_probe_temperature`,
      target_temp: `sensor.${p}_target_temperature`,
      progress: `sensor.${p}_progress`,
      ambient_temp: `sensor.${p}_ambient_temperature`,
      remaining_time: `sensor.${p}_remaining_time`,
      heating_rate: `sensor.${p}_heating_rate`,
      start_time: `sensor.${p}_start_time`,
      estimated_end: `sensor.${p}_estimated_end_time`,
      battery: `sensor.${p}_battery`,
      rssi: `sensor.${p}_signal_strength`
    };
  }

  render() {
    if (!this.shadowRoot) return;
    
    this._renderer.renderCard(this.shadowRoot, this._config);
    this._rendered = true;
    
    // Attach event listeners
    this._eventHandler.attachAllListeners(
      this.shadowRoot,
      this._entities,
      this._config,
      {
        onGraphToggle: () => this._toggleGraph(),
        onSpanChange: (span) => this._changeGraphSpan(span)
      }
    );
    
    // Sync with backend after render
    const stateEntity = this._stateManager.getEntityState(this._entities.state);
    if (stateEntity) {
      setTimeout(() => this._syncWithBackend(stateEntity), 50);
    }
    
    // Initialize chart if needed
    if (this._config.show_graph) {
      setTimeout(() => {
        const chartEl = this.shadowRoot.querySelector("#chart");
        if (chartEl) {
          // Force reflow to ensure layout is computed
          void chartEl.offsetHeight;
          
          this._chartManager.initChart(chartEl, this._entities);
          // Immediate update to fix 30s delay - but wait for chart to render first
          setTimeout(() => {
            const stateEntity = this._stateManager.getEntityState(this._entities.state);
            if (stateEntity) {
              const attrs = stateEntity.attributes || {};
              this._chartManager.updateFromAttributes(
                attrs.withdrawal_temp,
                null, // remaining_time from attrs
                stateEntity.state,
                attrs.temp_history || [],
                attrs.ambient_history || []
              );
            }
          }, 200);
        }
      }, 100);
    }
  }

  _syncWithBackend(stateEntity) {
    const attrs = stateEntity.attributes || {};
    const category = attrs.food_category;
    // food_type format: "poultry_chicken_breast" → need "chicken_breast"
    const food = attrs.food_type ? attrs.food_type.substring(attrs.food_type.indexOf('_') + 1) : null;
    const doneness = attrs.food_doneness;
    const isManual = attrs.is_manual_mode;
    
    const categorySelect = this.shadowRoot.querySelector(".select-category");
    const foodSelect = this.shadowRoot.querySelector(".select-food");
    const donenessSelect = this.shadowRoot.querySelector(".select-doneness");
    
    if (!categorySelect) {
      return;
    }
    
    if (isManual) {
      categorySelect.value = "manual";
      if (foodSelect) {
        foodSelect.innerHTML = '<option value="manual">--</option>';
        foodSelect.value = "manual";
        foodSelect.disabled = true;
      }
      if (donenessSelect) {
        donenessSelect.innerHTML = '<option value="manual">--</option>';
        donenessSelect.value = "manual";
        donenessSelect.disabled = true;
      }
    } else if (category && food) {
      categorySelect.value = category;
      
      if (foodSelect) {
        const foodOptions = this._renderer.generateFoodOptions(category, food);
        foodSelect.innerHTML = foodOptions;
        foodSelect.disabled = false;
        // Wait for next tick to ensure options are rendered
        setTimeout(() => {
          foodSelect.value = food;
        }, 10);
      }
      
      if (doneness && donenessSelect) {
        const donenessOptions = this._renderer.generateDonenessOptions(category, food, doneness);
        donenessSelect.innerHTML = donenessOptions;
        donenessSelect.disabled = false;
        // Wait for next tick to ensure options are rendered
        setTimeout(() => {
          donenessSelect.value = doneness;
        }, 10);
      }
    }
    
    // Also update the target temperature input from the entity sensor
    const targetInput = this.shadowRoot.querySelector(".target-input");
    if (targetInput) {
      const targetTempEntity = this._stateManager.getEntityState(this._entities.target_temp);
      if (targetTempEntity && targetTempEntity.state) {
        const temp = parseFloat(targetTempEntity.state);
        if (!isNaN(temp)) {
          targetInput.value = Math.round(temp);
        }
      }
    }
  }

  _updateCard(stateEntity) {
    if (!stateEntity) return;
    
    const attrs = stateEntity.attributes || {};
    const state = stateEntity.state;
    
    // Handle state transitions for cooking timing
    const prevCookingStart = this._stateManager.getCookingStartTime();
    if (state === "cooking" && !prevCookingStart) {
      // Cooking just started - initialize the start time
      this._stateManager.setCookingStartTime(Date.now());
    } else if (state !== "cooking" && prevCookingStart) {
      // Cooking ended - reset the timer
      this._stateManager.resetCookingStartTime();
    }
    
    // Extract current temperatures from history (last entry)
    const tempHistory = attrs.temp_history || [];
    const ambientHistory = attrs.ambient_history || [];
    const probeTemp = tempHistory.length > 0 ? tempHistory[tempHistory.length - 1][1] : null;
    const ambientTemp = ambientHistory.length > 0 ? ambientHistory[ambientHistory.length - 1][1] : null;
    
    // Get progress value
    const progress = this._stateManager.getNumericState(this._entities.progress);
    
    // Parse food_type correctly: "beef_steak" -> "steak"
    const parsedFood = attrs.food_type ? attrs.food_type.substring(attrs.food_type.indexOf('_') + 1) : null;
    
    // Update header with progress bar
    this._updateHeader(
      state,
      attrs.battery,
      attrs.rssi,
      attrs.food_category,
      parsedFood,
      attrs.food_doneness,
      attrs.is_manual_mode,
      progress
    );
    
    // Get state values for times and rate
    const startTime = this._stateManager.getEntityState(this._entities.start_time)?.state;
    const remainingTime = this._stateManager.getNumericState(this._entities.remaining_time);
    const estimatedEnd = this._stateManager.getEntityState(this._entities.estimated_end)?.state;
    const heatingRate = this._stateManager.getNumericState(this._entities.heating_rate);
    
    // Update main view
    this._updateMainView(
      state,
      probeTemp,
      attrs.withdrawal_temp,
      attrs.desired_temp,
      null, // progress - need to calculate
      startTime,
      estimatedEnd,
      remainingTime,
      heatingRate,
      ambientTemp,
      attrs.carryover_enabled,
      attrs.probe_connected,
      null  // disconnect_duration - need to find in attrs
    );
    
    // Update settings
    this._updateSettings(
      attrs.target_temp,
      attrs.manual_mode,
      attrs.manual_temp_memory,
      attrs.carryover_enabled,
      state
    );
    
    // Update buttons
    this._updateButtons(state);
    
    // Update graph
    if (this._chartManager.isInitialized() && this._config.show_graph) {
      this._chartManager.updateFromHistory(
        attrs.withdrawal_temp,
        this._stateManager.getNumericState(this._entities.remaining_time),
        state,
        this._entities
      );
    }
  }

  _updateHeader(state, battery, rssi, category, food, doneness, isManual, progress) {
    const t = (key) => this._stateManager.t(key);
    const stateBadge = this.shadowRoot.querySelector(".state-badge");
    const foodDisplay = this.shadowRoot.querySelector(".food-display");
    const batteryInfo = this.shadowRoot.querySelector(".battery-info");
    const rssiInfo = this.shadowRoot.querySelector(".rssi-info");
    
    // Update progress bar
    this._renderer.updateProgressBar(this.shadowRoot, progress, state);
    
    // State badge
    if (stateBadge) {
      stateBadge.className = `state-badge clickable ${state}`;
      stateBadge.textContent = t(state);
    }
    
    // Food display removed - will be used for other purposes later
    
    // Battery
    if (batteryInfo && this._config.show_battery && battery !== null) {
      batteryInfo.style.display = "";
      let batteryIcon = "mdi:battery";
      let batteryColor = "";
      if (battery >= 90) { batteryIcon = "mdi:battery"; batteryColor = "var(--success-color)"; }
      else if (battery >= 70) { batteryIcon = "mdi:battery-80"; batteryColor = "var(--success-color)"; }
      else if (battery >= 50) { batteryIcon = "mdi:battery-60"; batteryColor = "var(--success-color)"; }
      else if (battery >= 30) { batteryIcon = "mdi:battery-40"; batteryColor = "var(--warning-color)"; }
      else if (battery >= 10) { batteryIcon = "mdi:battery-20"; batteryColor = "var(--warning-color)"; }
      else { batteryIcon = "mdi:battery-alert"; batteryColor = "var(--error-color)"; }
      
      const colorStyle = batteryColor ? `style="color: ${batteryColor}"` : "";
      batteryInfo.innerHTML = `<ha-icon icon="${batteryIcon}" ${colorStyle}></ha-icon>${battery}%`;
    }
    
    // RSSI
    if (rssiInfo && this._config.show_rssi && rssi !== null) {
      rssiInfo.style.display = "";
      let rssiIcon = "mdi:wifi-strength-4";
      let rssiColor = "";
      if (rssi >= -50) rssiIcon = "mdi:wifi-strength-4";
      else if (rssi >= -60) rssiIcon = "mdi:wifi-strength-3";
      else if (rssi >= -70) rssiIcon = "mdi:wifi-strength-2";
      else if (rssi >= -80) { rssiIcon = "mdi:wifi-strength-1"; rssiColor = "var(--warning-color)"; }
      else { rssiIcon = "mdi:wifi-strength-alert-outline"; rssiColor = "var(--error-color)"; }
      
      const colorStyle = rssiColor ? `style="color: ${rssiColor}"` : "";
      rssiInfo.innerHTML = `<ha-icon icon="${rssiIcon}" ${colorStyle}></ha-icon>${rssi} dBm`;
    }
  }

  _updateMainView(state, probeTemp, withdrawalTemp, desiredTemp, progress, startTime, estimatedEnd, remainingTime, heatingRate, ambientTemp, carryoverEnabled, probeConnected, disconnectDuration) {
    const t = (key) => this._stateManager.t(key);
    const container = this.shadowRoot.querySelector(".card-container");
    const disconnectSection = this.shadowRoot.querySelector(".disconnect-section");
    const mainContent = this.shadowRoot.querySelector(".main-content");
    const cookingWarning = this.shadowRoot.querySelector(".cooking-disconnect-warning");
    const batteryInfo = this.shadowRoot.querySelector(".battery-info");
    const rssiInfo = this.shadowRoot.querySelector(".rssi-info");
    const foodRow = this.shadowRoot.querySelector(".food-row");
    
    // State class
    if (container) {
      container.className = `card-container state-${state}`;
    }
    
    // STATE: DISCONNECTED
    if (state === "disconnected") {
      disconnectSection.style.display = "";
      mainContent.style.display = "none";
      if (batteryInfo) batteryInfo.style.display = "none";
      if (rssiInfo) rssiInfo.style.display = "none";
      // Hide graph when disconnected
      const chartDiv = this.shadowRoot.querySelector("#chart");
      if (chartDiv) chartDiv.style.display = "none";
      return; // Nothing else to display
    }
    
    // For all other states
    disconnectSection.style.display = "none";
    mainContent.style.display = "";
    if (batteryInfo && this._config.show_battery) batteryInfo.style.display = "";
    if (rssiInfo && this._config.show_rssi) rssiInfo.style.display = "";
    
    // Cooking disconnect warning
    if (cookingWarning) {
      const showWarning = (state === "cooking" && !probeConnected && disconnectDuration > 1);
      cookingWarning.style.display = showWarning ? "" : "none";
      if (showWarning) {
        const warningText = cookingWarning.querySelector(".disconnect-warning-text");
        if (warningText) {
          warningText.textContent = `${t("disconnect_since")} (${Math.floor(disconnectDuration)}min)`;
        }
      }
    }
    
    // Update temperatures
    const probeTempEl = this.shadowRoot.querySelector(".probe-temp-value");
    const targetTempEl = this.shadowRoot.querySelector(".target-temp-value");
    const ambientTempValueEl = this.shadowRoot.querySelector(".ambient-temp-value");
    const ambientIconEl = this.shadowRoot.querySelector(".ambient-icon");
    const heatingRateEl = this.shadowRoot.querySelector(".heating-rate-value");
    
    if (probeTempEl) {
      probeTempEl.textContent = (probeTemp !== null && probeTemp !== undefined) ? `${probeTemp.toFixed(1)}°` : "--";
    }
    
    // Update ambient temperature with color coding
    if (ambientTempValueEl) {
      const ambientRowEl = ambientTempValueEl.parentElement;
      if (ambientTemp !== null && ambientTemp !== undefined) {
        ambientTempValueEl.textContent = `${ambientTemp.toFixed(1)}°`;
        // Apply color based on temperature
        ambientTempValueEl.classList.remove("blue", "orange", "red");
        if (ambientIconEl) {
          ambientIconEl.classList.remove("blue", "orange", "red");
        }
        if (ambientTemp < 50) {
          ambientTempValueEl.classList.add("blue");
          if (ambientIconEl) ambientIconEl.classList.add("blue");
        } else if (ambientTemp < 100) {
          ambientTempValueEl.classList.add("orange");
          if (ambientIconEl) ambientIconEl.classList.add("orange");
        } else {
          ambientTempValueEl.classList.add("red");
          if (ambientIconEl) ambientIconEl.classList.add("red");
        }
        if (ambientRowEl) ambientRowEl.style.display = "";
      } else {
        if (ambientRowEl) ambientRowEl.style.display = "none";
      }
    }
    
    // Update heating rate
    if (heatingRateEl) {
      if (state === "cooking" && heatingRate !== null && heatingRate !== undefined) {
        heatingRateEl.textContent = `${heatingRate.toFixed(2)}°/min`;
        heatingRateEl.style.display = "";
      } else {
        heatingRateEl.style.display = "none";
      }
    }
    
    if (targetTempEl) {
      if (state === "cooking" || state === "done") {
        targetTempEl.parentElement.style.display = "";
        // During cooking/done, show withdrawal temp if compensation enabled, otherwise desired temp
        if (carryoverEnabled && withdrawalTemp !== null && withdrawalTemp !== undefined) {
          targetTempEl.textContent = `${withdrawalTemp.toFixed(1)}°`;
        } else if (desiredTemp !== null && desiredTemp !== undefined) {
          targetTempEl.textContent = `${desiredTemp.toFixed(1)}°`;
        } else {
          targetTempEl.textContent = "--";
        }
      } else {
        // In IDLE, hide the target temp row completely
        targetTempEl.parentElement.style.display = "none";
      }
    }
    
    // Update progress
    const progressPercent = this.shadowRoot.querySelector(".progress-percent");
    const progressCircle = this.shadowRoot.querySelector(".progress-ring-circle");
    
    if (progressPercent && progressCircle) {
      if (state === "cooking") {
        if (progress !== null && progress !== undefined) {
          progressPercent.textContent = `${Math.round(progress)}%`;
          const circumference = 2 * Math.PI * 70;
          const offset = circumference - (progress / 100) * circumference;
          progressCircle.style.strokeDashoffset = offset;
          
          // Color based on progress
          if (progress < 33) progressCircle.style.stroke = "var(--primary-color)";
          else if (progress < 66) progressCircle.style.stroke = "var(--warning-color)";
          else progressCircle.style.stroke = "var(--success-color)";
        } else {
          progressPercent.textContent = "--";
          progressCircle.style.strokeDashoffset = 439.82;
        }
        progressPercent.style.display = "";
      } else {
        progressPercent.style.display = "none";
        progressCircle.style.strokeDashoffset = 439.82;
      }
    }
    
    // Update times
    const timeElapsed = this.shadowRoot.querySelector(".time-elapsed");
    const timeRemaining = this.shadowRoot.querySelector(".time-remaining");
    const timeStart = this.shadowRoot.querySelector(".time-start");
    const timeEnd = this.shadowRoot.querySelector(".time-end");
    
    // Get parent info-blocks for visibility control
    const timeElapsedBlock = timeElapsed?.closest(".info-block");
    const timeRemainingBlock = timeRemaining?.closest(".info-block");
    const timeStartBlock = timeStart?.closest(".info-block");
    const timeEndBlock = timeEnd?.closest(".info-block");
    
    // STATE: IDLE - Hide all times/rate/ambient
    if (state === "idle") {
      if (timeElapsedBlock) timeElapsedBlock.style.display = "none";
      if (timeRemainingBlock) timeRemainingBlock.style.display = "none";
      if (timeStartBlock) timeStartBlock.style.display = "none";
      if (timeEndBlock) timeEndBlock.style.display = "none";
    }
    
    // STATE: COOKING - Show all times/rate/ambient
    if (state === "cooking") {
      // Calculate elapsed time from startTime (from HA) in seconds
      let elapsed = 0;
      if (startTime) {
        try {
          const startDate = new Date(startTime);
          elapsed = Math.floor((Date.now() - startDate.getTime()) / 1000);
        } catch (e) {
          elapsed = 0;
        }
      }
      
      // Check if heating rate is valid (if negative or near-zero, don't show calculated times)
      const heatingRateValid = heatingRate !== null && heatingRate !== undefined && heatingRate > 0.01;
      
      if (timeElapsed) timeElapsed.textContent = this._formatDuration(elapsed);
      if (timeRemaining) timeRemaining.textContent = (heatingRateValid && remainingTime !== null) ? this._formatDuration(remainingTime * 60) : "--";
      if (timeStart) timeStart.textContent = this._formatTime(startTime);
      if (timeEnd) timeEnd.textContent = heatingRateValid ? this._formatTime(estimatedEnd) : "--";
      
      // Start elapsed time timer
      this._startElapsedTimer();
      
      // Show time blocks during cooking
      if (timeElapsedBlock) timeElapsedBlock.style.display = "";
      if (timeRemainingBlock) timeRemainingBlock.style.display = "";
      if (timeStartBlock) timeStartBlock.style.display = "";
      if (timeEndBlock) timeEndBlock.style.display = "";
    } else {
      // Stop elapsed timer when not cooking
      this._stopElapsedTimer();
      // IDLE/DONE: hide time blocks
      if (timeElapsedBlock) timeElapsedBlock.style.display = "none";
      if (timeRemainingBlock) timeRemainingBlock.style.display = "none";
      if (timeStartBlock) timeStartBlock.style.display = "none";
      if (timeEndBlock) timeEndBlock.style.display = "none";
    }
    
    // Note: heating rate now displayed only in circle and info-blocks are removed
    
    
    // Graph visibility based on state (if not user-toggled)
    const chartDiv = this.shadowRoot.querySelector("#chart");
    const graphToggle = this.shadowRoot.querySelector(".graph-toggle");
    if (chartDiv && graphToggle) {
      // Determine if graph should be visible based on state and config
      const shouldShowByDefault = (state === "cooking") && this._config.show_graph;
      
      if (this._userToggledGraph) {
        // User has toggled, respect their choice
        chartDiv.style.display = this._graphVisible ? "" : "none";
        graphToggle.textContent = this._graphVisible ? "▲" : "▼";
      } else {
        // Auto-control based on state
        chartDiv.style.display = shouldShowByDefault ? "" : "none";
        graphToggle.textContent = shouldShowByDefault ? "▲" : "▼";
        this._graphVisible = shouldShowByDefault;
      }
    }
  }

  _updateSettings(desiredTemp, isManual, manualTempMemory, carryoverEnabled, state) {
    const targetInput = this.shadowRoot.querySelector(".target-input");
    const compToggle = this.shadowRoot.querySelector(".comp-toggle");
    
    if (targetInput) {
      const temp = isManual ? manualTempMemory : desiredTemp;
      if (temp !== null && temp !== undefined) {
        targetInput.value = Math.round(temp);
      }
      targetInput.disabled = false; // Always enabled
    }
    
    if (compToggle) {
      compToggle.classList.toggle("active", carryoverEnabled);
    }
  }

  _updateButtons(state) {
    const controlsIdle = this.shadowRoot.querySelector(".controls-idle");
    const controlsCooking = this.shadowRoot.querySelector(".controls-cooking");
    
    if (controlsIdle) {
      controlsIdle.style.display = (state === "idle") ? "" : "none";
    }
    
    if (controlsCooking) {
      controlsCooking.style.display = (state === "cooking" || state === "done") ? "" : "none";
    }
  }

  _toggleGraph() {
    this._graphVisible = !this._graphVisible;
    this._userToggledGraph = true;
    
    const chartDiv = this.shadowRoot.querySelector("#chart");
    const graphToggle = this.shadowRoot.querySelector(".graph-toggle");
    
    if (chartDiv) {
      chartDiv.style.display = this._graphVisible ? "" : "none";
    }
    
    if (graphToggle) {
      graphToggle.textContent = this._graphVisible ? "▲" : "▼";
    }
    
    if (this._graphVisible && !this._chartManager.isInitialized()) {
      const chartEl = this.shadowRoot.querySelector("#chart");
      if (chartEl) {
        this._chartManager.initChart(chartEl, this._entities);
      }
    }
  }

  _changeGraphSpan(span) {
    this._chartManager.setGraphSpan(span);
    
    const stateEntity = this._stateManager.getEntityState(this._entities.state);
    if (stateEntity) {
      const attrs = stateEntity.attributes || {};
      this._chartManager.updateFromHistory(
        attrs.withdrawal_temp,
        this._stateManager.getNumericState(this._entities.remaining_time),
        stateEntity.state,
        this._entities
      );
    }
  }

  _formatDuration(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return "--";
    
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    // If less than 1 hour, show mm:ss format
    if (hours === 0) {
      return `${minutes.toString().padStart(2, "0")}m${secs.toString().padStart(2, "0")}`;
    }
    
    // If 1 hour or more, show hh:mm format
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }

  _formatTime(isoString) {
    if (!isoString) return "--";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(this._stateManager.getLang(), { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--";
    }
  }

  /**
   * Update elapsed time display every second
   */
  _updateElapsedTime() {
    const timeElapsed = this.shadowRoot?.querySelector(".time-elapsed");
    if (!timeElapsed) return;

    // Get startTime from entity
    const startTime = this._stateManager.getEntityState(this._entities.start_time)?.state;
    if (!startTime) {
      timeElapsed.textContent = "--";
      return;
    }

    try {
      const startDate = new Date(startTime);
      const elapsed = Math.floor((Date.now() - startDate.getTime()) / 1000);
      timeElapsed.textContent = this._formatDuration(elapsed);
    } catch (e) {
      timeElapsed.textContent = "--";
    }
  }

  /**
   * Start elapsed time timer
   */
  _startElapsedTimer() {
    if (this._elapsedTimeInterval) return; // Already running
    this._elapsedTimeInterval = setInterval(() => this._updateElapsedTime(), 1000);
  }

  /**
   * Stop elapsed time timer
   */
  _stopElapsedTimer() {
    if (this._elapsedTimeInterval) {
      clearInterval(this._elapsedTimeInterval);
      this._elapsedTimeInterval = null;
    }
  }

  getCardSize() { return 6; }
}

customElements.define("assistant-cooker-card", AssistantCookerCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "assistant-cooker-card",
  name: "Assistant Cooker Card",
  description: "Custom card for Assistant Cooker integration",
  version: CARD_VERSION
});

console.info(`%c ASSISTANT-COOKER-CARD %c v${CARD_VERSION} `, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
