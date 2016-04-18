goog.provide('anychart.ui.toolbar.SeparatorRenderer');

goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarSeparatorRenderer');
goog.require('goog.ui.registry');



/**
 * Anychart toolbar separator renderer.
 * @constructor
 * @extends {goog.ui.ToolbarSeparatorRenderer}
 */
anychart.ui.toolbar.SeparatorRenderer = function() {
  anychart.ui.toolbar.SeparatorRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.toolbar.SeparatorRenderer, goog.ui.ToolbarSeparatorRenderer);
goog.addSingletonGetter(anychart.ui.toolbar.SeparatorRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered by this renderer.
 * @type {string}
 */
anychart.ui.toolbar.SeparatorRenderer.CSS_CLASS = goog.getCssName('anychart-toolbar-separator');


/**
 * Returns the CSS class to be applied to the root element of containers rendered using this renderer.
 * @return {string} - Renderer-specific CSS class.
 * @override
 */
anychart.ui.toolbar.SeparatorRenderer.prototype.getCssClass = function() {
  return anychart.ui.toolbar.SeparatorRenderer.CSS_CLASS;
};


/**
 * Returns a styled toolbar separator implemented by the following DOM:
 * <div class="anychart-toolbar-separator anychart-inline-block">&nbsp;</div>
 * Overrides {@link goog.ui.MenuSeparatorRenderer#createDom}.
 * @param {goog.ui.Control} separator - Separator to render.
 * @return {!Element} - Root element for the separator.
 * @override
 */
anychart.ui.toolbar.SeparatorRenderer.prototype.createDom = function(separator) {
  // 00A0 is &nbsp;
  return separator.getDomHelper().createDom(
      'div', this.getClassNames(separator).join(' ') + ' ' + anychart.ui.INLINE_BLOCK_CLASSNAME, '\u00A0'
  );
};


// Registers a decorator factory function for toolbar separators.
// TODO (A.Kudryavtsev): Totally copied from final class goog.ui.ToolbarSeparator.
goog.ui.registry.setDecoratorByClassName(anychart.ui.toolbar.SeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator(anychart.ui.toolbar.SeparatorRenderer.getInstance());
});
