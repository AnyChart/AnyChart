goog.provide('anychart.data');

goog.require('anychart.data.ConcatView');
goog.require('anychart.data.FilterView');
goog.require('anychart.data.OrdinalView');
goog.require('anychart.data.PieView');
goog.require('anychart.data.ScatterView');
goog.require('anychart.data.Set');
goog.require('anychart.data.SortView');
goog.require('anychart.data.Tree');
goog.require('anychart.data.csv.Parser');
goog.require('anychart.enums');

/**
 Classes for handling data structures/sources<br/>
 The following data types/hierarchy is supported:
 <ul>
  <li>Linear ({@link anychart.data.Set})</li>
  <li>Tree ({@link anychart.data.Tree})</li>
  <li>Table ({@link anychart.data.Table})</li>
 </ul>
 You can map any of these data sets to ({@link anychart.data.View}), and then
 work with it using {@link anychart.data.Iterator} iterator.
 @namespace
 @name anychart.data
 */


/**
 * Maps passed data as an array of mappings. Data is expected to be a table, e.g. an array of arrays of values.
 * The function treats the table as a source for several series of points, that have the same X value.
 * Each row of the table is treated as a bunch of points, one for each series. Column number 0 is treated as an X value.
 * Other columns (number per series depends on the opt_mode) are treated as data values.
 * @param {Array.<Array.<*>>} data Source data table.
 * @param {(anychart.enums.MapAsTableMode|string)=} opt_mode Mapping mode. VALUE means, that each series
 *    is represented by one column in the table + shared X column (own Y values), RANGE means two columns per series
 *    + shared X column (high and low values) and OHLC means four columns per series + shared X (open, high, low, close).
 * @param {number=} opt_seriesCount Explicit number of series to make mapping for. If not set, auto-determination by
 *    the first table row is used.
 * @return {!Array.<anychart.data.Mapping>} Returns an array of mappings, one per series.
 */
anychart.data.mapAsTable = function(data, opt_mode, opt_seriesCount) {
  if (!data || !goog.isArray(data)) return [];
  var columnsPerSeries;
  if (goog.isDef(opt_mode)) {
    opt_mode = String(opt_mode).toLowerCase();
    switch (opt_mode) {
      case anychart.enums.MapAsTableMode.RANGE:
        columnsPerSeries = 2;
        break;
      case anychart.enums.MapAsTableMode.OHLC:
        columnsPerSeries = 4;
        break;
      default:
        columnsPerSeries = 1;
        break;
    }
  } else {
    columnsPerSeries = 1;
  }
  var seriesCount;
  if (!goog.isDef(opt_seriesCount) ||
      isNaN(seriesCount = anychart.utils.normalizeToNaturalNumber(opt_seriesCount, NaN, false))) {
    if (goog.isArray(data[0])) {
      seriesCount = Math.floor((data[0].length - 1) / columnsPerSeries);
    } else {
      seriesCount = 0;
    }
  }
  if (isNaN(seriesCount) || seriesCount <= 0)
    return [];
  var dataSet = new anychart.data.Set(data);
  var i;
  var res = [];
  if (columnsPerSeries == 1) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'value': [1 + i]
      }));
    }
  } else if (columnsPerSeries == 2) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'low': [1 + i * 2 + 0],
        'high': [1 + i * 2 + 1]
      }));
    }
  } else if (columnsPerSeries == 4) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'open': [1 + i * 4 + 0],
        'high': [1 + i * 4 + 1],
        'low': [1 + i * 4 + 2],
        'close': [1 + i * 4 + 3]
      }));
    }
  }
  return res;
};


//exports
goog.exportSymbol('anychart.data.mapAsTable', anychart.data.mapAsTable);
