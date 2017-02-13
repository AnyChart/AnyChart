/**
 * @fileoverview anychart.modules.bullet namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.bullet');

goog.require('anychart.charts.Bullet');
goog.require('anychart.modules.base');


/**
 * Creates a bullet chart.
 * @example <t>simple-h100</t>
 * var bulletChart = anychart.bullet([17]);
 * bulletChart.range().from(0).to(10);
 * bulletChart.range(1).from(10).to(20);
 * bulletChart.container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.charts.Bullet} Bullet chart.
 */
anychart.bullet = function(opt_data, opt_csvSettings) {
  var chart = new anychart.charts.Bullet(opt_data, opt_csvSettings);
  chart.setupByVal(anychart.getFullTheme('bullet'), true);

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.BULLET] = anychart.bullet;


//exports
goog.exportSymbol('anychart.bullet', anychart.bullet);
