goog.provide('anychart.utils.Padding');

goog.require('anychart.utils');
goog.require('anychart.utils.Space');



/**
 * Stores padding info for 4 sides. Can accept numbers and strings as side padding.
 * For initializing values meaning see anychart.utils.Padding#set() method.
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
anychart.utils.Padding.prototype.getWidthToWiden = function(initialWidth) {
  var top = this.top();
  var bottom = this.bottom();
  var topIsPercent = anychart.utils.isPercent(top);
  var bottomIsPercent = anychart.utils.isPercent(bottom);
  if (topIsPercent || bottomIsPercent) {
    var ratio = 1;
    if (topIsPercent)
      ratio -= parseFloat(top) / 100;
    else
      initialWidth -= goog.isNumber(top) ? top : parseFloat(top);
    if (bottomIsPercent)
      ratio -= parseFloat(bottom) / 100;
    else
      initialWidth -= goog.isNumber(bottom) ? bottom : parseFloat(bottom);
    return initialWidth / ratio;
  } else {
    return initialWidth;
  }
};


/** @inheritDoc */
anychart.utils.Padding.prototype.getHeightToWiden = function(initialHeight) {
  var left = this.left();
  var right = this.right();
  var leftIsPercent = anychart.utils.isPercent(left);
  var rightIsPercent = anychart.utils.isPercent(right);
  if (leftIsPercent || rightIsPercent) {
    var ratio = 1;
    if (leftIsPercent)
      ratio -= parseFloat(left) / 100;
    else
      initialHeight -= goog.isNumber(left) ? left : parseFloat(left);
    if (rightIsPercent)
      ratio -= parseFloat(right) / 100;
    else
      initialHeight -= goog.isNumber(right) ? right : parseFloat(right);
    return initialHeight / ratio;
  } else {
    return initialHeight;
  }
};
