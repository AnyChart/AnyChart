goog.provide('anychart.core.ui.toolbar.Toolbar');

goog.require('acgraph.vector');
goog.require('anychart.utils');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarRenderer');


/**
 * Namespace anychart.core.ui.toolbar
 * @namespace
 * @name anychart.core.ui.toolbar
 */



/**
 * Anychart toolbar implementation.
 * @constructor
 * @extends {goog.ui.Toolbar}
 */
anychart.core.ui.toolbar.Toolbar = function() {
  goog.base(this,
      /** @type {goog.ui.ToolbarRenderer} */ (goog.ui.ContainerRenderer.getCustomRenderer(goog.ui.ToolbarRenderer, 'anychart-toolbar')));

  /**
   * Container.
   * @type {Element|undefined}
   */
  this.container_;

  /**
   * Controlled chart.
   * @type {anychart.core.Chart}
   */
  this.targetChart_;

  /**
   * Supported print paper sizes.
   * @type {Array.<acgraph.vector.PaperSize>}
   * @private
   */
  this.printPaperSizes_ = [
    acgraph.vector.PaperSize.US_LETTER,
    acgraph.vector.PaperSize.A0,
    acgraph.vector.PaperSize.A0,
    acgraph.vector.PaperSize.A1,
    acgraph.vector.PaperSize.A2,
    acgraph.vector.PaperSize.A3,
    acgraph.vector.PaperSize.A4,
    acgraph.vector.PaperSize.A5,
    acgraph.vector.PaperSize.A6
  ];
};
goog.inherits(anychart.core.ui.toolbar.Toolbar, goog.ui.Toolbar);


/**
 * Type declaration for text caption or DOM structure to be used as the content.
 * @typedef {string|Node|Array<Node>|NodeList}
 */
anychart.core.ui.toolbar.Toolbar.ControlContent;


/**
 * CSS class name for applying the "display: inline-block" property in a
 * cross-browser way.
 * @type {string}
 */
anychart.core.ui.toolbar.Toolbar.INLINE_BLOCK_CLASSNAME = goog.getCssName('anychart-inline-block');


/**
 * Gets/sets toolbar container.
 * @param {(string|Element)=} opt_element - Element ID or a DOM node.
 * @return {anychart.core.ui.toolbar.Toolbar|Element|undefined} - Current container or itself for method chaining.
 */
anychart.core.ui.toolbar.Toolbar.prototype.container = function(opt_element) {
  if (goog.isDef(opt_element)) {
    this.container_ = goog.dom.getElement(opt_element);
    return this;
  }
  return this.container_;
};


/**
 * Gets/sets controlled chart.
 * @param {anychart.core.Chart=} opt_value - Target chart.
 * @return {anychart.core.ui.toolbar.Toolbar|anychart.core.Chart|undefined} - Current target or itself for method chaining.
 */
anychart.core.ui.toolbar.Toolbar.prototype.target = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.targetChart_ = opt_value;
    return this;
  }
  return this.targetChart_;
};


/**
 * Sets print paper sizes.
 * NOTE: In current implementation (21 May 2015) sizes must be set before draw() is called.
 * @param {Array.<acgraph.vector.PaperSize>=} opt_value - Array of supported print paper sizes.
 * @return {anychart.core.ui.toolbar.Toolbar|Array.<acgraph.vector.PaperSize>} - Current target or itself for method chaining.
 */
anychart.core.ui.toolbar.Toolbar.prototype.printPaperSizes = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.printPaperSizes_ = opt_value;
    return this;
  }
  return this.printPaperSizes_;
};


/**
 * Draws toolbar.
 * @return {anychart.core.ui.toolbar.Toolbar} - Itself for method chaining.
 */
anychart.core.ui.toolbar.Toolbar.prototype.draw = function() {
  if (this.container_) {
    this.render(this.container_);
  } else {
    anychart.utils.warning(anychart.enums.WarningCode.TOOLBAR_CONTAINER);
  }
  return this;
};



//exports
anychart.core.ui.toolbar.Toolbar.prototype['container'] = anychart.core.ui.toolbar.Toolbar.prototype.container;
anychart.core.ui.toolbar.Toolbar.prototype['target'] = anychart.core.ui.toolbar.Toolbar.prototype.target;
anychart.core.ui.toolbar.Toolbar.prototype['printPaperSizes'] = anychart.core.ui.toolbar.Toolbar.prototype.printPaperSizes;
anychart.core.ui.toolbar.Toolbar.prototype['draw'] = anychart.core.ui.toolbar.Toolbar.prototype.draw;
