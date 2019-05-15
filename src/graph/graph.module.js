goog.provide('anychart.graphModule.entry');

goog.require('anychart.graphModule.Chart');


/**
 * TODO// jsdoc
 * @param {Object=} opt_data
 * @return {anychart.graphModule.Chart}
 */
anychart.graph = function(opt_data) {
  var chart = new anychart.graphModule.Chart(opt_data);
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.GRAPH] = anychart.graph;

//exports
goog.exportSymbol('anychart.graph', anychart.graph);
