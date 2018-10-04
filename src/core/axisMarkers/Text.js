goog.provide('anychart.core.axisMarkers.Text');
goog.provide('anychart.standalones.axisMarkers.Text');

goog.require('anychart.core.axisMarkers.TextBase');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.TextBase}
 */
anychart.core.axisMarkers.Text = function() {
  anychart.core.axisMarkers.Text.base(this, 'constructor');

  this.addThemes('defaultFontSettings', 'defaultLabelSettings', 'defaultTextMarkerSettings');

  var valueBeforeInvalidationHook = function() {
    this.invalidate(anychart.ConsistencyState.BOUNDS, this.getValueChangeSignals());
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['value', 0, 0, 0, valueBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.core.axisMarkers.Text, anychart.core.axisMarkers.TextBase);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axisMarkers.Text.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'value', anychart.core.settings.asIsNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.axisMarkers.Text, anychart.core.axisMarkers.Text.PROPERTY_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {(anychart.scales.Base|Object|anychart.enums.ScaleTypes)=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Text} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Text} */ (this.scaleInternal(opt_value));
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Text.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Text.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.axisMarkers.Text.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Text.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.axisMarkers.Text.PROPERTY_DESCRIPTORS, config, opt_default);
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.axisMarkers.Text}
 */
anychart.standalones.axisMarkers.Text = function() {
  anychart.standalones.axisMarkers.Text.base(this, 'constructor');

  this.addThemes('standalones.textAxisMarker');
};
goog.inherits(anychart.standalones.axisMarkers.Text, anychart.core.axisMarkers.Text);
anychart.core.makeStandalone(anychart.standalones.axisMarkers.Text, anychart.core.axisMarkers.Text);


/**
 * Constructor function.
 * @return {!anychart.standalones.axisMarkers.Text}
 */
anychart.standalones.axisMarkers.text = function() {
  return new anychart.standalones.axisMarkers.Text();
};


//endregion
//exports
(function() {
  var proto = anychart.core.axisMarkers.Text.prototype;
  // auto generated
  //proto['value'] = proto.value;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['layout'] = proto.layout;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['isHorizontal'] = proto.isHorizontal;

  proto = anychart.standalones.axisMarkers.Text.prototype;
  goog.exportSymbol('anychart.standalones.axisMarkers.text', anychart.standalones.axisMarkers.text);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
