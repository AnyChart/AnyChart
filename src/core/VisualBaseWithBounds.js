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


/**
 * Getter for the element bounds settings.
 * @return {!anychart.core.utils.Bounds} Current bounds of the element.
 *//**
 * Sets bounds of the element using one parameter.<br/>
 * @example <t>lineChart</t>
 * chart.line([1, 1.8, 1.2, 2.8]);
 * chart.bounds( anychart.math.rect(10, 10, 350, 250) );
 * @param {(anychart.utils.RectObj|anychart.math.Rect|anychart.core.utils.Bounds)=} opt_value Bounds of element.
 * @return {!anychart.core.VisualBase} An instance of {@link anychart.core.VisualBase} class for method chaining.
 *//**
 * Setter for the element bounds settings.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.bounds(0, 50, '50%', '250px');
 * @param {(number|string)=} opt_x X-coordinate.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {!anychart.core.VisualBase} An instance of {@link anychart.core.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element left bound settings.
 * @return {number|string|undefined} Current element's left bound settings.
 *//**
 * Sets element left.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.left('20%');
 * @param {(number|string|null)=} opt_value Left bound settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element right bound settings.
 * @return {number|string|undefined} Current element's right bound settings.
 *//**
 * Sets element right.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.right('20%');
 * @param {(number|string|null)=} opt_value Right bound settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element top bound settings.
 * @return {number|string|undefined} Current element's top bound settings.
 *//**
 * Sets element top.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.top('20%');
 * @param {(number|string|null)=} opt_value Top bound settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element bottom bound settings.
 * @return {number|string|undefined} Current element's bottom bound settings.
 *//**
 * Sets element bottom.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.bottom('20%');
 * @param {(number|string|null)=} opt_value Bottom bound settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element width settings.
 * @return {number|string|undefined} Current element's width settings.
 *//**
 * Sets element width.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.width('80%');
 * @param {(number|string|null)=} opt_value Width settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
 * Getter for element height settings.
 * @return {number|string|undefined} Current element's height settings.
 *//**
 * Sets element height.
 * @example <t>lineChart</t>
 * chart.spline([1, 1.8, 1.2, 2.8]);
 * chart.height('80%');
 * @param {(number|string|null)=} opt_value Height settings for the element.
 * @return {!anychart.core.VisualBaseWithBounds} Returns self for method chaining.
 *//**
 * @ignoreDoc
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
