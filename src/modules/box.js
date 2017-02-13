/**
 * @fileoverview anychart.modules.box namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.box');
goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.drawers.Box');
goog.require('anychart.modules.base');


/**
 * Default box chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * var data = [
 *     {x: 'p1', low: 760, q1: 801, median: 848, q3: 895, high: 965, outliers: [650]},
 *     ['p2', 733, 853, 939, 980, 1080],
 *     ['p3', 714, 762, 817, 870, 918],
 *     ['p4', 724, 802, 806, 871, 950],
 *     ['p5', 834, 836, 864, 882, 910, [710, 970, 980]]
 * ];
 * var chart = anychart.box();
 * chart.box(data);
 * chart.container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for column series.
 */
anychart.box = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.BOX);
  chart.setType(anychart.enums.ChartTypes.BOX);

  chart.setupByVal(anychart.getFullTheme('box'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['box'](arguments[i]);
  }

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.BOX] = anychart.box;

//exports
goog.exportSymbol('anychart.box', anychart.box);
