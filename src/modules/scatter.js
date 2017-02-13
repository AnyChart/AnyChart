/**
 * @fileoverview anychart.modules.scatter namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.scatter');

goog.require('anychart.charts.Scatter');
goog.require('anychart.modules.base');


/**
 * Returns a scatter chart instance with initial settings (axes, grids, title).<br/>
 * By default creates marker series if arguments is set.
 * @example
 * anychart.scatter([20, 7, 10, 14])
 *    .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Scatter} Chart with defaults for scatter series.
 */
anychart.scatter = function(var_args) {
  var chart = new anychart.charts.Scatter();
  chart.setupByVal(anychart.getFullTheme('scatter'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['marker'](arguments[i]);
  }

  return chart;
};


/**
 * Default marker chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.marker([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Scatter} Chart with defaults for marker series.
 */
anychart.marker = function(var_args) {
  var chart = new anychart.charts.Scatter();
  chart.setupByVal(anychart.getFullTheme('marker'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['marker'](arguments[i]);
  }

  return chart;
};


/**
 * Default bubble chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bubble([
 *      [1.3, 2, 1.3],
 *      [1.6, 1.5, 1.4],
 *      [1.9, 1.9, 1.1]
 *   ])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bubble chart data.
 * @return {anychart.charts.Scatter} Chart with defaults for bubble series.
 */
anychart.bubble = function(var_args) {
  var chart = new anychart.charts.Scatter();
  chart.setupByVal(anychart.getFullTheme('bubble'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['bubble'](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.BUBBLE] = anychart.bubble;
anychart.chartTypesMap[anychart.enums.ChartTypes.MARKER] = anychart.marker;
anychart.chartTypesMap[anychart.enums.ChartTypes.SCATTER] = anychart.scatter;

//exports
goog.exportSymbol('anychart.bubble', anychart.bubble);//doc|ex
goog.exportSymbol('anychart.scatter', anychart.scatter);
goog.exportSymbol('anychart.marker', anychart.marker);
goog.exportSymbol('anychart.scatterChart', anychart.scatter);
