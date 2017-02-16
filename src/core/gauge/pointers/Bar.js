goog.provide('anychart.core.gauge.pointers.Bar');
goog.require('acgraph');
goog.require('anychart.core.gauge.pointers.Base');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.core.gauge.pointers.Base}
 */
anychart.core.gauge.pointers.Bar = function() {
  anychart.core.gauge.pointers.Bar.base(this, 'constructor');

  /**
   * Pointer width.
   * @type {?string}
   * @private
   */
  this.width_;

  /**
   * Pointer position.
   * @type {anychart.enums.GaugeSidePosition}
   * @private
   */
  this.position_;

  /**
   * Pointer radius.
   * @type {?string}
   * @private
   */
  this.radius_;
};
goog.inherits(anychart.core.gauge.pointers.Bar, anychart.core.gauge.pointers.Base);


/**
 * Bar width. Sets in percent relative gauge radius.
 * @param {(number|string|null)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Bar)} .
 */
anychart.core.gauge.pointers.Bar.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.width_;
};


/**
 * Bar position relative axis - inside, center, outside.
 * @param {(anychart.enums.GaugeSidePosition|string)=} opt_value [center].
 * @return {(anychart.enums.GaugeSidePosition|string|!anychart.core.gauge.pointers.Bar)} .
 */
anychart.core.gauge.pointers.Bar.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeGaugeSidePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.position_;
};


/**
 * Bar pointer radius. Sets relative gauge radius in percent.
 * @param {(number|string|null)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Bar)} .
 */
anychart.core.gauge.pointers.Bar.prototype.radius = function(opt_value) {
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


/** @inheritDoc */
anychart.core.gauge.pointers.Bar.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.axisIndex()));
  if (!this.checkDrawingNeeded())
    return this;

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    if (this.hatchFillElement) this.hatchFillElement.clear();
    return this;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.hatchFill());
    if (!this.hatchFillElement && !anychart.utils.isNone(fill)) {
      this.hatchFillElement = acgraph.path();

      this.hatchFillElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.hatchFillElement.zIndex(/** @type {number} */(this.zIndex() + 1));
    }

    if (this.hatchFillElement) {
      this.hatchFillElement.disablePointerEvents(true);
      this.hatchFillElement.fill(fill);
      this.hatchFillElement.stroke(null);

      this.invalidate(anychart.ConsistencyState.BOUNDS);
    }

    this.markConsistent(anychart.ConsistencyState.GAUGE_HATCH_FILL);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var cx = gauge.getCx();
    var cy = gauge.getCy();

    var scale = axis.scale();

    var iterator = gauge.getResetIterator();
    iterator.select(/** @type {number} */(this.dataIndex()));
    var value = parseFloat(iterator.get('value'));

    if (scale.isMissing(value)) {
      if (this.domElement) this.domElement.clear();
      if (this.hatchFillElement) this.hatchFillElement.clear();

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      return this;
    }

    if (!this.domElement) {
      this.domElement = acgraph.path();
      this.registerDisposable(this.domElement);
    } else
      this.domElement.clear();

    var axisRadius = axis.getPixRadius();
    var axisWidth = axis.getPixWidth();
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
    var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : gauge.sweepAngle());

    var pixRadius = goog.isDefAndNotNull(this.radius_) ?
        anychart.utils.normalizeSize(this.radius_, gauge.getPixRadius()) :
        axisRadius;
    var pixWidth = goog.isDefAndNotNull(this.width_) ?
        anychart.utils.normalizeSize(this.width_, gauge.getPixRadius()) :
        axisWidth;

    var shift = (goog.isDef(this.radius_) ? pixWidth / 2 : pixWidth / 2 + axisWidth / 2);

    if (this.position_ == anychart.enums.GaugeSidePosition.OUTSIDE)
      pixRadius += shift;
    else if (this.position_ == anychart.enums.GaugeSidePosition.INSIDE)
      pixRadius -= shift;

    var zeroRatio = goog.math.clamp(scale.transform(0), 0, 1);
    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var fromRatio;
    var toRatio;
    if ((axisSweepAngle >= 0) ^ (valueRatio >= zeroRatio)) {
      fromRatio = valueRatio;
      toRatio = zeroRatio;
    } else {
      fromRatio = zeroRatio;
      toRatio = valueRatio;
    }

    var startAngle = goog.math.standardAngle(axisStartAngle + fromRatio * axisSweepAngle);
    var endAngle = goog.math.standardAngle(axisStartAngle + toRatio * axisSweepAngle);
    var sweepAngle = goog.math.standardAngle(endAngle - startAngle);
    if (!sweepAngle) sweepAngle = valueRatio == zeroRatio ? 0 : 360;

    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['radius'] = pixRadius;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['startAngle'] = goog.math.standardAngle(startAngle - anychart.charts.CircularGauge.DEFAULT_START_ANGLE);
    this.contextProvider['sweepAngle'] = sweepAngle;
    this.contextProvider['width'] = pixWidth;

    this.domElement.circularArc(
        cx,
        cy,
        pixRadius - pixWidth / 2,
        pixRadius - pixWidth / 2,
        startAngle,
        sweepAngle);

    this.domElement.circularArc(
        cx,
        cy,
        pixRadius + pixWidth / 2,
        pixRadius + pixWidth / 2,
        startAngle + sweepAngle,
        -sweepAngle, true);

    this.domElement.close();

    this.makeInteractive(/** @type {acgraph.vector.Path} */(this.domElement));

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();
      this.hatchFillElement.circularArc(
          cx,
          cy,
          pixRadius - pixWidth / 2,
          pixRadius - pixWidth / 2,
          startAngle,
          sweepAngle);

      this.hatchFillElement.circularArc(
          cx,
          cy,
          pixRadius + pixWidth / 2,
          pixRadius + pixWidth / 2,
          startAngle + sweepAngle,
          -sweepAngle, true);

      this.hatchFillElement.close();
    }

    if (goog.isFunction(this.fill()) || goog.isFunction(this.stroke()))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.core.gauge.pointers.Bar.base(this, 'draw');

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Bar.prototype.serialize = function() {
  var json = anychart.core.gauge.pointers.Bar.base(this, 'serialize');

  json['position'] = this.position();
  if (goog.isDef(this.width())) json['width'] = this.width();
  if (goog.isDef(this.radius())) json['radius'] = this.radius();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Bar.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.pointers.Bar.base(this, 'setupByJSON', config, opt_default);

  this.position(config['position']);
  this.width(config['width']);
  this.radius(config['radius']);
};


//exports
(function() {
  var proto = anychart.core.gauge.pointers.Bar.prototype;
  proto['width'] = proto.width;
  proto['position'] = proto.position;
  proto['radius'] = proto.radius;
})();
