goog.provide('anychart.ui.chartEditor.ChartSettingsSideBar');

goog.require('anychart.ui.chartEditor.group.CartesianXAxes');
goog.require('anychart.ui.chartEditor.group.CartesianYAxes');
goog.require('anychart.ui.chartEditor.group.ChartTitle');
goog.require('anychart.ui.chartEditor.group.Credits');
goog.require('anychart.ui.chartEditor.group.DataLabels');
goog.require('anychart.ui.chartEditor.group.Legend');
goog.require('anychart.ui.chartEditor.group.Series');
goog.require('anychart.ui.chartEditor.group.Theme');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.ChartSettingsSideBar = function() {
  anychart.ui.chartEditor.ChartSettingsSideBar.base(this, 'constructor');

  this.instances_ = [];
};
goog.inherits(anychart.ui.chartEditor.ChartSettingsSideBar, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.ChartSettingsSideBar.CSS_CLASS = goog.getCssName('anychart-chart-editor-chartSettingsSidebar');


/**
 * @type {Array.<goog.ui.Component>}
 * @private
 */
anychart.ui.chartEditor.ChartSettingsSideBar.prototype.instances_ = null;


/** @override */
anychart.ui.chartEditor.ChartSettingsSideBar.prototype.disposeInternal = function() {
  this.instances_ = null;
  anychart.ui.chartEditor.ChartSettingsSideBar.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.ChartSettingsSideBar.prototype.createDom = function() {
  anychart.ui.chartEditor.ChartSettingsSideBar.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.ui.chartEditor.ChartSettingsSideBar.CSS_CLASS);
};


/** @type {Object.<string, Function>} */
anychart.ui.chartEditor.ChartSettingsSideBar.ClsMap = {
  'theme': anychart.ui.chartEditor.group.Theme,
  'title': anychart.ui.chartEditor.group.ChartTitle,
  'legend': anychart.ui.chartEditor.group.Legend,
  'series': anychart.ui.chartEditor.group.Series,
  'cartesianxaxes': anychart.ui.chartEditor.group.CartesianXAxes,
  'cartesianyaxes': anychart.ui.chartEditor.group.CartesianYAxes,
  'credits': anychart.ui.chartEditor.group.Credits,
  'datalabels': anychart.ui.chartEditor.group.DataLabels
};


/**
 * @param {Array.<string>} list
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 */
anychart.ui.chartEditor.ChartSettingsSideBar.prototype.update = function(list, model) {
  var itemsCount = list.length;
  var count = Math.max(itemsCount, this.getChildCount());

  for (var i = 0; i < count; i++) {
    /** @type {goog.ui.Component} */
    var instance = this.instances_[i];

    if (i < itemsCount) {
      /** @type {string} */
      var name = list[i];
      /** @type {Function} */
      var cls = anychart.ui.chartEditor.ChartSettingsSideBar.ClsMap[name];

      if (cls) {
        if (instance && instance instanceof cls) {
          instance.update(model);
        } else {
          goog.dispose(instance);
          instance = /** @type {anychart.ui.chartEditor.group.Base} */(new cls(model));
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
