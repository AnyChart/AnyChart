goog.provide('anychart.core.gauge.Cap');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.VisualBase');
goog.require('anychart.utils');



/**
 * Axis ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.gauge.Cap = function() {
  anychart.core.gauge.Cap.base(this, 'constructor');

  /**
   * Cap radius.
   * @type {string}
   * @private
   */
  this.radius_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Ticks fill.
   * @type {acgraph.vector.Fill|string}
   * @private
   */
  this.fill_;

  /**
   * Ticks hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|boolean}
   * @private
   */
  this.hatchFill_;

  /**
   * Root layer.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();

  /**
   * Cap dom element.
   * @type {!acgraph.vector.Circle}
   * @private
   */
  this.domElement_ = acgraph.circle();
};
goog.inherits(anychart.core.gauge.Cap, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.gauge.Cap.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_HATCH_FILL;


/**
 * Cap radius (c)cap.
 * @param {(number|string)=} opt_value .
 * @return {string|anychart.core.gauge.Cap} .
 */
anychart.core.gauge.Cap.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.radius_ != opt_value) {
      this.radius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Cap stroke (c)cap.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {(!anychart.core.gauge.Cap|acgraph.vector.Stroke)} .
 */
anychart.core.gauge.Cap.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Cap fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {(!anychart.core.gauge.Cap|acgraph.vector.Fill)} .
 */
anychart.core.gauge.Cap.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Cap hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|boolean|anychart.core.gauge.Cap} Hatch fill.
 */
anychart.core.gauge.Cap.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    if (goog.isBoolean(opt_patternFillOrTypeOrState))
      opt_patternFillOrTypeOrState = opt_patternFillOrTypeOrState ?
          anychart.charts.CircularGauge.DEFAULT_HATCH_FILL_TYPE : 'none';

    var hatchFill = acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill !== this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.GAUGE_HATCH_FILL,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hatchFill_;
};


/** @inheritDoc */
anychart.core.gauge.Cap.prototype.remove = function() {
  if (this.rootLayer_) this.rootLayer_.parent(null);
};


/**
 * Set/get link to gauge.
 * @param {anychart.charts.CircularGauge=} opt_gauge Gauge inst for set.
 * @return {anychart.core.gauge.Cap}
 */
anychart.core.gauge.Cap.prototype.gauge = function(opt_gauge) {
  if (goog.isDef(opt_gauge)) {
    if (this.gauge_ != opt_gauge) {
      this.gauge_ = opt_gauge;
    }
    return this;
  } else {
    return this.gauge_;
  }
};


/**
 * Drawing.
 * @return {anychart.core.gauge.Cap}
 */
anychart.core.gauge.Cap.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.domElement_.fill(this.fill_);
    this.domElement_.stroke(this.stroke_);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    if (!this.hatchFillElement_ && !anychart.utils.isNone(this.hatchFill_)) {
      this.hatchFillElement_ = acgraph.circle();
      this.hatchFillElement_.parent(this.rootLayer_);
      this.hatchFillElement_.zIndex(1);
    }

    if (this.hatchFillElement_) {
      this.hatchFillElement_.fill(this.hatchFill_);
      this.hatchFillElement_.stroke(null);

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_HATCH_FILL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.domElement_.parent(this.rootLayer_);
    if (this.hatchFillElement_)
      this.hatchFillElement_.parent(this.rootLayer_);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer_.zIndex(/** @type {number} */(this.zIndex()));
    this.domElement_.zIndex(0);
    if (this.hatchFillElement_)
      this.hatchFillElement_.zIndex(1);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var pixRadius = anychart.utils.normalizeSize(this.radius_, this.gauge_.getPixRadius());
    var cx = this.gauge_.getCx();
    var cy = this.gauge_.getCy();

    this.domElement_.centerX(cx);
    this.domElement_.centerY(cy);
    this.domElement_.radius(pixRadius < 0 ? 0 : pixRadius);

    if (this.hatchFillElement_) {
      this.hatchFillElement_.centerX(cx);
      this.hatchFillElement_.centerY(cy);
      this.hatchFillElement_.radius(pixRadius);
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.Cap.prototype.serialize = function() {
  var json = anychart.core.gauge.Cap.base(this, 'serialize');

  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));
  json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  json['radius'] = this.radius();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.Cap.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.Cap.base(this, 'setupByJSON', config, opt_default);

  this.fill(config['fill']);
  this.stroke(config['stroke']);
  this.hatchFill(config['hatchFill']);
  this.radius(config['radius']);
};


//exports
(function() {
  var proto = anychart.core.gauge.Cap.prototype;
  proto['radius'] = proto.radius;
  proto['stroke'] = proto.stroke;
  proto['fill'] = proto.fill;
  proto['hatchFill'] = proto.hatchFill;
})();
