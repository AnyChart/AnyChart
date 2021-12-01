goog.provide('anychart.stockModule.Interactivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.stockModule.Interactivity = function(parent) {
  anychart.stockModule.Interactivity.base(this, 'constructor', parent);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['scrollOnMouseWheel', 0, 0]
  ]);
};
goog.inherits(anychart.stockModule.Interactivity, anychart.core.utils.Interactivity);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.stockModule.Interactivity.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'allowPlotDrag', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scrollOnMouseWheel', anychart.core.settings.booleanNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.stockModule.Interactivity, anychart.stockModule.Interactivity.PROPERTY_DESCRIPTORS);


//region --- setup/serialize
/** @inheritDoc */
anychart.stockModule.Interactivity.prototype.serialize = function() {
  var json = anychart.stockModule.Interactivity.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.stockModule.Interactivity.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.stockModule.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.stockModule.Interactivity.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.stockModule.Interactivity.PROPERTY_DESCRIPTORS, config);
};
//endregion

//region --- Export
(function() {
  // auto generated
  // proto['scrollOnMouseWheel'] = proto.scrollOnMouseWheel;
})();
//endregion
