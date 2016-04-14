/**
 * @fileoverview anychart.modules.circularGauge namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.circularGauge');

goog.require('anychart.charts.CircularGauge');
goog.require('anychart.modules.base');


/**
 * Default circular gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.CircularGauge} Circular gauge with defaults.
 */
anychart.circularGauge = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.CircularGauge(opt_data, opt_csvSettings);
  var theme = anychart.getFullTheme();

  gauge.setup(theme['circularGauge']);

  return gauge;
};


anychart.gaugeTypesMap[anychart.enums.GaugeTypes.CIRCULAR] = anychart.circularGauge;

//exports
goog.exportSymbol('anychart.circularGauge', anychart.circularGauge);
