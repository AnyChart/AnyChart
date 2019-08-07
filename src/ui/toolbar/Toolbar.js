goog.provide('anychart.ui.toolbar.Toolbar');

goog.require('anychart.core.reporting');
goog.require('goog.ui.Toolbar');

goog.forwardDeclare('anychart.core.Chart');

/**
 * Namespace anychart.ui.toolbar
 * @namespace
 * @name anychart.ui.toolbar
 */



/**
 * Anychart toolbar implementation.
 * @constructor
 * @extends {goog.ui.Toolbar}
 */
anychart.ui.toolbar.Toolbar = function() {
  anychart.ui.toolbar.Toolbar.base(this, 'constructor');

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
};
goog.inherits(anychart.ui.toolbar.Toolbar, goog.ui.Toolbar);


/**
 * Type declaration for text caption or DOM structure to be used as the content.
 * @typedef {string|Node|Array<Node>|NodeList}
 */
anychart.ui.toolbar.Toolbar.ControlContent;


/**
 * Gets/sets toolbar container.
 * @param {(string|Element)=} opt_element - Element ID or a DOM node.
 * @return {anychart.ui.toolbar.Toolbar|Element|undefined} - Current container or itself for method chaining.
 */
anychart.ui.toolbar.Toolbar.prototype.container = function(opt_element) {
  if (goog.isDef(opt_element)) {
    var newContainer = goog.dom.getElement(opt_element);
    if (this.container_ != newContainer) {
      this.exitDocument();
      this.container_ = newContainer;
      this.draw();
    }
    return this;
  }
  return this.container_;
};


/**
 * Gets/sets controlled chart.
 * @param {anychart.core.Chart=} opt_value - Target chart.
 * @return {anychart.ui.toolbar.Toolbar|anychart.core.Chart|undefined} - Current target or itself for method chaining.
 */
anychart.ui.toolbar.Toolbar.prototype.target = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.targetChart_ = opt_value;
    return this;
  }
  return this.targetChart_;
};


/**
 * Draws toolbar.
 * @return {anychart.ui.toolbar.Toolbar} - Itself for method chaining.
 */
anychart.ui.toolbar.Toolbar.prototype.draw = function() {
  if (this.container_) {
    if (this.container_.firstChild) {
      this.renderBefore(this.container_.firstChild);
    } else {
      this.render(this.container_);
    }
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.TOOLBAR_CONTAINER);
  }
  return this;
};
