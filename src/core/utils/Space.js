goog.provide('anychart.core.utils.Space');

goog.require('anychart.core.Base');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Stores space info for 4 sides. Can accept numbers and strings as side spaces.
 * For initializing values meaning see set() method.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 *    Space object or top or top and bottom space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Space = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  goog.base(this);
  if (arguments.length)
    this.set.apply(this, arguments);
};
goog.inherits(anychart.core.utils.Space, anychart.core.Base);


/**
 * @typedef {{
 *  top: (number|string),
 *  left: (number|string),
 *  bottom: (number|string),
 *  right: (number|string)
 * }}
 */
anychart.core.utils.Space.NormalizedSpace;


/**
 * Signals mask.
 * @type {number}
 */
anychart.core.utils.Space.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Top space.
 * @type {number|string}
 * @private
 */
anychart.core.utils.Space.prototype.top_ = 0;


/**
 * Right space.
 * @type {number|string}
 * @private
 */
anychart.core.utils.Space.prototype.right_ = 0;


/**
 * Bottom space.
 * @type {number|string}
 * @private
 */
anychart.core.utils.Space.prototype.bottom_ = 0;


/**
 * Left space.
 * @type {number|string}
 * @private
 */
anychart.core.utils.Space.prototype.left_ = 0;


/**
 * Normalizes space.
 * @param {...(string|number)} var_args - Arguments.
 *  Can actually take the following:
 *    1) Four {string|number} values that are top, right, bottom and left respectively.
 *    2) Two {string|number} values that are top-bottom and right-left values.
 *    3) Single {string|number} value that sets top-right-bottom-left.
 *    4) Single Array.<string|number> with top, right, bottom and left values.
 *    4) Single Object.<string, {string|number}> with top, right, bottom and left values.
 * @return {anychart.core.utils.Space.NormalizedSpace}
 */
anychart.core.utils.Space.normalizeSpace = function(var_args) {
  var top, right, bottom, left;
  var argsLen;
  var spaceOrTopOrTopAndBottom = arguments[0], rightOrRightAndLeft = arguments[1],
      bottomVal = arguments[2], leftVal = arguments[3];
  if (goog.isArray(spaceOrTopOrTopAndBottom)) {
    var tmp = spaceOrTopOrTopAndBottom;
    spaceOrTopOrTopAndBottom = tmp[0];
    rightOrRightAndLeft = tmp[1];
    bottomVal = tmp[2];
    leftVal = tmp[3];
    argsLen = tmp.length;
  } else
    argsLen = arguments.length;
  // else if branches sorted a bit like by usage frequency
  if (argsLen == 0) {
    left = bottom = right = top = 0;
  } else if (goog.isObject(spaceOrTopOrTopAndBottom)) {
    top = spaceOrTopOrTopAndBottom['top'] || 0;
    right = spaceOrTopOrTopAndBottom['right'] || 0;
    bottom = spaceOrTopOrTopAndBottom['bottom'] || 0;
    left = spaceOrTopOrTopAndBottom['left'] || 0;
  } else if (argsLen == 1) {
    left = bottom = right = top = spaceOrTopOrTopAndBottom || 0;
  } else if (argsLen == 2) {
    bottom = top = spaceOrTopOrTopAndBottom || 0;
    left = right = rightOrRightAndLeft || 0;
  } else if (argsLen == 3) {
    top = spaceOrTopOrTopAndBottom || 0;
    left = right = rightOrRightAndLeft || 0;
    bottom = bottomVal || 0;
  } else if (argsLen >= 4) {
    top = spaceOrTopOrTopAndBottom || 0;
    right = rightOrRightAndLeft || 0;
    bottom = bottomVal || 0;
    left = leftVal || 0;
  }

  return /** @type {anychart.core.utils.Space.NormalizedSpace} */ ({
    top: top,
    left: left,
    bottom: bottom,
    right: right
  });
};


/**
 * Resets all offsets using values passed.
 * Can accept other Space object or from 0 to 4 values (numbers or percent strings).
 * Space values are applied just as in CSS:
 * 1) set(25, 50, 75, 100):
 *    top space is 25
 *    right space is 50
 *    bottom space is 75
 *    left space is 100
 * 2) set(25, 50, 75):
 *    top space is 25
 *    right and left spaces are 50
 *    bottom space is 75
 * 3) set(25, 50):
 *    top and bottom spaces are 25
 *    right and left spaces are 50
 * 4) set(25):
 *    all four spaces are 25
 * Also can accept arrays (applied, like it is an apply) and objects with 'left', 'top', 'right' and 'bottom' fields.
 *
 * NOTE: set():
 *    all four spaces are 0
 *
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!anychart.core.utils.Space} Returns itself for chaining.
 */
anychart.core.utils.Space.prototype.set = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var normalizedSpace = /** @type {anychart.core.utils.Space.NormalizedSpace} */ (anychart.core.utils.Space.normalizeSpace.apply(this, arguments));
  this.suspendSignalsDispatching();
  this.left(normalizedSpace.left).top(normalizedSpace.top).right(normalizedSpace.right).bottom(normalizedSpace.bottom);
  this.resumeSignalsDispatching(true);
  return this;
};


