goog.provide('anychart.stockModule.splitter.states.Normal');

//region -- Requirements.
goog.require('anychart.core.Base');



//endregion
//region -- Constructor.
/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.stockModule.splitter.states.Normal = function() {
  anychart.stockModule.splitter.states.Normal.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.stockModule.splitter.states.Normal, anychart.core.Base);


//endregion
//region -- Signals.
/**
 * Supported signals.
 * @type {anychart.Signal|number}
 */
anychart.stockModule.splitter.states.Normal.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


//endregion
//region -- Descriptors.
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.splitter.states.Normal.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.stockModule.splitter.states.Normal, anychart.stockModule.splitter.states.Normal.DESCRIPTORS);


//endregion
//region -- Serialize/Deserialize.
/**
 * @inheritDoc
 */
anychart.stockModule.splitter.states.Normal.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.splitter.states.Normal.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.stockModule.splitter.states.Normal.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.stockModule.splitter.states.Normal.prototype.serialize = function() {
  var json = anychart.stockModule.splitter.states.Normal.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.stockModule.splitter.states.Normal.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


//endregion
