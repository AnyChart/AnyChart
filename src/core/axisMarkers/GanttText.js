goog.provide('anychart.core.axisMarkers.GanttText');
goog.require('anychart.core.axisMarkers.TextBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt range marker.
 * @param {anychart.scales.GanttDateTime} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.TextBase}
 */
anychart.core.axisMarkers.GanttText = function(scale) {
  anychart.core.axisMarkers.GanttText.base(this, 'constructor');

  this.scaleInternal(scale);

  /**
   * @type {anychart.enums.GanttDateTimeMarkers|number}
   */
  this.val = 0;

};
goog.inherits(anychart.core.axisMarkers.GanttText, anychart.core.axisMarkers.TextBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.GanttText.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.GanttText.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.scales.GanttDateTime=} opt_value Scale.
 * @return {anychart.scales.GanttDateTime|!anychart.core.axisMarkers.GanttText} - Scale or itself for method chaining.
 */
anychart.core.axisMarkers.GanttText.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get line marker layout.
 * @param {anychart.enums.Layout=} opt_value - LineMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.GanttText} - Layout or this.
 */
anychart.core.axisMarkers.GanttText.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


/**
 * Get/set value.
 * @param {(number|anychart.enums.GanttDateTimeMarkers)=} opt_newValue - LineMarker value settings.
 * @return {number|anychart.enums.GanttDateTimeMarkers|anychart.core.axisMarkers.GanttText} - LineMarker value settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.GanttText.prototype.value = function(opt_newValue) {
  return /** @type {number|anychart.enums.GanttDateTimeMarkers|anychart.core.axisMarkers.GanttText} */ (this.valueInternal(opt_newValue));
};


/** @inheritDoc */
anychart.core.axisMarkers.GanttText.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.GanttText.base(this, 'serialize');
  json['value'] = this.value();
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.GanttText.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.GanttText.base(this, 'setupByJSON', config, opt_default);
  this.value(config['value']);
};


//exports
(function() {
  var proto = anychart.core.axisMarkers.GanttText.prototype;
  proto['value'] = proto.value;
  proto['scale'] = proto.scale;
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
