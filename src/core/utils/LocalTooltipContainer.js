goog.provide('anychart.core.utils.LocalTooltipContainer');

goog.require('acgraph');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.userAgent');



/**
 * Base tooltip container.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.utils.LocalTooltipContainer = function() {
  anychart.core.utils.LocalTooltipContainer.base(this, 'constructor');

  /**
   * @type {boolean}
   * @private
   */
  this.selectable_ = false;

  /**
   * Root div element.
   * @type {Element}
   * @private
   */
  this.root_ = goog.dom.createDom('div');

  /**
   * Associated stage. For IE 6-8 here's a hack like 'pointer-events: none'.
   * @type {acgraph.vector.Stage}
   * @private
   */
  this.stage_ = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9') ?
      acgraph.create(null, 1, 1) :
      acgraph.create();
  this.stage_.allowCreditsDisabling = true;
  this.stage_.container(this.root_);
  // do not wrap TooltipsContainer stage into relative div
  // DVF-791
  this.stage_.wrapped_ = true;

  /**
   * Tooltip container's container.
   * @type {Element}
   * @private
   */
  this.container_ = null;
};
goog.inherits(anychart.core.utils.LocalTooltipContainer, goog.Disposable);


/**
 * Local container style.
 * @type {Object}
 * @const
 */
anychart.core.utils.LocalTooltipContainer.LOCAL_CONTAINER_STYLE = {
  'position': 'absolute',
  'z-index': 9999,
  'left': 0,
  'top': 0,
  'width': '100%',
  'height': '100%',
  'pointer-events': 'none'
};


/**
 * Global stage.getDomWrapper() style.
 * @type {Object}
 * @const
 */
anychart.core.utils.LocalTooltipContainer.LOCAL_STAGE_WRAPPER_STYLE = {
  'position': 'relative',
  'left': 0,
  'top': 0,
  'overflow': 'hidden',
  'width': '100%',
  'height': '100%'
};


/**
 * Global stage.domElement() style.
 * @type {Object}
 * @const
 */
anychart.core.utils.LocalTooltipContainer.LOCAL_STAGE_DOM_ELEMENT_STYLE = {
  'position': 'relative',
  'left': 0,
  'top': 0,
  'opacity': 1,
  'pointer-events': 'none'
};


/**
 * Applies style to elements.
 * @protected
 */
anychart.core.utils.LocalTooltipContainer.prototype.applyStyle = function() {
  //this implementation is for local container (default). Default one must be overridden.
  goog.style.setStyle(this.root_, anychart.core.utils.LocalTooltipContainer.LOCAL_CONTAINER_STYLE);
  goog.style.setStyle(this.stage_.getDomWrapper(), anychart.core.utils.LocalTooltipContainer.LOCAL_STAGE_WRAPPER_STYLE);
  goog.style.setStyle(this.stage_.domElement(), anychart.core.utils.LocalTooltipContainer.LOCAL_STAGE_DOM_ELEMENT_STYLE);
};


/**
 * Gets/sets tooltip container's container.
 * @param {Element=} opt_val - Value to set.
 * @return {?Element|anychart.core.utils.LocalTooltipContainer} - Current value or itself for chaining.
 */
anychart.core.utils.LocalTooltipContainer.prototype.container = function(opt_val) {
  if (goog.isDef(opt_val)) {
    if (opt_val != this.container_) {
      this.container_ = opt_val;
      if (this.container_) { //not null.
        goog.dom.appendChild(this.container_, this.root_);
        this.applyStyle();
        this.stage_.checkSize();
      } else {
        goog.dom.removeNode(this.root_);
      }
    }
    return this;
  }
  return this.container_;
};


/**
 * Root element getter.
 * @return {Element}
 */
anychart.core.utils.LocalTooltipContainer.prototype.getRoot = function() {
  return this.root_;
};


/**
 * Stage getter.
 * @return {acgraph.vector.Stage}
 */
anychart.core.utils.LocalTooltipContainer.prototype.getStage = function() {
  return this.stage_;
};


/**
 * Whether container is local.
 * @return {boolean}
 */
anychart.core.utils.LocalTooltipContainer.prototype.isLocal = function() {
  return true;
};


/**
 * Set container to tooltip.
 * @param {anychart.core.ui.Tooltip} tooltip
 */
anychart.core.utils.LocalTooltipContainer.prototype.allocTooltip = function(tooltip) {
  tooltip.container(this.stage_);
};


/**
 * Release passed tooltip.
 * @param {anychart.core.ui.Tooltip} tooltip
 */
anychart.core.utils.LocalTooltipContainer.prototype.release = function(tooltip) {
  tooltip.container(null);
};


/**
 * Getter/Setter for the text selectable option.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.LocalTooltipContainer}
 */
anychart.core.utils.LocalTooltipContainer.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selectable_ = opt_value;
    return this;
  } else {
    return this.selectable_;
  }
};


/** @inheritDoc */
anychart.core.utils.LocalTooltipContainer.prototype.disposeInternal = function() {
  goog.dispose(this.stage_);
  this.stage_ = null;
  goog.dom.removeNode(this.root_);
  this.root_ = null;
};
