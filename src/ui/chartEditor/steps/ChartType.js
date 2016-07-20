goog.provide('anychart.ui.chartEditor.steps.ChartType');

goog.require('anychart.ui.chartEditor.ChartTypeSideBar');
goog.require('anychart.ui.chartEditor.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.ui.chartEditor.steps.Base}
 */
anychart.ui.chartEditor.steps.ChartType = function(opt_domHelper) {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'constructor', opt_domHelper);

  this.setName('Chart Type');
  this.setTitle('Chart Type');
};
goog.inherits(anychart.ui.chartEditor.steps.ChartType, anychart.ui.chartEditor.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.ui.chartEditor.steps.ChartType.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartType-step');


/** @enum {string} */
anychart.ui.chartEditor.steps.ChartType.CssClass = {};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.createDom = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());

  var className = anychart.ui.chartEditor.steps.ChartType.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();

  var chartTypeSidebar = new anychart.ui.chartEditor.ChartTypeSideBar();
  chartTypeSidebar.setParentEventTarget(this);
  chartTypeSidebar.render(asideEl);

  this.chartTypeSidebar_ = chartTypeSidebar;
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.enterDocument = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'enterDocument');

  this.update();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.BUILD_CHART,
    container: this.getContentElement()
  });
};


/** @inheritDoc */
anychart.ui.chartEditor.steps.ChartType.prototype.update = function() {
  var model = this.getSharedModel();
  this.chartTypeSidebar_.update(model.presetsList, model);
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.exitDocument = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'exitDocument');
};


/** @override */
anychart.ui.chartEditor.steps.ChartType.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.steps.ChartType.base(this, 'disposeInternal');
};
