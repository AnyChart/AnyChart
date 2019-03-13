/**
 * @fileoverview anychart.linearGaugeModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.linearGaugeModule.entry');

goog.require('anychart.linearGaugeModule.Chart');


/**
 * Default linear gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.linearGaugeModule.Chart} Linear gauge with defaults.
 */
anychart.gauges.linear = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.linearGaugeModule.Chart();
  gauge.data(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.LinearGaugePointerType.BAR);
  gauge.setType(anychart.enums.GaugeTypes.LINEAR);
  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.LINEAR] = anychart.gauges.linear;


/**
 * Default bullet gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.linearGaugeModule.Chart} Linear gauge with defaults.
 */
anychart.gauges.bullet = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.linearGaugeModule.Chart();
  gauge.addThemes('bullet');
  gauge.data(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.LinearGaugePointerType.BAR);
  gauge.setType(anychart.enums.GaugeTypes.BULLET);
  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.BULLET] = anychart.gauges.bullet;


/**
 * Default thermometer gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.linearGaugeModule.Chart} Linear gauge with defaults.
 */
anychart.gauges.thermometer = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.linearGaugeModule.Chart();
  gauge.addThemes('thermometer');
  gauge.data(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.LinearGaugePointerType.THERMOMETER);
  gauge.setType(anychart.enums.GaugeTypes.THERMOMETER);
  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.THERMOMETER] = anychart.gauges.thermometer;


/**
 * Default tank gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.linearGaugeModule.Chart} Linear gauge with defaults.
 */
anychart.gauges.tank = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.linearGaugeModule.Chart();
  gauge.addThemes('tank');
  gauge.data(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.LinearGaugePointerType.TANK);
  gauge.setType(anychart.enums.GaugeTypes.TANK);
  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.TANK] = anychart.gauges.tank;


/**
 * Default led gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.linearGaugeModule.Chart} Linear gauge with defaults.
 */
anychart.gauges.led = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.linearGaugeModule.Chart();
  gauge.addThemes('led');
  gauge.data(opt_data, opt_csvSettings);
  gauge.setOption('defaultPointerType', anychart.enums.LinearGaugePointerType.LED);
  gauge.setType(anychart.enums.GaugeTypes.LED);
  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.LED] = anychart.gauges.led;

//exports
goog.exportSymbol('anychart.gauges.linear', anychart.gauges.linear);
//goog.exportSymbol('anychart.gauges.bullet', anychart.gauges.bullet);
goog.exportSymbol('anychart.gauges.thermometer', anychart.gauges.thermometer);
goog.exportSymbol('anychart.gauges.tank', anychart.gauges.tank);
goog.exportSymbol('anychart.gauges.led', anychart.gauges.led);
