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
 * Stores user settings about element bounds.
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
anychart.elements.BaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.BOUNDS |
    anychart.utils.ConsistencyState.PIXEL_BOUNDS;


/**
 * Gets/Sets element bounds settings. These bounds can contain strings, percents, etc.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_boundsOrX X-coordinate
 *    or entire bounds.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {(!anychart.elements.Base|!anychart.utils.Bounds)} Element bounds or thw element for chaining.
 */
anychart.elements.BaseWithBounds.prototype.bounds = function(opt_boundsOrX, opt_y, opt_width, opt_height) {
  if (!this.bounds_) {
    this.bounds_ = new anychart.utils.Bounds();
    this.registerDisposable(this.bounds_);
    this.bounds_.listen(anychart.utils.Invalidatable.INVALIDATED, this.boundsInvalidated, false, this);
  }
  if (goog.isDef(opt_boundsOrX)) {
    this.bounds_.set.apply(this.bounds_, arguments);
    return this;
  }
  return this.bounds_;
};


/**
 * Gets or sets definitive, pixel bounds of the element.
 * When getting the value it tries to get it in several ways from the bounds, set by bounds() method, consequently
 * trying to use container size passed to the method, fetched from the container (if any), and finally - trying to
 * get bounds without any container size at all. Also you can set a math.Rect, if
 *
 * @param {(!anychart.math.Rect|null|number)=} opt_valueOrContainerWidth Several meanings:
 *    1) rectangle if used as a setter,
 *    2) null to reset the value to auto calculation,
 *    3) number to use as a container width value in auto calculation (works as getter),
 *    4) nothing if used as getter.
 * @param {number=} opt_containerHeight Container height, if you know it and use the method as a getter.
 * @return {(!anychart.elements.Base|!anychart.math.Rect)} Returns the rect with determined pixel bounds or itself for
 *    chaining.
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
  // TODO(Anton Saukh): Переделать, когда в graphics появится возможность задавать границы слоям.
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
 * Listener for bounds invalidation.
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
