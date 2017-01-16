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
  anychart.core.utils.Bounds.base(this, 'constructor');
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
 * Auto-calculated value for top. If set - used as a default for top.
 * @type {number}
 * @private
 */
anychart.core.utils.Bounds.prototype.autoTop_ = NaN;


/**
 * Auto-calculated value for height. If set - used as a default for height.
 * @type {number}
 * @private
 */
anychart.core.utils.Bounds.prototype.autoHeight_ = NaN;


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
 * Min width value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.minWidth_ = null;


/**
 * Min height value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.minHeight_ = null;


/**
 * Max width value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.maxWidth_ = null;


/**
 * Max height value.
 * @type {(number|string|null)}
 * @private
 */
anychart.core.utils.Bounds.prototype.maxHeight_ = null;


/**
 * Normalizes all info stored in this object and returns a standard Rect of it.
 * @param {(number|anychart.math.Rect|{left:number,top:number,width:number,height:number})=} opt_parentLeftOrRect Optional parent left coord to shift bounds if parent in shifted.
 * @param {number=} opt_parentTop Optional parent top coord to shift bounds if parent in shifted.
 * @param {number=} opt_parentWidth Optional parent width to support percent cases.
 * @param {number=} opt_parentHeight Optional parent height to support percent cases.
 * @return {!anychart.math.Rect} Normalized rect.
 */
anychart.core.utils.Bounds.prototype.toRect = function(opt_parentLeftOrRect, opt_parentTop, opt_parentWidth, opt_parentHeight) {
  var parentBounds;
  if (opt_parentLeftOrRect instanceof anychart.math.Rect) {
    parentBounds = /** @type {anychart.math.Rect} */(opt_parentLeftOrRect);
    opt_parentLeftOrRect = anychart.utils.toNumber(parentBounds.left);
    opt_parentTop = anychart.utils.toNumber(parentBounds.top);
    opt_parentWidth = anychart.utils.toNumber(parentBounds.width);
    opt_parentHeight = anychart.utils.toNumber(parentBounds.height);
  } else if (goog.isObject(opt_parentLeftOrRect)) {
    parentBounds = /** @type {Object} */(opt_parentLeftOrRect);
    opt_parentLeftOrRect = anychart.utils.toNumber(parentBounds['left']);
    opt_parentTop = anychart.utils.toNumber(parentBounds['top']);
    opt_parentWidth = anychart.utils.toNumber(parentBounds['width']);
    opt_parentHeight = anychart.utils.toNumber(parentBounds['height']);
  } else {
    opt_parentLeftOrRect = anychart.utils.toNumber(opt_parentLeftOrRect);
    opt_parentTop = anychart.utils.toNumber(opt_parentTop);
    opt_parentWidth = anychart.utils.toNumber(opt_parentWidth);
    opt_parentHeight = anychart.utils.toNumber(opt_parentHeight);
  }

  var left, top, width, height, rightOrBottom;

  if (!goog.isNull(this.left_)) {
    left = anychart.utils.normalizeSize(this.left_, opt_parentWidth);
    if (!goog.isNull(this.right_)) {
      width = anychart.utils.normalizeSize(this.right_, opt_parentWidth, true) - left;
    } else if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
    } else {
      width = (+opt_parentWidth - left) || 0;
    }
    width = this.limitWidth(width, opt_parentWidth);
  } else if (!goog.isNull(this.right_)) {
    rightOrBottom = anychart.utils.normalizeSize(this.right_, opt_parentWidth, true);
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
    } else {
      width = rightOrBottom;
    }
    width = this.limitWidth(width, opt_parentWidth);
    left = rightOrBottom - width;
  } else {
    left = 0;
    if (!goog.isNull(this.width_)) {
      width = anychart.utils.normalizeSize(this.width_, opt_parentWidth);
    } else {
      width = +opt_parentWidth || 0;
    }
    width = this.limitWidth(width, opt_parentWidth);
  }

  if (!goog.isNull(this.top_)) {
    top = anychart.utils.normalizeSize(this.top_, opt_parentHeight);
    if (!goog.isNull(this.bottom_)) {
      height = anychart.utils.normalizeSize(this.bottom_, opt_parentHeight, true) - top;
    } else if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
    } else if (!isNaN(this.autoHeight_)) {
      height = this.autoHeight_;
    } else {
      height = (+opt_parentHeight - top) || 0;
    }
    height = this.limitHeight(height, opt_parentHeight);
  } else if (!goog.isNull(this.bottom_)) {
    rightOrBottom = anychart.utils.normalizeSize(this.bottom_, opt_parentHeight, true);
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
    } else if (!isNaN(this.autoTop_)) {
      height = rightOrBottom - this.autoTop_;
    } else if (!isNaN(this.autoHeight_)) {
      height = this.autoHeight_;
    } else {
      height = rightOrBottom;
    }
    height = this.limitHeight(height, opt_parentHeight);
    top = rightOrBottom - height;
  } else {
    top = isNaN(this.autoTop_) ? 0 : this.autoTop_;
    if (!goog.isNull(this.height_)) {
      height = anychart.utils.normalizeSize(this.height_, opt_parentHeight);
    } else if (!isNaN(this.autoHeight_)) {
      height = this.autoHeight_;
    } else {
      height = +opt_parentHeight || 0;
    }
    height = this.limitHeight(height, opt_parentHeight);
  }

  if (!isNaN(opt_parentLeftOrRect))
    left += opt_parentLeftOrRect;
  if (!isNaN(opt_parentTop))
    top += opt_parentTop;

  return new anychart.math.Rect(left, top, width, height);
};


