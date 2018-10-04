goog.provide('anychart.core.NoDataSettings');
goog.require('anychart.core.Base');



/**
 * Class with settings for no data.
 * @param {anychart.core.Chart|anychart.stockModule.Plot} provider
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.NoDataSettings = function(provider) {
  anychart.core.NoDataSettings.base(this, 'constructor');
  this.provider_ = provider;
};
goog.inherits(anychart.core.NoDataSettings, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.NoDataSettings.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Getter/setter for no data label
 * @param {Object=} opt_value
 * @return {anychart.core.NoDataSettings|anychart.core.ui.Label}
 */
anychart.core.NoDataSettings.prototype.label = function(opt_value) {
  if (!this.label_) {
    this.label_ = /** @type {anychart.core.ui.Label} */(this.provider_.createChartLabel());
    this.label_.listenSignals(this.labelInvalidated_, this);
    this.label_.addThemes('defaultFontSettings', 'defaultLabelSettings', 'defaultNoDataLabel');
    this.setupCreated('label', this.label_);
  }

  if (goog.isDef(opt_value)) {
    this.label_.setup(opt_value);
    return this;
  }
  return this.label_;
};


/**
 * Label invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.NoDataSettings.prototype.labelInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


/** @inheritDoc */
anychart.core.NoDataSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.NoDataSettings.base(this, 'setupByJSON', config, opt_default);
  this.label().setupInternal(!!opt_default, config['label']);
};


/** @inheritDoc */
anychart.core.NoDataSettings.prototype.disposeInternal = function() {
  goog.dispose(this.label_);
  anychart.core.NoDataSettings.base(this, 'disposeInternal');
};
