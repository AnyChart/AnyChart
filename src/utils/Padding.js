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
