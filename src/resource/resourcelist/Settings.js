goog.provide('anychart.resourceModule.resourceList.Settings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Base class for all settings.
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.resourceModule.resourceList.Settings = function() {
  anychart.resourceModule.resourceList.Settings.base(this, 'constructor');
};
goog.inherits(anychart.resourceModule.resourceList.Settings, anychart.core.Base);


//region --- STATES/SIGNALS ---
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.resourceModule.resourceList.Settings.prototype.SUPPORTED_STATES = 0;


/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.resourceList.Settings.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- OVERRIDES ---
/** @inheritDoc */
anychart.resourceModule.resourceList.Settings.prototype.invalidate = function(state, opt_signal) {
  this.dispatchSignal(opt_signal || 0);
  return 0;
};


/** @inheritDoc */
anychart.resourceModule.resourceList.Settings.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.resourceList.Settings.base(this, 'setupByJSON', config, opt_default);
  if (!!opt_default)
    this.themeSettings = config || {};
};


//endregion
