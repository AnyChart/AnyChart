goog.provide('anychart.ui.chartEditor.steps.Settings');

goog.require('anychart.ui.chartEditor.ChartSettingsSideBar');
goog.require('anychart.ui.chartEditor.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.ui.chartEditor.steps.Base}
 */
anychart.ui.chartEditor.steps.Settings = function(opt_domHelper) {
  anychart.ui.chartEditor.steps.Settings.base(this, 'constructor', opt_domHelper);

  this.setName('Chart Settings');
  this.setTitle('Chart Settings');
};
goog.inherits(anychart.ui.chartEditor.steps.Settings, anychart.ui.chartEditor.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.ui.chartEditor.steps.Settings.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-step');


/**
 * @type {anychart.ui.chartEditor.ChartSettingsSideBar}
 * @private
 */
anychart.ui.chartEditor.steps.Settings.prototype.chartSettingsSidebar_ = null;


/** @override */
anychart.ui.chartEditor.steps.Settings.prototype.createDom = function() {
  anychart.ui.chartEditor.steps.Settings.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();
  var sharedModel = this.getSharedModel();

  var className = anychart.ui.chartEditor.steps.Settings.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();
  var contentEl = this.getContentElement();

  var chartSettingsSidebar = new anychart.ui.chartEditor.ChartSettingsSideBar();
  chartSettingsSidebar.render(asideEl);
  chartSettingsSidebar.setParentEventTarget(this);

  this.chartSettingsSidebar_ = chartSettingsSidebar;

  this.update();
};


/** @override */
anychart.ui.chartEditor.steps.Settings.prototype.update = function() {
  var model = this.getSharedModel();
  var settingsList = this.getSettingsList(model.chartConstructor);

  this.chartSettingsSidebar_.update(settingsList, model);
};


/** @override */
anychart.ui.chartEditor.steps.Settings.prototype.enterDocument = function() {
  anychart.ui.chartEditor.steps.Settings.base(this, 'enterDocument');

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.BUILD_CHART,
    container: this.getContentElement()
  });
};


/** @override */
anychart.ui.chartEditor.steps.Settings.prototype.exitDocument = function() {
  anychart.ui.chartEditor.steps.Settings.base(this, 'exitDocument');
};


/** @override */
anychart.ui.chartEditor.steps.Settings.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.steps.Settings.base(this, 'disposeInternal');
};


/**
 * Defined available settings list for passed chart type.
 * @param {string} charType
 * @return {Array.<string>}
 */
anychart.ui.chartEditor.steps.Settings.prototype.getSettingsList = function(charType) {
  if (charType == 'pie' || charType == 'donut' || charType == 'pie3d' || charType == 'donut3d') {
    return ['theme', 'title', 'legend', 'datalabels', 'credits', 'piefeatures'];

  } else if (charType == 'funnel' || charType == 'pyramid') {
    return ['theme', 'title', 'legend', 'datalabels', 'credits', 'funnelpyramidfeatures'];

  } else {
    return [
      'theme', 'title', 'legend', 'series', 'datalabels',
      'cartesianxaxes', 'cartesianyaxes', 'credits', 'cartesianfeatures'];
  }
};
