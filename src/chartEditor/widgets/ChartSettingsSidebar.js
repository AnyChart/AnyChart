goog.provide('anychart.chartEditorModule.ChartSettingsSideBar');

goog.require('anychart.chartEditorModule.group.CartesianXAxes');
goog.require('anychart.chartEditorModule.group.CartesianYAxes');
goog.require('anychart.chartEditorModule.group.ChartTitle');
goog.require('anychart.chartEditorModule.group.Credits');
goog.require('anychart.chartEditorModule.group.DataLabels');
goog.require('anychart.chartEditorModule.group.Legend');
goog.require('anychart.chartEditorModule.group.Series');
goog.require('anychart.chartEditorModule.group.Theme');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.ChartSettingsSideBar = function() {
  anychart.chartEditorModule.ChartSettingsSideBar.base(this, 'constructor');

  /**
   * @type {Array.<goog.ui.Component>}
   * @private
   */
  this.instances_ = [];
};
goog.inherits(anychart.chartEditorModule.ChartSettingsSideBar, goog.ui.Component);


/** @type {string} */
anychart.chartEditorModule.ChartSettingsSideBar.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartSettingsSidebar');


/** @override */
anychart.chartEditorModule.ChartSettingsSideBar.prototype.disposeInternal = function() {
  this.instances_.length = 0;
  anychart.chartEditorModule.ChartSettingsSideBar.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.ChartSettingsSideBar.prototype.createDom = function() {
  anychart.chartEditorModule.ChartSettingsSideBar.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.ChartSettingsSideBar.CSS_CLASS);
};


/** @type {Object.<string, Function>} */
anychart.chartEditorModule.ChartSettingsSideBar.ClsMap = {
  'theme': anychart.chartEditorModule.group.Theme,
  'title': anychart.chartEditorModule.group.ChartTitle,
  'legend': anychart.chartEditorModule.group.Legend,
  'series': anychart.chartEditorModule.group.Series,
  'cartesianxaxes': anychart.chartEditorModule.group.CartesianXAxes,
  'cartesianyaxes': anychart.chartEditorModule.group.CartesianYAxes,
  'credits': anychart.chartEditorModule.group.Credits,
  'datalabels': anychart.chartEditorModule.group.DataLabels
};


/**
 * @param {Array.<string>} list
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 */
anychart.chartEditorModule.ChartSettingsSideBar.prototype.update = function(list, model) {
  var itemsCount = list.length;
  var count = Math.max(itemsCount, this.getChildCount());

  for (var i = 0; i < count; i++) {
    /** @type {(goog.ui.Component|anychart.chartEditorModule.group.Base)} */
    var instance = this.instances_[i];

    if (i < itemsCount) {
      /** @type {string} */
      var name = list[i];
      /** @type {Function} */
      var cls = anychart.chartEditorModule.ChartSettingsSideBar.ClsMap[name];

      if (cls) {
        if (instance && anychart.utils.instanceOf(instance, cls)) {
          instance.update(model);
        } else {
          goog.dispose(instance);
          instance = /** @type {anychart.chartEditorModule.group.Base} */(new cls(model));
          instance.setExpanded(!i); // set in only then create new instance
          this.instances_[i] = instance;
          this.addChildAt(instance, i, true);
          instance.update(model);
        }
        goog.style.setElementShown(instance.getElement(), true);
      } else {
        if (instance) goog.style.setElementShown(instance.getElement(), false);
      }
    } else {
      if (instance) goog.style.setElementShown(instance.getElement(), false);
    }
  }
};
