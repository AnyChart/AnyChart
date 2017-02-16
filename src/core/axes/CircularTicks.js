goog.provide('anychart.core.axes.CircularTicks');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Axis ticks class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axes.CircularTicks = function() {
  anychart.core.axes.CircularTicks.base(this, 'constructor');

  /**
   * Ticks length.
   * @type {?string}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string|Function}
   * @private
   */
  this.stroke_;

  /**
   * Ticks fill.
   * @type {acgraph.vector.Fill|string|Function}
   * @private
   */
  this.fill_;

  /**
   * Ticks position.
   * @type {anychart.enums.GaugeSidePosition}
   * @private
   */
  this.position_;

  /**
   * Ticks type.
   * @type {(string|anychart.enums.MarkerType|
   * function(acgraph.vector.Path, number, number, number): acgraph.vector.Path)}
   * @private
   */
  this.type_;

  /**
   * In this class ticks are markers. Its control by MarkersFactory.
   * @type {!anychart.core.ui.MarkersFactory}
   * @private
   */
  this.ticks_ = new anychart.core.ui.MarkersFactory();
  this.ticks_.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
  this.ticks_.size(10);
  this.ticks_.anchor(anychart.enums.Anchor.CENTER);
  this.ticks_.offsetX(0);
  this.ticks_.offsetY(0);
  this.ticks_.rotation(0);
  this.ticks_.setParentEventTarget(this);

  /**
   * Ticks hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|boolean}
   * @private
   */
  this.hatchFill_;

  /**
   * @type {Object}
   * @private
   */
  this.contextProvider_ = {};
};
goog.inherits(anychart.core.axes.CircularTicks, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.CircularTicks.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axes.CircularTicks.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Tick length.
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.axes.CircularTicks)} .
 */
anychart.core.axes.CircularTicks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.length_ != opt_value) {
      this.length_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.length_;
};


/**
 * @return {number}
 */
anychart.core.axes.CircularTicks.prototype.getPixLength = function() {
  return this.pixLength_;
};


/**
 * Tick stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.core.axes.CircularTicks|acgraph.vector.Stroke|Function)} .
 */
anychart.core.axes.CircularTicks.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Tick fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|string|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.axes.CircularTicks|acgraph.vector.Fill|Function)} .
 */
anychart.core.axes.CircularTicks.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke} Normalized color.
 * @protected
 */
anychart.core.axes.CircularTicks.prototype.normalizeColor = function(color) {
  var context = goog.object.clone(this.contextProvider_);
  return goog.isFunction(color) ?
      color.call(context, context) :
      color;
};


/**
 * Tick hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.axes.CircularTicks|boolean} Hatch fill.
 */
anychart.core.axes.CircularTicks.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    if (goog.isBoolean(opt_patternFillOrTypeOrState))
      opt_patternFillOrTypeOrState = opt_patternFillOrTypeOrState ?
          anychart.charts.CircularGauge.DEFAULT_HATCH_FILL_TYPE : 'none';

    var hatchFill = acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Tick type.
 * @param {(string|anychart.enums.MarkerType|
 * function(acgraph.vector.Path, number, number, number): acgraph.vector.Path)=} opt_value .
 * @return {(!anychart.core.axes.CircularTicks|string|anychart.enums.MarkerType|
 * function(acgraph.vector.Path, number, number, number): acgraph.vector.Path)} .
 */
anychart.core.axes.CircularTicks.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isFunction(opt_value))
      opt_value = (goog.isFunction(opt_value)) ?
          opt_value :
          anychart.enums.normalizeMarkerType(opt_value, anychart.enums.MarkerType.LINE);
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.type_;
};


/**
 * Tick position.
 * @param {(anychart.enums.SidePosition|string)=} opt_value [center] Position to set.
 * @return {(anychart.enums.SidePosition|string|!anychart.core.axes.CircularTicks)} .
 */
anychart.core.axes.CircularTicks.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeGaugeSidePosition(opt_value);
    if (this.position_ != opt_value)
      this.position_ = opt_value;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.position_;
};


/**
 * @return {number}
 */
anychart.core.axes.CircularTicks.prototype.getRadius = function() {
  return this.radius_;
};


/** @inheritDoc */
anychart.core.axes.CircularTicks.prototype.remove = function() {
  if (this.ticks_) this.ticks_.remove();
  if (this.hatchFillElement_) this.hatchFillElement_.remove();
};


/**
 * Start drawing.
 */
