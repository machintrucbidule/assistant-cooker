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
    this._lastAutoSpanUpdate = 0;
    this._cachedAutoSpan = 5;
    // Throttle: full refresh only every 2 minutes
    this._lastFullRefresh = 0;
    this._currentSpanMinutes = 5;
    this._forceRefresh = false;
    // Cache for incremental updates
    this._cachedProbeData = [];
    this._cachedAmbientData = [];
    this._cachedXMin = 0;
    this._cachedXMax = 0;
    // Track last data to detect real changes
    this._lastDataHash = "";
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
          { seriesName: [t("probe"), t("target"), t("projection")], labels: { formatter: v => v?.toFixed(0) + "°", style: { colors: isDark ? "#888" : "#666", fontSize: "9px" } } },
          { seriesName: t("ambient"), opposite: true, labels: { formatter: v => v?.toFixed(0) + "°", style: { colors: isDark ? "#888" : "#666", fontSize: "9px" } } }
        ],
        legend: { show: false },
        grid: { borderColor: isDark ? "#333" : "#e0e0e0", padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        tooltip: { theme: isDark ? "dark" : "light", x: { format: "HH:mm:ss" }, y: { formatter: v => v !== null ? v.toFixed(1) + "°C" : "--" } }
      });

      this._chart.render();
      this._chartInitialized = true;

      // Note: updateFromHistory/updateFromAttributes will be called by assistant-cooker-card.js
      // after a delay to ensure chart is fully ready
    } catch (e) {
      console.error("[assistant-cooker-card] Chart error:", e);
      this._chart = null;
      this._chartInitialized = false;
    }
  }

  /**
   * Update chart from attribute data (temp_history and ambient_history)
   * This is now the main update method - uses attributes instead of API calls
   */
  async updateFromAttributes(withdrawalTemp, remainingTime, state, tempHistory, ambientHistory) {
    if (!this._chart || !this._chartInitialized) return;

    try {
      // Safety: ensure chart's internal data is ready before updating
      if (!this._chart.w || !this._chart.w.config || !this._chart.w.config.series) {
        return;
      }

      const now = Date.now();

      // Check if data actually changed - skip update if nothing new
      const lastProbeTime = tempHistory.length > 0 ? tempHistory[tempHistory.length - 1][0] : "";
      const lastAmbientTime = ambientHistory.length > 0 ? ambientHistory[ambientHistory.length - 1][0] : "";
      const dataHash = `${lastProbeTime}-${lastAmbientTime}-${state}`;
      
      if (!this._forceRefresh && dataHash === this._lastDataHash) {
        return; // No new data, skip update
      }
      this._lastDataHash = dataHash;

      // Calculate span (only recalculated every 2 minutes for auto mode)
      const graphSpan = this._graphSpan || "auto";
      let spanMinutes;
      const isCookingOrDone = state === "cooking" || state === "done";
      
      if (graphSpan === "auto") {
        const cookingStartTime = this._stateManager.getCookingStartTime();
        const cookingStartMs = cookingStartTime instanceof Date ? cookingStartTime.getTime() : cookingStartTime;
        
        if (isCookingOrDone && cookingStartMs) {
          const elapsedMin = (now - cookingStartMs) / 60000;
          if (now - this._lastAutoSpanUpdate >= 120000 || this._lastAutoSpanUpdate === 0) {
            this._cachedAutoSpan = Math.ceil(elapsedMin + 5);
            this._lastAutoSpanUpdate = now;
            this._forceRefresh = true; // Span changed, force full refresh
          }
          spanMinutes = this._cachedAutoSpan;
        } else {
          // Idle/disconnected: 5 minutes of past data (+ 10 min future = 15 min total)
          spanMinutes = 5;
          this._lastAutoSpanUpdate = 0;
          this._cachedAutoSpan = 5;
        }
      } else {
        spanMinutes = parseInt(graphSpan);
      }

      // Check if span changed (user selection or auto recalculation)
      if (spanMinutes !== this._currentSpanMinutes) {
        this._forceRefresh = true;
        this._currentSpanMinutes = spanMinutes;
      }

      // Future display: 10 minutes by default, but reduce when end time is known and close
      // If remainingTime is known and < 9 min, show only remainingTime + 1 min
      let futureMinutes = 10;
      if (remainingTime !== null && remainingTime > 0 && remainingTime < 9) {
        futureMinutes = Math.ceil(remainingTime) + 1;
      }
      const xMin = now - spanMinutes * 60000;
      const xMax = now + futureMinutes * 60000;

      // Convert history arrays to chart data format
      const probeData = tempHistory.map(([timestamp, value]) => ({
        x: new Date(timestamp).getTime(),
        y: value
      })).filter(d => !isNaN(d.x) && !isNaN(d.y));

      const ambientData = ambientHistory.map(([timestamp, value]) => ({
        x: new Date(timestamp).getTime(),
        y: value
      })).filter(d => !isNaN(d.x) && !isNaN(d.y));

      // Filter data to visible range
      const visibleProbeData = probeData.filter(d => d.x >= xMin && d.x <= now);
      const visibleAmbientData = ambientData.filter(d => d.x >= xMin && d.x <= now);

      // Check if we need a full refresh (every 2 minutes or on span change)
      // Also force refresh if probe data just appeared (was empty, now has data)
      const probeDataJustAppeared = this._cachedProbeData.length === 0 && visibleProbeData.length > 0;
      const needsFullRefresh = this._forceRefresh || probeDataJustAppeared || (now - this._lastFullRefresh >= 120000);

      if (needsFullRefresh) {
        // Full refresh: update everything including axes
        this._doFullRefresh(visibleProbeData, visibleAmbientData, withdrawalTemp, remainingTime, state, xMin, xMax, now);
        this._lastFullRefresh = now;
        this._forceRefresh = false;
        this._cachedProbeData = visibleProbeData;
        this._cachedAmbientData = visibleAmbientData;
        this._cachedXMin = xMin;
        this._cachedXMax = xMax;
      } else {
        // Incremental update: only add new data points
        this._doIncrementalUpdate(visibleProbeData, visibleAmbientData, withdrawalTemp, remainingTime, state, now);
      }
    } catch (e) {
      console.error("[assistant-cooker-card] Error updating chart from attributes:", e);
    }
  }

  /**
   * Full chart refresh - updates axes, options, and all series
   */
  _doFullRefresh(probeData, ambientData, withdrawalTemp, remainingTime, state, xMin, xMax, now) {
    const isCooking = state === "cooking" || state === "done";

    // Target and projection lines
    let targetData = [], projectionData = [];
    if (isCooking && withdrawalTemp && probeData.length > 0) {
      targetData = [{ x: xMin, y: withdrawalTemp }, { x: xMax, y: withdrawalTemp }];
      if (state === "cooking" && remainingTime && remainingTime > 0) {
        const lastPoint = probeData[probeData.length - 1];
        if (lastPoint) {
          projectionData = [{ x: lastPoint.x, y: lastPoint.y }, { x: now + remainingTime * 60000, y: withdrawalTemp }];
        }
      }
    }

    // Calculate Y axis range
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

    try {
      const t = (key) => this._stateManager.t(key);
      this._chart.updateOptions({ 
        xaxis: { min: xMin, max: xMax },
        yaxis: [
          { seriesName: [t("probe"), t("target"), t("projection")], min: minY, max: maxY, labels: { formatter: v => v?.toFixed(0) + "°" } },
          { seriesName: t("ambient"), opposite: true, min: ambientMin, max: ambientMax, labels: { formatter: v => v?.toFixed(0) + "°" } }
        ]
      }, false, false);

      this._chart.updateSeries([
        { name: t("probe"), data: probeData },
        { name: t("target"), data: targetData },
        { name: t("projection"), data: projectionData },
        { name: t("ambient"), data: ambientData }
      ]);
    } catch (apexError) {
      // Chart not ready yet
    }
  }

  /**
   * Incremental update - only updates series data without changing axes
   */
  _doIncrementalUpdate(probeData, ambientData, withdrawalTemp, remainingTime, state, now) {
    const isCooking = state === "cooking" || state === "done";

    // Use cached axis limits
    const xMin = this._cachedXMin;
    const xMax = this._cachedXMax;

    // Target and projection lines
    let targetData = [], projectionData = [];
    if (isCooking && withdrawalTemp && probeData.length > 0) {
      targetData = [{ x: xMin, y: withdrawalTemp }, { x: xMax, y: withdrawalTemp }];
      if (state === "cooking" && remainingTime && remainingTime > 0) {
        const lastPoint = probeData[probeData.length - 1];
        if (lastPoint) {
          projectionData = [{ x: lastPoint.x, y: lastPoint.y }, { x: now + remainingTime * 60000, y: withdrawalTemp }];
        }
      }
    }

    try {
      const t = (key) => this._stateManager.t(key);
      this._chart.updateSeries([
        { name: t("probe"), data: probeData },
        { name: t("target"), data: targetData },
        { name: t("projection"), data: projectionData },
        { name: t("ambient"), data: ambientData }
      ], false); // false = don't animate
    } catch (apexError) {
      // Chart not ready yet
    }
  }

  /**
   * Update chart from history data - DEPRECATED, now uses updateFromAttributes
   * Kept for backwards compatibility but redirects to updateFromAttributes
   */
  async updateFromHistory(withdrawalTemp, remainingTime, state, entities, tempHistory, ambientHistory) {
    // If tempHistory and ambientHistory are provided, use them directly
    if (tempHistory && ambientHistory) {
      return this.updateFromAttributes(withdrawalTemp, remainingTime, state, tempHistory, ambientHistory);
    }
    // Otherwise this is a legacy call - do nothing (card should use updateFromAttributes)
    console.warn("[assistant-cooker-card] updateFromHistory called without attributes - use updateFromAttributes instead");
  }

  /**
   * Set graph span (for time range selection)
   * Forces a full refresh on next update
   */
  setGraphSpan(span) {
    if (this._graphSpan !== span) {
      this._graphSpan = span;
      this._forceRefresh = true; // Force full refresh on span change
    }
  }

  /**
   * Force a full refresh on next update
   */
  forceRefresh() {
    this._forceRefresh = true;
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
