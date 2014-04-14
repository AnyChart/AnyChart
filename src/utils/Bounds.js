goog.provide('anychart.utils.Bounds');

goog.require('anychart.Base');
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
 * Note: 'right' and 'bottom' have more priority than 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string)=} opt_y Y-coordinate.
 * @param {(number|string)=} opt_width Width.
 * @param {(number|string)=} opt_height Height.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.utils.Bounds = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  goog.base(this);
  if (arguments.length)
    this.set.apply(this, arguments);
};
goog.inherits(anychart.utils.Bounds, anychart.Base);


/**
 * Маска состояний рассинхронизации, которые умеет отправлять этот объект.
 * @type {number}
 */
anychart.utils.Bounds.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Left edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.left_ = null;


/**
 * Top edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.top_ = null;


/**
 * Right edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.right_ = null;


/**
 * Bottom edge position.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.bottom_ = null;


/**
 * Width value.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.width_ = null;


/**
 * Height value.
 * @type {(number|string|null)}
 * @private
 */
anychart.utils.Bounds.prototype.height_ = null;


/**
 * Normalizes all info stored in this object and returns a standard Rect of it.
 * @param {number=} opt_containerWidth Optional container width to support percent cases.
 * @param {number=} opt_containerHeight Optional container height to support percent cases.
 * @return {!anychart.math.Rect} Normalized rect.
 */
anychart.utils.Bounds.prototype.toRect = function(opt_containerWidth, opt_containerHeight) {
  var left, top, width, height;

  if (!goog.isNull(this.left_)) {
    left = anychart.utils.normalize(this.left_, opt_containerWidth);
    if (!goog.isNull(this.right_)) {
      width = anychart.utils.normalize(this.right_, opt_containerWidth, true) - left;
    } else if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
    } else {
      width = (+opt_containerWidth - left) || 0;
    }
  } else if (!goog.isNull(this.right_)) {
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
      left = anychart.utils.normalize(this.right_, opt_containerWidth, true) - width;
    } else {
      left = 0;
      width = anychart.utils.normalize(this.right_, opt_containerWidth, true);
    }
  } else {
    left = 0;
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalize(this.width_, opt_containerWidth);
    } else {
      width = +opt_containerWidth || 0;
    }
  }

  if (!goog.isNull(this.top_)) {
    top = anychart.utils.normalize(this.top_, opt_containerHeight);
    if (!goog.isNull(this.bottom_)) {
      height = anychart.utils.normalize(this.bottom_, opt_containerHeight, true) - top;
    } else if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
    } else {
      height = (+opt_containerHeight - top) || 0;
    }
  } else if (!goog.isNull(this.bottom_)) {
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
      top = anychart.utils.normalize(this.bottom_, opt_containerHeight, true) - height;
    } else {
      top = 0;
      height = anychart.utils.normalize(this.bottom_, opt_containerHeight, true);
    }
  } else {
    top = 0;
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalize(this.height_, opt_containerHeight);
    } else {
      height = +opt_containerHeight || 0;
    }
  }

  return new anychart.math.Rect(left, top, width, height);
};


/**
 * Resets all values of the object by passed values.
 * Note: 'right' and 'bottom' have more priority than 'width' and 'height'.
 * @param {(number|string|anychart.utils.RectObj|anychart.math.Rect|anychart.utils.Bounds|null)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string|null)=} opt_y Y-coordinate.
 * @param {(number|string|null)=} opt_width Width.
 * @param {(number|string|null)=} opt_height Height.
 * @return {!anychart.utils.Bounds} Returns itself for chaining.
 */
anychart.utils.Bounds.prototype.set = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  var left, top, right, bottom, width, height;
  if (opt_xOrRect instanceof anychart.utils.Bounds) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.left = function(opt_value) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.top = function(opt_value) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.right = function(opt_value) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.bottom = function(opt_value) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.width = function(opt_value) {
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
 * @return {(number|string|null|anychart.utils.Bounds)} Value, or itself for chaining.
 */
anychart.utils.Bounds.prototype.height = function(opt_value) {
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
 * @inheritDoc
 */
anychart.utils.Bounds.prototype.serialize = function() {
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
anychart.utils.Bounds.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);

  this.left(config['left']);
  this.top(config['top']);
  this.right(config['right']);
  this.bottom(config['bottom']);
  this.width(config['width']);
  this.height(config['height']);

  return this;
};
