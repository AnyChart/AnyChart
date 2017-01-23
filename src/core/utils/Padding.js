goog.provide('anychart.core.utils.Padding');

goog.require('anychart.core.utils.Space');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Stores padding info for 4 sides. Can accept numbers and strings as padding.
 * For initializing values see anychart.core.utils.Padding#set() method.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 *    Space object or top or top and bottom space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.core.utils.Space}
 */
anychart.core.utils.Padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  anychart.core.utils.Padding.base(this, 'constructor', opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left);
};
goog.inherits(anychart.core.utils.Padding, anychart.core.utils.Space);


/** @inheritDoc */
anychart.core.utils.Padding.prototype.widenBounds = function(boundsRect) {
  var width = this.widenWidth(boundsRect.width);
  var height = this.widenHeight(boundsRect.height);
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('left')), width);
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('top')), height);
  return new anychart.math.Rect(
      boundsRect.left - left,
      boundsRect.top - top,
      width, height
  );
};


/** @inheritDoc */
anychart.core.utils.Padding.prototype.widenHeight = function(initialHeight) {
  var top = /** @type {number|string} */(this.getOption('top'));
  var bottom = /** @type {number|string} */(this.getOption('bottom'));
  var ratio = 1;
  if (anychart.utils.isPercent(top))
    ratio -= parseFloat(top) / 100;
  else
    initialHeight += goog.isNumber(top) ? top : parseFloat(top);
  if (anychart.utils.isPercent(bottom))
    ratio -= parseFloat(bottom) / 100;
  else
    initialHeight += goog.isNumber(bottom) ? bottom : parseFloat(bottom);
  if (!ratio) ratio = 1e-7;
  return initialHeight / ratio;
};


/** @inheritDoc */
anychart.core.utils.Padding.prototype.widenWidth = function(initialWidth) {
  var left = /** @type {number|string} */(this.getOption('left'));
  var right = /** @type {number|string} */(this.getOption('right'));
  var ratio = 1;
  if (anychart.utils.isPercent(left))
    ratio -= parseFloat(left) / 100;
  else
    initialWidth += goog.isNumber(left) ? left : parseFloat(left);
  if (anychart.utils.isPercent(right))
    ratio -= parseFloat(right) / 100;
  else
    initialWidth += goog.isNumber(right) ? right : parseFloat(right);
  if (!ratio) ratio = 1e-7;
  return initialWidth / ratio;
};
