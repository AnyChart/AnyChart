goog.provide('anychart.core.utils.Crossing');
goog.require('anychart.core.Base');



/**
 * Settings class for crossing.
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.utils.Crossing = function() {
  anychart.core.utils.Crossing.base(this, 'constructor');

  anychart.core.settings.createDescriptorMeta(this.descriptorsMeta, 'stroke', 0, anychart.Signal.NEEDS_REDRAW);
};
goog.inherits(anychart.core.utils.Crossing, anychart.core.Base);


//region --- descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Crossing.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(map, anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Crossing, anychart.core.utils.Crossing.prototype.SIMPLE_PROPS_DESCRIPTORS);
//endregion


//region --- infrastructure
/** @inheritDoc */
anychart.core.utils.Crossing.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- setup/dispose
/** @inheritDoc */
anychart.core.utils.Crossing.prototype.serialize = function() {
  var json = anychart.core.utils.Crossing.base(this, 'serialize');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.Crossing.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.core.utils.Crossing.prototype.disposeInternal = function() {
  this.stroke_ = null;
  anychart.core.utils.Crossing.base(this, 'disposeInternal');
};
//endregion
