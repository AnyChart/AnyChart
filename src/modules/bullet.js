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
 * @return {!anychart.charts.Bullet} Bullet chart.
 */
anychart.bullet = function(opt_data) {
  return new anychart.charts.Bullet(opt_data);
};


/**
 * Creates a bullet chart.
 * @example <t>simple-h100</t>
 * var bulletChart = anychart.bullet([17]);
 * bulletChart.range().from(0).to(10);
 * bulletChart.range(1).from(10).to(20);
 * bulletChart.container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @return {!anychart.charts.Bullet} Bullet chart.
 * @deprecated Use anychart.bullet() instead.
 */
anychart.bulletChart = anychart.bullet;

//exports
goog.exportSymbol('anychart.bullet', anychart.bullet);
goog.exportSymbol('anychart.bulletChart', anychart.bulletChart);
