/**
 * @fileoverview anychart.treemapModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.treemapModule.entry');

goog.require('anychart.treemapModule.Chart');


/**
 * Default tree map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.treemapModule.Chart} Tree map chart with defaults.
 */
anychart.treeMap = function(opt_data, opt_fillMethod) {
  var chart = new anychart.treemapModule.Chart(opt_data, opt_fillMethod);

  chart.setupInternal(true, anychart.getFullTheme('treeMap'));

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.TREE_MAP] = anychart.treeMap;

//exports
goog.exportSymbol('anychart.treeMap', anychart.treeMap);