anychart.core.axes.CircularTicks.prototype.startDrawing = function() {
  this.pixLength_ = goog.isDefAndNotNull(this.length_) ?
      anychart.utils.normalizeSize(this.length_, this.axis_.getPixRadius()) :
      this.axis_.getPixWidth();
  this.radius_ = this.axis_.getPixRadius();
  if (this.position_ == anychart.enums.GaugeSidePosition.OUTSIDE)
    this.radius_ += this.axis_.getPixWidth() / 2 + this.pixLength_ / 2;
  else if (this.position_ == anychart.enums.GaugeSidePosition.INSIDE)
    this.radius_ -= this.axis_.getPixWidth() / 2 + this.pixLength_ / 2;

  this.contextProvider_['length'] = this.pixLength_;
  this.contextProvider_['radius'] = this.radius_;
  this.contextProvider_['cx'] = this.axis_.gauge().getCx();
  this.contextProvider_['cy'] = this.axis_.gauge().getCy();

  this.ticks_.clear();
  if (!goog.isFunction(this.stroke_))
    this.ticks_.stroke(this.stroke_);
  if (!goog.isFunction(this.fill_))
    this.ticks_.fill(this.fill_);
  this.ticks_.size(this.pixLength_ / 2);
  this.ticks_.type(this.type_);

  if (!this.hatchFillElement_ && !anychart.utils.isNone(this.hatchFill_)) {
    this.hatchFillElement_ = new anychart.core.ui.MarkersFactory();
    this.hatchFillElement_.positionFormatter(anychart.utils.DEFAULT_FORMATTER);
    this.hatchFillElement_.size(10);
    this.hatchFillElement_.anchor(anychart.enums.Anchor.CENTER);
    this.hatchFillElement_.offsetX(0);
    this.hatchFillElement_.offsetY(0);
    this.hatchFillElement_.rotation(0);
    this.hatchFillElement_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.hatchFillElement_.zIndex(anychart.core.axes.Circular.ZINDEX_TICK_HATCH_FILL);
  }

  if (this.hatchFillElement_) {
    this.hatchFillElement_.clear();
    this.hatchFillElement_.disablePointerEvents(true);
    this.hatchFillElement_.size(this.pixLength_ / 2);
    this.hatchFillElement_.type(this.type_);
    this.hatchFillElement_.fill(this.hatchFill_);
    this.hatchFillElement_.stroke(null);
  }
};


/**
 * @param {number} angle
 */
anychart.core.axes.CircularTicks.prototype.drawTick = function(angle) {
  var angleRad = goog.math.toRadians(angle);

  var cx = this.axis_.gauge().getCx();
  var cy = this.axis_.gauge().getCy();

  var x = cx + this.radius_ * Math.cos(angleRad);
  var y = cy + this.radius_ * Math.sin(angleRad);

  var tick = this.ticks_.add({'value': {'x': x, 'y': y}});
  var rotation = /** @type {number} */(goog.isDef(tick.rotation()) ? tick.rotation() : goog.isDef(this.ticks_.rotation()) ? this.ticks_.rotation() : 0);

  this.contextProvider_['rotation'] = rotation + angle + 90;
  this.contextProvider_['x'] = x;
  this.contextProvider_['y'] = y;
  this.contextProvider_['angle'] = angle;

  tick.rotation(rotation + angle + 90);
  if (goog.isFunction(this.fill_))
    tick.fill(/** @type {acgraph.vector.Fill} */(acgraph.vector.normalizeFill(
        /** @type {acgraph.vector.Fill} */(this.normalizeColor(this.fill_)))));
  if (goog.isFunction(this.stroke_))
    tick.stroke(/** @type {acgraph.vector.Stroke} */(acgraph.vector.normalizeStroke(
        /** @type {acgraph.vector.Stroke} */(this.normalizeColor(this.stroke_)))));

  if (this.hatchFillElement_) {
    var hatchFill = this.hatchFillElement_.add({'value': {'x': x, 'y': y}});
    hatchFill.rotation(rotation + angle + 90);
  }
};


/**
 * Renders ticks.
 * @return {!anychart.core.axes.CircularTicks} {@link anychart.core.axes.CircularTicks} instance for method chaining.
 */
anychart.core.axes.CircularTicks.prototype.finalizeDrawing = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());

    var multiplier = anychart.charts.CircularGauge.ZINDEX_MULTIPLIER * 0.1;
    this.ticks_.zIndex(zIndex + anychart.core.axes.Circular.ZINDEX_TICK * multiplier);
    if (this.hatchFillElement_)
      this.hatchFillElement_.zIndex(zIndex + anychart.core.axes.Circular.ZINDEX_TICK_HATCH_FILL * multiplier);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.ticks_.container(/** @type {acgraph.vector.ILayer} */ (this.container()));
    if (this.hatchFillElement_)
      this.hatchFillElement_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.ticks_.draw();

  if (this.hatchFillElement_)
    this.hatchFillElement_.draw();

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  return this;
};


/**
 * Link to axis.
 * @param {anychart.core.axes.Circular} axis Axis to set.
 */
anychart.core.axes.CircularTicks.prototype.setAxis = function(axis) {
  this.axis_ = axis;
};


/** @inheritDoc */
anychart.core.axes.CircularTicks.prototype.serialize = function() {
  var json = anychart.core.axes.CircularTicks.base(this, 'serialize');

  if (goog.isDef(this.length())) json['length'] = this.length();
  if (goog.isFunction(this['type'])) {
    if (goog.isFunction(this.type())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Gauge axis ticks type']);
    } else {
      json['type'] = this.type();
    }
  }
  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION, null, ['Ticks fill']);
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.core.reporting.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['Ticks stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  json['position'] = this.position();

  return json;
};


/** @inheritDoc */
anychart.core.axes.CircularTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axes.CircularTicks.base(this, 'setupByJSON', config, opt_default);

  this.length(config['length']);
  this.type(config['type']);
  this.stroke(config['stroke']);
  this.fill(config['fill']);
  this.hatchFill(config['hatchFill']);
  this.position(config['position']);
};


//exports
(function() {
  var proto = anychart.core.axes.CircularTicks.prototype;
  proto['length'] = proto.length;
  proto['type'] = proto.type;
  proto['stroke'] = proto.stroke;
  proto['fill'] = proto.fill;
  proto['hatchFill'] = proto.hatchFill;
  proto['position'] = proto.position;
})();
