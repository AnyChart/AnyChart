goog.provide('anychart.ui.menu.ItemRenderer');

goog.require('goog.ui.MenuItemRenderer');



/**
 * Default renderer for {@link anychart.ui.MenuItem}s.  Each item has the following
 * structure:
 * <pre>
 *   <div class="anychart-menuitem">
 *     <div class="anychart-menuitem-content">
 *       ...(menu item contents)...
 *     </div>
 *   </div>
 * </pre>
 *
 * NOTE: This class is used by SubMenuRenderer, that's why we can't just replace it with
 *  goog.ui.ControlRenderer.getCustomRenderer(goog.ui.MenuRenderer, 'anychart-menuitem').
 *
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
anychart.ui.menu.ItemRenderer = function() {
  anychart.ui.menu.ItemRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.menu.ItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(anychart.ui.menu.ItemRenderer);


/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
anychart.ui.menu.ItemRenderer.CSS_CLASS = goog.getCssName('anychart-menuitem');


/** @override */
anychart.ui.menu.ItemRenderer.prototype.getCssClass = function() {
  return anychart.ui.menu.ItemRenderer.CSS_CLASS;
};