/**
 * Limits passed height by stored minHeight_ and maxHeight_ settings.
 * @param {number} height
 * @param {number=} opt_parentHeight
 * @return {number}
 */
anychart.core.utils.Bounds.prototype.limitHeight = function(height, opt_parentHeight) {
  if (!goog.isNull(this.minHeight_))
    height = Math.max(height, anychart.utils.normalizeSize(this.minHeight_, opt_parentHeight));
  if (!goog.isNull(this.maxHeight_))
    height = Math.min(height, anychart.utils.normalizeSize(this.maxHeight_, opt_parentHeight));
  return height;
};


/**
 * Limits passed width by stored minWidth_ and maxWidth_ settings.
 * @param {number} width
 * @param {number=} opt_parentHeight
 * @return {number}
 */
anychart.core.utils.Bounds.prototype.limitWidth = function(width, opt_parentHeight) {
  if (!goog.isNull(this.minWidth_))
    width = Math.max(width, anychart.utils.normalizeSize(this.minWidth_, opt_parentHeight));
  if (!goog.isNull(this.maxWidth_))
    width = Math.min(width, anychart.utils.normalizeSize(this.maxWidth_, opt_parentHeight));
  return width;
};


/**
 * Resets all values of the object by passed values.
 * Note: 'right' and 'bottom' have priority over 'width' and 'height'.
 * @param {(number|string|Array.<number|string|null>|anychart.utils.RectObj|anychart.math.Rect|anychart.core.utils.Bounds|null)=} opt_xOrRect X-coordinate or
 *    the rect as object.
 * @param {(number|string|null)=} opt_y Y-coordinate.
 * @param {(number|string|null)=} opt_width Width.
 * @param {(number|string|null)=} opt_height Height.
 * @return {!anychart.core.utils.Bounds} Returns itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.set = function(opt_xOrRect, opt_y, opt_width, opt_height) {
  var left, top, right, bottom, width, height, minWidth, minHeight, maxWidth, maxHeight;
  if (opt_xOrRect instanceof anychart.core.utils.Bounds) {
    left = opt_xOrRect.left_;
    top = opt_xOrRect.top_;
    width = opt_xOrRect.width_;
    height = opt_xOrRect.height_;
    minWidth = opt_xOrRect.minWidth_;
    minHeight = opt_xOrRect.minHeight_;
    maxWidth = opt_xOrRect.maxWidth_;
    maxHeight = opt_xOrRect.maxHeight_;
    right = opt_xOrRect.right_;
    bottom = opt_xOrRect.bottom_;
  } else if (opt_xOrRect instanceof anychart.math.Rect) {
    left = opt_xOrRect.left;
    top = opt_xOrRect.top;
    width = opt_xOrRect.width;
    height = opt_xOrRect.height;
    right = null;
    bottom = null;
    minWidth = null;
    minHeight = null;
    maxWidth = null;
    maxHeight = null;
  } else if (goog.isArray(opt_xOrRect)) {
    left = goog.isDef(opt_xOrRect[0]) ? opt_xOrRect[0] : null;
    top = goog.isDef(opt_xOrRect[1]) ? opt_xOrRect[1] : null;
    width = goog.isDef(opt_xOrRect[2]) ? opt_xOrRect[2] : null;
    height = goog.isDef(opt_xOrRect[3]) ? opt_xOrRect[3] : null;
    right = null;
    bottom = null;
    minWidth = null;
    minHeight = null;
    maxWidth = null;
    maxHeight = null;
  } else if (goog.isObject(opt_xOrRect)) {
    left = goog.isDef(opt_xOrRect['left']) ? opt_xOrRect['left'] : null;
    top = goog.isDef(opt_xOrRect['top']) ? opt_xOrRect['top'] : null;
    right = goog.isDef(opt_xOrRect['right']) ? opt_xOrRect['right'] : null;
    bottom = goog.isDef(opt_xOrRect['bottom']) ? opt_xOrRect['bottom'] : null;
    width = goog.isDef(opt_xOrRect['width']) ? opt_xOrRect['width'] : null;
    height = goog.isDef(opt_xOrRect['height']) ? opt_xOrRect['height'] : null;
    minWidth = goog.isDef(opt_xOrRect['minWidth']) ? opt_xOrRect['minWidth'] : null;
    minHeight = goog.isDef(opt_xOrRect['minHeight']) ? opt_xOrRect['minHeight'] : null;
    maxWidth = goog.isDef(opt_xOrRect['maxWidth']) ? opt_xOrRect['maxWidth'] : null;
    maxHeight = goog.isDef(opt_xOrRect['maxHeight']) ? opt_xOrRect['maxHeight'] : null;
  } else {
    left = goog.isDef(opt_xOrRect) ? opt_xOrRect : null;
    top = goog.isDef(opt_y) ? opt_y : null;
    width = goog.isDef(opt_width) ? opt_width : null;
    height = goog.isDef(opt_height) ? opt_height : null;
    right = null;
    bottom = null;
    minWidth = null;
    minHeight = null;
    maxWidth = null;
    maxHeight = null;
  }

  this.suspendSignalsDispatching();
  this.left(left)
      .top(top)
      .right(right)
      .bottom(bottom)
      .width(width)
      .height(height)
      .minWidth(minWidth)
      .minHeight(minHeight)
      .maxWidth(maxWidth)
      .maxHeight(maxHeight);
  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Sets autoTop_ value. Considered internal.
 * @param {number} value
 * @return {anychart.core.utils.Bounds}
 */
