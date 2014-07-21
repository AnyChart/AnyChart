goog.provide('anychart.cartesian.series');
/**
 * @namespace
 * @name anychart.cartesian.series
 */


/**
 * List of all series types.
 * @enum {string}
 */
anychart.cartesian.series.Type = {
  AREA: 'area',
  BAR: 'bar',
  BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  MARKER: 'marker',
  OHLC: 'ohlc',
  RANGE_AREA: 'rangearea',
  RANGE_BAR: 'rangebar',
  RANGE_COLUMN: 'rangecolumn',
  RANGE_SPLINE_AREA: 'rangesplinearea',
  RANGE_STEP_AREA: 'rangesteparea',
  SPLINE: 'spline',
  SPLINE_AREA: 'splinearea',
  STEP_AREA: 'steparea',
  STEP_LINE: 'stepline'
};


/**
 *
 * @type {Object}
 */
anychart.cartesian.series.seriesTypesMap = {};
