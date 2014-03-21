goog.provide('anychart.elements.BaseWithBounds');

goog.require('anychart.elements.Base');



/**
 * An extended base element that understands bounds settings and can handle percent values in it.
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.BaseWithBounds = function() {
  goog.base(this);
  this.invalidate(anychart.utils.ConsistencyState.BOUNDS);
  this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
};
goog.inherits(anychart.elements.BaseWithBounds, anychart.elements.Base);


/**
 * Stores user settings for element bounds.
 * @type {anychart.utils.Bounds}
 * @private
 */
anychart.elements.BaseWithBounds.prototype.bounds_;


/**
 * Stores normalized bounds.
 * @type {acgraph.math.Rect}
 * @private
 */
anychart.elements.BaseWithBounds.prototype.pixelBounds_;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.elements.BaseWithBounds.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.BOUNDS |
    anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Supported consistency states. Adds BOUNDS and PIXEL_BOUNDS to Base states.
 * @type {number}
 */
anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.BOUNDS |
    anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Getter for the element bounds settings.
 * @return {!anychart.utils.Bounds} Current bounds of the element.
 *//**
 * Sets bounds of the element using one parameter.<br/>
 * @example <t>listingOnly</t>
 * element.bounds( new anychart.math.Rect(0, 0, 100, 100) );
 * @param {(anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_value Bounds of element.
 * @return {!anychart.elements.Base} An instance of {@link anychart.elements.Base} class for method chaining.
 *//**
 * Setter for the element bounds settings.
 * @example <t>listingOnly</t>
 * element.bounds(0, 100, '50%', '400px');
 * @param {(number|string)=} opt_x X-coordinate.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {!anychart.elements.Base} An instance of {@link anychart.elements.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_boundsOrX .
 * @param {(number|string)=} opt_y .
 * @param {(number|string)=} opt_width .
 * @param {(number|string)=} opt_height .
 * @return {(!anychart.elements.Base|!anychart.utils.Bounds)} .
 */
anychart.elements.BaseWithBounds.prototype.bounds = function(opt_boundsOrX, opt_y, opt_width, opt_height) {
  if (!this.bounds_) {
    this.bounds_ = new anychart.utils.Bounds();
    this.registerDisposable(this.bounds_);
    this.bounds_.listenInvalidation(this.boundsInvalidated, this);
  }
  if (goog.isDef(opt_boundsOrX)) {
    this.bounds_.set.apply(this.bounds_, arguments);
    return this;
  }
  return this.bounds_;
};


/**
 * Returns the current bounds.<br/>
 * <b>Note:</b> If the width and/or height were set in percents using {@link anychart.elements.BaseWithBounds#bounds} method,
 * then we might have problems with autocalculation, in case the size was never passed in pixels for any of the
 * nesting containers. In such case we need to pass pixel size of the container
 * using <b>containerWidth</b> and <b>containerHeight</b>. In any other case you
 * <b>don't need to set them!</b><br/>
 * <b>Note:</b> If this method was used as a setter then no matter what parameters set you
 * get those passed to setter.
 * @shortDescription Returns the current bounds.
 * @example <t>listingOnly</t>
 * // simple usage
 * element.bounds(0, 10, 200, 300);
 * element.pixelBounds(); // returns Rect with size: 200x300
 * // container size: 400 x 100
 * element.bounds(0, 10, '50%', '57%');
 * element.pixelBounds(400, 100); // returns Rect with size: 200x57
 * @example <c>Using setter</c><t>listingOnly</t>
 * var rect = new anychart.math.Rect( 0, 0, 100, 100);
 * element.pixelBounds(rect);
 * element.pixelBounds(); // returns the value of variable rect.
 * element.pixelBounds(400, 100); // returns the value of variable rect.
 * @param {number=} opt_containerWidth The width of a container in pixels.
 * @param {number=} opt_containerHeight Height of a container in pixels.
 * @return {!anychart.math.Rect} Returns the rect with determined pixel bounds.
 *//**
 * Sets exact pixel bounds of the element.<br/>
 * <b>Note:</b> If you pass <b>null</b> then previous value is reset
 * and bounds are autocalculated.
 * @example <t>listingOnly</t>
 * element.pixelBounds( new anychart.math.Rect( 0, 0, 100, 100) );
 * @param {(!anychart.math.Rect|null)=} opt_value Value to set.
 * @return {!anychart.elements.Base} An instance of {@link anychart.elements.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!anychart.math.Rect|null|number)=} opt_valueOrContainerWidth .
 * @param {number=} opt_containerHeight .
 * @return {(!anychart.elements.Base|!anychart.math.Rect)} .
 */
anychart.elements.BaseWithBounds.prototype.pixelBounds = function(opt_valueOrContainerWidth, opt_containerHeight) {
  if ((opt_valueOrContainerWidth instanceof anychart.math.Rect) || goog.isNull(opt_valueOrContainerWidth)) {
    if (this.pixelBounds_ != opt_valueOrContainerWidth) {
      this.pixelBounds_ = opt_valueOrContainerWidth;
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    }
    return this;
  }
  if (this.pixelBounds_)
    return /** @type {!anychart.math.Rect} */(this.pixelBounds_);
  // TODO(Anton Saukh): Refactor when we implement bounds for layers in graphics.
  var stage = this.container();
  if (stage)
    stage = stage.getStage();
  if (stage) {
    opt_valueOrContainerWidth = goog.isDef(opt_valueOrContainerWidth) ?
        opt_valueOrContainerWidth :
        /** @type {number} */(stage.width());
    opt_containerHeight = goog.isDef(opt_containerHeight) ?
        opt_containerHeight :
        /** @type {number} */(stage.height());
  }
  return this.bounds().toRect(opt_valueOrContainerWidth, opt_containerHeight);
};


/**
 * Listener for the bounds invalidation.
 * @param {anychart.utils.InvalidatedStatesEvent} event Invalidation event.
 * @protected
 */
anychart.elements.BaseWithBounds.prototype.boundsInvalidated = function(event) {
  if (event.invalidated(anychart.utils.ConsistencyState.BOUNDS)) {
    this.suspendInvalidationDispatching();
    this.invalidate(anychart.utils.ConsistencyState.BOUNDS);
    if (!this.pixelBounds_)
      this.invalidate(anychart.utils.ConsistencyState.PIXEL_BOUNDS);
    this.resumeInvalidationDispatching(true);
  }
};
