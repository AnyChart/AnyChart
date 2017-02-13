//region --- Provide & Require
goog.provide('anychart.core.resource.Logo');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Overlay');
//endregion



/**
 * Resource Chart Logo element.
 * @constructor
 * @extends {anychart.core.ui.Background}
 */
anychart.core.resource.Logo = function() {
  anychart.core.resource.Logo.base(this, 'constructor');

  this.overlay_ = new anychart.core.ui.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);
};
goog.inherits(anychart.core.resource.Logo, anychart.core.ui.Background);


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
anychart.core.resource.Logo.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.Background.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.Logo.prototype.SUPPORTED_SIGNALS =
    anychart.core.ui.Background.prototype.SUPPORTED_SIGNALS;


//endregion
//region --- Settings
/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.resource.Logo|anychart.core.ui.Overlay}
 */
anychart.core.resource.Logo.prototype.overlay = function(opt_value) {
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
anychart.core.resource.Logo.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.resource.Logo.prototype.draw = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LOGO_OVERLAY);
  }

  anychart.core.resource.Logo.base(this, 'draw');

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
anychart.core.resource.Logo.prototype.serialize = function() {
  var json = anychart.core.resource.Logo.base(this, 'serialize');

  json['overlay'] = this.overlay_.serialize();

  return json;
};


/** @inheritDoc */
anychart.core.resource.Logo.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.Logo.base(this, 'setupByJSON', config, opt_default);
  this.overlay_.setupByVal(config['overlay'], opt_default);
};


/** @inheritDoc */
anychart.core.resource.Logo.prototype.disposeInternal = function() {
  anychart.core.resource.Logo.base(this, 'disposeInternal');

  goog.dispose(this.overlay_);
  this.overlay_ = null;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.core.resource.Logo.prototype;
  proto['overlay'] = proto.overlay;
})();


//endregion
