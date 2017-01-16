goog.provide('anychart.core.axisMarkers.Line');

goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.core.axisMarkers.Line = function() {
  anychart.core.axisMarkers.Line.base(this, 'constructor');

  this.val = 0;

  /**
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.layout_;

  /**
   * @type {anychart.enums.Layout}
   * @private
   */
  this.defaultLayout_ = anychart.enums.Layout.HORIZONTAL;
};
goog.inherits(anychart.core.axisMarkers.Line, anychart.core.axisMarkers.PathBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.Line.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Direction.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker layout.
 * @param {anychart.enums.Layout=} opt_value - LineMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.Line} - Layout or this.
 */
anychart.core.axisMarkers.Line.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var layout = anychart.enums.normalizeLayout(opt_value);
    if (this.layout_ != layout) {
      this.layout_ = layout;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else if (this.layout_) {
    return this.layout_;
  } else if (this.axis()) {
    var axisOrientation = this.axis().orientation();
    var isHorizontal = (axisOrientation == anychart.enums.Orientation.LEFT || axisOrientation == anychart.enums.Orientation.RIGHT);
    return isHorizontal ? anychart.enums.Layout.HORIZONTAL : anychart.enums.Layout.VERTICAL;
  } else {
    return this.defaultLayout_;
  }
};


/**
 * Set Default layout.
 * @param {anychart.enums.Layout} value Layout value.
 */
anychart.core.axisMarkers.Line.prototype.setDefaultLayout = function(value) {
  var needInvalidate = !this.layout_ && this.defaultLayout_ != value;
  this.defaultLayout_ = value;
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for scale.
 * @param {anychart.scales.Base=} opt_value Scale.
 * @return {anychart.scales.Base|!anychart.core.axisMarkers.Line} Axis scale or itself for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.scale = function(opt_value) {
  return /** @type {anychart.scales.Base|!anychart.core.axisMarkers.Line} */ (this.scaleInternal(opt_value));
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
 * @return {!(anychart.core.axisMarkers.Line|acgraph.vector.Stroke)} LineMarker line settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
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
 * @param {number=} opt_newValue LineMarker value settings.
 * @return {number|anychart.core.axisMarkers.Line} - LineMarker value settings or LineMarker instance for method chaining.
 */
anychart.core.axisMarkers.Line.prototype.value = function(opt_newValue) {
  return /** @type {number|anychart.core.axisMarkers.Line} */ (this.valueInternal(opt_newValue));
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Line.prototype.boundsInvalidated = function() {
  this.drawLine();
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.Line.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(/** @type {acgraph.vector.Stroke} */(this.stroke_));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.disposeInternal = function() {
  delete this.stroke_;
  anychart.core.axisMarkers.Line.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.Line.base(this, 'serialize');
  json['value'] = this.value();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.Line.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.Line.base(this, 'setupByJSON', config, opt_default);
  this.value(config['value']);
  this.stroke(config['stroke']);
};


//exports
(function() {
  var proto = anychart.core.axisMarkers.Line.prototype;
  proto['value'] = proto.value;
  proto['scale'] = proto.scale;
  proto['axis'] = proto.axis;
  proto['layout'] = proto.layout;
  proto['stroke'] = proto.stroke;
  proto['isHorizontal'] = proto.isHorizontal;
})();
