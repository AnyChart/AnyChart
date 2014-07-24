goog.provide('anychart.modules.cartesian');

goog.require('anychart');
goog.require('anychart.modules.area');
goog.require('anychart.modules.bar');
goog.require('anychart.modules.column');
goog.require('anychart.modules.finance');
goog.require('anychart.modules.line');
goog.require('anychart.modules.scatter');


/**
 * Default empty chart.
 * @return {anychart.cartesian.Chart} Empty chart.
 */
anychart.cartesianChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


//exports
goog.exportSymbol('anychart.cartesian.Chart', anychart.cartesian.Chart);//in docs/
