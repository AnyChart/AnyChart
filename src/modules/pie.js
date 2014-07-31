goog.provide('anychart.modules.pie');

goog.require('anychart');
goog.require('anychart.pie.Chart');


/**
 * Default pie chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @return {anychart.pie.Chart} Default pie chart.
 */
anychart.pieChart = function(opt_data) {
  var chart = new anychart.pie.Chart(opt_data);

  chart.title()
      .text('Pie Chart')
      .fontWeight('bold');

  chart.labels()
      .enabled(true);

  chart.legend()
      .enabled(true)
      .position('right')
      .align('left')
      .itemsLayout('vertical');

  chart.legend().title()
      .enabled(false);

  chart.legend().titleSeparator()
      .enabled(false)
      .margin(3, 0);

  return chart;
};

//exports
goog.exportSymbol('anychart.pieChart', anychart.pieChart);
