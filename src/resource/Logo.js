//region --- Provide & Require
goog.provide('anychart.resourceModule.Logo');
goog.require('anychart.core.ui.Background');
goog.require('anychart.ganttBaseModule.Overlay');
//endregion



/**
 * Resource Chart Logo element.
 * @constructor
 * @extends {anychart.core.ui.Background}
 */
anychart.resourceModule.Logo = function() {
  anychart.resourceModule.Logo.base(this, 'constructor');

  this.overlay_ = new anychart.ganttBaseModule.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);
};
goog.inherits(anychart.resourceModule.Logo, anychart.core.ui.Background);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.resourceModule.Logo.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY;


/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.Logo.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Settings
/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.resourceModule.Logo|anychart.ganttBaseModule.Overlay}
 */
anychart.resourceModule.Logo.prototype.overlay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.overlay_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.overlay_;
};


//endregion
//region --- Signals handling
//------------------------------------------------------------------------------
//
//  Signals handling
//
//------------------------------------------------------------------------------
/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.resourceModule.Logo.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.resourceModule.Logo.prototype.draw = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY);
  }

  anychart.resourceModule.Logo.base(this, 'draw');

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY)) {
    this.overlay_.target(this.container().getStage().getDomWrapper());
    this.overlay_.setBounds(this.getPixelBounds());
    this.overlay_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY);
  }

  return this;
};


//endregion
//region --- Serialize / Setup / Disposing
/** @inheritDoc */
anychart.resourceModule.Logo.prototype.serialize = function() {
  var json = anychart.resourceModule.Logo.base(this, 'serialize');

  json['overlay'] = this.overlay_.serialize();

  return json;
};


/** @inheritDoc */
anychart.resourceModule.Logo.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.Logo.base(this, 'setupByJSON', config, opt_default);
  this.overlay_.setupInternal(!!opt_default, config['overlay']);
};


/** @inheritDoc */
anychart.resourceModule.Logo.prototype.disposeInternal = function() {
  anychart.resourceModule.Logo.base(this, 'disposeInternal');

  goog.dispose(this.overlay_);
  this.overlay_ = null;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.resourceModule.Logo.prototype;
  proto['overlay'] = proto.overlay;
})();


//endregion
