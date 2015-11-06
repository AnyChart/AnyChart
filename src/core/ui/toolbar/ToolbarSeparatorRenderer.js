goog.provide('anychart.core.ui.toolbar.ToolbarSeparatorRenderer');

goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');
goog.require('goog.ui.registry');



/**
 * Anychart toolbar separator renderer.
 * @constructor
 * @extends {goog.ui.ToolbarSeparatorRenderer}
 */
anychart.core.ui.toolbar.ToolbarSeparatorRenderer = function() {
  goog.base(this);
};
goog.inherits(anychart.core.ui.toolbar.ToolbarSeparatorRenderer, goog.ui.ToolbarSeparatorRenderer);
goog.addSingletonGetter(anychart.core.ui.toolbar.ToolbarSeparatorRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered by this renderer.
 * @type {string}
 */
anychart.core.ui.toolbar.ToolbarSeparatorRenderer.CSS_CLASS = goog.getCssName('anychart-toolbar-separator');


/**
 * Returns the CSS class to be applied to the root element of containers rendered using this renderer.
 * @return {string} - Renderer-specific CSS class.
 * @override
 */
anychart.core.ui.toolbar.ToolbarSeparatorRenderer.prototype.getCssClass = function() {
  return anychart.core.ui.toolbar.ToolbarSeparatorRenderer.CSS_CLASS;
};


/**
 * Returns a styled toolbar separator implemented by the following DOM:
 * <div class="anychart-toolbar-separator anychart-inline-block">&nbsp;</div>
 * Overrides {@link goog.ui.MenuSeparatorRenderer#createDom}.
 * @param {goog.ui.Control} separator - Separator to render.
 * @return {!Element} - Root element for the separator.
 * @override
 */
anychart.core.ui.toolbar.ToolbarSeparatorRenderer.prototype.createDom = function(separator) {
  // 00A0 is &nbsp;
  return separator.getDomHelper().createDom(
      'div', this.getClassNames(separator).join(' ') + ' ' + anychart.core.ui.toolbar.Toolbar.INLINE_BLOCK_CLASSNAME, '\u00A0'
  );
};


// Registers a decorator factory function for toolbar separators.
// TODO (A.Kudryavtsev): Totally copied from final class goog.ui.ToolbarSeparator.
goog.ui.registry.setDecoratorByClassName(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance());
});
