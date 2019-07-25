goog.provide('anychart.stockModule.splitter.states.Hovered');

//region -- Requirements.
goog.require('anychart.core.Base');



//endregion
//region -- Constructor.
/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.splitter.states.Hovered = function() {
  anychart.stockModule.splitter.states.Hovered.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, 0]
  ]);
};
goog.inherits(anychart.stockModule.splitter.states.Hovered, anychart.core.Base);


//endregion
//region -- Descriptors.
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.splitter.states.Hovered.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.splitter.states.Hovered, anychart.stockModule.splitter.states.Hovered.DESCRIPTORS);


//endregion
//region -- Serialize/Deserialize.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.states.Hovered.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.splitter.states.Hovered.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.stockModule.splitter.states.Hovered.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.stockModule.splitter.states.Hovered.prototype.serialize = function() {
  var json = anychart.stockModule.splitter.states.Hovered.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.stockModule.splitter.states.Hovered.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


//endregion
