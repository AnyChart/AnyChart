/**
 * @fileoverview anychart.circlePackingModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.circlePackingModule.entry');

goog.require('anychart.circlePackingModule.Chart');


/**
 * Default circle packing.<br/>
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.circlePackingModule.Chart} - Circle packing chart with defaults.
 */
anychart.circlePacking = function(opt_data, opt_fillMethod) {
  var chart = new anychart.circlePackingModule.Chart(opt_data, opt_fillMethod);
  chart.setupStateSettings();
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.CIRCLE_PACKING] = anychart.circlePacking;

//exports
goog.exportSymbol('anychart.circlePacking', anychart.circlePacking);
