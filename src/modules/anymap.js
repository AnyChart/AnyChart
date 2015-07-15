goog.provide('anychart.modules.anymap');

goog.require('anychart.core.map.series.Choropleth');
goog.require('anychart.maps.Map');
goog.require('anychart.modules.base');


/**
 * Default map.
 * @return {anychart.maps.Map} Map.
 */
anychart.map = function() {
  return new anychart.maps.Map();
};
anychart.mapTypesMap[anychart.enums.MapTypes.MAP] = anychart.map;

//exports
goog.exportSymbol('anychart.map', anychart.map);


