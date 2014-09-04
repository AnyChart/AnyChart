goog.provide('anychart.utils.Space');

goog.require('anychart.Base');
goog.require('anychart.utils');



/**
 * Stores space info for 4 sides. Can accept numbers and strings as side spaces.
 * For initializing values meaning see set() method.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.utils.Space = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  goog.base(this);
  if (arguments.length)
    this.set.apply(this, arguments);
};
goog.inherits(anychart.utils.Space, anychart.Base);


/**
 * Signals mask.
 * @type {number}
 */
anychart.utils.Space.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Top space.
 * @type {number|string}
 * @private
 */
anychart.utils.Space.prototype.top_ = 0;


/**
 * Right space.
 * @type {number|string}
 * @private
 */
anychart.utils.Space.prototype.right_ = 0;


/**
 * Bottom space.
 * @type {number|string}
 * @private
 */
anychart.utils.Space.prototype.bottom_ = 0;


/**
 * Left space.
 * @type {number|string}
 * @private
 */
anychart.utils.Space.prototype.left_ = 0;


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
 *
 * NOTE: set():
 *    all four spaces are 0
 *
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {anychart.utils.Space} Returns itself for chaining.
 */
anychart.utils.Space.prototype.set = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var top, right, bottom, left;
  var argsLen = arguments.length;
  // else if branches sorted a bit like by usage frequency
  if (argsLen == 0) {
    left = bottom = right = top = 0;
  } else if (opt_spaceOrTopOrTopAndBottom instanceof anychart.utils.Space) {
    top = opt_spaceOrTopOrTopAndBottom.top_;
    right = opt_spaceOrTopOrTopAndBottom.right_;
    bottom = opt_spaceOrTopOrTopAndBottom.bottom_;
    left = opt_spaceOrTopOrTopAndBottom.left_;
  } else if (argsLen == 1) {
    left = bottom = right = top = opt_spaceOrTopOrTopAndBottom || 0;
  } else if (argsLen == 2) {
    bottom = top = opt_spaceOrTopOrTopAndBottom || 0;
    left = right = opt_rightOrRightAndLeft || 0;
  } else if (argsLen == 3) {
    top = opt_spaceOrTopOrTopAndBottom || 0;
    left = right = opt_rightOrRightAndLeft || 0;
    bottom = opt_bottom || 0;
  } else if (argsLen >= 4) {
    top = opt_spaceOrTopOrTopAndBottom || 0;
    right = opt_rightOrRightAndLeft || 0;
    bottom = opt_bottom || 0;
    left = opt_left || 0;
  }

  this.suspendSignalsDispatching();
  this.left(left).top(top).right(right).bottom(bottom);
  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Gets or sets left space. Returns previously set space, not the derived pixel value.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {(number|string|!anychart.utils.Space)} Value, or itself for chaining.
 */
anychart.utils.Space.prototype.left = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isNumber(opt_value) || goog.isString(opt_value)) ? opt_value || 0 : 0;
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
 * @return {(number|string|!anychart.utils.Space)} Value or itself for method chaining.
 */
anychart.utils.Space.prototype.top = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isNumber(opt_value) || goog.isString(opt_value)) ? opt_value || 0 : 0;
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
 * @return {(number|string|!anychart.utils.Space)} Value or itself for chaining.
 */
anychart.utils.Space.prototype.right = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isNumber(opt_value) || goog.isString(opt_value)) ? opt_value || 0 : 0;
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
 * @return {(number|string|!anychart.utils.Space)} Value or itself for chaining.
 */
anychart.utils.Space.prototype.bottom = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = (goog.isNumber(opt_value) || goog.isString(opt_value)) ? opt_value || 0 : 0;
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
anychart.utils.Space.prototype.tightenBounds = function(boundsRect) {
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
anychart.utils.Space.prototype.tightenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(this.left_, initialWidth);
  var right = anychart.utils.normalizeSize(this.right_, initialWidth);
  return initialWidth - left - right;
};


/**
 * Applies margin settings to a height. The resulting height is less than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.utils.Space.prototype.tightenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(this.top_, initialHeight);
  var bottom = anychart.utils.normalizeSize(this.bottom_, initialHeight);
  return initialHeight - top - bottom;
};


/**
 * Applies padding settings to a rectangle, creating a new widen rectangle.
 * @param {!anychart.math.Rect} boundsRect Rectangle to apply margin to.
 * @return {!anychart.math.Rect} New rectangle.
 */
anychart.utils.Space.prototype.widenBounds = function(boundsRect) {
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
anychart.utils.Space.prototype.widenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(this.left_, initialWidth);
  var right = anychart.utils.normalizeSize(this.right_, initialWidth);
  return initialWidth + left + right;
};


/**
 * Applies margin settings to a height. The resulting height is bigger than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.utils.Space.prototype.widenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(this.top_, initialHeight);
  var bottom = anychart.utils.normalizeSize(this.bottom_, initialHeight);
  return initialHeight + top + bottom;
};


/**
 * @inheritDoc
 */
anychart.utils.Space.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['top'] = this.top();
  json['right'] = this.right();
  json['bottom'] = this.bottom();
  json['left'] = this.left();

  return json;
};


/**
 * @inheritDoc
 */
anychart.utils.Space.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);

  this.left(config['left']);
  this.top(config['top']);
  this.right(config['right']);
  this.bottom(config['bottom']);

  return this;
};
