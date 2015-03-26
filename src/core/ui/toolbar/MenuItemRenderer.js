goog.provide('anychart.core.ui.toolbar.MenuItemRenderer');

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
anychart.core.ui.toolbar.MenuItemRenderer = function() {
  goog.base(this);
};
goog.inherits(anychart.core.ui.toolbar.MenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(anychart.core.ui.toolbar.MenuItemRenderer);


/**
 * CSS class name the renderer applies to menu item elements.
 * @type {string}
 */
anychart.core.ui.toolbar.MenuItemRenderer.CSS_CLASS = goog.getCssName('anychart-menuitem');


/** @override */
anychart.core.ui.toolbar.MenuItemRenderer.prototype.getCssClass = function() {
  return anychart.core.ui.toolbar.MenuItemRenderer.CSS_CLASS;
};
