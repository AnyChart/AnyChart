goog.provide('anychart.core.utils.TooltipsContainer');
goog.require('acgraph');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.userAgent');



/**
 * Top-level container has the same size as the document.
 * It should not block any events on a page.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.utils.TooltipsContainer = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.selectable_ = false;

  /**
   * @type {Object.<!string, !anychart.core.ui.SeriesTooltip|!anychart.core.ui.TooltipItem>}
   * @private
   */
  this.tooltipsMap_ = {};

  var document = goog.dom.getDocument();
  if (goog.userAgent.IE && (!goog.userAgent.isVersionOrHigher('7') || document.documentMode && document.documentMode <= 6)) {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; left:0; top:0; z-index: 9999;'});
  } else {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; z-index: 9999; left: -10000px; top: -10000px'});
  }

  var viewportSize, width, height;
  if (goog.userAgent.IPHONE || goog.userAgent.IPAD || goog.userAgent.ANDROID) {
    viewportSize = goog.dom.getViewportSize();
    width = viewportSize.width;
    height = viewportSize.height;
  } else {
    viewportSize = goog.dom.getWindow().screen;
    width = viewportSize.availWidth;
    height = viewportSize.availHeight;
  }

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
    // hack like `pointer-events: none`
    this.stage_ = acgraph.create(this.root_, 1, 1);
  } else {
    this.stage_ = acgraph.create(this.root_, width, height);
  }

  this.stage_.domElement()['style']['cssText'] = 'position:fixed; left:0; top:0; opacity:1; pointer-events: none';

  // do not wrap TooltipsContainer stage into relative div
  // DVF-791
  this.stage_.wrapped_ = true;
  goog.dom.appendChild(goog.dom.getDocument().body, this.root_);
};
goog.inherits(anychart.core.utils.TooltipsContainer, goog.Disposable);
goog.addSingletonGetter(anychart.core.utils.TooltipsContainer);


/**
 * @type {Element}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.root_ = null;


/**
 * @type {acgraph.vector.Stage}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.stage_ = null;


/**
 * Set container to tooltip.
 * @param {anychart.core.ui.SeriesTooltip|anychart.core.ui.TooltipItem} tooltip
 */
anychart.core.utils.TooltipsContainer.prototype.allocTooltip = function(tooltip) {
  tooltip.container(this.stage_);
  this.tooltipsMap_[goog.getUid(tooltip).toString()] = tooltip;
};


/**
 * Release passed tooltip.
 * @param {anychart.core.ui.SeriesTooltip|anychart.core.ui.TooltipItem} tooltip
 */
anychart.core.utils.TooltipsContainer.prototype.release = function(tooltip) {
  tooltip.container(null);
  delete this.tooltipsMap_[goog.getUid(tooltip).toString()];
};


/**
 * Hide all tooltips.
 * @param {boolean=} opt_force Ignore tooltips hide delay.
 */
anychart.core.utils.TooltipsContainer.prototype.hideTooltips = function(opt_force) {
  if (goog.isNull(this.tooltipsMap_)) return;

  for (var id in this.tooltipsMap_) {
    if (!this.tooltipsMap_.hasOwnProperty(id)) continue;
    this.tooltipsMap_[id].hide(opt_force);
  }
};


/**
 * Getter/Setter for the text selectable option.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.TooltipsContainer}
 */
anychart.core.utils.TooltipsContainer.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.selectable_ != opt_value) {
      this.selectable_ = opt_value;
    }
    return this;
  } else {
    return this.selectable_;
  }
};


/** @inheritDoc */
anychart.core.utils.TooltipsContainer.prototype.disposeInternal = function() {
  //todo this method is never called

  this.stage_.dispose();
  this.stage_ = null;
  goog.dom.removeNode(this.root_);
  this.root_ = null;
  this.tooltipsMap_ = null;
};
