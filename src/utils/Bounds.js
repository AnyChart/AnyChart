goog.provide('anychart.utils.Bounds');

goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Invalidatable');


/**
 * @typedef {{
 *    left:(number|string|undefined),
 *    top:(number|string|undefined),
 *    width:(number|string|undefined),
 *    height:(number|string|undefined),
 *    right:(number|string|undefined),
 *    bottom:(number|string|undefined)
 * }}
 */
anychart.utils.RectObj;



/**
 * Stores information about visual location of an object. Can be defined with an object, a math.Rect or as a set of
 * numbers.
 * Note: 'right' and 'bottom' have more priority than 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.utils.Bounds = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  goog.base(this);
  if (arguments.length)
    this.set.apply(this, arguments);
};
goog.inherits(anychart.utils.Bounds, anychart.utils.Invalidatable);


/**
 * Left edge position.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.left_;


/**
 * Top edge position.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.top_;


/**
 * Right edge position.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.right_;


/**
 * Bottom edge position.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.bottom_;


/**
 * Width value.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.width_;


/**
 * Height value.
 * @type {(number|string|undefined)}
 * @private
 */
anychart.utils.Bounds.prototype.height_;


/**
 * Normalizes all info stored in this object and returns a standard Rect of it.
 * @param {number=} opt_containerWidth Optional container width to support percent cases.
 * @param {number=} opt_containerHeight Optional container height to support percent cases.
 * @return {!anychart.math.Rect} Normalized rect.
 */
anychart.utils.Bounds.prototype.toRect = function(opt_containerWidth, opt_containerHeight) {
  var left, top, width, height;

  if (goog.isDef(this.left_)) {
    left = anychart.utils.normalize(this.left_, opt_containerWidth);
    if (goog.isDef(this.right_)) {
      width = anychart.utils.normalize(this.right_, opt_containerWidth) - left;
    } else if (goog.isDef(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
    } else if (!isNaN(opt_containerWidth)) {
      width = +opt_containerWidth - left;
    } else {
      width = 0;
    }
  } else if (goog.isDef(this.right_)) {
    if (goog.isDef(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
      left = anychart.utils.normalize(this.right_, opt_containerWidth) - width;
    } else {
      left = 0;
      width = anychart.utils.normalize(this.right_, opt_containerWidth);
    }
  } else {
    left = 0;
    if (goog.isDef(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
    } else if (!isNaN(opt_containerWidth)) {
      width = +opt_containerWidth;
    } else {
      width = 0;
    }
  }

  if (goog.isDef(this.top_)) {
    top = anychart.utils.normalize(this.top_, opt_containerHeight);
    if (goog.isDef(this.right_)) {
      height = anychart.utils.normalize(this.right_, opt_containerHeight) - top;
    } else if (goog.isDef(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
    } else if (!isNaN(opt_containerHeight)) {
      height = +opt_containerHeight - top;
    } else {
      height = 0;
    }
  } else if (goog.isDef(this.right_)) {
    if (goog.isDef(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
      top = anychart.utils.normalize(this.right_, opt_containerHeight) - height;
    } else {
      top = 0;
      height = anychart.utils.normalize(this.right_, opt_containerHeight);
    }
  } else {
    top = 0;
    if (goog.isDef(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
    } else if (!isNaN(opt_containerHeight)) {
      height = +opt_containerHeight;
    } else {
      height = 0;
    }
  }

  return new anychart.math.Rect(left, top, width, height);
};


/**
 * Resets all values of the object by passed values.
 * Note: 'right' and 'bottom' have more priority than 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @return {!anychart.utils.Bounds} Returns itself for chaining.
 */
anychart.utils.Bounds.prototype.set = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  var left, top, right, bottom, width, height;
  if (opt_xOrRect instanceof anychart.utils.Bounds) {
    left = opt_xOrRect.left();
    top = opt_xOrRect.top();
    width = opt_xOrRect.width();
    height = opt_xOrRect.height();
    right = opt_xOrRect.right();
    bottom = opt_xOrRect.bottom();
  } else if (opt_xOrRect instanceof anychart.math.Rect) {
    left = opt_xOrRect.left;
    top = opt_xOrRect.top;
    width = opt_xOrRect.width;
    height = opt_xOrRect.height;
    right = null;
    bottom = null;
  } else if (goog.isObject(opt_xOrRect)) {
    left = opt_xOrRect['left'];
    top = opt_xOrRect['top'];
    right = opt_xOrRect['right'];
    bottom = opt_xOrRect['bottom'];
    width = opt_xOrRect['width'];
    height = opt_xOrRect['height'];
  } else {
    left = opt_xOrRect;
    top = opt_y;
    width = opt_width;
    height = opt_height;
    right = null;
    bottom = null;
  }

  this.suspendInvalidationDispatching();
  this.left(left).top(top).right(right).bottom(bottom).width(width).height(height);
  this.resumeInvalidationDispatching(true);

  return this;
};


/**
 * Gets or sets left edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.left_) {
      this.left_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.left_;
};


/**
 * Gets or sets top edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.top_) {
      this.top_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.top_;
};


/**
 * Gets or sets right edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.right_) {
      this.right_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.right_;
};


/**
 * Gets or sets bottom edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.bottom_) {
      this.bottom_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.bottom_;
};


/**
 * Gets or sets width value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.width_) {
      this.width_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.width_;
};


/**
 * Gets or sets height value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|undefined|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val;
    if (!goog.isNull(opt_value) && !isNaN(opt_value))
      val = +opt_value;
    else if (goog.isString(opt_value))
      val = opt_value;
    else
      val = undefined;
    if (val != this.height_) {
      this.height_ = val;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.BOUNDS);
    }
    return this;
  } else
    return this.height_;
};
