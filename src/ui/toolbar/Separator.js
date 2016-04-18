goog.provide('anychart.ui.toolbar.Separator');

goog.require('anychart.ui.toolbar.SeparatorRenderer');
goog.require('goog.ui.Separator');
goog.require('goog.ui.registry');



/**
 * A separator control for a toolbar.
 *
 * @param {anychart.ui.toolbar.SeparatorRenderer=} opt_renderer Renderer to render or
 *    decorate the separator; defaults to
 *     {@link anychart.ui.toolbar.SeparatorRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Separator}
 * @final
 */
anychart.ui.toolbar.Separator = function(opt_renderer, opt_domHelper) {
  anychart.ui.toolbar.Separator.base(this, 'constructor', opt_renderer ||
      anychart.ui.toolbar.SeparatorRenderer.getInstance(), opt_domHelper);
};
goog.inherits(anychart.ui.toolbar.Separator, goog.ui.Separator);


// Registers a decorator factory function for toolbar separators.
goog.ui.registry.setDecoratorByClassName(
    anychart.ui.toolbar.SeparatorRenderer.CSS_CLASS,
    function() {
      return new anychart.ui.toolbar.Separator();
    });
