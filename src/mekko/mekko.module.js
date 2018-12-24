/**
 * @fileoverview anychart.mekkoModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.mekkoModule.entry');

goog.require('anychart.mekkoModule.Chart');
goog.require('anychart.mekkoModule.Drawer');


/**
 * Returns a mekko chart instance with initial settings.
 * For yAxis uses default linear yScale. Points padding is set to 0.
 *
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.mekkoModule.Chart} Chart instance.
 */
anychart.mekko = function(var_args) {
  var chart = new anychart.mekkoModule.Chart(false);
  chart.setType(anychart.enums.ChartTypes.MEKKO);
  chart.setupAxes();
  chart.setupStateSettings();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['mekko'](arguments[i]);
  }
  return chart;
};


/**
 * Returns a mekko chart instance with initial settings.
 * For yAxis uses categories ordinal scale and sets points padding default value.
 *
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.mekkoModule.Chart} Chart instance.
 */
anychart.mosaic = function(var_args) {
  var chart = new anychart.mekkoModule.Chart(true);
  chart.addThemes('mosaic');
  chart.setType(anychart.enums.ChartTypes.MOSAIC);
  chart.setupAxes();
  chart.setupStateSettings();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['mekko'](arguments[i]);
  }
  return chart;
};


/**
 * Returns a barmekko chart instance with initial settings.
 * Same as mekko chart, but with yScale stack mode set to 'value'.
 *
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.mekkoModule.Chart} Chart instance.
 */
anychart.barmekko = function(var_args) {
  var chart = new anychart.mekkoModule.Chart(false, true);
  chart.addThemes('barmekko');
  chart.setType(anychart.enums.ChartTypes.BARMEKKO);
  chart.setupAxes();
  chart.setupStateSettings();

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['mekko'](arguments[i]);
  }
  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.MEKKO] = anychart.mekko;
anychart.chartTypesMap[anychart.enums.ChartTypes.MOSAIC] = anychart.mosaic;
anychart.chartTypesMap[anychart.enums.ChartTypes.BARMEKKO] = anychart.barmekko;


//exports
goog.exportSymbol('anychart.mekko', anychart.mekko);
goog.exportSymbol('anychart.mosaic', anychart.mosaic);
goog.exportSymbol('anychart.barmekko', anychart.barmekko);
