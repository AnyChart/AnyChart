goog.provide('anychart.ganttModule.axisMarkers.Line');

goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');
goog.require('anychart.core.reporting');
goog.require('anychart.enums');



/**
 * Gantt chart line marker.
 * @param {anychart.ganttModule.Scale} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.ganttModule.axisMarkers.Line = function(scale) {
  anychart.ganttModule.axisMarkers.Line.base(this, 'constructor');

  this.scaleInternal(scale);

  this.val = 0;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;
};
goog.inherits(anychart.ganttModule.axisMarkers.Line, anychart.core.axisMarkers.PathBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Line.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.axisMarkers.Line.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.ganttModule.Scale=} opt_value Scale.
 * @return {anychart.ganttModule.Scale|!anychart.ganttModule.axisMarkers.Line} - Scale or itself for method chaining.
 */
anychart.ganttModule.axisMarkers.Line.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.ganttModule.Scale} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.ganttModule.axisMarkers.Line|acgraph.vector.Stroke)} LineMarker line settings or LineMarker instance for method chaining.
 */
anychart.ganttModule.axisMarkers.Line.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Get/set value.
 * @param {(number|anychart.enums.GanttDateTimeMarkers)=} opt_newValue - LineMarker value settings.
 * @return {number|anychart.enums.GanttDateTimeMarkers|anychart.ganttModule.axisMarkers.Line} - LineMarker value settings or LineMarker instance for method chaining.
 */
anychart.ganttModule.axisMarkers.Line.prototype.value = function(opt_newValue) {
  return /** @type {number|anychart.enums.GanttDateTimeMarkers|anychart.ganttModule.axisMarkers.Line} */ (this.valueInternal(opt_newValue));
};


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.core.reporting.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.boundsInvalidated = function() {
  this.drawLine();
};


/**
 * @inheritDoc
 */
anychart.ganttModule.axisMarkers.Line.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke_));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.disposeInternal = function() {
  delete this.stroke_;
  anychart.ganttModule.axisMarkers.Line.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.serialize = function() {
  var json = anychart.ganttModule.axisMarkers.Line.base(this, 'serialize');
  json['value'] = this.value();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.ganttModule.axisMarkers.Line.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.axisMarkers.Line.base(this, 'setupByJSON', config, opt_default);
  this.value(config['value']);
  this.stroke(config['stroke']);
};


//exports
(function() {
  var proto = anychart.ganttModule.axisMarkers.Line.prototype;
  proto['value'] = proto.value;
  proto['scale'] = proto.scale;
  proto['layout'] = proto.layout;
  proto['stroke'] = proto.stroke;
  proto['isHorizontal'] = proto.isHorizontal;
})();
