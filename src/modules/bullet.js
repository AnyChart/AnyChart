goog.provide('anychart.modules.bullet');

goog.require('anychart');
goog.require('anychart.bullet.Chart');


/**
 * Default bullet chart.
 * @example
 * anychart.bulletChart([17, 14])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Bullet Chart data.
 * @return {!anychart.bullet.Chart} Bullet chart.
 */
anychart.bulletChart = function(opt_data) {
  var chart = new anychart.bullet.Chart(opt_data);
  return chart;
};

//exports
goog.exportSymbol('anychart.bulletChart', anychart.bulletChart);
