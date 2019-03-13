/**
 * @fileoverview anychart.circularGaugeModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.circularGaugeModule.entry');

goog.require('anychart.circularGaugeModule.Chart');


/**
 * Default circular gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.circularGaugeModule.Chart} Circular gauge with defaults.
 */
anychart.gauges.circular = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.circularGaugeModule.Chart(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.CircularGaugePointerType.NEEDLE);
  gauge.setupElements();

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.CIRCULAR] = anychart.gauges.circular;


//exports
goog.exportSymbol('anychart.gauges.circular', anychart.gauges.circular);
