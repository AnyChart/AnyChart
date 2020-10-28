goog.provide('anychart.format.Context');

goog.require('anychart.base');
goog.require('anychart.core.BaseContext');
goog.require('anychart.format');



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
anychart.module['format']['Context'] = function(opt_values, opt_dataSource, opt_statisticsSources) {
  anychart.module['format']['Context'].base(this, 'constructor', opt_values, opt_dataSource, opt_statisticsSources);
};
goog.inherits(anychart.module['format']['Context'], anychart.core.BaseContext);



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
anychart.format.Context = anychart.module['format']['Context'];


//exports
(function() {
  goog.exportSymbol('anychart.format.Context', anychart.format.Context);
  var proto = anychart.format.Context.prototype;

  proto['getData'] = proto.getData;
  proto['getMeta'] = proto.getMeta;
  proto['getStat'] = proto.getStat;
})();
