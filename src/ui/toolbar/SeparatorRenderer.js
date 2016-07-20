goog.provide('anychart.ui.toolbar.SeparatorRenderer');

goog.require('goog.ui.ToolbarSeparatorRenderer');



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
 * Returns a styled toolbar separator implemented by the following DOM:
 * <div class="anychart-toolbar-separator anychart-inline-block">&nbsp;</div>
 * Overrides {@link goog.ui.MenuSeparatorRenderer#createDom}.
 * @param {goog.ui.Control} separator - Separator to render.
 * @return {!Element} - Root element for the separator.
 * @override
 */
anychart.ui.toolbar.SeparatorRenderer.prototype.createDom = function(separator) {
  var element = separator.getDomHelper().createDom(goog.dom.TagName.DIV,
      this.getClassNames(separator).join(' ') +
          ' ' + goog.ui.INLINE_BLOCK_CLASSNAME);

  // Don't use UTF-8.
  element.innerHTML = '&nbsp;';
  return element;
};
