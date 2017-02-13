/**
 * @fileoverview anychart.modules.anymap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.anymap');

goog.require('anychart.charts.Map');
goog.require('anychart.modules.base');
goog.require('anychart.modules.bubbleMap');
goog.require('anychart.modules.choropleth');
goog.require('anychart.modules.connector');
goog.require('anychart.modules.markerMap');
goog.require('anychart.modules.seatMap');


/**
 * Default map.
 * @return {anychart.charts.Map} Map.
 */
anychart.map = function() {
  var chart = new anychart.charts.Map();
  chart.setupByVal(anychart.getFullTheme('map'), true);
  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MAP] = anychart.map;

//exports
goog.exportSymbol('anychart.map', anychart.map);


