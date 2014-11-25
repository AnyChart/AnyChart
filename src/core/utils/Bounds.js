goog.provide('anychart.core.utils.Bounds');

goog.require('anychart.core.Base');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');


/**
 * @typedef {{
 *    left:(number|string|null|undefined),
 *    top:(number|string|null|undefined),
 *    width:(number|string|null|undefined),
 *    height:(number|string|null|undefined),
 *    right:(number|string|null|undefined),
 *    bottom:(number|string|null|undefined)
 * }}
 */
anychart.utils.RectObj;



/**
 * Stores information about visual location of an object. Can be defined with an object, a math.Rect or as a set of
 * numbers.
 * Note: 'right' and 'bottom' have priority over 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.core.utils.Bounds)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Bounds = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  goog.base(this);
  if (arguments.length)
    this.set.apply(this, arguments);
};
goog.inherits(anychart.core.utils.Bounds, anychart.core.Base);


/**
 * Signals mask.
 * @type {number}
 */
anychart.core.utils.Bounds.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Left edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.left_ = null;


/**
 * Top edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.top_ = null;


/**
 * Right edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.right_ = null;


/**
 * Bottom edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.bottom_ = null;


/**
 * Width value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.width_ = null;


/**
 * Height value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.height_ = null;


/**
 * Normalizes all info stored in this object and returns a standard Rect of it.
 * @param {(number|anychart.math.Rect)=} opt_parentLeftOrRect Optional parent left coord to shift bounds if parent in shifted.
 * @param {number=} opt_parentTop Optional parent top coord to shift bounds if parent in shifted.
 * @param {number=} opt_parentWidth Optional parent width to support percent cases.
 * @param {number=} opt_parentHeight Optional parent height to support percent cases.
 * @return {!anychart.math.Rect} Normalized rect.
 */
anychart.core.utils.Bounds.prototype.toRect = function(opt_parentLeftOrRect, opt_parentTop, opt_parentWidth, opt_parentHeight) {
  if (opt_parentLeftOrRect instanceof anychart.math.Rect) {
    var parentBounds = /** @type {anychart.math.Rect} */(opt_parentLeftOrRect);
    opt_parentLeftOrRect = +parentBounds.left;
    opt_parentTop = +parentBounds.top;
    opt_parentWidth = +parentBounds.width;
    opt_parentHeight = +parentBounds.height;
  } else {
    opt_parentLeftOrRect = anychart.utils.toNumber(opt_parentLeftOrRect);
    opt_parentTop = anychart.utils.toNumber(opt_parentTop);
    opt_parentWidth = anychart.utils.toNumber(opt_parentWidth);
    opt_parentHeight = anychart.utils.toNumber(opt_parentHeight);
  }

  var left, top, width, height;

  if (!goog.isNull(this.left_)) {
    left = anychart.utils.normalizeSize(this.left_, opt_parentWidth);
    if (!goog.isNull(this.right_)) {
      width = anychart.utils.normalizeSize(this.right_, opt_parentWidth, true) - left;
    } else if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
    } else {
      width = (+opt_parentWidth - left) || 0;
    }
  } else if (!goog.isNull(this.right_)) {
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
      left = anychart.utils.normalizeSize(this.right_, opt_parentWidth, true) - width;
    } else {
      left = 0;
      width = anychart.utils.normalizeSize(this.right_, opt_parentWidth, true);
    }
  } else {
    left = 0;
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
    } else {
      width = +opt_parentWidth || 0;
    }
  }

  if (!goog.isNull(this.top_)) {
    top = anychart.utils.normalizeSize(this.top_, opt_parentHeight);
    if (!goog.isNull(this.bottom_)) {
      height = anychart.utils.normalizeSize(this.bottom_, opt_parentHeight, true) - top;
    } else if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
    } else {
      height = (+opt_parentHeight - top) || 0;
    }
  } else if (!goog.isNull(this.bottom_)) {
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
      top = anychart.utils.normalizeSize(this.bottom_, opt_parentHeight, true) - height;
    } else {
      top = 0;
      height = anychart.utils.normalizeSize(this.bottom_, opt_parentHeight, true);
    }
  } else {
    top = 0;
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
    } else {
      height = +opt_parentHeight || 0;
    }
  }

  if (!isNaN(opt_parentLeftOrRect))
    left += opt_parentLeftOrRect;
  if (!isNaN(opt_parentTop))
    top += opt_parentTop;

  return new anychart.math.Rect(left, top, width, height);
};


