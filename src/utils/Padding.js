goog.provide('anychart.utils.Padding');

goog.require('anychart.utils');
goog.require('anychart.utils.Space');



/**
 * Stores padding info for 4 sides. Can accept numbers and strings as padding.
 * For initializing values see anychart.utils.Padding#set() method.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.utils.Space}
 */
anychart.utils.Padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  anychart.utils.Space.apply(this, arguments);
};
goog.inherits(anychart.utils.Padding, anychart.utils.Space);


/** @inheritDoc */
anychart.utils.Padding.prototype.widenBounds = function(boundsRect) {
  var width = this.widenWidth(boundsRect.width);
  var height = this.widenHeight(boundsRect.height);
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.left()), width);
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.top()), height);
  return new anychart.math.Rect(
      boundsRect.left - left,
      boundsRect.top - top,
      width, height
  );
};


/** @inheritDoc */
anychart.utils.Padding.prototype.widenHeight = function(initialHeight) {
  var top = this.top();
  var bottom = this.bottom();
  var ratio = 1;
  if (anychart.utils.isPercent(top))
    ratio -= parseFloat(top) / 100;
  else
    initialHeight += goog.isNumber(top) ? top : parseFloat(top);
  if (anychart.utils.isPercent(bottom))
    ratio -= parseFloat(bottom) / 100;
  else
    initialHeight += goog.isNumber(bottom) ? bottom : parseFloat(bottom);
  if (ratio == 0) ratio = 1e-7;
  return initialHeight / ratio;
};


/** @inheritDoc */
anychart.utils.Padding.prototype.widenWidth = function(initialWidth) {
  var left = this.left();
  var right = this.right();
  var ratio = 1;
  if (anychart.utils.isPercent(left))
    ratio -= parseFloat(left) / 100;
  else
    initialWidth += goog.isNumber(left) ? left : parseFloat(left);
  if (anychart.utils.isPercent(right))
    ratio -= parseFloat(right) / 100;
  else
    initialWidth += goog.isNumber(right) ? right : parseFloat(right);
  if (ratio == 0) ratio = 1e-7;
  return initialWidth / ratio;
};
