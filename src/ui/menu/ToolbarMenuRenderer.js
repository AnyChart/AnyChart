goog.provide('anychart.ui.menu.ToolbarMenuRenderer');
goog.require('goog.ui.MenuRenderer');



/**
 * Toolbar specific menu.
 * @param {string=} opt_ariaRole
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
anychart.ui.menu.ToolbarMenuRenderer = function(opt_ariaRole) {
  anychart.ui.menu.ToolbarMenuRenderer.base(this, 'constructor', opt_ariaRole);
};
goog.inherits(anychart.ui.menu.ToolbarMenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(anychart.ui.menu.ToolbarMenuRenderer);


/**
 * Default css class.
 * @type {string}
 */
anychart.ui.menu.ToolbarMenuRenderer.CSS_CLASS = goog.getCssName('goog-toolbar-menu');


/**
 * Returns CSS class to be applied.
 * @return {string}
 */
anychart.ui.menu.ToolbarMenuRenderer.prototype.getCssClass = function() {
  return anychart.ui.menu.ToolbarMenuRenderer.CSS_CLASS;
};
