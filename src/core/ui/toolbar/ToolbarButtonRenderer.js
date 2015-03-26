goog.provide('anychart.core.ui.toolbar.ToolbarButtonRenderer');

goog.require('goog.ui.ToolbarButtonRenderer');



/**
 * Anychart toolbar button renderer.
 * @constructor
 * @extends {goog.ui.ToolbarButtonRenderer}
 */
anychart.core.ui.toolbar.ToolbarButtonRenderer = function() {
  goog.base(this);
};
goog.inherits(anychart.core.ui.toolbar.ToolbarButtonRenderer, goog.ui.ToolbarButtonRenderer);
goog.addSingletonGetter(anychart.core.ui.toolbar.ToolbarButtonRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered by this renderer.
 * @type {string}
 */
anychart.core.ui.toolbar.ToolbarButtonRenderer.CSS_CLASS = goog.getCssName('anychart-toolbar-button');


/**
 * Returns the CSS class to be applied to the root element of containers rendered using this renderer.
 * @return {string} - Renderer-specific CSS class.
 * @override
 */
anychart.core.ui.toolbar.ToolbarButtonRenderer.prototype.getCssClass = function() {
  return anychart.core.ui.toolbar.ToolbarButtonRenderer.CSS_CLASS;
};


/**
 * Returns the button's contents wrapped in the following DOM structure:
 *    <div class="anychart-inline-block goog-custom-button">
 *      <div class="anychart-inline-block goog-custom-button-outer-box">
 *        <div class="anychart-inline-block goog-custom-button-inner-box">
 *          Contents...
 *        </div>
 *      </div>
 *    </div>
 * Overrides {@link goog.ui.ButtonRenderer#createDom}.
 * @param {goog.ui.Control} control - anychart.core.ui.Button to render.
 * @return {!Element} - Root element for the button.
 * @override
 */
anychart.core.ui.toolbar.ToolbarButtonRenderer.prototype.createDom = function(control) {
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var attributes = {'class': anychart.core.ui.toolbar.Toolbar.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' ')};
  var buttonElement = button.getDomHelper().createDom('div', attributes, this.createButton(button.getContent(), button.getDomHelper()));
  this.setTooltip(buttonElement, /** @type {!string}*/ (button.getTooltip()));
  this.setAriaStates(button, buttonElement);

  return buttonElement;
};


/**
 * Takes a text caption or existing DOM structure, and returns the content
 * wrapped in a pseudo-rounded-corner box.  Creates the following DOM structure:
 *  <div class="anychart-inline-block anychart-custom-button-outer-box">
 *    <div class="anychart-inline-block anychart-custom-button-inner-box">
 *      Contents...
 *    </div>
 *  </div>
 * Used by both {@link #createDom} and {@link #decorate}. To be overridden by subclasses.
 * @param {anychart.core.ui.toolbar.Toolbar.ControlContent} content - Text caption or DOM structure to wrap in a box.
 * @param {goog.dom.DomHelper} dom - DOM helper, used for document interaction.
 * @return {Element} - Pseudo-rounded-corner box containing the content.
 */
anychart.core.ui.toolbar.ToolbarButtonRenderer.prototype.createButton = function(content, dom) {
  return dom.createDom('div', anychart.core.ui.toolbar.Toolbar.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'outer-box'),
      dom.createDom('div', anychart.core.ui.toolbar.Toolbar.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'inner-box'), content));
};
