/**
 * @fileoverview anychart.modules.choropleth namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.choropleth');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Choropleth');
goog.require('anychart.modules.base');


/**
 * Default choropleth map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.charts.Map} Map with defaults for choropleth series.
 */
anychart.choropleth = function(var_args) {
  var map = new anychart.charts.Map();
  map.defaultSeriesType(anychart.enums.MapSeriesType.CHOROPLETH);

  map.setupByVal(anychart.getFullTheme('choropleth'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    map.choropleth(arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CHOROPLETH] = anychart.choropleth;

//exports
goog.exportSymbol('anychart.choropleth', anychart.choropleth);
