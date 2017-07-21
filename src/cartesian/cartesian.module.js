/**
 * @fileoverview anychart.cartesianModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.cartesianModule.entry');

goog.require('anychart.cartesianModule.BoxDrawer');
goog.require('anychart.cartesianModule.Chart');
goog.require('anychart.core.drawers.Area');
goog.require('anychart.core.drawers.Bubble');
goog.require('anychart.core.drawers.Candlestick');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.core.drawers.JumpLine');
goog.require('anychart.core.drawers.Line');
goog.require('anychart.core.drawers.Marker');
goog.require('anychart.core.drawers.OHLC');
goog.require('anychart.core.drawers.RangeArea');
goog.require('anychart.core.drawers.RangeColumn');
goog.require('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers.RangeStick');
goog.require('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers.StepArea');
goog.require('anychart.core.drawers.StepLine');
goog.require('anychart.core.drawers.Stick');






/**
 * Default area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for area series.
 */
anychart.area = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.AREA);
  chart.setType(anychart.enums.ChartTypes.AREA);

  chart.setupInternal(true, anychart.getFullTheme('area'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['area'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.AREA] = anychart.area;


/**
 * Default bar chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.bar([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Bar chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for bar series.
 */
anychart.bar = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();

  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.BAR);
  chart.setType(anychart.enums.ChartTypes.BAR);

  chart.setupInternal(true, anychart.getFullTheme('bar'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['bar'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.BAR] = anychart.bar;


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
 * @return {anychart.cartesianModule.Chart} Chart with defaults for column series.
 */
anychart.box = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();

  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.BOX);
  chart.setType(anychart.enums.ChartTypes.BOX);

  chart.setupInternal(true, anychart.getFullTheme('box'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['box'](arguments[i]);
  }

  return chart;
};

anychart.chartTypesMap[anychart.enums.ChartTypes.BOX] = anychart.box;


/**
 * Default column chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.column([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for column series.
 */
anychart.column = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.COLUMN);
  chart.setType(anychart.enums.ChartTypes.COLUMN);

  chart.setupInternal(true, anychart.getFullTheme('column'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['column'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.COLUMN] = anychart.column;


/**
 * Default hilo chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.hilo([['p1', 2, 3], ['p2', 4, 8], ['p3', 6, 9]])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Hilo chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for hilo series.
 */
anychart.hilo = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.HILO);
  chart.setType(anychart.enums.ChartTypes.HILO);

  chart.setupInternal(true, anychart.getFullTheme('column'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['hilo'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.HILO] = anychart.hilo;


/**
 * Default financial chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * var chart = anychart.financial();
 * chart.ohlc([
 *    [Date.UTC(2013, 07, 04), 511.53, 514.98, 505.79, 506.40],
 *    [Date.UTC(2013, 07, 05), 507.84, 513.30, 507.23, 512.88],
 *    [Date.UTC(2013, 07, 06), 512.36, 515.40, 510.58, 511.40],
 *    [Date.UTC(2013, 07, 07), 513.10, 516.50, 511.47, 515.25],
 *    [Date.UTC(2013, 07, 08), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Finance chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for ohlc and candlestick series.
 */
anychart.financial = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();
  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.CANDLESTICK);
  chart.setType(anychart.enums.ChartTypes.FINANCIAL);

  chart.setupInternal(true, anychart.getFullTheme('financial'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['candlestick'](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.FINANCIAL] = anychart.financial;


/**
 * Default line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.line([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Line chart data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for line series.
 */
anychart.line = function(var_args) {
  anychart.performance.start('anychart.line()');
  var chart = new anychart.cartesianModule.Chart();

  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.LINE);
  chart.setType(anychart.enums.ChartTypes.LINE);

  chart.setupInternal(true, anychart.getFullTheme('line'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['line'](arguments[i]);
  }
  anychart.performance.end('anychart.line()');
  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.LINE] = anychart.line;


/**
 * Default vertical area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Series data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for vertical area series.
 */
anychart.verticalArea = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();

  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.AREA);
  chart.setType(anychart.enums.ChartTypes.VERTICAL_AREA);

  chart.setupInternal(true, anychart.getFullTheme('verticalArea'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart[anychart.enums.CartesianSeriesType.AREA](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.VERTICAL_AREA] = anychart.verticalArea;


/**
 * Default vertical line chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Series data.
 * @return {anychart.cartesianModule.Chart} Chart with defaults for vertical line series.
 */
anychart.verticalLine = function(var_args) {
  var chart = new anychart.cartesianModule.Chart();

  chart.setOption('defaultSeriesType', anychart.enums.CartesianSeriesType.LINE);
  chart.setType(anychart.enums.ChartTypes.VERTICAL_LINE);

  chart.setupInternal(true, anychart.getFullTheme('verticalLine'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart[anychart.enums.CartesianSeriesType.LINE](arguments[i]);
  }

  return chart;
};
anychart.chartTypesMap[anychart.enums.ChartTypes.VERTICAL_LINE] = anychart.verticalLine;


//exports
goog.exportSymbol('anychart.area', anychart.area);
goog.exportSymbol('anychart.bar', anychart.bar);
goog.exportSymbol('anychart.vertical', anychart.bar);
goog.exportSymbol('anychart.box', anychart.box);
goog.exportSymbol('anychart.column', anychart.column);
goog.exportSymbol('anychart.hilo', anychart.hilo);
goog.exportSymbol('anychart.financial', anychart.financial);
goog.exportSymbol('anychart.line', anychart.line);
goog.exportSymbol('anychart.verticalArea', anychart.verticalArea);
goog.exportSymbol('anychart.verticalLine', anychart.verticalLine);