/**
 * Resets all values of the object by passed values.
 * Note: 'right' and 'bottom' have priority over 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.core.utils.Bounds|null)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string|null)=} opt_y Y-coordinate.
 * @param {(number|string|null)=} opt_width Width.
 * @param {(number|string|null)=} opt_height Height.
 * @return {!anychart.core.utils.Bounds} Returns itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.set = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  var left, top, right, bottom, width, height;
  if (opt_xOrRect instanceof anychart.core.utils.Bounds) {
    left = opt_xOrRect.left_;
    top = opt_xOrRect.top_;
    width = opt_xOrRect.width_;
    height = opt_xOrRect.height_;
    right = opt_xOrRect.right_;
    bottom = opt_xOrRect.bottom_;
  } else if (opt_xOrRect instanceof anychart.math.Rect) {
    left = opt_xOrRect.left;
    top = opt_xOrRect.top;
    width = opt_xOrRect.width;
    height = opt_xOrRect.height;
    right = null;
    bottom = null;
  } else if (goog.isObject(opt_xOrRect)) {
    left = goog.isDef(opt_xOrRect['left']) ? opt_xOrRect['left'] : null;
    top = goog.isDef(opt_xOrRect['top']) ? opt_xOrRect['top'] : null;
    right = goog.isDef(opt_xOrRect['right']) ? opt_xOrRect['right'] : null;
    bottom = goog.isDef(opt_xOrRect['bottom']) ? opt_xOrRect['bottom'] : null;
    width = goog.isDef(opt_xOrRect['width']) ? opt_xOrRect['width'] : null;
    height = goog.isDef(opt_xOrRect['height']) ? opt_xOrRect['height'] : null;
  } else {
    left = goog.isDef(opt_xOrRect) ? opt_xOrRect : null;
    top = goog.isDef(opt_y) ? opt_y : null;
    width = goog.isDef(opt_width) ? opt_width : null;
    height = goog.isDef(opt_height) ? opt_height : null;
    right = null;
    bottom = null;
  }

  this.suspendSignalsDispatching();
  this.left(left).top(top).right(right).bottom(bottom).width(width).height(height);
  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Gets or sets left edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.left_) {
      this.left_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.left_;
};


/**
 * Gets or sets top edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for chaining.
 */
anychart.core.utils.Bounds.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.top_) {
      this.top_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.top_;
};


/**
 * Gets or sets right edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for chaining.
 */
anychart.core.utils.Bounds.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.right_) {
      this.right_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.right_;
};


/**
 * Gets or sets bottom edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for chaining.
 */
anychart.core.utils.Bounds.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.bottom_) {
      this.bottom_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.bottom_;
};


/**
 * Gets or sets width value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.width_) {
      this.width_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.width_;
};


/**
 * Gets or sets height value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = ((goog.isNumber(opt_value) && !isNaN(opt_value)) || goog.isString(opt_value)) ? opt_value : null;
    if (val != this.height_) {
      this.height_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.height_;
};


/**
 * Define, is one of the bounds settings set in percent.
 * @return {boolean} Is one of the bounds settings set in percent.
 */
anychart.core.utils.Bounds.prototype.dependsOnContainerSize = function() {
  return anychart.utils.isPercent(this.width_) ||
      anychart.utils.isPercent(this.height_) ||
      anychart.utils.isPercent(this.left_) ||
      anychart.utils.isPercent(this.top_) ||
      this.bottom_ != null ||
      this.right_ != null ||
      (goog.isNull(this.width_) && goog.isNull(this.right_)) ||
      (goog.isNull(this.height_) && goog.isNull(this.bottom_));
};


/**
 * @inheritDoc
 */
anychart.core.utils.Bounds.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['left'] = this.left();
  json['top'] = this.top();
  json['right'] = this.right();
  json['bottom'] = this.bottom();
  json['width'] = this.width();
  json['height'] = this.height();

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.utils.Bounds.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);

  this.left(config['left']);
  this.top(config['top']);
  this.right(config['right']);
  this.bottom(config['bottom']);
  this.width(config['width']);
  this.height(config['height']);

  return this;
};
