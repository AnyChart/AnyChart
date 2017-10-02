goog.provide('anychart.radarPolarBaseModule.RadialAxisTicks');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');



/**
 * Axis radar ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.radarPolarBaseModule.RadialAxisTicks = function() {
  anychart.radarPolarBaseModule.RadialAxisTicks.base(this, 'constructor');

  /**
   * Ticks length.
   * @type {number|string}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Path with ticks.
   * @type {!acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();
  this.bindHandlersToGraphics(this.path_);
  this.registerDisposable(this.path_);
};
goog.inherits(anychart.radarPolarBaseModule.RadialAxisTicks, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for length.
 * @param {(number|string)=} opt_value .
 * @return {(string|number|!anychart.radarPolarBaseModule.RadialAxisTicks)} .
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeNumberOrPercent(opt_value) || 0;
    if (this.length_ != val) {
      this.length_ = val;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.length_;
};


/**
 * Getter/setter for stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!(anychart.radarPolarBaseModule.RadialAxisTicks|acgraph.vector.Stroke)} .
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != stroke) {
      this.stroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.radarPolarBaseModule.RadialAxisTicks} {@link anychart.core.AxisTicks} instance for method chaining.
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.draw = function() {
  this.path_.clear();
  this.path_.stroke(this.stroke_);

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path_.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path_.parent(/** @type {acgraph.vector.ILayer} */ (this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Axis ticks drawer for top orientation.
 * @param {number} x .
 * @param {number} y .
 * @param {number} x1 .
 * @param {number} y1 .
 */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.drawTick = function(x, y, x1, y1) {
  this.path_.moveTo(x, y);
  this.path_.lineTo(x1, y1);
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.serialize = function() {
  var json = anychart.radarPolarBaseModule.RadialAxisTicks.base(this, 'serialize');
  json['length'] = this.length();
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  return json;
};


/** @inheritDoc */
anychart.radarPolarBaseModule.RadialAxisTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.radarPolarBaseModule.RadialAxisTicks.base(this, 'setupByJSON', config, opt_default);
  this.length(config['length']);
  this.stroke(config['stroke']);
};


//exports
(function() {
  var proto = anychart.radarPolarBaseModule.RadialAxisTicks.prototype;
  proto['length'] = proto.length;
  proto['stroke'] = proto.stroke;
})();
