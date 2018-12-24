/**
 * @fileoverview anychart.wordtreeModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.wordtreeModule.entry');

goog.require('anychart.wordtreeModule.Chart');


/**
 * Default wordtree chart.
 * @param {anychart.treeDataModule.Tree|
 * string|
 * Array.<Object>|
 * Array.<Array<string>>|
 * Array.<string>|
 * null=} opt_data data for chart
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method..
 * @return {anychart.wordtreeModule.Chart} Wordtree chart with defaults.
 */
anychart.wordtree = function(opt_data, opt_fillMethod) {
  var chart = new anychart.wordtreeModule.Chart(opt_data, opt_fillMethod);
  chart.addThemes('wordtree');
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.WORDTREE] = anychart.wordtree;

//exports
goog.exportSymbol('anychart.wordtree', anychart.wordtree);
