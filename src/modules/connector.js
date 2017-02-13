/**
 * @fileoverview anychart.modules.bubbleMap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.connector');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Connector');
goog.require('anychart.modules.base');


/**
 * Default connector map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Map} Map with defaults for choropleth series.
 */
anychart.connector = function(var_args) {
  var map = new anychart.charts.Map();
  map.defaultSeriesType(anychart.enums.MapSeriesType.CONNECTOR);

  map.setupByVal(anychart.getFullTheme('connector'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    map.connector(arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CONNECTOR] = anychart.connector;

//exports
goog.exportSymbol('anychart.connector', anychart.connector);
