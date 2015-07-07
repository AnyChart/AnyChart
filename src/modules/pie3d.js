goog.provide('anychart.modules.pie3d');

goog.require('anychart.charts.Pie');
goog.require('anychart.modules.base');


/**
 * Default 3D pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie3d([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Pie} Default pie chart.
 */
anychart.pie3d = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Pie(opt_data, opt_csvSettings);

  chart.title()
      .text('3D Pie Chart')
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

  chart.mode3d(true);
  chart.explode('5%');
  chart.connectorLength('15%');

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.PIE_3D] = anychart.pie3d;


//exports
goog.exportSymbol('anychart.pie3d', anychart.pie3d);
