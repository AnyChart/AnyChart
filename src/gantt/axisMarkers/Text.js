goog.provide('anychart.ganttModule.axisMarkers.Text');
goog.require('anychart.core.axisMarkers.TextBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt range marker.
 * @param {anychart.ganttModule.Scale} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.TextBase}
 */
anychart.ganttModule.axisMarkers.Text = function(scale) {
  anychart.ganttModule.axisMarkers.Text.base(this, 'constructor');

  this.scaleInternal(scale);

  /**
   * @type {anychart.enums.GanttDateTimeMarkers|number}
   */
  this.val = 0;

};
goog.inherits(anychart.ganttModule.axisMarkers.Text, anychart.core.axisMarkers.TextBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Text.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Text.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.TextBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.ganttModule.Scale=} opt_value Scale.
 * @return {anychart.ganttModule.Scale|!anychart.ganttModule.axisMarkers.Text} - Scale or itself for method chaining.
 */
anychart.ganttModule.axisMarkers.Text.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.ganttModule.Scale} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get line marker layout.
 * @param {anychart.enums.Layout=} opt_value - LineMarker layout.
 * @return {anychart.enums.Layout|anychart.ganttModule.axisMarkers.Text} - Layout or this.
 */
anychart.ganttModule.axisMarkers.Text.prototype.layout = function(opt_value) {
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
 * @return {number|anychart.enums.GanttDateTimeMarkers|anychart.ganttModule.axisMarkers.Text} - LineMarker value settings or LineMarker instance for method chaining.
 */
anychart.ganttModule.axisMarkers.Text.prototype.value = function(opt_newValue) {
  return /** @type {number|anychart.enums.GanttDateTimeMarkers|anychart.ganttModule.axisMarkers.Text} */ (this.valueInternal(opt_newValue));
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Text.prototype.serialize = function() {
  var json = anychart.ganttModule.axisMarkers.Text.base(this, 'serialize');
  json['value'] = this.value();
  return json;
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Text.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.axisMarkers.Text.base(this, 'setupByJSON', config, opt_default);
  this.value(config['value']);
};


//exports
(function() {
  var proto = anychart.ganttModule.axisMarkers.Text.prototype;
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
