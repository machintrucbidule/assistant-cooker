/**
 * State Manager Module
 * Manages internal state, Home Assistant integration, and translations
 */

import { translations as enTranslations } from '../translations/en.js';

export class StateManager {
  constructor() {
    this._hass = null;
    this._config = null;
    this._lang = "en";
    this._translations = enTranslations;
    this._translationsCache = { en: enTranslations };
    this._translationsLoading = null;
    this._lastBackendCategory = null;
    this._lastBackendFood = null;
    this._lastBackendDoneness = null;
    this._lastBackendIsManual = null;
    this._cookingStartTime = null;
  }

  /**
   * Set Home Assistant instance and handle language changes
   */
  setHass(hass) {
    console.log("[AC-STATE] setHass called, language:", hass.language);
    const oldLang = this._lang;
    this._hass = hass;
    
    const newLang = hass.language?.substring(0, 2) || "en";
    console.log("[AC-STATE] detected lang:", newLang);
    const supportedLangs = ["fr", "en", "de", "es", "it", "pt", "nl", "pl", "ru", "zh", "ja", "ko", "ar", "hi", "tr", "sv", "da", "nb", "fi", "cs", "uk"];
    this._lang = supportedLangs.includes(newLang) ? newLang : "en";

    const languageChanged = oldLang !== this._lang;
    console.log("[AC-STATE] languageChanged:", languageChanged);

    if (languageChanged) {
      this._translationsLoading = this._loadLanguage();
    }

    return languageChanged;
  }

  /**
   * Wait for translations to finish loading
   */
  async waitForTranslations() {
    if (this._translationsLoading) {
      await this._translationsLoading;
      this._translationsLoading = null;
    }
  }

  /**
   * Get Home Assistant instance
   */
  getHass() {
    return this._hass;
  }

  /**
   * Get current language code
   */
  getLang() {
    return this._lang;
  }

  /**
   * Load language translations (lazy-loading)
   */
  async _loadLanguage() {
    console.log(`[AC-STATE] _loadLanguage called for lang: ${this._lang}`);
    if (this._lang === "en") {
      this._translations = this._translationsCache.en;
      console.log(`[AC-STATE] Using EN translations (cached)`);
    } else {
      if (this._translationsCache[this._lang]) {
        this._translations = this._translationsCache[this._lang];
        console.log(`[AC-STATE] Using cached ${this._lang} translations`);
      } else {
        try {
          console.log(`[AC-STATE] Loading ${this._lang} translations from file...`);
          const langModule = await import(`../translations/${this._lang}.js`);
          this._translationsCache[this._lang] = langModule.translations;
          this._translations = langModule.translations;
          console.log(`[AC-STATE] Successfully loaded ${this._lang} translations:`, Object.keys(this._translations).slice(0, 10));
        } catch (e) {
          console.error(`[assistant-cooker-card] Failed to load translation for ${this._lang}. Falling back to 'en'.`, e);
          this._lang = "en";
          this._translations = this._translationsCache.en;
        }
      }
    }
  }

  /**
   * Translate a key with fallback chain
   */
  t(key) {
    const translated = this._translations?.[key] || this._translationsCache.en[key] || key;
    if (key === 'idle' || key === 'elapsed') {
      console.log(`[AC-STATE] t('${key}'): lang=${this._lang}, hasTranslations=${!!this._translations}, result='${translated}'`);
    }
    return translated;
  }

  /**
   * Get numeric value from entity state
   */
  getNumericState(entityId) {
    if (!this._hass || !entityId) return null;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return null;
    const value = parseFloat(stateObj.state);
    return isNaN(value) ? null : value;
  }

  /**
   * Get entity state object
   */
  getEntityState(entityId) {
    if (!this._hass || !entityId) return null;
    return this._hass.states[entityId];
  }

  /**
   * Get entity attribute
   */
  getEntityAttribute(entityId, attributeName) {
    const entity = this.getEntityState(entityId);
    return entity?.attributes?.[attributeName];
  }

  /**
   * Check if backend selection has changed
   */
  hasBackendChanged(stateEntity) {
    if (!stateEntity) return false;

    const attrs = stateEntity.attributes || {};
    const backendCategory = attrs.food_category;
    const backendFood = attrs.food_type;
    const backendDoneness = attrs.food_doneness;
    const backendIsManual = attrs.is_manual_mode;

    const changed = this._lastBackendCategory !== backendCategory ||
                    this._lastBackendFood !== backendFood ||
                    this._lastBackendDoneness !== backendDoneness ||
                    this._lastBackendIsManual !== backendIsManual;

    if (changed) {
      console.log("[AC-STATE] hasBackendChanged: YES", {
        category: { old: this._lastBackendCategory, new: backendCategory },
        food: { old: this._lastBackendFood, new: backendFood },
        doneness: { old: this._lastBackendDoneness, new: backendDoneness },
        manual: { old: this._lastBackendIsManual, new: backendIsManual }
      });
      this._lastBackendCategory = backendCategory;
      this._lastBackendFood = backendFood;
      this._lastBackendDoneness = backendDoneness;
      this._lastBackendIsManual = backendIsManual;
    }

    return changed;
  }

  /**
   * Get or set cooking start time
   */
  getCookingStartTime() {
    return this._cookingStartTime;
  }

  setCookingStartTime(time) {
    this._cookingStartTime = time;
  }

  /**
   * Reset cooking start time
   */
  resetCookingStartTime() {
    this._cookingStartTime = null;
  }

  /**
   * Get current language
   */
  getLang() {
    return this._lang;
  }

  /**
   * Get hass instance
   */
  getHass() {
    return this._hass;
  }

  /**
   * Get all displayable data for the card
   */
  getData() {
    if (!this._hass) {
      return {
        state: null,
        elapsed: null,
        remaining: null,
        started: null,
        ends: null,
        ambient: null,
        rate: null
      };
    }

    // Retrieve entities (adapt according to your config)
    const stateEntity = this.getEntityState(`sensor.${this._config?.entity_prefix}_state`);
    
    return {
      state: stateEntity?.state || null,
      elapsed: this.getEntityAttribute(`sensor.${this._config?.entity_prefix}_state`, 'elapsed') || null,
      remaining: this.getEntityAttribute(`sensor.${this._config?.entity_prefix}_state`, 'remaining') || null,
      started: this.getEntityAttribute(`sensor.${this._config?.entity_prefix}_state`, 'started') || null,
      ends: this.getEntityAttribute(`sensor.${this._config?.entity_prefix}_state`, 'ends') || null,
      ambient: this.getNumericState(`sensor.${this._config?.entity_prefix}_ambient`) || null,
      rate: this.getEntityAttribute(`sensor.${this._config?.entity_prefix}_state`, 'rate') || null
    };
  }

  /**
   * Set configuration
   */
  setConfig(config) {
    this._config = config;
  }
}
