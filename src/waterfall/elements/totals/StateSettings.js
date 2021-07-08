goog.provide('anychart.waterfallModule.totals.StateSettings');

goog.require('anychart.core.StateSettings');



/**
 * Class that used to store total's state settings.
 *
 * @param {anychart.core.settings.IObjectWithSettings} stateHolder State holder.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta Descriptors for state.
 * @param {anychart.PointState|anychart.SettingsState} stateType
 * @param {!Array.<Array>=} opt_descriptorsOverride
 *
 * @constructor
 *
 * @extends {anychart.core.StateSettings}
 */
anychart.waterfallModule.totals.StateSettings = function(stateHolder, descriptorsMeta, stateType, opt_descriptorsOverride) {
  anychart.waterfallModule.totals.StateSettings.base(this, 'constructor', stateHolder, descriptorsMeta, stateType, opt_descriptorsOverride);
};
goog.inherits(anychart.waterfallModule.totals.StateSettings, anychart.core.StateSettings);


/**
 * Proxy request to labels factory.
 * @param {(Object|boolean|null)=} opt_config
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory|anychart.core.ui.CircularLabelsFactory|anychart.core.ui.LabelsSettings}
 */
anychart.waterfallModule.totals.StateSettings.prototype.label = function(opt_config) {
  return this.labels(opt_config);
};


/** @inheritDoc */
anychart.waterfallModule.totals.StateSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.totals.StateSettings.base(this, 'setupByJSON', config, opt_default);

  // Used for user setup only.
  if ('label' in config) {
    this.label(config['label']);
  }
};


(function() {
  var proto = anychart.waterfallModule.totals.StateSettings.prototype;

  proto['label'] = proto.label;
})();
