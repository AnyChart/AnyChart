goog.provide('anychart.modules.anymap');

goog.require('anychart.charts.Map');
goog.require('anychart.core.map.series.Bubble');
goog.require('anychart.core.map.series.Choropleth');
goog.require('anychart.modules.base');
goog.require('anychart.modules.bubbleMap');
goog.require('anychart.modules.choropleth');


/**
 * Default map.
 * @return {anychart.charts.Map} Map.
 */
anychart.map = function() {
  var chart = new anychart.charts.Map();
  var theme = anychart.getFullTheme();
  chart.setup(theme['map']);
  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MAP] = anychart.map;

//exports
goog.exportSymbol('anychart.map', anychart.map);


