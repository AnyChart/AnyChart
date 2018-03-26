/**
 * @fileoverview anychart.modules.sunburst namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.sunburstModule.entry');

goog.require('anychart.core.entry');
goog.require('anychart.sunburstModule.Chart');


/**
 * Sunburst chart.
 * @param {(anychart.treeDataModule.Tree|anychart.treeDataModule.View|Array.<Object>)=} opt_data - Data tree or raw data.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.sunburstModule.Chart} Default pie chart.
 */
anychart.sunburst = function(opt_data, opt_fillMethod) {
  var chart = new anychart.sunburstModule.Chart(opt_data, opt_fillMethod);

  chart.setupInternal(true, anychart.getFullTheme('sunburst'));

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.SUNBURST] = anychart.sunburst;


//exports
goog.exportSymbol('anychart.sunburst', anychart.sunburst);
