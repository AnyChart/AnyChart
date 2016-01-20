goog.provide('anychart.charts.Cartesian');
goog.require('anychart.core.CartesianBase');



/**
 * Cartesian chart class.<br/>
 * To get the chart use any of these methods:
 *  <ul>
 *      <li>{@link anychart.cartesian}</li>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * Chart can contain any number of series.
 * Each series is interactive, you can customize click and hover behavior and other params.
 * @extends {anychart.core.CartesianBase}
 * @constructor
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 */
anychart.charts.Cartesian = function(opt_barChartMode) {
  anychart.charts.Cartesian.base(this, 'constructor', opt_barChartMode);
};
goog.inherits(anychart.charts.Cartesian, anychart.core.CartesianBase);


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.charts.Cartesian} Empty chart.
 */
anychart.cartesian = function(opt_barChartMode) {
  var chart = new anychart.charts.Cartesian(opt_barChartMode);
  chart.setup(anychart.getFullTheme()['cartesian']);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.CARTESIAN] = anychart.cartesian;


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.area}</li>
 *      <li>{@link anychart.bar}</li>
 *      <li>{@link anychart.column}</li>
 *      <li>{@link anychart.financial}</li>
 *      <li>{@link anychart.line}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesian();
 * chart.line([20, 7, 10, 14]);
 * @param {boolean=} opt_barChartMode If true, sets the chart to Bar Chart mode, swapping default chart elements
 *    behaviour to horizontal-oriented (setting default layout to VERTICAL, swapping axes, etc).
 * @return {!anychart.core.CartesianBase} Empty chart.
 * @deprecated Use anychart.cartesian() instead.
 */
anychart.cartesianChart = anychart.cartesian;

//exports
goog.exportSymbol('anychart.cartesian', anychart.cartesian);
goog.exportSymbol('anychart.cartesianChart', anychart.cartesianChart);
anychart.charts.Cartesian.prototype['xScale'] = anychart.charts.Cartesian.prototype.xScale;
anychart.charts.Cartesian.prototype['yScale'] = anychart.charts.Cartesian.prototype.yScale;
anychart.charts.Cartesian.prototype['barsPadding'] = anychart.charts.Cartesian.prototype.barsPadding;
anychart.charts.Cartesian.prototype['barGroupsPadding'] = anychart.charts.Cartesian.prototype.barGroupsPadding;
anychart.charts.Cartesian.prototype['crosshair'] = anychart.charts.Cartesian.prototype.crosshair;
anychart.charts.Cartesian.prototype['maxBubbleSize'] = anychart.charts.Cartesian.prototype.maxBubbleSize;
anychart.charts.Cartesian.prototype['minBubbleSize'] = anychart.charts.Cartesian.prototype.minBubbleSize;
anychart.charts.Cartesian.prototype['grid'] = anychart.charts.Cartesian.prototype.grid;
anychart.charts.Cartesian.prototype['minorGrid'] = anychart.charts.Cartesian.prototype.minorGrid;
anychart.charts.Cartesian.prototype['xAxis'] = anychart.charts.Cartesian.prototype.xAxis;
anychart.charts.Cartesian.prototype['yAxis'] = anychart.charts.Cartesian.prototype.yAxis;
anychart.charts.Cartesian.prototype['getSeries'] = anychart.charts.Cartesian.prototype.getSeries;
anychart.charts.Cartesian.prototype['area'] = anychart.charts.Cartesian.prototype.area;
anychart.charts.Cartesian.prototype['bar'] = anychart.charts.Cartesian.prototype.bar;
anychart.charts.Cartesian.prototype['box'] = anychart.charts.Cartesian.prototype.box;
anychart.charts.Cartesian.prototype['bubble'] = anychart.charts.Cartesian.prototype.bubble;
anychart.charts.Cartesian.prototype['candlestick'] = anychart.charts.Cartesian.prototype.candlestick;
anychart.charts.Cartesian.prototype['column'] = anychart.charts.Cartesian.prototype.column;
anychart.charts.Cartesian.prototype['line'] = anychart.charts.Cartesian.prototype.line;
anychart.charts.Cartesian.prototype['marker'] = anychart.charts.Cartesian.prototype.marker;
anychart.charts.Cartesian.prototype['ohlc'] = anychart.charts.Cartesian.prototype.ohlc;
anychart.charts.Cartesian.prototype['rangeArea'] = anychart.charts.Cartesian.prototype.rangeArea;
anychart.charts.Cartesian.prototype['rangeBar'] = anychart.charts.Cartesian.prototype.rangeBar;
anychart.charts.Cartesian.prototype['rangeColumn'] = anychart.charts.Cartesian.prototype.rangeColumn;
anychart.charts.Cartesian.prototype['rangeSplineArea'] = anychart.charts.Cartesian.prototype.rangeSplineArea;
anychart.charts.Cartesian.prototype['rangeStepArea'] = anychart.charts.Cartesian.prototype.rangeStepArea;
anychart.charts.Cartesian.prototype['spline'] = anychart.charts.Cartesian.prototype.spline;
anychart.charts.Cartesian.prototype['splineArea'] = anychart.charts.Cartesian.prototype.splineArea;
anychart.charts.Cartesian.prototype['stepLine'] = anychart.charts.Cartesian.prototype.stepLine;
anychart.charts.Cartesian.prototype['stepArea'] = anychart.charts.Cartesian.prototype.stepArea;
anychart.charts.Cartesian.prototype['lineMarker'] = anychart.charts.Cartesian.prototype.lineMarker;
anychart.charts.Cartesian.prototype['rangeMarker'] = anychart.charts.Cartesian.prototype.rangeMarker;
anychart.charts.Cartesian.prototype['textMarker'] = anychart.charts.Cartesian.prototype.textMarker;
anychart.charts.Cartesian.prototype['palette'] = anychart.charts.Cartesian.prototype.palette;
anychart.charts.Cartesian.prototype['markerPalette'] = anychart.charts.Cartesian.prototype.markerPalette;
anychart.charts.Cartesian.prototype['hatchFillPalette'] = anychart.charts.Cartesian.prototype.hatchFillPalette;
anychart.charts.Cartesian.prototype['getType'] = anychart.charts.Cartesian.prototype.getType;
anychart.charts.Cartesian.prototype['defaultSeriesType'] = anychart.charts.Cartesian.prototype.defaultSeriesType;
anychart.charts.Cartesian.prototype['addSeries'] = anychart.charts.Cartesian.prototype.addSeries;
anychart.charts.Cartesian.prototype['getSeriesAt'] = anychart.charts.Cartesian.prototype.getSeriesAt;
anychart.charts.Cartesian.prototype['getSeriesCount'] = anychart.charts.Cartesian.prototype.getSeriesCount;
anychart.charts.Cartesian.prototype['removeSeries'] = anychart.charts.Cartesian.prototype.removeSeries;
anychart.charts.Cartesian.prototype['removeSeriesAt'] = anychart.charts.Cartesian.prototype.removeSeriesAt;
anychart.charts.Cartesian.prototype['removeAllSeries'] = anychart.charts.Cartesian.prototype.removeAllSeries;
anychart.charts.Cartesian.prototype['getPlotBounds'] = anychart.charts.Cartesian.prototype.getPlotBounds;
anychart.charts.Cartesian.prototype['xZoom'] = anychart.charts.Cartesian.prototype.xZoom;
anychart.charts.Cartesian.prototype['xScroller'] = anychart.charts.Cartesian.prototype.xScroller;
