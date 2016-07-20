goog.provide('anychart.ui.IconButtonRenderer');

goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');



/**
 * Icon button renderer.
 *
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
anychart.ui.IconButtonRenderer = function() {
  anychart.ui.IconButtonRenderer.base(this, 'constructor');
};
goog.inherits(anychart.ui.IconButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(anychart.ui.IconButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
anychart.ui.IconButtonRenderer.CSS_CLASS = goog.getCssName('anychart-icon-button');


/** @override */
anychart.ui.IconButtonRenderer.prototype.getCssClass = function() {
  return anychart.ui.IconButtonRenderer.CSS_CLASS;
};


/** @override */
anychart.ui.IconButtonRenderer.prototype.createDom = function(control) {
  var button = /** @type {goog.ui.Button} */ (control);
  var classNames = this.getClassNames(button);
  var attributes = {
    'class': goog.ui.INLINE_BLOCK_CLASSNAME + ' ' + classNames.join(' ')
  };
  var buttonElement = button.getDomHelper().createDom(
      goog.dom.TagName.DIV, attributes);
  this.setTooltip(
      buttonElement, /** @type {!string}*/ (button.getTooltip()));

  return buttonElement;
};


/** @override */
anychart.ui.IconButtonRenderer.prototype.getContentElement = function(element) {
  return element;
};
