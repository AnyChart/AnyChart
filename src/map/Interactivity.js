goog.provide('anychart.mapModule.Interactivity');
goog.require('anychart.core.utils.Interactivity');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.utils.Interactivity}
 */
anychart.mapModule.Interactivity = function(parent) {
  anychart.mapModule.Interactivity.base(this, 'constructor', parent);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['zoomOnDoubleClick', 0, 0],
    ['keyboardZoomAndMove', 0, 0],
    ['drag', 0, 0],
    ['copyFormat', 0, 0]
  ]);
};
goog.inherits(anychart.mapModule.Interactivity, anychart.core.utils.Interactivity);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.mapModule.Interactivity.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomOnDoubleClick', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'keyboardZoomAndMove', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drag', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'copyFormat', anychart.core.settings.functionNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.mapModule.Interactivity, anychart.mapModule.Interactivity.PROPERTY_DESCRIPTORS);


//region --- setup/serialize
/** @inheritDoc */
anychart.mapModule.Interactivity.prototype.serialize = function() {
  var json = anychart.mapModule.Interactivity.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.mapModule.Interactivity.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.mapModule.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.mapModule.Interactivity.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.mapModule.Interactivity.PROPERTY_DESCRIPTORS, config);
};
//endregion

//region --- Export
(function() {
  // auto generated
  // proto['zoomOnDoubleClick'] = proto.zoomOnDoubleClick;
  // proto['keyboardZoomAndMove'] = proto.keyboardZoomAndMove;
  // proto['drag'] = proto.drag;
  // proto['copyFormat'] = proto.copyFormat;
})();
//endregion
