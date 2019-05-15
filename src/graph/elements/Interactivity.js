goog.provide('anychart.graphModule.elements.Interactivity');

goog.require('anychart.core.Base');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.graphModule.elements.Interactivity = function() {
  anychart.graphModule.elements.Interactivity.base(this, 'constructor');

  function turnOffZoom() {
    if (this.getOption('scrollOnMouseWheel'))
      this.setOption('zoomOnMouseWheel', false);
  }
  function turnOffScroll() {
    if (this.getOption('zoomOnMouseWheel'))
      this.setOption('scrollOnMouseWheel', false);
  }
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, 0],
    ['zoomOnMouseWheel', 0, 0, 0, turnOffScroll],
    ['scrollOnMouseWheel', 0, 0, 0, turnOffZoom],
    ['nodes', 0, 0], //can user drag nodes.
    ['edges', 0, anychart.Signal.NEEDS_REAPPLICATION], //can user drag nodes.
    ['magnetize', 0, 0], //stick nodes to sibling position.
    ['hoverGap', 0, anychart.Signal.NEEDS_REAPPLICATION] //stick nodes to sibling position.
  ]);
};
goog.inherits(anychart.graphModule.elements.Interactivity, anychart.core.Base);


/**
 * Supported signals.
 * @type {anychart.Signal|number}
 */
anychart.graphModule.elements.Interactivity.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Own property descriptors
 */
anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scrollOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'magnetize', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'nodes', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'edges', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hoverGap', anychart.core.settings.numberNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Interactivity, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS);


/** @inheritDoc */
anychart.graphModule.elements.Interactivity.prototype.setupSpecial = function(isDefault, var_args) {
  if (goog.isBoolean(var_args)) {
    this.enabled(var_args);
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.graphModule.elements.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Interactivity.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.graphModule.elements.Interactivity.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Interactivity.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS, json);
  return json;
};

