goog.provide('anychart.chartEditorModule.IconButtonRenderer');

goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');



/**
 * Icon button renderer.
 *
 * @constructor
 * @extends {goog.ui.CustomButtonRenderer}
 */
anychart.chartEditorModule.IconButtonRenderer = function() {
  anychart.chartEditorModule.IconButtonRenderer.base(this, 'constructor');
};
goog.inherits(anychart.chartEditorModule.IconButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(anychart.chartEditorModule.IconButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
anychart.chartEditorModule.IconButtonRenderer.CSS_CLASS = goog.getCssName('anychart-icon-button');


/** @override */
anychart.chartEditorModule.IconButtonRenderer.prototype.getCssClass = function() {
  return anychart.chartEditorModule.IconButtonRenderer.CSS_CLASS;
};


/** @override */
anychart.chartEditorModule.IconButtonRenderer.prototype.createDom = function(control) {
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
anychart.chartEditorModule.IconButtonRenderer.prototype.getContentElement = function(element) {
  return element;
};
