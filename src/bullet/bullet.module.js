/**
 * @fileoverview anychart.bulletModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.bulletModule.entry');
goog.require('anychart.bulletModule.Chart');


/**
 * Creates a bullet chart.
 * @example <t>simple-h100</t>
 * var bulletChart = anychart.bullet([17]);
 * bulletChart.range().from(0).to(10);
 * bulletChart.range(1).from(10).to(20);
 * bulletChart.container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.bulletModule.Chart} Bullet chart.
 */
anychart.bullet = function(opt_data, opt_csvSettings) {
  return new anychart.bulletModule.Chart(opt_data, opt_csvSettings);
};
anychart.chartTypesMap[anychart.enums.ChartTypes.BULLET] = anychart.bullet;


//exports
goog.exportSymbol('anychart.bullet', anychart.bullet);
