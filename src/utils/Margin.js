goog.provide('anychart.utils.Margin');

goog.require('anychart.utils.Space');



/**
 * Stores margin info for 4 sides. Can accept numbers and strings as side margin.
 * For initializing values meaning see anychart.utils.Margin#set() method.
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.utils.Space}
 */
anychart.utils.Margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  anychart.utils.Space.apply(this, arguments);
};
goog.inherits(anychart.utils.Margin, anychart.utils.Space);
