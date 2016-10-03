goog.provide('anychart.core.ui.resourceList.Settings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Base class for all settings.
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.ui.resourceList.Settings = function() {
  anychart.core.ui.resourceList.Settings.base(this, 'constructor');

  /**
   * Settings storage.
   * @type {!Object}
   * @protected
   */
  this.settings = {};

  /**
   * Default settings.
   * @type {!Object}
   * @protected
   */
  this.defaultSettings = {};
};
goog.inherits(anychart.core.ui.resourceList.Settings, anychart.core.Base);


//region --- STATES/SIGNALS ---
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.resourceList.Settings.prototype.SUPPORTED_STATES = 0;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.resourceList.Settings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW;
//endregion


//region --- OVERRIDES ---
/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.invalidate = function(state, opt_signal) {
  this.dispatchSignal(opt_signal || 0);
  return 0;
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.Settings.base(this, 'setupByJSON', config, opt_default);
  if (!!opt_default)
    this.defaultSettings = config || {};
};
//endregion


//region --- IObjectWithSettings implementation ---
/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.settings[name]);
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.getOption = function(name) {
  return goog.isDef(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/** @inheritDoc */
anychart.core.ui.resourceList.Settings.prototype.check = function(flags) {
  return true;
};
//endregion