anychart.core.utils.Bounds.prototype.setAutoTop = function(value) {
  var doDispatch = this.autoTop_ != value;
  this.autoTop_ = value;
  if (doDispatch)
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  return this;
};


/**
 * Sets autoHeight_ value. Considered internal.
 * @param {number} value
 * @return {anychart.core.utils.Bounds}
 */
anychart.core.utils.Bounds.prototype.setAutoHeight = function(value) {
  var doDispatch = this.autoHeight_ != value;
  this.autoHeight_ = value;
  if (doDispatch)
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  return this;
};


/**
 * Gets or sets left edge position. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
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
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
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
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
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
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
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
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
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
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val != this.height_) {
      this.height_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.height_;
};


/**
 * Gets or sets minimum width value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.minWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val != this.minWidth_) {
      this.minWidth_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.minWidth_;
};


/**
 * Gets or sets minimum height value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.minHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val != this.minHeight_) {
      this.minHeight_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.minHeight_;
};


/**
 * Gets or sets maximum height value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val != this.maxWidth_) {
      this.maxWidth_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.maxWidth_;
};


/**
 * Gets or sets maximum height value. Returns previously set position, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|null|anychart.core.utils.Bounds)} Value, or itself for method chaining.
 */
anychart.core.utils.Bounds.prototype.maxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value);
    if (val != this.maxHeight_) {
      this.maxHeight_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.maxHeight_;
};


/**
 * Define, is one of the bounds settings set in percent.
 * @return {boolean} Is one of the bounds settings set in percent.
 */
anychart.core.utils.Bounds.prototype.dependsOnContainerSize = function() {
  return anychart.utils.isPercent(this.width_) ||
      anychart.utils.isPercent(this.height_) ||
      anychart.utils.isPercent(this.minWidth_) ||
      anychart.utils.isPercent(this.minHeight_) ||
      anychart.utils.isPercent(this.maxWidth_) ||
      anychart.utils.isPercent(this.maxHeight_) ||
      anychart.utils.isPercent(this.left_) ||
      anychart.utils.isPercent(this.top_) ||
      this.bottom_ != null ||
      this.right_ != null ||
      (goog.isNull(this.width_) && goog.isNull(this.right_)) ||
      (goog.isNull(this.height_) && goog.isNull(this.bottom_));
};


/** @inheritDoc */
anychart.core.utils.Bounds.prototype.serialize = function() {
  var json = anychart.core.utils.Bounds.base(this, 'serialize');
  if (!goog.isNull(this.top_))
    json['top'] = this.top_;
  if (!goog.isNull(this.right_))
    json['right'] = this.right_;
  if (!goog.isNull(this.bottom_))
    json['bottom'] = this.bottom_;
  if (!goog.isNull(this.left_))
    json['left'] = this.left_;
  if (!goog.isNull(this.width_))
    json['width'] = this.width_;
  if (!goog.isNull(this.height_))
    json['height'] = this.height_;
  if (!goog.isNull(this.minWidth_))
    json['minWidth'] = this.minWidth_;
  if (!goog.isNull(this.minHeight_))
    json['minHeight'] = this.minHeight_;
  if (!goog.isNull(this.maxWidth_))
    json['maxWidth'] = this.maxWidth_;
  if (!goog.isNull(this.maxHeight_))
    json['maxHeight'] = this.maxHeight_;
  return json;
};


/** @inheritDoc */
anychart.core.utils.Bounds.prototype.setup = function(var_args) {
  if (goog.isDef(arguments[0]))
    this.set.apply(this, arguments);
  return this;
};


//exports
(function() {
  var proto = anychart.core.utils.Bounds.prototype;
  proto['top'] = proto.top;
  proto['right'] = proto.right;
  proto['bottom'] = proto.bottom;
  proto['left'] = proto.left;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['minWidth'] = proto.minWidth;
  proto['minHeight'] = proto.minHeight;
  proto['maxWidth'] = proto.maxWidth;
  proto['maxHeight'] = proto.maxHeight;
  proto['set'] = proto.set;
  proto['toRect'] = proto.toRect;
})();
