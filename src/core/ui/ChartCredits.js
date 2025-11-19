goog.provide('anychart.core.ui.ChartCredits');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');



/**
 * Define class Credits.<br/>
 * <b>Note:</b> Use method {@link anychart.ui.credits} to create instance of this class.<br/>
 * <b>Note:</b> You can't customize credits without <u>your licence key</u>. To buy licence key go to
 * <a href="http://www.anychart.com/buy/">Buy page</a>.
 * @param {!anychart.core.Chart} chart Chart.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.ui.ChartCredits = function(chart) {
  /**
   * Stage credits.
   * @type {anychart.core.Chart}
   * @private
   */
  this.chart_ = chart;

  anychart.core.ui.ChartCredits.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['text', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION],
    ['url', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION],
    ['alt', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION],
    ['imgAlt', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION],
    ['logoSrc', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION],
    ['enabled', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION]
  ]);
};
goog.inherits(anychart.core.ui.ChartCredits, anychart.core.Base);


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.APPEARANCE;


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


//region --- Descriptors and Meta
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.ChartCredits.prototype.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'text', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'url', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'alt', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'imgAlt', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'logoSrc', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.ChartCredits, anychart.core.ui.ChartCredits.prototype.PROPERTY_DESCRIPTORS);


//endregion
//region --- Serialization and Setup
/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.serialize = function() {
  var json = {};
  anychart.core.settings.serialize(this, this.PROPERTY_DESCRIPTORS, json, 'ChartCredits', this.descriptorsMeta);
  // chartType is needed to decern products used for validation and credits text in stage credits.
  var chartType = this.chart_.getType();
  if (goog.isDef(chartType)) {
    json['chartType'] = chartType;
  }
  return json;
};


/** @inheritDoc */
anychart.core.ui.ChartCredits.prototype.setupByJSON = function(config) {
  this.suspendSignalsDispatching();
  anychart.core.settings.deserialize(this, this.PROPERTY_DESCRIPTORS, config);
  this.resumeSignalsDispatching(true);
};


//exports
(function() {
  var proto = anychart.core.ui.ChartCredits.prototype;
})();
