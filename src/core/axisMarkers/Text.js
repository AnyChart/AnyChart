goog.provide('anychart.core.axisMarkers.Text');

goog.require('anychart.core.axisMarkers.TextBase');



/**
 * Text marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.TextBase}
 */
anychart.core.axisMarkers.Text = function() {
  anychart.core.axisMarkers.Text.base(this, 'constructor');

};
goog.inherits(anychart.core.axisMarkers.Text, anychart.core.axisMarkers.TextBase);


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
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Text} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Text} */ (this.scaleInternal(opt_value));
};


/**
 * Get/set value.
 * @param {number=} opt_newValue TextMarker value settings.
 * @return {number|anychart.core.axisMarkers.Text} TextMarker value settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Text.prototype.value = function(opt_newValue) {
  return /** @type {number|anychart.core.axisMarkers.Text} */ (this.valueInternal(opt_newValue));

};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Text.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Text.base(this, 'serialize');
  json['value'] = this.value();
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Text.base(this, 'setupByJSON', config, opt_default);
  this.value(config['value']);
};


//exports
(function() {
  var proto = anychart.core.axisMarkers.Text.prototype;
  proto['value'] = proto.value;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['anchor'] = proto.anchor;
  proto['align'] = proto.align;
  proto['layout'] = proto.layout;
  proto['rotation'] = proto.rotation;
  proto['offsetX'] = proto.offsetX;
  proto['offsetY'] = proto.offsetY;
  proto['text'] = proto.text;
  proto['height'] = proto.height;
  proto['width'] = proto.width;
  proto['isHorizontal'] = proto.isHorizontal;
})();
