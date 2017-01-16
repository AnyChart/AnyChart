//region --- Provide and Require
goog.provide('anychart.ui.Zoom');

goog.require('anychart.enums');
goog.require('anychart.ui.button.Base');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');

goog.forwardDeclare('anychart.charts.Map');
//endregion



/**
 * Zoom ui element (for zoomable chart).
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.Zoom = function() {
  anychart.ui.Zoom.base(this, 'constructor');

  /**
   * Map chart.
   * @type {?anychart.charts.Map}
   * @private
   */
  this.target_ = null;
};
goog.inherits(anychart.ui.Zoom, goog.ui.Component);


/** @type {string} */
anychart.ui.Zoom.CSS_CLASS = goog.getCssName('anychart-zoom');


/**
 * Set Map chart for Range Selector.
 * @param {anychart.charts.Map} chart
 */
anychart.ui.Zoom.prototype.target = function(chart) {
  this.target_ = chart;
};


/**
 * @private
 */
anychart.ui.Zoom.prototype.createDomInternal_ = function() {
  var element = this.getElement();
  var cssName = anychart.ui.Zoom.CSS_CLASS;
  goog.dom.classlist.add(element, cssName);

  this.zoomFitAllButton_ = new anychart.ui.button.Base();
  this.zoomFitAllButton_.setModel({'type': 'fitAll'});
  this.zoomFitAllButton_.setTooltip('Fit All');
  this.zoomFitAllButton_.addClassName('anychart-zoom-zoomFitAll');
  this.zoomFitAllButton_.setIcon('ac ac-dot-square-o disable-selection');
  this.addChild(this.zoomFitAllButton_, true);


  this.zoomInButton_ = new anychart.ui.button.Base();
  this.zoomInButton_.setModel({'type': 'zoomIn'});
  this.zoomInButton_.setTooltip('Zoom In');
  this.zoomInButton_.addClassName('anychart-zoom-zoomIn');
  this.zoomInButton_.setIcon('ac ac-plus disable-selection');
  this.addChild(this.zoomInButton_, true);


  this.zoomOutButton_ = new anychart.ui.button.Base();
  this.zoomOutButton_.setModel({'type': 'zoomOut'});
  this.zoomOutButton_.setTooltip('Zoom Out');
  this.zoomOutButton_.addClassName('anychart-zoom-zoomOut');
  this.zoomOutButton_.setIcon('ac ac-minus disable-selection');
  this.addChild(this.zoomOutButton_, true);
};


/** @override */
anychart.ui.Zoom.prototype.createDom = function() {
  anychart.ui.Zoom.base(this, 'createDom');
  this.createDomInternal_();
};


/** @override */
anychart.ui.Zoom.prototype.decorateInternal = function(element) {
  if (this.isMapChart_(element)) {
    this.render(element);
    return;
  }
  anychart.ui.Zoom.base(this, 'decorateInternal', element);
  this.createDomInternal_();
};


/**
 * @param {*} chart
 * @return {boolean}
 * @private
 */
anychart.ui.Zoom.prototype.isMapChart_ = function(chart) {
  return /** @type {boolean} */(chart && goog.isFunction(chart['getType']) && chart['getType']() == anychart.enums.MapTypes.MAP);
};


/**
 * @param {(anychart.charts.Map|Element)=} opt_parentElement Optional parent element or Map chart to render the
 *    range picker into.
 * @return {Element|undefined}
 * @private
 */
anychart.ui.Zoom.prototype.extractChartContainer_ = function(opt_parentElement) {
  if (this.isMapChart_(opt_parentElement)) {
    this.target(/** @type {anychart.charts.Map} */(opt_parentElement));
    var stage = this.target_['container']() ? this.target_['container']()['getStage']() : null;
    if (stage && stage['container']()) {
      opt_parentElement = stage['container']();
    } else {
      opt_parentElement = null;
    }
  }
  return opt_parentElement;
};


/**
 * @param {(anychart.charts.Map|Element)=} opt_parentElement Optional parent element or Map chart to render the range picker into.
 * @private
 */
anychart.ui.Zoom.prototype.delayedRenderOnChartDraw_ = function(opt_parentElement) {
  this.render(opt_parentElement);
};


/**
 * @param {(anychart.charts.Map|Element)=} opt_parentElement Optional parent element or Map chart to render the
 *    range selector into.
 * @override
 */
anychart.ui.Zoom.prototype.render = function(opt_parentElement) {
  var container = this.extractChartContainer_(opt_parentElement || this.target_);

  if (container) {
    anychart.ui.Zoom.base(this, 'render', container);
  } else {
    var bind = goog.bind(this.delayedRenderOnChartDraw_, this, container || this.target_);
    this.target_.listenOnce(anychart.enums.EventType.CHART_DRAW, bind, false, this);
  }
};


/** @override */
anychart.ui.Zoom.prototype.enterDocument = function() {
  anychart.ui.Zoom.base(this, 'enterDocument');

  if (!this.target_) return;

  var handler = this.getHandler();
  handler.listen(this, goog.ui.Component.EventType.ACTION, this.handleButtonAction_);
};


/**
 * Handler for button action.
 * @param {Object} e
 * @private
 */
anychart.ui.Zoom.prototype.handleButtonAction_ = function(e) {
  var descriptor = e.target.getModel();

  this.target_.zoomDuration = 100;
  switch (descriptor['type']) {
    case 'fitAll':
      this.target_.fitAll();
      break;
    case 'zoomIn':
      this.target_.zoomIn();
      break;
    case 'zoomOut':
      this.target_.zoomOut();
      break;
  }
};


/** @override */
anychart.ui.Zoom.prototype.exitDocument = function() {
  anychart.ui.Zoom.base(this, 'exitDocument');
};


/** @override */
anychart.ui.Zoom.prototype.disposeInternal = function() {
  this.target_ = null;

  this.zoomFitAllButton_.dispose();
  this.zoomFitAllButton_ = null;

  this.zoomInButton_.dispose();
  this.zoomInButton_ = null;

  this.zoomOutButton_.dispose();
  this.zoomOutButton_ = null;

  anychart.ui.Zoom.base(this, 'disposeInternal');
};


/**
 * Constructor function for range selector.
 * @return {anychart.ui.Zoom}
 */
anychart.ui.zoom = function() {
  return new anychart.ui.Zoom();
};


//region --- Exports
//exports
(function() {
  var proto = anychart.ui.Zoom.prototype;
  goog.exportSymbol('anychart.ui.zoom', anychart.ui.zoom);
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['target'] = proto.target;
  proto['dispose'] = proto.dispose;
})();


//endregion
