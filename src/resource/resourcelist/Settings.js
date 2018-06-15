goog.provide('anychart.resourceModule.resourceList.Settings');

goog.require('anychart.core.Base');
goog.require('anychart.core.utils.Margin');



/**
 * Base class for all settings.
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.resourceModule.resourceList.Settings = function() {
  anychart.resourceModule.resourceList.Settings.base(this, 'constructor');
};
goog.inherits(anychart.resourceModule.resourceList.Settings, anychart.core.Base);


//region --- OWN API ---
/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.resourceModule.resourceList.Settings|anychart.core.utils.Margin)} .
 */
anychart.resourceModule.resourceList.Settings.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Margin invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.resourceModule.resourceList.Settings.prototype.marginInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.resourceList.Settings.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.resourceModule.resourceList.Settings.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.resourceList.Settings.base(this, 'setupByJSON', config, opt_default);
  this.margin().setupInternal(!!opt_default, config['margin']);
};


/** @inheritDoc */
anychart.resourceModule.resourceList.Settings.prototype.serialize = function() {
  var json = anychart.resourceModule.resourceList.Settings.base(this, 'serialize');
  json['margin'] = this.margin().serialize();
  return json;
};


/** @inheritDoc */
anychart.resourceModule.resourceList.Settings.prototype.disposeInternal = function() {
  goog.dispose(this.margin_);
  anychart.resourceModule.resourceList.Settings.base(this, 'disposeInternal');
};


//endregion
//exports
(function() {
  var proto = anychart.resourceModule.resourceList.Settings.prototype;
  proto['margin'] = proto.margin;
})();
