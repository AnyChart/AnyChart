goog.provide('anychart.core.axisMarkers.Text');

goog.require('anychart.core.axisMarkers.TextBase');
goog.require('anychart.enums');



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


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Text.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.layout_;
  }
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
  var json = goog.base(this, 'serialize');
  json['value'] = this.value();
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Text.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.value(config['value']);
};


//exports
anychart.core.axisMarkers.Text.prototype['value'] = anychart.core.axisMarkers.Text.prototype.value;
anychart.core.axisMarkers.Text.prototype['scale'] = anychart.core.axisMarkers.Text.prototype.scale;
anychart.core.axisMarkers.Text.prototype['anchor'] = anychart.core.axisMarkers.Text.prototype.anchor;
anychart.core.axisMarkers.Text.prototype['align'] = anychart.core.axisMarkers.Text.prototype.align;
anychart.core.axisMarkers.Text.prototype['layout'] = anychart.core.axisMarkers.Text.prototype.layout;
anychart.core.axisMarkers.Text.prototype['rotation'] = anychart.core.axisMarkers.Text.prototype.rotation;
anychart.core.axisMarkers.Text.prototype['offsetX'] = anychart.core.axisMarkers.Text.prototype.offsetX;
anychart.core.axisMarkers.Text.prototype['offsetY'] = anychart.core.axisMarkers.Text.prototype.offsetY;
anychart.core.axisMarkers.Text.prototype['text'] = anychart.core.axisMarkers.Text.prototype.text;
anychart.core.axisMarkers.Text.prototype['height'] = anychart.core.axisMarkers.Text.prototype.height;
anychart.core.axisMarkers.Text.prototype['width'] = anychart.core.axisMarkers.Text.prototype.width;
anychart.core.axisMarkers.Text.prototype['isHorizontal'] = anychart.core.axisMarkers.Text.prototype.isHorizontal;
