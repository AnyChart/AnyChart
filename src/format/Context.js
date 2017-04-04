goog.provide('anychart.format.Context');

goog.require('anychart.core.BaseContext');
goog.require('anychart.format');



window['anychart']['format']['Context'] = function(opt_values, opt_dataSource, opt_statisticsSources) {
  window['anychart']['format']['Context'].base(this, 'constructor', opt_values, opt_dataSource, opt_statisticsSources);
};
goog.inherits(window['anychart']['format']['Context'], anychart.core.BaseContext);



/**
 * Common format context class. Actually is parent for anychart.format.Context to hide all not exported
 * methods from user to prototype.
 * DEV NOTE: No value must be set directly like context['val'] = val; Use constructor or propagate() instead!
 *
 * @param {Object.<string, anychart.core.BaseContext.TypedValue>=} opt_values - Typed values.
 * @param {(anychart.data.IRowInfo|anychart.data.ITreeDataInfo)=} opt_dataSource - Source for getData().
 * @param {Array.<anychart.core.BaseContext.StatisticsSource>=} opt_statisticsSources - Statistics sources. Must be set by priority.
 * @constructor
 * @extends {anychart.core.BaseContext}
 */
anychart.format.Context = goog.global['anychart']['format']['Context'];


/**
 * Gets data value by name.
 * @param {string} name - Name.
 * @return {*} - Value by name.
 * @deprecated Since 7.13.1. Use getData() instead.
 */
anychart.format.Context.prototype.getDataValue = function(name) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['getDataValue()', 'getData()'], true);
  return this.getData(name);
};


/**
 * Gets token value by name.
 * @param {string} name - Name.
 * @return {*} - Value by name.
 * @deprecated Since 7.13.1. Use getData(), getMeta() or getStat() directly instead.
 */
anychart.format.Context.prototype.getTokenValue = function(name) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['getTokenValue()', 'getData(), getMeta() or getStat() directly '], true);
  return this.getTokenValueInternal(name);
};


/**
 * Gets token type by name.
 * @param {string} name - Name.
 * @return {*} - Type by name.
 * @deprecated Since 7.13.1. Use getData(), getMeta() or getStat() directly instead.
 */
anychart.format.Context.prototype.getTokenType = function(name) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['getTokenType()', 'getData(), getMeta() or getStat() directly '], true);
  return this.getTokenTypeInternal(name);
};


/**
 * Gets series meta by name.
 * @param {string} name - Name.
 * @return {*} - Series meta by name.
 * @deprecated Since 7.13.1. Use getData(), getMeta() or getStat() directly instead.
 */
anychart.format.Context.prototype.getSeriesMeta = function(name) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null,
      ['getSeriesMeta()', 'this.series.meta()', ', works if context contains \'series\' field'], true);
  var values = this.values();
  return (values && values['series']) ? values['series'].value.meta(name) : void 0;
};


//exports
/** @suppress {deprecated} */
(function() {
  goog.exportSymbol('anychart.format.Context', anychart.format.Context);
  var proto = anychart.format.Context.prototype;

  proto['getData'] = proto.getData;
  proto['getMeta'] = proto.getMeta;
  proto['getStat'] = proto.getStat;

  proto['getDataValue'] = proto.getDataValue; //deprecated since 7.13.1
  proto['getTokenValue'] = proto.getTokenValue; //deprecated since 7.13.1
  proto['getTokenType'] = proto.getTokenType; //deprecated since 7.13.1
  proto['getSeriesMeta'] = proto.getSeriesMeta; //deprecated since 7.13.1
})();
