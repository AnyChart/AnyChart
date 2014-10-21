goog.provide('anychart.modules.pie');

goog.require('anychart');
goog.require('anychart.pie.Chart');


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pieChart([1.3, 2, 1.4])
 *   .container(stage).draw();
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
      .position(anychart.enums.Orientation.BOTTOM)
      .align(anychart.enums.Align.CENTER)
      .itemsLayout(anychart.enums.Layout.HORIZONTAL);

  chart.legend().title()
      .enabled(false);

  chart.legend().titleSeparator()
      .enabled(false)
      .margin(3, 0);

  return chart;
};

//exports
goog.exportSymbol('anychart.pieChart', anychart.pieChart);
