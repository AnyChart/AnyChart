/**
 * @fileoverview anychart.modules.treeMap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.treeMap');

goog.require('anychart.charts.TreeMap');
goog.require('anychart.modules.base');


/**
 * Default tree map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {(anychart.data.Tree|anychart.data.TreeView|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.charts.TreeMap} Tree map chart with defaults.
 */
anychart.treeMap = function(opt_data, opt_fillMethod) {
  var chart = new anychart.charts.TreeMap(opt_data, opt_fillMethod);

  chart.setupByVal(anychart.getFullTheme('treeMap'), true);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.TREE_MAP] = anychart.treeMap;

//exports
goog.exportSymbol('anychart.treeMap', anychart.treeMap);
