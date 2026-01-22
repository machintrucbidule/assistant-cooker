/**
 * Rendering Module
 * Generates HTML structure and styles for the card
 */

import { FOOD_DATABASE } from '../data/food-database.js';
import { SPAN_OPTIONS } from '../data/span-options.js';

export class Renderer {
  constructor(stateManager) {
    this._stateManager = stateManager;
  }

  /**
   * Render complete card HTML
   */
  renderCard(shadowRoot, config) {
    const t = (key) => this._stateManager.t(key);
    const lang = this._stateManager.getLang();

    shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <ha-card>
        <div class="card-container state-idle">
          <div class="header">
            <span class="state-badge clickable" data-entity="state">${t("idle")}</span>
            <div class="progress-bar-container clickable" data-entity="progress" style="display:none;">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill"></div>
                <span class="progress-bar-text">00%</span>
              </div>
            </div>
            <span class="battery-info" style="display:none"></span>
            <span class="rssi-info" style="display:none"></span>
          </div>

          <div class="disconnect-section" style="display:none;">
            <span class="disconnect-text">${t("connect_probe")}</span>
          </div>

          <div class="main-content">
            <div class="cooking-disconnect-warning" style="display:none;">
              <ha-icon icon="mdi:connection"></ha-icon>
              <span class="disconnect-warning-text"></span>
            </div>
            
            <div class="temp-display">
              <div class="info-left">
                <div class="info-block clickable" data-entity="remaining_time">
                  <span class="info-label">${t("elapsed")}</span>
                  <span class="info-value time-elapsed">--</span>
                </div>
                <div class="info-block clickable" data-entity="start_time">
                  <span class="info-label">${t("started_at")}</span>
                  <span class="info-value time-start">--</span>
                </div>
              </div>
              
              <div class="progress-container clickable" data-entity="probe_temp">
                <svg class="progress-ring" viewBox="0 0 160 160">
                  <circle class="progress-ring-bg" cx="80" cy="80" r="70" />
                  <circle class="progress-ring-circle" cx="80" cy="80" r="70" />
                </svg>
                <div class="progress-center">
                  <div class="ambient-temp-row clickable" data-entity="ambient_temp">
                    <ha-icon icon="mdi:air-filter" class="ambient-icon"></ha-icon>
                    <span class="ambient-temp-value"--</span>
                  </div>
                  <span class="probe-temp-value">--</span>
                  <span class="heating-rate-value clickable" data-entity="heating_rate">--</span>
                  <div class="target-temp-row clickable" data-entity="target_temp">
                    <ha-icon icon="mdi:target" class="target-icon"></ha-icon>
                    <span class="target-temp-value">--</span>
                  </div>
                </div>
              </div>
              
              <div class="info-right">
                <div class="info-block clickable" data-entity="remaining_time">
                  <span class="info-label">${t("remaining")}</span>
                  <span class="info-value time-remaining">--</span>
                </div>
                <div class="info-block clickable" data-entity="estimated_end">
                  <span class="info-label">${t("ends_at")}</span>
                  <span class="info-value time-end">--</span>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <div class="setting-group">
                <label class="setting-label">${t("target_temp").toUpperCase()}</label>
                <div class="target-wrapper">
                  <input type="number" class="target-input" min="30" max="100" step="1" value="57" />
                  <span class="target-unit">°C</span>
                </div>
              </div>
              <div class="setting-group">
                <label class="setting-label">${t("compensation").toUpperCase()}</label>
                <div class="comp-wrapper">
                  <button class="comp-toggle active"><ha-icon icon="mdi:thermometer-check"></ha-icon></button>
                  <span class="comp-help">?</span>
                </div>
              </div>
            </div>

            <div class="food-row">
              <select class="select-category">
                ${this.generateCategoryOptions()}
              </select>
              <select class="select-food"><option value="">--</option></select>
              <select class="select-doneness"><option value="">--</option></select>
            </div>

            <div class="controls-idle">
              <button class="btn-start">${t("start")}</button>
            </div>

            <div class="controls-cooking" style="display:none;">
              <button class="btn-stop">${t("stop")}</button>
            </div>
          </div>

          <div class="graph-section" ${config.show_graph === false ? 'style="display:none"' : ''}>
            <div id="chart"></div>
            <div class="graph-controls">
              <button class="graph-toggle">▲</button>
              <select class="span-select">
                ${this.generateSpanOptions(lang)}
              </select>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Generate category select options
   */
  generateCategoryOptions() {
    const t = (key) => this._stateManager.t(key);
    return Object.entries(FOOD_DATABASE)
      .map(([key, cat]) => `<option value="${key}">${t(cat.categoryKey)}</option>`)
      .join("");
  }

  /**
   * Generate food select options for a category
   */
  generateFoodOptions(category, selectedFood = null) {
    const t = (key) => this._stateManager.t(key);
    if (!FOOD_DATABASE[category]) return '<option value="">--</option>';
    
    const foods = FOOD_DATABASE[category].foods;
    return Object.entries(foods)
      .map(([key, f]) => `<option value="${key}" ${key === selectedFood ? "selected" : ""}>${t(f.foodKey)}</option>`)
      .join("");
  }

  /**
   * Generate doneness select options for a food
   */
  generateDonenessOptions(category, food, selectedDoneness = null) {
    const t = (key) => this._stateManager.t(key);
    if (!FOOD_DATABASE[category]?.foods[food]) return '<option value="">--</option>';
    
    const opts = FOOD_DATABASE[category].foods[food].doneness;
    return Object.entries(opts)
      .map(([key, d]) => `<option value="${key}" ${key === selectedDoneness ? "selected" : ""}>${t(d.donenessKey)} (${d.temp}°)</option>`)
      .join("");
  }

  /**
   * Generate span select options
   */
  generateSpanOptions(lang) {
    return SPAN_OPTIONS
      .map(opt => `<option value="${opt.value}" ${opt.value === "auto" ? "selected" : ""}>${opt.label[lang] || opt.label.en}</option>`)
      .join("");
  }

  /**
   * Get CSS styles
   */
  getStyles() {
    return `
      :host { --primary-color: #03a9f4; --success-color: #4caf50; --warning-color: #ff9800; --error-color: #f44336; --card-bg: var(--card-background-color, #1c1c1c); --text-primary: var(--primary-text-color, #fff); --text-secondary: var(--secondary-text-color, #aaa); }
      

      
      .card-container { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      
      /* Header */
      .header { display: flex; align-items: center; gap: 12px; }
      .state-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; cursor: pointer; }
      .state-badge.disconnected { background: var(--card-background-color, #2a2a2a); color: var(--text-secondary); border: 1px solid var(--text-secondary); }
      .state-badge.idle { background: var(--success-color); color: #fff; }
      .state-badge.cooking { background: var(--warning-color); color: #fff; }
      .state-badge.done { background: var(--success-color); color: #fff; }
      .state-badge:hover { opacity: 0.8; }
      
      /* Progress bar */
      .progress-bar-container { display: flex; flex: 1; height: 24px; margin: 0 10px; position: relative; }
      .progress-bar-bg { flex: 1; height: 100%; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; position: relative; }
      .progress-bar-fill { height: 100%; width: 0%; background: #03a9f4; transition: width 0.3s ease, background-color 0.3s ease; }
      .progress-bar-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: 600; color: #fff; min-width: 35px; text-align: center; z-index: 10; }
      
      /* Progress bar color states */
      .progress-bar-fill.low { background: #03a9f4; }
      .progress-bar-fill.medium { background: #ff9800; }
      .progress-bar-fill.high { background: #4caf50; }
      .progress-bar-fill.disabled { background: #9e9e9e; }
      
      .food-display { flex: 1; font-size: 14px; color: var(--text-primary); font-weight: 500; }
      .battery-info { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; cursor: pointer; margin-left: auto; }
      .rssi-info { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; cursor: pointer; }
      .battery-info:hover, .rssi-info:hover { opacity: 0.8; }
      
      /* Disconnect section */
      .disconnect-section { text-align: center; padding: 20px; color: var(--text-secondary); font-size: 16px; font-weight: 400; }
      
      /* Main content */
      .main-content { display: flex; flex-direction: column; gap: 16px; }
      .cooking-disconnect-warning { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(244, 67, 54, 0.1); border-left: 3px solid var(--error-color); border-radius: 4px; color: var(--error-color); font-size: 12px; }
      
      /* Temperature display */
      .temp-display { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .info-left, .info-right { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
      .info-right { align-items: flex-end; }
      .info-right .info-value { text-align: right; }
      .info-block { display: flex; flex-direction: column; gap: 2px; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
      .info-block:hover { background: rgba(255,255,255,0.05); }
      .info-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; }
      .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
      
      /* Progress ring */
      .progress-container { flex: 0 0 auto; width: 160px; height: 160px; position: relative; cursor: pointer; align-self: center; }
      .progress-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
      .progress-ring-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 8; }
      .progress-ring-circle { fill: none; stroke: var(--primary-color); stroke-width: 8; stroke-linecap: round; stroke-dasharray: 439.82; stroke-dashoffset: 439.82; transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease; }
      .progress-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; }
      .progress-percent { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: 700; color: var(--primary-color); }
      
      .ambient-temp-row { position: absolute; top: 35px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 600; line-height: 1; }
      .ambient-icon { font-size: 13px; width: 13px; height: 13px; flex-shrink: 0; line-height: 1; display: flex; align-items: center; justify-content: center; }
      .ambient-icon.blue { color: #03a9f4; }
      .ambient-icon.orange { color: #ff9800; }
      .ambient-icon.red { color: #f44336; }
      .ambient-temp-value { font-size: 13px; font-weight: 600; line-height: 1; }
      .ambient-temp-value.blue { color: #03a9f4; }
      .ambient-temp-value.orange { color: #ff9800; }
      .ambient-temp-value.red { color: #f44336; }
      
      .probe-temp-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 32px; font-weight: 700; color: var(--text-primary); line-height: 1; white-space: nowrap; }
      
      .heating-rate-value { position: absolute; top: 63%; left: 50%; transform: translateX(-50%); font-size: 11px; color: #999; font-weight: 500; line-height: 1; white-space: nowrap; }
      
      .target-temp-row { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; line-height: 1; }
      .target-icon { font-size: 11px; width: 11px; height: 11px; color: var(--text-secondary); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .target-temp-value { font-size: 13px; font-weight: 600; line-height: 1; }
      
      /* Settings section */
      .settings-section { display: flex; gap: 12px; }
      .setting-group { flex: 1; display: flex; flex-direction: column; gap: 6px; }
      .setting-group:first-child { align-items: flex-end; }
      .setting-label { font-size: 10px; color: var(--text-secondary); font-weight: 600; }
      .target-wrapper { display: flex; align-items: center; gap: 6px; }
      .target-input { width: 52px; padding: 6px 10px; background: var(--card-background-color, #2a2a2a); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: var(--text-primary); font-size: 16px; font-weight: 500; text-align: center; }
      .target-unit { font-size: 16px; color: var(--text-secondary); font-weight: 500; }
      .comp-wrapper { display: flex; align-items: center; gap: 8px; }
      .comp-toggle { padding: 6px 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: var(--text-secondary); cursor: pointer; transition: all 0.3s; }
      .comp-toggle ha-icon { --mdc-icon-size: 18px; }
      .comp-toggle.active { background: var(--success-color); border-color: var(--success-color); color: #fff; }
      .comp-help { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 12px; cursor: pointer; }
      
      /* Controls */
      .controls-idle, .controls-cooking { display: flex; flex-direction: column; gap: 12px; }
      .food-row { display: flex; gap: 8px; }
      select { flex: 1; padding: 8px; background: var(--card-background-color, #2a2a2a); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: var(--text-primary); font-size: 14px; cursor: pointer; }
      select:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn-start, .btn-stop { width: 100%; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; border: none; transition: all 0.3s; }
      .btn-start { background: var(--success-color); color: #fff; }
      .btn-start:hover { background: #45a049; }
      .btn-stop { background: var(--error-color); color: #fff; }
      .btn-stop:hover { background: #e53935; }
      
      /* Graph section */
      .graph-section { display: block; text-align: center; margin-bottom: 0; }
      #chart { height: 150px; margin-bottom: 4px; }
      .graph-controls { display: inline-flex; align-items: center; gap: 4px; padding: 0; margin: 0; }
      .graph-toggle { padding: 2px 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: var(--text-secondary); cursor: pointer; font-size: 11px; height: auto; min-width: 28px; line-height: 1.2; }
      .span-select { width: 80px; height: auto; padding: 2px 6px; font-size: 11px; line-height: 1.2; }
      
      /* Clickable */
      .clickable { cursor: pointer; transition: opacity 0.2s; }
      .clickable:hover { opacity: 0.8; }
      
      /* Help popup */
      .help-popup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; }
      .help-popup { background: var(--card-background-color, #1c1c1c); padding: 24px; border-radius: 12px; max-width: 400px; margin: 16px; }
      .help-popup-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary); }
      .help-popup-text { font-size: 14px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 16px; }
      .help-popup-close { width: 100%; padding: 10px; background: var(--primary-color); color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
    `;
  }

  /**
   * Update progress bar in header
   */
  updateProgressBar(shadowRoot, progress, state) {
    const container = shadowRoot.querySelector('.progress-bar-container');
    const fill = shadowRoot.querySelector('.progress-bar-fill');
    const text = shadowRoot.querySelector('.progress-bar-text');

    if (!container || !fill || !text) return;

    // Show/hide progress bar based on state
    const showProgress = state === 'cooking' || state === 'done';
    container.style.display = showProgress ? 'flex' : 'none';

    if (!showProgress) return;

    // Ensure progress is 0-100
    const percent = Math.max(0, Math.min(100, progress || 0));

    // Update width and text - format as 2 digits with leading zero
    fill.style.width = percent + '%';
    text.textContent = String(Math.round(percent)).padStart(2, '0') + '%';

    // Update color classes based on percentage
    fill.classList.remove('low', 'medium', 'high', 'disabled');
    if (state === 'done') {
      fill.classList.add('high');
    } else if (percent < 80) {
      fill.classList.add('low');
    } else if (percent < 100) {
      fill.classList.add('medium');
    } else {
      fill.classList.add('high');
    }
  }
}