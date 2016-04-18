goog.provide('anychart.ui.menu.Separator');

goog.require('anychart.ui.menu.SeparatorRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.registry');



/**
 * Class representing a menu separator.  A menu separator extends {@link
    * goog.ui.Separator} by always setting its renderer to {@link
    * anychart.ui.menu.SeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @constructor
 * @extends {goog.ui.Separator}
 * @final
 */
anychart.ui.menu.Separator = function(opt_domHelper) {
  anychart.ui.menu.Separator.base(this, 'constructor', anychart.ui.menu.SeparatorRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(anychart.ui.menu.Separator, goog.ui.Separator);


// Register a decorator factory function for goog.ui.Separators.
goog.ui.registry.setDecoratorByClassName(
    anychart.ui.menu.SeparatorRenderer.CSS_CLASS,
    function() {
      // Separator defaults to using SeparatorRenderer.
      return new anychart.ui.menu.Separator();
    });
