goog.provide('anychart.core.gauge.pointers.Knob');
goog.require('acgraph');
goog.require('anychart.core.gauge.pointers.Base');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Knob pointer class.<br/>
 * @constructor
 * @extends {anychart.core.gauge.pointers.Base}
 */
anychart.core.gauge.pointers.Knob = function() {
  goog.base(this);
  /**
   * @type {number}
   * @private
   */
  this.verticesCount_;

  /**
   * @type {number}
   * @private
   */
  this.verticesCurvature_;

  /**
   * @type {?string}
   * @private
   */
  this.topRadius_;

  /**
   * @type {?string}
   * @private
   */
  this.bottomRadius_;

  /**
   * @type {number}
   * @private
   */
  this.topRatio_;

  /**
   * @type {number}
   * @private
   */
  this.bottomRatio_;

  this.restoreDefaults();
};
goog.inherits(anychart.core.gauge.pointers.Knob, anychart.core.gauge.pointers.Base);


/**
 * Vertices count.
 * @param {(number)=} opt_value .
 * @return {(number|!anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.verticesCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.verticesCount_ != opt_value) {
      this.verticesCount_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.verticesCount_;
};


/**
 * @param {number=} opt_value .
 * @this {anychart.core.gauge.pointers.Knob}
 * @return {(number|!anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.verticesCurvature = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.verticesCurvature_ != opt_value) {
      this.verticesCurvature_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.verticesCurvature_;
};


/**
 * @param {(number)=} opt_value .
 * @return {(number|!anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.topRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.topRatio_ != opt_value) {
      this.topRatio_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.topRatio_;
};


/**
 * @param {(number)=} opt_value .
 * @return {(number|!anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.bottomRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.bottomRatio_ != opt_value) {
      this.bottomRatio_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.bottomRatio_;
};


/**
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.topRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
    if (this.topRadius_ != opt_value) {
      this.topRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.topRadius_;
};


/**
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Knob)} .
 */
