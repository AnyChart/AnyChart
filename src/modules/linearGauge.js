/**
 * @fileoverview anychart.modules.linearGauge namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.linearGauge');

goog.require('anychart.charts.LinearGauge');
goog.require('anychart.modules.base');


/**
 * Default linear gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.LinearGauge} Linear gauge with defaults.
 */
anychart.gauges.linear = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.LinearGauge();
  gauge.data(opt_data, opt_csvSettings);
  gauge.defaultPointerType(anychart.enums.LinearGaugePointerType.BAR);
  gauge.setType(anychart.enums.GaugeTypes.LINEAR);

  gauge.setupByVal(anychart.getFullTheme('linearGauge'), true);

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.LINEAR] = anychart.gauges.linear;


/**
 * Default bullet gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.LinearGauge} Linear gauge with defaults.
 */
anychart.gauges.bullet = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.LinearGauge();
  gauge.data(opt_data, opt_csvSettings);
  gauge.defaultPointerType(anychart.enums.LinearGaugePointerType.BAR);
  gauge.setType(anychart.enums.GaugeTypes.BULLET);

  gauge.setupByVal(anychart.getFullTheme('bullet'), true);

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.BULLET] = anychart.gauges.bullet;


/**
 * Default thermometer gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.LinearGauge} Linear gauge with defaults.
 */
anychart.gauges.thermometer = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.LinearGauge();
  gauge.data(opt_data, opt_csvSettings);
  gauge.defaultPointerType(anychart.enums.LinearGaugePointerType.THERMOMETER);
  gauge.setType(anychart.enums.GaugeTypes.THERMOMETER);

  gauge.setupByVal(anychart.getFullTheme('thermometerGauge'), true);

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.THERMOMETER] = anychart.gauges.thermometer;


/**
 * Default tank gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.LinearGauge} Linear gauge with defaults.
 */
anychart.gauges.tank = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.LinearGauge();
  gauge.data(opt_data, opt_csvSettings);
  gauge.defaultPointerType(anychart.enums.LinearGaugePointerType.TANK);
  gauge.setType(anychart.enums.GaugeTypes.TANK);

  gauge.setupByVal(anychart.getFullTheme('tankGauge'), true);

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.TANK] = anychart.gauges.tank;


/**
 * Default led gauge.<br/>
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser
 * settings here as a hash map.
 * @return {anychart.charts.LinearGauge} Linear gauge with defaults.
 */
anychart.gauges.led = function(opt_data, opt_csvSettings) {
  var gauge = new anychart.charts.LinearGauge();
  gauge.data(opt_data, opt_csvSettings);
  gauge.defaultPointerType(anychart.enums.LinearGaugePointerType.LED);
  gauge.setType(anychart.enums.GaugeTypes.LED);

  gauge.setupByVal(anychart.getFullTheme('ledGauge'), true);

  return gauge;
};
anychart.gaugeTypesMap[anychart.enums.GaugeTypes.LED] = anychart.gauges.led;

//exports
goog.exportSymbol('anychart.gauges.linear', anychart.gauges.linear);
//goog.exportSymbol('anychart.gauges.bullet', anychart.gauges.bullet);
goog.exportSymbol('anychart.gauges.thermometer', anychart.gauges.thermometer);
goog.exportSymbol('anychart.gauges.tank', anychart.gauges.tank);
goog.exportSymbol('anychart.gauges.led', anychart.gauges.led);
