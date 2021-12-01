goog.provide('anychart.waterfallModule.ArrowConnector');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings.IObjectWithSettings');



/**
 * Waterfall arrow connector settings.
 *
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.waterfallModule.ArrowConnector = function() {
  anychart.waterfallModule.ArrowConnector.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(
      this.descriptorsMeta,
      [
        ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
      ]
  );
};
goog.inherits(anychart.waterfallModule.ArrowConnector, anychart.core.Base);


/**
 * Arrow connector properties.
 *
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.waterfallModule.ArrowConnector.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.waterfallModule.ArrowConnector, anychart.waterfallModule.ArrowConnector.OWN_DESCRIPTORS);


/**
 * Signals supported by arrow connector.
 *
 * @type {number}
 */
anychart.waterfallModule.ArrowConnector.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/** @inheritDoc */
anychart.waterfallModule.ArrowConnector.prototype.serialize = function() {
  var json = anychart.waterfallModule.ArrowConnector.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.waterfallModule.ArrowConnector.OWN_DESCRIPTORS, json);

  return json;
};


/** @inheritDoc */
anychart.waterfallModule.ArrowConnector.prototype.setupByJSON = function(config, opt_default) {
  anychart.waterfallModule.ArrowConnector.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.waterfallModule.ArrowConnector.OWN_DESCRIPTORS, config, opt_default);
};
