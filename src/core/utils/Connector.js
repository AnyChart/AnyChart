goog.provide('anychart.core.utils.Connector');
goog.require('anychart.core.Base');



/**
 * Connector settings class.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Connector = function() {
  anychart.core.utils.Connector.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW],
    ['length',
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.utils.Connector, anychart.core.Base);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.utils.Connector.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Connector.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Connector descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Connector.DESCRIPTORS = (function() {
  var map = {};
  anychart.core.settings.createDescriptors(map, [
      anychart.core.settings.descriptors.STROKE,
      anychart.core.settings.descriptors.LENGTH
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Connector, anychart.core.utils.Connector.DESCRIPTORS);


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.utils.Connector.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.utils.Connector.DESCRIPTORS, json, 'Connector');
  return json;
};


/** @inheritDoc */
anychart.core.utils.Connector.prototype.setupByJSON = function(config, opt_default) {
  goog.base(this, 'setupByJSON', config);
  if (opt_default) {
    anychart.core.settings.copy(this.themeSettings, anychart.core.utils.Connector.DESCRIPTORS, config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.utils.Connector.DESCRIPTORS, config);
  }
};


/** @inheritDoc */
anychart.core.utils.Connector.prototype.setupSpecial = function(isDefault, var_args) {
  var arg = arguments[1];
  var res = false;
  if (!isNaN(arg)) {
    this['length'](arg);
    res = true;
  } else if (goog.isString(arg)) {
    this['stroke'](arg);
    res = true;
  }
  return res;
};


//endregion
//exports
// stroke
// length
