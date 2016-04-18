goog.provide('anychart.ui.menu.Renderer');

goog.require('goog.ui.MenuRenderer');



/**
 * Default renderer for {@link anychart.ui.ContextMenu}s, based on {@link
    * goog.ui.MenuRenderer}.
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
anychart.ui.menu.Renderer = function(opt_ariaRole) {
  anychart.ui.menu.Renderer.base(this, 'constructor', opt_ariaRole || goog.a11y.aria.Role.MENU);
};
goog.inherits(anychart.ui.menu.Renderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(anychart.ui.menu.Renderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered
 * by this renderer.
 * @type {string}
 */
anychart.ui.menu.Renderer.CSS_CLASS = goog.getCssName('anychart-menu');


/** @inheritDoc */
anychart.ui.menu.Renderer.prototype.getCssClass = function() {
  return anychart.ui.menu.Renderer.CSS_CLASS;
};