anychart.core.gauge.pointers.Knob.prototype.bottomRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
    if (this.bottomRadius_ != opt_value) {
      this.bottomRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.bottomRadius_;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.axisIndex()));
  if (!this.checkDrawingNeeded() || !axis)
    return this;

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

    var iterator = gauge.data().getIterator();
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
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.startAngle() : gauge.startAngle());
    var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : gauge.sweepAngle());

    var pixTopRadius = goog.isDefAndNotNull(this.topRadius_) ?
        anychart.utils.normalizeSize(this.topRadius_, gauge.getPixRadius()) :
        axisRadius * .7;

    var pixBottomRadius = goog.isDefAndNotNull(this.bottomRadius_) ?
        anychart.utils.normalizeSize(this.bottomRadius_, gauge.getPixRadius()) :
        axisRadius * .6;

    var verticesSectorSweep = 360 / this.verticesCount_;
    var topVerticesSweep = (verticesSectorSweep / 2) * this.topRatio_;
    var bottomVerticesSweep = (verticesSectorSweep / 2) * this.bottomRatio_;

    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);
    var startAngle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
    var angle0, angle1, angle2;


    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['topRadius'] = pixTopRadius;
    this.contextProvider['bottomRadius'] = pixBottomRadius;
    this.contextProvider['angle'] = startAngle;


    var r0 = Math.abs(pixTopRadius - pixBottomRadius);
    var len0 = r0 / 2;
    var invert = pixTopRadius < pixBottomRadius;
    var r1 = invert ? pixBottomRadius - len0 : pixBottomRadius + len0;
    var curvatureSide = this.verticesCurvature_ < .5 ? -90 : 90;
    var curvatureValue = Math.abs(.5 - this.verticesCurvature_) * len0;

    var ax, ay, ax1, ay1, control1x, control1y, control2x, control2y, endX, endY, i;

    this.domElement.clear();

    for (i = 0; i < this.verticesCount_; i++) {
      angle0 = goog.math.standardAngle(startAngle + i * verticesSectorSweep);
      angle1 = goog.math.standardAngle(angle0 + (verticesSectorSweep - topVerticesSweep * 2) / 2);
      angle2 = goog.math.standardAngle(angle0 + verticesSectorSweep - bottomVerticesSweep);

      this.domElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angle0, bottomVerticesSweep, i != 0);

      ax = cx + Math.cos(goog.math.toRadians(angle1)) * r1;
      ay = cy + Math.sin(goog.math.toRadians(angle1)) * r1;
      ax1 = ax + Math.cos(goog.math.toRadians(angle1 + curvatureSide)) * curvatureValue;
      ay1 = ay + Math.sin(goog.math.toRadians(angle1 + curvatureSide)) * curvatureValue;
      control1x = ax1 + Math.cos(goog.math.toRadians(angle1 - 180)) * (curvatureValue * .5);
      control1y = ay1 + Math.sin(goog.math.toRadians(angle1 - 180)) * (curvatureValue * .5);
      control2x = ax1 + Math.cos(goog.math.toRadians(angle1)) * (curvatureValue * .5);
      control2y = ay1 + Math.sin(goog.math.toRadians(angle1)) * (curvatureValue * .5);
      endX = cx + Math.cos(goog.math.toRadians(angle1)) * pixTopRadius;
      endY = cy + Math.sin(goog.math.toRadians(angle1)) * pixTopRadius;

      if (invert) this.domElement.curveTo(control2x, control2y, control1x, control1y, endX, endY);
      else this.domElement.curveTo(control1x, control1y, control2x, control2y, endX, endY);

      ax = cx + Math.cos(goog.math.toRadians(angle2)) * r1;
      ay = cy + Math.sin(goog.math.toRadians(angle2)) * r1;
      ax1 = ax + Math.cos(goog.math.toRadians(angle2 + curvatureSide * -1)) * curvatureValue;
      ay1 = ay + Math.sin(goog.math.toRadians(angle2 + curvatureSide * -1)) * curvatureValue;
      control1x = ax1 + Math.cos(goog.math.toRadians(angle2)) * (curvatureValue * .5);
      control1y = ay1 + Math.sin(goog.math.toRadians(angle2)) * (curvatureValue * .5);
      control2x = ax1 + Math.cos(goog.math.toRadians(angle2 - 180)) * (curvatureValue * .5);
      control2y = ay1 + Math.sin(goog.math.toRadians(angle2 - 180)) * (curvatureValue * .5);
      endX = cx + Math.cos(goog.math.toRadians(angle2)) * pixBottomRadius;
      endY = cy + Math.sin(goog.math.toRadians(angle2)) * pixBottomRadius;

      this.domElement.circularArc(cx, cy, pixTopRadius, pixTopRadius, angle1, topVerticesSweep * 2);

      if (invert) this.domElement.curveTo(control2x, control2y, control1x, control1y, endX, endY);
      else this.domElement.curveTo(control1x, control1y, control2x, control2y, endX, endY);

      this.domElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angle2, bottomVerticesSweep);
    }

    this.domElement.close();

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();

      for (i = 0; i < this.verticesCount_; i++) {
        angle0 = goog.math.standardAngle(startAngle + i * verticesSectorSweep);
        angle1 = goog.math.standardAngle(angle0 + (verticesSectorSweep - topVerticesSweep * 2) / 2);
        angle2 = goog.math.standardAngle(angle0 + verticesSectorSweep - bottomVerticesSweep);

        this.hatchFillElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angle0, bottomVerticesSweep, i != 0);

        ax = cx + Math.cos(goog.math.toRadians(angle1)) * r1;
        ay = cy + Math.sin(goog.math.toRadians(angle1)) * r1;
        ax1 = ax + Math.cos(goog.math.toRadians(angle1 + curvatureSide)) * curvatureValue;
        ay1 = ay + Math.sin(goog.math.toRadians(angle1 + curvatureSide)) * curvatureValue;
        control1x = ax1 + Math.cos(goog.math.toRadians(angle1 - 180)) * (curvatureValue * .5);
        control1y = ay1 + Math.sin(goog.math.toRadians(angle1 - 180)) * (curvatureValue * .5);
        control2x = ax1 + Math.cos(goog.math.toRadians(angle1)) * (curvatureValue * .5);
        control2y = ay1 + Math.sin(goog.math.toRadians(angle1)) * (curvatureValue * .5);
        endX = cx + Math.cos(goog.math.toRadians(angle1)) * pixTopRadius;
        endY = cy + Math.sin(goog.math.toRadians(angle1)) * pixTopRadius;

        if (invert) this.hatchFillElement.curveTo(control2x, control2y, control1x, control1y, endX, endY);
        else this.hatchFillElement.curveTo(control1x, control1y, control2x, control2y, endX, endY);

        ax = cx + Math.cos(goog.math.toRadians(angle2)) * r1;
        ay = cy + Math.sin(goog.math.toRadians(angle2)) * r1;
        ax1 = ax + Math.cos(goog.math.toRadians(angle2 + curvatureSide * -1)) * curvatureValue;
        ay1 = ay + Math.sin(goog.math.toRadians(angle2 + curvatureSide * -1)) * curvatureValue;
        control1x = ax1 + Math.cos(goog.math.toRadians(angle2)) * (curvatureValue * .5);
        control1y = ay1 + Math.sin(goog.math.toRadians(angle2)) * (curvatureValue * .5);
        control2x = ax1 + Math.cos(goog.math.toRadians(angle2 - 180)) * (curvatureValue * .5);
        control2y = ay1 + Math.sin(goog.math.toRadians(angle2 - 180)) * (curvatureValue * .5);
        endX = cx + Math.cos(goog.math.toRadians(angle2)) * pixBottomRadius;
        endY = cy + Math.sin(goog.math.toRadians(angle2)) * pixBottomRadius;

        this.hatchFillElement.circularArc(cx, cy, pixTopRadius, pixTopRadius, angle1, topVerticesSweep * 2);

        if (invert) this.hatchFillElement.curveTo(control2x, control2y, control1x, control1y, endX, endY);
        else this.hatchFillElement.curveTo(control1x, control1y, control2x, control2y, endX, endY);

        this.hatchFillElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angle2, bottomVerticesSweep);
      }

      this.hatchFillElement.close();
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  goog.base(this, 'draw');
  return this;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.restoreDefaults = function() {
  goog.base(this, 'restoreDefaults');

  this.suspendSignalsDispatching();
  this.fill(/** @type {acgraph.vector.Fill} */({'keys': ['rgb(255, 255, 255)', 'rgb(220, 220, 220)'], 'angle': 135}));
  this.stroke('2 #ccc');
  this.verticesCount(6);
  this.verticesCurvature(.5);
  this.topRatio(.5);
  this.bottomRatio(.5);
  this.resumeSignalsDispatching(true);
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['verticesCount'] = this.verticesCount();
  json['verticesCurvature'] = this.verticesCurvature();
  json['topRatio'] = this.topRatio();
  json['bottomRatio'] = this.bottomRatio();
  if (goog.isDef(this.topRadius())) json['topRadius'] = this.topRadius();
  if (goog.isDef(this.bottomRadius())) json['bottomRadius'] = this.bottomRadius();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.verticesCount(config['verticesCount']);
  this.verticesCurvature(config['verticesCurvature']);
  this.topRatio(config['topRatio']);
  this.bottomRatio(config['bottomRatio']);
  this.topRadius(config['topRadius']);
  this.bottomRadius(config['bottomRadius']);
};


//exports
anychart.core.gauge.pointers.Knob.prototype['verticesCount'] = anychart.core.gauge.pointers.Knob.prototype.verticesCount;
anychart.core.gauge.pointers.Knob.prototype['verticesCurvature'] = anychart.core.gauge.pointers.Knob.prototype.verticesCurvature;
anychart.core.gauge.pointers.Knob.prototype['topRatio'] = anychart.core.gauge.pointers.Knob.prototype.topRatio;
anychart.core.gauge.pointers.Knob.prototype['bottomRatio'] = anychart.core.gauge.pointers.Knob.prototype.bottomRatio;
anychart.core.gauge.pointers.Knob.prototype['topRadius'] = anychart.core.gauge.pointers.Knob.prototype.topRadius;
anychart.core.gauge.pointers.Knob.prototype['bottomRadius'] = anychart.core.gauge.pointers.Knob.prototype.bottomRadius;
