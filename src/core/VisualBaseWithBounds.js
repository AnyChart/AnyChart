goog.provide('anychart.core.VisualBaseWithBounds');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.utils.Bounds');



/**
 * An extended base element that understands bounds settings and can handle percent values in it.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.VisualBaseWithBounds = function() {
  goog.base(this);
};
goog.inherits(anychart.core.VisualBaseWithBounds, anychart.core.VisualBase);


/**
 * Stores user settings for element bounds.
 * @type {anychart.core.utils.Bounds}
 * @private
 */
anychart.core.VisualBaseWithBounds.prototype.bounds_;


/**
 * Stores normalized bounds.
 * @type {anychart.math.Rect}
 * @private
 */
anychart.core.VisualBaseWithBounds.prototype.pixelBounds_;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. ENABLED, CONTAINER, BOUNDS and Z_INDEX.
 * @type {number}
 */
anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;


/** @inheritDoc */
anychart.core.VisualBaseWithBounds.prototype.dependsOnContainerSize = function() {
  return this.bounds().dependsOnContainerSize();
};


/**
 * Getter/setter for bounds.
 * @param {(number|string|null|Array.<number|string>|anychart.utils.RectObj|anychart.math.Rect|anychart.core.utils.Bounds)=} opt_boundsOrX .
 * @param {(number|string|null)=} opt_y .
 * @param {(number|string|null)=} opt_width .
 * @param {(number|string|null)=} opt_height .
 * @return {(!anychart.core.VisualBase|!anychart.core.utils.Bounds)} .
 */
anychart.core.VisualBaseWithBounds.prototype.bounds = function(opt_boundsOrX, opt_y, opt_width, opt_height) {
  if (!this.bounds_) {
    this.bounds_ = new anychart.core.utils.Bounds();
    this.registerDisposable(this.bounds_);
    this.bounds_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_boundsOrX)) {
    this.bounds_.setup.apply(this.bounds_, arguments);
    return this;
  }
  return this.bounds_;
};


/**
 * Getter/setter for left.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().left(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().left());
};


/**
 * Getter/setter for right.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().right(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().right());
};


/**
 * Getter/setter for top.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().top(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().top());
};


/**
 * Getter/setter for bottom.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().bottom(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().bottom());
};


/**
 * Getter/setter for width.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().width(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().width());
};


/**
 * Getter/setter for height.
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().height(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().height());
};


/**
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.minWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().minWidth(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().minWidth());
};


/**
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.minHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().minHeight(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().minHeight());
};


/**
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().maxWidth(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().maxWidth());
};


/**
 * @param {(number|string|null)=} opt_value .
 * @return {(!anychart.core.VisualBase|number|string|null)} .
 */
anychart.core.VisualBaseWithBounds.prototype.maxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.bounds().maxHeight(opt_value);
    return this;
  }
  return /** @type {number|string|null} */(this.bounds().maxHeight());
};


/**
 * Returns pixel bounds of the element due to parent bounds and self bounds settings.
 * @return {!anychart.math.Rect} .
 */
anychart.core.VisualBaseWithBounds.prototype.getPixelBounds = function() {
  return this.bounds().toRect(/** @type {anychart.math.Rect} */(this.parentBounds()));
};


/**
 * Listener for the bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.VisualBaseWithBounds.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/** @inheritDoc */
anychart.core.VisualBaseWithBounds.prototype.disposeInternal = function() {
  goog.dispose(this.bounds_);
  this.bounds_ = null;
  this.pixelBounds_ = null;

  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.VisualBaseWithBounds.prototype['bounds'] = anychart.core.VisualBaseWithBounds.prototype.bounds;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['top'] = anychart.core.VisualBaseWithBounds.prototype.top;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['right'] = anychart.core.VisualBaseWithBounds.prototype.right;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['bottom'] = anychart.core.VisualBaseWithBounds.prototype.bottom;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['left'] = anychart.core.VisualBaseWithBounds.prototype.left;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['width'] = anychart.core.VisualBaseWithBounds.prototype.width;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['height'] = anychart.core.VisualBaseWithBounds.prototype.height;//doc|ex
anychart.core.VisualBaseWithBounds.prototype['minWidth'] = anychart.core.VisualBaseWithBounds.prototype.minWidth;
anychart.core.VisualBaseWithBounds.prototype['minHeight'] = anychart.core.VisualBaseWithBounds.prototype.minHeight;
anychart.core.VisualBaseWithBounds.prototype['maxWidth'] = anychart.core.VisualBaseWithBounds.prototype.maxWidth;
anychart.core.VisualBaseWithBounds.prototype['maxHeight'] = anychart.core.VisualBaseWithBounds.prototype.maxHeight;
anychart.core.VisualBaseWithBounds.prototype['getPixelBounds'] = anychart.core.VisualBaseWithBounds.prototype.getPixelBounds;
