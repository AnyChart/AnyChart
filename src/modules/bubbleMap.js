/**
 * @fileoverview anychart.modules.bubbleMap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.bubbleMap');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Bubble');
goog.require('anychart.modules.base');


/**
 * Default bubble map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Map} Map with defaults for choropleth series.
 */
anychart.bubbleMap = function(var_args) {
  var map = new anychart.charts.Map();

  map.defaultSeriesType(anychart.enums.MapSeriesType.BUBBLE);

  map.setupByVal(anychart.getFullTheme('bubbleMap'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    map.bubble(arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.BUBBLE] = anychart.bubbleMap;

//exports
goog.exportSymbol('anychart.bubbleMap', anychart.bubbleMap);
