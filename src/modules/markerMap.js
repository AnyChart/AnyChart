/**
 * @fileoverview anychart.modules.bubbleMap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.markerMap');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Marker');
goog.require('anychart.modules.base');


/**
 * Default bubble map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Map} Map with defaults for choropleth series.
 */
anychart.markerMap = function(var_args) {
  var map = new anychart.charts.Map();
  map.defaultSeriesType(anychart.enums.MapSeriesType.MARKER);

  map.setupByVal(anychart.getFullTheme('markerMap'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    map.marker(arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MARKER] = anychart.markerMap;

//exports
goog.exportSymbol('anychart.markerMap', anychart.markerMap);