/**
 * Gets or sets left space. Returns previously set space, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|!anychart.core.utils.Space)} Value, or itself for chaining.
 */
anychart.core.utils.Space.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value) || 0;
    if (val != this.left_) {
      this.left_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.left_;
};


/**
 * Gets or sets top space. Returns previously set space, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|!anychart.core.utils.Space)} Value or itself for method chaining.
 */
anychart.core.utils.Space.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value) || 0;
    if (val != this.top_) {
      this.top_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.top_;
};


/**
 * Gets or sets right space. Returns previously set space, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|!anychart.core.utils.Space)} Value or itself for chaining.
 */
anychart.core.utils.Space.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value) || 0;
    if (val != this.right_) {
      this.right_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.right_;
};


/**
 * Gets or sets bottom space. Returns previously set space, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|!anychart.core.utils.Space)} Value or itself for chaining.
 */
anychart.core.utils.Space.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumberOrStringOrNull(opt_value) || 0;
    if (val != this.bottom_) {
      this.bottom_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else
    return this.bottom_;
};


/**
 * Applies margin settings to a rect, creating a new tighten rectangle.
 * @param {!anychart.math.Rect} boundsRect Rectangle to apply margins to.
 * @return {!anychart.math.Rect} New rectangle with applied margin.
 */
anychart.core.utils.Space.prototype.tightenBounds = function(boundsRect) {
  var left = anychart.utils.normalizeSize(this.left_, boundsRect.width);
  var right = anychart.utils.normalizeSize(this.right_, boundsRect.width);
  var top = anychart.utils.normalizeSize(this.top_, boundsRect.height);
  var bottom = anychart.utils.normalizeSize(this.bottom_, boundsRect.height);
  return new anychart.math.Rect(
      boundsRect.left + left,
      boundsRect.top + top,
      boundsRect.width - left - right,
      boundsRect.height - top - bottom
  );
};


/**
 * Applies margin settings to the width. The resulting width is less than the initial.
 * @param {number} initialWidth Width to apply margin to.
 * @return {number} New width.
 */
anychart.core.utils.Space.prototype.tightenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(this.left_, initialWidth);
  var right = anychart.utils.normalizeSize(this.right_, initialWidth);
  return initialWidth - left - right;
};


/**
 * Applies margin settings to a height. The resulting height is less than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.core.utils.Space.prototype.tightenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(this.top_, initialHeight);
  var bottom = anychart.utils.normalizeSize(this.bottom_, initialHeight);
  return initialHeight - top - bottom;
};


/**
 * Applies padding settings to a rectangle, creating a new widen rectangle.
 * @param {!anychart.math.Rect} boundsRect Rectangle to apply margin to.
 * @return {!anychart.math.Rect} New rectangle.
 */
anychart.core.utils.Space.prototype.widenBounds = function(boundsRect) {
  var left = anychart.utils.normalizeSize(this.left_, boundsRect.width);
  var right = anychart.utils.normalizeSize(this.right_, boundsRect.width);
  var top = anychart.utils.normalizeSize(this.top_, boundsRect.height);
  var bottom = anychart.utils.normalizeSize(this.bottom_, boundsRect.height);
  return new anychart.math.Rect(
      boundsRect.left - left,
      boundsRect.top - top,
      boundsRect.width + left + right,
      boundsRect.height + top + bottom
  );
};


/**
 * Applies margin settings to a width. The resulting width is bigger than the initial.
 * @param {number} initialWidth Width to apply margin to.
 * @return {number} New width.
 */
anychart.core.utils.Space.prototype.widenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(this.left_, initialWidth);
  var right = anychart.utils.normalizeSize(this.right_, initialWidth);
  return initialWidth + left + right;
};


/**
 * Applies margin settings to a height. The resulting height is bigger than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.core.utils.Space.prototype.widenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(this.top_, initialHeight);
  var bottom = anychart.utils.normalizeSize(this.bottom_, initialHeight);
  return initialHeight + top + bottom;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isDef(this.top_))
    json['top'] = this.top_;
  if (goog.isDef(this.right_))
    json['right'] = this.right_;
  if (this.bottom_)
    json['bottom'] = this.bottom_;
  if (this.left_)
    json['left'] = this.left_;
  return json;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.setup = function(var_args) {
  if (goog.isDef(arguments[0]))
    this.set.apply(this, arguments);
  return this;
};


//exports
anychart.core.utils.Space.prototype['top'] = anychart.core.utils.Space.prototype.top;
anychart.core.utils.Space.prototype['right'] = anychart.core.utils.Space.prototype.right;
anychart.core.utils.Space.prototype['bottom'] = anychart.core.utils.Space.prototype.bottom;
anychart.core.utils.Space.prototype['left'] = anychart.core.utils.Space.prototype.left;
anychart.core.utils.Space.prototype['set'] = anychart.core.utils.Space.prototype.set;
