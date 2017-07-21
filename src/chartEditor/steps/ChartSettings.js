goog.provide('anychart.chartEditorModule.steps.Settings');

goog.require('anychart.chartEditorModule.ChartSettingsSideBar');
goog.require('anychart.chartEditorModule.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditorModule.steps.Base}
 */
anychart.chartEditorModule.steps.Settings = function(opt_domHelper) {
  anychart.chartEditorModule.steps.Settings.base(this, 'constructor', opt_domHelper);

  this.setName('Chart Settings');
  this.setTitle('Chart Settings');
};
goog.inherits(anychart.chartEditorModule.steps.Settings, anychart.chartEditorModule.steps.Base);


/**
 * CSS class name.
 * @type {string}
 */
anychart.chartEditorModule.steps.Settings.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-step');


/**
 * @type {anychart.chartEditorModule.ChartSettingsSideBar}
 * @private
 */
anychart.chartEditorModule.steps.Settings.prototype.chartSettingsSidebar_ = null;


/** @override */
anychart.chartEditorModule.steps.Settings.prototype.createDom = function() {
  anychart.chartEditorModule.steps.Settings.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var className = anychart.chartEditorModule.steps.Settings.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var asideEl = this.getAsideElement();
  var chartSettingsSidebar = new anychart.chartEditorModule.ChartSettingsSideBar();
  chartSettingsSidebar.render(asideEl);
  chartSettingsSidebar.setParentEventTarget(this);

  this.chartSettingsSidebar_ = chartSettingsSidebar;

  this.update();
};


/** @override */
anychart.chartEditorModule.steps.Settings.prototype.update = function() {
  var model = this.getSharedModel();
  var settingsList = this.getSettingsList(model.chartConstructor);

  this.chartSettingsSidebar_.update(settingsList, model);
};


/** @override */
anychart.chartEditorModule.steps.Settings.prototype.enterDocument = function() {
  anychart.chartEditorModule.steps.Settings.base(this, 'enterDocument');

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.BUILD_CHART,
    container: this.getContentElement()
  });
};


/** @override */
anychart.chartEditorModule.steps.Settings.prototype.exitDocument = function() {
  anychart.chartEditorModule.steps.Settings.base(this, 'exitDocument');
};


/** @override */
anychart.chartEditorModule.steps.Settings.prototype.disposeInternal = function() {
  anychart.chartEditorModule.steps.Settings.base(this, 'disposeInternal');
};


/**
 * Defined available settings list for passed chart type.
 * @param {string} charType
 * @return {Array.<string>}
 */
anychart.chartEditorModule.steps.Settings.prototype.getSettingsList = function(charType) {
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
