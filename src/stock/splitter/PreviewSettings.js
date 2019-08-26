goog.provide('anychart.stockModule.splitter.PreviewSettings');

//region -- Requirements.
goog.require('anychart.core.Base');



//endregion
//region -- Constructor.
/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.splitter.PreviewSettings = function() {
  anychart.stockModule.splitter.PreviewSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, 0]
  ]);

};
goog.inherits(anychart.stockModule.splitter.PreviewSettings, anychart.core.Base);


//endregion
//region -- Descriptors.
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.splitter.PreviewSettings.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.splitter.PreviewSettings, anychart.stockModule.splitter.PreviewSettings.DESCRIPTORS);


//endregion
//region -- Serialize/Deserialize.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.PreviewSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.splitter.PreviewSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.stockModule.splitter.PreviewSettings.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.stockModule.splitter.PreviewSettings.prototype.serialize = function() {
  var json = anychart.stockModule.splitter.PreviewSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.stockModule.splitter.PreviewSettings.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


//endregion

