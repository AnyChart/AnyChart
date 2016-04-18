goog.provide('anychart.ui.menu.SeparatorRenderer');

goog.require('goog.ui.MenuSeparatorRenderer');



/**
 * Renderer for menu separators.
 * @constructor
 * @extends {goog.ui.MenuSeparatorRenderer}
 */
anychart.ui.menu.SeparatorRenderer = function() {
  anychart.ui.menu.SeparatorRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.menu.SeparatorRenderer, goog.ui.MenuSeparatorRenderer);
goog.addSingletonGetter(anychart.ui.menu.SeparatorRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
anychart.ui.menu.SeparatorRenderer.CSS_CLASS = goog.getCssName('anychart-menuseparator');


/** @inheritDoc */
anychart.ui.menu.SeparatorRenderer.prototype.getCssClass = function() {
  return anychart.ui.menu.SeparatorRenderer.CSS_CLASS;
};
