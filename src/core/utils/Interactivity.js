goog.provide('anychart.core.utils.Interactivity');
goog.require('anychart.core.Base');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Interactivity = function(parent) {
  anychart.core.utils.Interactivity.base(this, 'constructor');

  /**
   * @type {anychart.core.Chart}
   * @private
   */
  this.parent_ = parent;

  /**
   * Descriptors meta.
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['spotRadius', 0, 0],
    ['multiSelectOnClick', 0, 0],
    ['unselectOnClickOutOfPoint', 0, 0],
    ['hoverMode', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['selectionMode', 0, 0],
    ['zoomOnMouseWheel', 0, 0],
    ['scrollOnMouseWheel', 0, 0]
  ]);
};
goog.inherits(anychart.core.utils.Interactivity, anychart.core.Base);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'spotRadius', anychart.utils.normalizeToNaturalNumber],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'multiSelectOnClick', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'unselectOnClickOutOfPoint', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hoverMode', anychart.enums.normalizeHoverMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectionMode', anychart.enums.normalizeSelectMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scrollOnMouseWheel', anychart.core.settings.booleanNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Interactivity, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Interactivity.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * @inheritDoc
 */
anychart.core.utils.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS, config, opt_default);
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.utils.Interactivity.prototype.serialize = function() {
  var json = {};
  anychart.core.settings.serialize(this, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS, json);
  return json;
};


//exports
(function() {
  // auto generated
  // proto['spotRadius'] = proto.spotRadius;
  // proto['multiSelectOnClick'] = proto.multiSelectOnClick;
  // proto['unselectOnClickOutOfPoint'] = proto.unselectOnClickOutOfPoint;
  // proto['hoverMode'] = proto.hoverMode;
  // proto['selectionMode'] = proto.selectionMode;
  // proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  // proto['scrollOnMouseWheel'] = proto.scrollOnMouseWheel;
})();
