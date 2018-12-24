//region Provide / Require
goog.provide('anychart.wordtreeModule.Connectors');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Tooltip');



//endregion
//region Constructor and descriptors
/**
 * Connectors base settings.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */

anychart.wordtreeModule.Connectors = function() {
  anychart.wordtreeModule.Connectors.base(this, 'constructor');
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS_META);
};
goog.inherits(anychart.wordtreeModule.Connectors, anychart.core.Base);


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'curveFactor', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offset', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'length', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.wordtreeModule.Connectors, anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.wordtreeModule.Connectors.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_REDRAW_APPEARANCE | anychart.Signal.BOUNDS_CHANGED;


/**
 * Descriptors meta.
 * @type {!Array.<Array>}
 */
anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS_META = (function() {
  return [
    ['curveFactor', 0, anychart.Signal.BOUNDS_CHANGED],
    ['offset', 0, anychart.Signal.BOUNDS_CHANGED],
    ['length', 0, anychart.Signal.BOUNDS_CHANGED],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ];
})();


//endregion
//region Serialize
/** @inheritDoc */
anychart.wordtreeModule.Connectors.prototype.serialize = function() {
  var json = anychart.wordtreeModule.Connectors.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.wordtreeModule.Connectors.prototype.setupByJSON = function(config, opt_default) {
  anychart.wordtreeModule.Connectors.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.wordtreeModule.Connectors.OWN_DESCRIPTORS, config, opt_default);
};
//endregion

