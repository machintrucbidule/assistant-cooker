/**
 * Chart Manager Module
 * Manages ApexCharts lifecycle and history updates
 */

export class ChartManager {
  constructor(stateManager, apiClient) {
    this._stateManager = stateManager;
    this._apiClient = apiClient;
    this._chart = null;
    this._chartInitialized = false;
    this._chartRetryTimeout = null;
  }

  /**
   * Initialize ApexCharts (load library and create chart)
   */
  initChart(chartElement, entities) {
    if (this._chartInitialized) return;
    
    if (!chartElement) {
      console.warn("Chart element not found in DOM yet, retrying...");
      setTimeout(() => this.initChart(chartElement, entities), 100);
      return;
    }
    
    // Load ApexCharts if needed
    if (!window.ApexCharts) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/apexcharts@3.45.1/dist/apexcharts.min.js";
      script.onload = () => {
        console.log("ApexCharts loaded");
        setTimeout(() => this._createChart(chartElement, entities), 50);
      };
      script.onerror = () => console.error("Failed to load ApexCharts");
      document.head.appendChild(script);
    } else {
      this._createChart(chartElement, entities);
    }
  }

  /**
   * Create ApexCharts instance
   */
  _createChart(chartEl, entities) {
    if (!chartEl || !window.ApexCharts) return;
    
    // Si le conteneur n'a pas encore de dimensions, attendre le prochain frame
    if (chartEl.offsetWidth === 0 && !this._chartRetryTimeout) {
      this._chartRetryTimeout = setTimeout(() => {
        this._chartRetryTimeout = null;
        this._createChart(chartEl, entities);
      }, 50);
      return;
    }
    
    if (this._chart) { try { this._chart.destroy(); } catch (e) {} }

    try {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const t = (key) => this._stateManager.t(key);
      
      // Create chart with minimal valid initial data (no null values)
      const now = Date.now();
      const initialData = [
        { name: t("probe"), data: [[now, 0]] },
        { name: t("target"), data: [[now, 0]] },
        { name: t("projection"), data: [[now, 0]] },
        { name: t("ambient"), data: [[now, 0]] }
      ];

      this._chart = new ApexCharts(chartEl, {
        chart: { type: "line", height: 150, background: "transparent", toolbar: { show: false }, animations: { enabled: false }, zoom: { enabled: false } },
        series: initialData,
        colors: ["#03a9f4", "#f44336", "#03a9f4", "#ff9800"],
        stroke: { curve: "smooth", width: [3, 2, 2, 2], dashArray: [0, 5, 5, 0] },
        xaxis: { type: "datetime", labels: { datetimeUTC: false, datetimeFormatter: { hour: "HH:mm", minute: "HH:mm" }, style: { colors: isDark ? "#888" : "#666", fontSize: "9px" } } },
        yaxis: [
          { seriesName: t("probe"), labels: { formatter: v => v?.toFixed(0) + "°", style: { colors: isDark ? "#888" : "#666", fontSize: "9px" } } },
          { seriesName: t("ambient"), opposite: true, labels: { formatter: v => v?.toFixed(0) + "°", style: { colors: isDark ? "#888" : "#666", fontSize: "9px" } } }
        ],
        legend: { show: false },
        grid: { borderColor: isDark ? "#333" : "#e0e0e0", padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        tooltip: { theme: isDark ? "dark" : "light", x: { format: "HH:mm:ss" }, y: { formatter: v => v !== null ? v.toFixed(1) + "°C" : "--" } }
      });
      
      this._chart.render();
      this._chartInitialized = true;
      
      // Immediately load real data from Home Assistant
      const stateEntity = this._stateManager.getEntityState(entities.state);
      if (stateEntity) {
        const attrs = stateEntity.attributes || {};
        this.updateFromHistory(
          attrs.withdrawal_temp, 
          this._stateManager.getNumericState(entities.remaining_time), 
          stateEntity.state,
          entities
        );
      }
    } catch (e) {
      console.error("[assistant-cooker-card] Chart error:", e);
      this._chart = null;
      this._chartInitialized = false;
    }
  }

  /**
   * Update chart from attribute data (temp_history and ambient_history)
   */
  async updateFromAttributes(withdrawalTemp, remainingTime, state, tempHistory, ambientHistory) {
    if (!this._chart) return;

    try {
      const now = Date.now();
      
      // Convert history arrays to chart data format
      // History format: [["2026-01-20T16:39:29.532037+00:00", 18.875], ...]
      const probeData = tempHistory.map(([timestamp, value]) => ({
        x: new Date(timestamp).getTime(),
        y: value
      })).filter(d => !isNaN(d.x) && !isNaN(d.y));
      
      const ambientData = ambientHistory.map(([timestamp, value]) => ({
        x: new Date(timestamp).getTime(),
        y: value
      })).filter(d => !isNaN(d.x) && !isNaN(d.y));

      // Calculate time range
      const graphSpan = this._graphSpan || "auto";
      let spanMinutes;
      
      if (graphSpan === "auto") {
        const cookingStartTime = this._stateManager.getCookingStartTime();
        if (state === "cooking" && cookingStartTime && remainingTime !== null && remainingTime > 0 && remainingTime < 720) {
          const totalDuration = (now - cookingStartTime.getTime()) / 60000 + remainingTime;
          spanMinutes = Math.ceil(totalDuration * 1.1);
        } else if (state === "cooking" && cookingStartTime) {
          const elapsedMin = (now - cookingStartTime.getTime()) / 60000;
          if (elapsedMin < 3) spanMinutes = 5;
          else if (elapsedMin < 5) spanMinutes = 10;
          else if (elapsedMin < 15) spanMinutes = 15;
          else if (elapsedMin < 30) spanMinutes = 30;
          else spanMinutes = Math.ceil((elapsedMin + 15) / 15) * 15;
        } else {
          spanMinutes = 60;
        }
      } else {
        spanMinutes = parseInt(graphSpan);
      }

      const pastMinutes = spanMinutes * 2 / 3;
      const futureMinutes = spanMinutes / 3;
      const xMin = now - pastMinutes * 60000;
      const xMax = now + futureMinutes * 60000;

      // Filter data to visible range
      const visibleProbeData = probeData.filter(d => d.x >= xMin && d.x <= now);
      const visibleAmbientData = ambientData.filter(d => d.x >= xMin && d.x <= now);

      // Target and projection lines
      let targetData = [], projectionData = [];
      const isCooking = state === "cooking" || state === "done";
      
      if (isCooking && withdrawalTemp && visibleProbeData.length > 0) {
        targetData = [{ x: xMin, y: withdrawalTemp }, { x: xMax, y: withdrawalTemp }];
        if (state === "cooking" && remainingTime && remainingTime > 0) {
          const lastPoint = visibleProbeData[visibleProbeData.length - 1];
          if (lastPoint) {
            projectionData = [{ x: lastPoint.x, y: lastPoint.y }, { x: now + remainingTime * 60000, y: withdrawalTemp }];
          }
        }
      }

      // Calculate Y axis range
      let allTemps = visibleProbeData.map(d => d.y);
      if (withdrawalTemp && isCooking) allTemps.push(withdrawalTemp);
      let minY = allTemps.length ? Math.min(...allTemps) - 2 : 0;
      let maxY = allTemps.length ? Math.max(...allTemps) + 2 : 100;
      if (maxY - minY < 5) { const mid = (maxY + minY) / 2; minY = mid - 2.5; maxY = mid + 2.5; }

      let ambientMin = 0, ambientMax = 100;
      if (visibleAmbientData.length > 0) {
        const ambientTemps = visibleAmbientData.map(d => d.y);
        ambientMin = Math.min(...ambientTemps) - 10;
        ambientMax = Math.max(...ambientTemps) + 10;
      }

      this._chart.updateOptions({ 
        xaxis: { min: xMin, max: xMax },
        yaxis: [
          { min: minY, max: maxY, labels: { formatter: v => v?.toFixed(0) + "°" } },
          { opposite: true, min: ambientMin, max: ambientMax, labels: { formatter: v => v?.toFixed(0) + "°" } }
        ]
      }, false, false);

      const t = (key) => this._stateManager.t(key);
      this._chart.updateSeries([
        { name: t("probe"), data: visibleProbeData },
        { name: t("target"), data: targetData },
        { name: t("projection"), data: projectionData },
        { name: t("ambient"), data: visibleAmbientData }
      ]);
    } catch (e) {
      console.error("[assistant-cooker-card] Error updating chart from attributes:", e);
    }
  }

  /**
   * Update chart from history data
   */
  async updateFromHistory(withdrawalTemp, remainingTime, state, entities) {
    if (!this._chart) return;

    try {
      const now = Date.now();
      const graphSpan = this._graphSpan || "auto";
      let spanMinutes;
      
      if (graphSpan === "auto") {
        const cookingStartTime = this._stateManager.getCookingStartTime();
        if (state === "cooking" && cookingStartTime && remainingTime !== null && remainingTime > 0 && remainingTime < 720) {
          const totalDuration = (now - cookingStartTime.getTime()) / 60000 + remainingTime;
          spanMinutes = Math.ceil(totalDuration * 1.1);
        } else if (state === "cooking" && cookingStartTime) {
          const elapsedMin = (now - cookingStartTime.getTime()) / 60000;
          if (elapsedMin < 3) spanMinutes = 5;
          else if (elapsedMin < 5) spanMinutes = 10;
          else if (elapsedMin < 15) spanMinutes = 15;
          else if (elapsedMin < 30) spanMinutes = 30;
          else spanMinutes = Math.ceil((elapsedMin + 15) / 15) * 15;
        } else {
          spanMinutes = 60;
        }
      } else {
        spanMinutes = parseInt(graphSpan);
      }

      const pastMinutes = spanMinutes * 2 / 3;
      const futureMinutes = spanMinutes / 3;
      const xMin = now - pastMinutes * 60000;
      const xMax = now + futureMinutes * 60000;

      const hoursBack = Math.ceil(spanMinutes / 60) + 1;
      const probeHistory = await this._apiClient.fetchHistory(entities.probe_temp, hoursBack);
      const ambientHistory = await this._apiClient.fetchHistory(entities.ambient_temp, hoursBack);

      const probeData = probeHistory.filter(([t]) => t >= xMin && t <= now).map(([t, v]) => ({ x: t, y: v }));
      const ambientData = ambientHistory.filter(([t]) => t >= xMin && t <= now).map(([t, v]) => ({ x: t, y: v }));

      let targetData = [], projectionData = [];
      const isCooking = state === "cooking" || state === "done";
      
      if (isCooking && withdrawalTemp && probeData.length > 0) {
        targetData = [{ x: xMin, y: withdrawalTemp }, { x: xMax, y: withdrawalTemp }];
        if (state === "cooking" && remainingTime && remainingTime > 0) {
          const lastPoint = probeData[probeData.length - 1];
          if (lastPoint) {
            projectionData = [{ x: lastPoint.x, y: lastPoint.y }, { x: now + remainingTime * 60000, y: withdrawalTemp }];
          }
        }
      }

      let allTemps = probeData.map(d => d.y);
      if (withdrawalTemp && isCooking) allTemps.push(withdrawalTemp);
      let minY = allTemps.length ? Math.min(...allTemps) - 2 : 0;
      let maxY = allTemps.length ? Math.max(...allTemps) + 2 : 100;
      if (maxY - minY < 5) { const mid = (maxY + minY) / 2; minY = mid - 2.5; maxY = mid + 2.5; }

      let ambientMin = 0, ambientMax = 100;
      if (ambientData.length > 0) {
        const ambientTemps = ambientData.map(d => d.y);
        ambientMin = Math.min(...ambientTemps) - 10;
        ambientMax = Math.max(...ambientTemps) + 10;
      }

      this._chart.updateOptions({ 
        xaxis: { min: xMin, max: xMax },
        yaxis: [
          { min: minY, max: maxY, labels: { formatter: v => v?.toFixed(0) + "°" } },
          { opposite: true, min: ambientMin, max: ambientMax, labels: { formatter: v => v?.toFixed(0) + "°" } }
        ]
      }, false, false);

      const t = (key) => this._stateManager.t(key);
      this._chart.updateSeries([
        { name: t("probe"), data: probeData },
        { name: t("target"), data: targetData },
        { name: t("projection"), data: projectionData },
        { name: t("ambient"), data: ambientData }
      ]);
    } catch (e) {
      console.error("[assistant-cooker-card] Error updating chart:", e);
    }
  }

  /**
   * Set graph span (for time range selection)
   */
  setGraphSpan(span) {
    this._graphSpan = span;
  }

  /**
   * Check if chart is initialized
   */
  isInitialized() {
    return this._chartInitialized;
  }

  /**
   * Destroy chart
   */
  destroy() {
    if (this._chart) {
      try {
        this._chart.destroy();
      } catch (e) {
        console.error("[assistant-cooker-card] Error destroying chart:", e);
      }
      this._chart = null;
      this._chartInitialized = false;
    }
  }
}
