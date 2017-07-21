/**
 * @fileoverview anychart.modules.anymap namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.mapModule.entry');

goog.require('anychart.mapModule.Chart');
goog.require('anychart.mapModule.drawers.Bubble');
goog.require('anychart.mapModule.drawers.Choropleth');
goog.require('anychart.mapModule.drawers.Connector');
goog.require('anychart.mapModule.drawers.Marker');


/**
 * Default map.
 * @return {anychart.mapModule.Chart} Map.
 */
anychart.map = function() {
  var chart = new anychart.mapModule.Chart();
  chart.setupInternal(true, anychart.getFullTheme('map'));
  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MAP] = anychart.map;


/**
 * Default bubble map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.bubbleMap = function(var_args) {
  var map = new anychart.mapModule.Chart();
  map.setOption('defaultSeriesType', anychart.enums.MapSeriesType.BUBBLE);
  map.setupInternal(true, anychart.getFullTheme('bubbleMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    map['bubble'](arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.BUBBLE] = anychart.bubbleMap;


/**
 * Default choropleth map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.choropleth = function(var_args) {
  var map = new anychart.mapModule.Chart();
  map.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CHOROPLETH);

  map.setupInternal(true, anychart.getFullTheme('choropleth'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    map['choropleth'](arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CHOROPLETH] = anychart.choropleth;


/**
 * Default connector map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.connector = function(var_args) {
  var map = new anychart.mapModule.Chart();
  map.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CONNECTOR);
  map.setupInternal(true, anychart.getFullTheme('connector'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    map['connector'](arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CONNECTOR] = anychart.connector;


/**
 * Default bubble map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.markerMap = function(var_args) {
  var map = new anychart.mapModule.Chart();
  map.setOption('defaultSeriesType', anychart.enums.MapSeriesType.MARKER);

  map.setupInternal(true, anychart.getFullTheme('markerMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    map['marker'](arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MARKER] = anychart.markerMap;


/**
 * Default seat map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.seatMap = function(var_args) {
  var map = new anychart.mapModule.Chart();
  map.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CHOROPLETH);

  map.setupInternal(true, anychart.getFullTheme('seatMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    map['choropleth'](arguments[i]);
  }

  return map;
};
anychart.mapTypesMap[anychart.enums.MapTypes.SEAT_MAP] = anychart.seatMap;


//exports
goog.exportSymbol('anychart.map', anychart.map);
goog.exportSymbol('anychart.bubbleMap', anychart.bubbleMap);
goog.exportSymbol('anychart.choropleth', anychart.choropleth);
goog.exportSymbol('anychart.connector', anychart.connector);
goog.exportSymbol('anychart.markerMap', anychart.markerMap);
goog.exportSymbol('anychart.seatMap', anychart.seatMap);


