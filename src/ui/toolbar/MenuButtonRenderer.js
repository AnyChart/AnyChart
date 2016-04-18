goog.provide('anychart.ui.toolbar.MenuButtonRenderer');


goog.require('goog.ui.ToolbarMenuButtonRenderer');



/**
 * Anychart toolbar menu button renderer.
 * @constructor
 * @extends {goog.ui.ToolbarMenuButtonRenderer}
 */
anychart.ui.toolbar.MenuButtonRenderer = function() {
  anychart.ui.toolbar.MenuButtonRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.toolbar.MenuButtonRenderer, goog.ui.ToolbarMenuButtonRenderer);
goog.addSingletonGetter(anychart.ui.toolbar.MenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of toolbars rendered by this renderer.
 * @type {string}
 */
anychart.ui.toolbar.MenuButtonRenderer.CSS_CLASS = goog.getCssName('anychart-toolbar-menu-button');


/**
 * Returns the CSS class to be applied to the root element of containers rendered using this renderer.
 * @return {string} - Renderer-specific CSS class.
 * @override
 */
anychart.ui.toolbar.MenuButtonRenderer.prototype.getCssClass = function() {
  return anychart.ui.toolbar.MenuButtonRenderer.CSS_CLASS;
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
 * @param {goog.ui.Control} control - anychart.ui.toolbar.Button to render.
 * @return {!Element} - Root element for the button.
 * @override
 */
anychart.ui.toolbar.MenuButtonRenderer.prototype.createDom = function(control) {
  //TODO (A.Kudryavtsev): Copied to override goog-inline class.
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var attributes = {'class': anychart.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' ')};
  var buttonElement = button.getDomHelper().createDom('div', attributes, this.createButton(button.getContent(), button.getDomHelper()));
  this.setTooltip(buttonElement, /** @type {!string}*/ (button.getTooltip()));
  this.setAriaStates(button, buttonElement);

  return buttonElement;
};


/**
 * Takes a text caption or existing DOM structure, and returns it wrapped in
 * an appropriately-styled DIV.  Creates the following DOM structure:
 *    <div class="anychart-inline-block anychart-menu-button-caption">
 *      Contents...
 *    </div>
 * @param {anychart.ui.toolbar.Toolbar.ControlContent} content - Text caption or DOM structure to wrap in a box.
 * @param {string} cssClass - The CSS class for the renderer.
 * @param {goog.dom.DomHelper} dom - DOM helper, used for document interaction.
 * @return {!Element} - Caption element.
 */
anychart.ui.toolbar.MenuButtonRenderer.wrapCaption = function(content, cssClass, dom) {
  return dom.createDom('div', anychart.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(cssClass, 'caption'), content);
};


/**
 * Takes a text caption or existing DOM structure, and returns it wrapped in
 * an appropriately-styled DIV.  Creates the following DOM structure:
 *    <div class="anychart-inline-block anychart-menu-button-caption">
 *      Contents...
 *    </div>
 * @param {anychart.ui.toolbar.Toolbar.ControlContent} content - Text caption or DOM structure to wrap in a box.
 * @param {goog.dom.DomHelper} dom - DOM helper, used for document interaction.
 * @return {Element} - Caption element.
 */
anychart.ui.toolbar.MenuButtonRenderer.prototype.createCaption = function(content, dom) {
  return anychart.ui.toolbar.MenuButtonRenderer.wrapCaption(content, this.getCssClass(), dom);
};


/**
 * Returns an appropriately-styled DIV containing a dropdown arrow element.
 * Creates the following DOM structure:
 *    <div class="anychart-inline-block anychart-menu-button-dropdown">
 *      &nbsp;
 *    </div>
 * @param {goog.dom.DomHelper} dom - DOM helper, used for document interaction.
 * @return {Element} - Dropdown element.
 */
anychart.ui.toolbar.MenuButtonRenderer.prototype.createDropdown = function(dom) {
  var element = dom.createDom('div', anychart.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'dropdown'));
  element.innerHTML = '&nbsp';
  return element;
};


/**
 * Takes a text caption or existing DOM structure, and returns the content wrapped in a pseudo-rounded-corner box.
 * Creates the following DOM structure:
 *  <div class="anychart-inline-block anychart-custom-button-outer-box">
 *    <div class="anychart-inline-block anychart-custom-button-inner-box">
 *      Contents...
 *    </div>
 *  </div>
 * Used by both {@link #createDom} and {@link #decorate}.  To be overridden by subclasses.
 * @param {anychart.ui.toolbar.Toolbar.ControlContent} content - Text caption or DOM structure to wrap in a box.
 * @param {goog.dom.DomHelper} dom - DOM helper, used for document interaction.
 * @return {Element} - Pseudo-rounded-corner box containing the content.
 */
anychart.ui.toolbar.MenuButtonRenderer.prototype.createButton = function(content, dom) {
  content = [this.createCaption(content, dom), this.createDropdown(dom)];
  return dom.createDom('div', anychart.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'outer-box'),
      dom.createDom('div', anychart.ui.INLINE_BLOCK_CLASSNAME + ' ' + goog.getCssName(this.getCssClass(), 'inner-box'), content));
};
