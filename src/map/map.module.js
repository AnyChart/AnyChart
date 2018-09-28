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
  chart.setupStateSettings();
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
  var chart = new anychart.mapModule.Chart();
  chart.setupStateSettings();
  chart.setOption('defaultSeriesType', anychart.enums.MapSeriesType.BUBBLE);
  chart.setupInternal(true, anychart.getFullTheme('bubbleMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['bubble'](arguments[i]);
  }

  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.BUBBLE] = anychart.bubbleMap;


/**
 * Default choropleth map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.choropleth = function(var_args) {
  var chart = new anychart.mapModule.Chart();
  chart.setupStateSettings();
  chart.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CHOROPLETH);

  chart.setupInternal(true, anychart.getFullTheme('choropleth'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['choropleth'](arguments[i]);
  }

  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CHOROPLETH] = anychart.choropleth;


/**
 * Default connector map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.connector = function(var_args) {
  var chart = new anychart.mapModule.Chart();
  chart.setupStateSettings();
  chart.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CONNECTOR);
  chart.setupInternal(true, anychart.getFullTheme('connector'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['connector'](arguments[i]);
  }

  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.CONNECTOR] = anychart.connector;


/**
 * Default bubble map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.markerMap = function(var_args) {
  var chart = new anychart.mapModule.Chart();
  chart.setupStateSettings();
  chart.setOption('defaultSeriesType', anychart.enums.MapSeriesType.MARKER);

  chart.setupInternal(true, anychart.getFullTheme('markerMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['marker'](arguments[i]);
  }

  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.MARKER] = anychart.markerMap;


/**
 * Default seat map.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Column chart data.
 * @return {anychart.mapModule.Chart} Map with defaults for choropleth series.
 */
anychart.seatMap = function(var_args) {
  var chart = new anychart.mapModule.Chart();
  chart.setupStateSettings();
  chart.setOption('defaultSeriesType', anychart.enums.MapSeriesType.CHOROPLETH);

  chart.setupInternal(true, anychart.getFullTheme('seatMap'));

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['choropleth'](arguments[i]);
  }

  return chart;
};
anychart.mapTypesMap[anychart.enums.MapTypes.SEAT_MAP] = anychart.seatMap;


//exports
goog.exportSymbol('anychart.map', anychart.map);
goog.exportSymbol('anychart.bubbleMap', anychart.bubbleMap);
goog.exportSymbol('anychart.choropleth', anychart.choropleth);
goog.exportSymbol('anychart.connector', anychart.connector);
goog.exportSymbol('anychart.markerMap', anychart.markerMap);
goog.exportSymbol('anychart.seatMap', anychart.seatMap);


