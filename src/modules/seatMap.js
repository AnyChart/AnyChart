/**
 * @fileoverview anychart.modules.choropleth namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.seatMap');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Choropleth');
goog.require('anychart.modules.base');


/**
 * Default seat map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Map} Map with defaults for choropleth series.
 */
anychart.seatMap = function(var_args) {
  var map = new anychart.charts.Map();
  map.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);

  map.setupByVal(anychart.getFullTheme('seatMap'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    map.choropleth(arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.SEAT_MAP] = anychart.seatMap;

//exports
goog.exportSymbol('anychart.seatMap', anychart.seatMap);
