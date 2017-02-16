goog.provide('anychart.core.gauge.pointers.Knob');
goog.require('acgraph');
goog.require('anychart.core.gauge.pointers.Base');
goog.require('anychart.utils');



/**
 * Knob pointer class.<br/>
 * @constructor
 * @extends {anychart.core.gauge.pointers.Base}
 */
anychart.core.gauge.pointers.Knob = function() {
  anychart.core.gauge.pointers.Knob.base(this, 'constructor');
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
    opt_value = goog.math.clamp(opt_value, 0, 1);
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
    opt_value = goog.math.clamp(opt_value, 0, 1);
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
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
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
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.bottomRadius_ != opt_value) {
      this.bottomRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.bottomRadius_;
};


/**
 * Drawing vertices sides.
 * @param {acgraph.vector.Path} path Path for drawing.
 * @param {number} asvs AngleStartVertexSector Angle where vertex sector started.
 * @param {number} vss VerticesSectorSweep Sweep of vertex sector.
 * @param {number} tvs TopVerticesSweep Half sweep of vertex sector part that placed under the top radius.
 * @param {number} bvs BottomVerticesSweep Sweep of vertex sector parts that placed under the top bottom. Sweep of one it part.
 * @param {number} ptr PixTopRadius Pixel value of top knob radius.
 * @param {number} pbr PixBottomRadius Pixel value of bottom knob radius.
 * @param {number} cx X coordinate of knob center.
 * @param {number} cy Y coordinate of knob center.
 * @param {number} csa CurvatureSideAngle. Relative of curvature ratio.
 * @param {number} cv CurvatureValue. Pixel value of curvature max deflection.
 * @param {boolean} invert Invert. Whether knob bottom radius over top radius.
 * @param {boolean} isFirstSide Vertex have 2 sides, if this is first side - true, elese - false.
 */
anychart.core.gauge.pointers.Knob.prototype.drawVertexSide = function(path, asvs, vss, tvs, bvs, ptr, pbr, cx, cy, csa, cv, invert, isFirstSide) {
  var control1x, control1y, control2x, control2y;
  var xa, ya, xb, yb, xp, yp, xo, yo, loa, lop;
  var angleStartPointVertexSide, angleEndPointVertexSide;
  var startVertexSidePointX, startVertexSidePointY, endVertexSidePointX, endVertexSidePointY;
  var vertexSideCenterX, vertexSideCenterY;
  var vertexSideTiltAngle, curvatureBasePointAngle;
  var curveBasePointX, curveBasePointY;
  var tangentAngleRad, controlDirection;

  if (isFirstSide) {
    angleStartPointVertexSide = goog.math.standardAngle(asvs + bvs);
    angleEndPointVertexSide = goog.math.standardAngle(asvs + vss / 2 - tvs);
  } else {
    angleStartPointVertexSide = goog.math.standardAngle(asvs + vss - bvs);
    angleEndPointVertexSide = goog.math.standardAngle(asvs + vss / 2 + tvs);
  }

  startVertexSidePointX = cx + Math.cos(goog.math.toRadians(angleStartPointVertexSide)) * pbr;
  startVertexSidePointY = cy + Math.sin(goog.math.toRadians(angleStartPointVertexSide)) * pbr;

  endVertexSidePointX = cx + Math.cos(goog.math.toRadians(angleEndPointVertexSide)) * ptr;
  endVertexSidePointY = cy + Math.sin(goog.math.toRadians(angleEndPointVertexSide)) * ptr;

  //Coordinates of the vertex side center.
  vertexSideCenterX = (startVertexSidePointX + endVertexSidePointX) / 2;
  vertexSideCenterY = (startVertexSidePointY + endVertexSidePointY) / 2;

  //Angle of the tangent in radians.
  tangentAngleRad = goog.math.toRadians(angleStartPointVertexSide + 90);

  xa = startVertexSidePointX;
  ya = startVertexSidePointY;
  xb = startVertexSidePointX + Math.cos(tangentAngleRad) * 100;
  yb = startVertexSidePointY + Math.sin(tangentAngleRad) * 100;
  xp = endVertexSidePointX;
  yp = endVertexSidePointY;

  //the coordinates of the base perpendicular to the tangent
  xo = (xa * Math.pow(yb - ya, 2) + xp * Math.pow(xb - xa, 2) + (xb - xa) * (yb - ya) * (yp - ya)) / (Math.pow(yb - ya, 2) + Math.pow(xb - xa, 2)) || 0;
  yo = (((xb - xa) * (xp - xo)) / (yb - ya)) + yp || 0;

  //OA length
  loa = Math.sqrt(Math.pow(xa - xo, 2) + Math.pow(ya - yo, 2));
  //OP length
  lop = Math.sqrt(Math.pow(xp - xo, 2) + Math.pow(yp - yo, 2));

  //Tilt angle of vertex side to the tangent in the start vertex point.
  vertexSideTiltAngle = goog.math.toDegrees(Math.atan(lop / loa));
  if (this.topRatio_ < 1 - this.bottomRatio_) {
    vertexSideTiltAngle = isFirstSide ?
        90 - vertexSideTiltAngle :
        -(90 - vertexSideTiltAngle);
  } else {
    vertexSideTiltAngle = isFirstSide ?
        -(90 - vertexSideTiltAngle) :
        90 - vertexSideTiltAngle;
  }

  //Calc angle for curvature of the vertex side
  curvatureBasePointAngle = angleStartPointVertexSide + (isFirstSide ? -csa : csa) + vertexSideTiltAngle;

  //Base point for curvature of the vertex side
  curveBasePointX = vertexSideCenterX + Math.cos(goog.math.toRadians(curvatureBasePointAngle)) * cv;
  curveBasePointY = vertexSideCenterY + Math.sin(goog.math.toRadians(curvatureBasePointAngle)) * cv;

  controlDirection = this.verticesCurvature_ < .5 ? 90 : -90;
  //First control point of cubic curve
  control1x = curveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);
  control1y = curveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);

  controlDirection = this.verticesCurvature_ < .5 ? -90 : 90;
  //First control point of cubic curve
  control2x = curveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);
  control2y = curveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);

  if (isFirstSide) {
    if (invert) path.curveTo(control1x, control1y, control2x, control2y, endVertexSidePointX, endVertexSidePointY);
    else path.curveTo(control2x, control2y, control1x, control1y, endVertexSidePointX, endVertexSidePointY);
  } else {
    if (invert) path.curveTo(control1x, control1y, control2x, control2y, startVertexSidePointX, startVertexSidePointY);
    else path.curveTo(control2x, control2y, control1x, control1y, startVertexSidePointX, startVertexSidePointY);
  }
};


/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.draw = function() {
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
    var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
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

    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['topRadius'] = pixTopRadius;
    this.contextProvider['bottomRadius'] = pixBottomRadius;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(startAngle - anychart.charts.CircularGauge.DEFAULT_START_ANGLE);

    //difference between knob radius.
    var dr = Math.abs(pixTopRadius - pixBottomRadius);
    //half dr
    var halfDr = dr / 2;
    //if bottom radius more then top radius - this is invert mode.
    var invert = pixTopRadius < pixBottomRadius;
    //We need change vector direction relative verticesCurvature value.
    var curvatureSideAngle = this.verticesCurvature_ < .5 ? 90 : -90;
    //Pixel value of curvature max deflection.
    var curvatureValue = Math.abs(.5 - this.verticesCurvature_) * halfDr;
    var angleStartVertexSector, angleStartPointVertexSide, angleEndPointVertexSide, i;

    this.domElement.clear();

    for (i = 0; i < this.verticesCount_; i++) {
      angleStartVertexSector = goog.math.standardAngle(startAngle + i * verticesSectorSweep);

      this.domElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angleStartVertexSector, bottomVerticesSweep, i != 0);

      this.drawVertexSide(
          /** @type {acgraph.vector.Path} */(this.domElement),
          angleStartVertexSector,
          verticesSectorSweep,
          topVerticesSweep,
          bottomVerticesSweep,
          pixTopRadius,
          pixBottomRadius,
          cx, cy, curvatureSideAngle, curvatureValue, invert, true);

      angleEndPointVertexSide = goog.math.standardAngle(angleStartVertexSector + verticesSectorSweep / 2 - topVerticesSweep);
      this.domElement.circularArc(cx, cy, pixTopRadius, pixTopRadius, angleEndPointVertexSide, topVerticesSweep * 2);

      this.drawVertexSide(
          /** @type {acgraph.vector.Path} */(this.domElement),
          angleStartVertexSector,
          verticesSectorSweep,
          topVerticesSweep,
          bottomVerticesSweep,
          pixTopRadius,
          pixBottomRadius,
          cx, cy, curvatureSideAngle, curvatureValue, invert, false);

      angleStartPointVertexSide = goog.math.standardAngle(angleStartVertexSector + verticesSectorSweep - bottomVerticesSweep);
      this.domElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angleStartPointVertexSide, bottomVerticesSweep);
    }

    this.domElement.close();

    this.makeInteractive(/** @type {acgraph.vector.Path} */(this.domElement));

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();

      for (i = 0; i < this.verticesCount_; i++) {
        angleStartVertexSector = goog.math.standardAngle(startAngle + i * verticesSectorSweep);

        this.hatchFillElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angleStartVertexSector, bottomVerticesSweep, i != 0);

        this.drawVertexSide(
            /** @type {acgraph.vector.Path} */(this.hatchFillElement),
            angleStartVertexSector,
            verticesSectorSweep,
            topVerticesSweep,
            bottomVerticesSweep,
            pixTopRadius,
            pixBottomRadius,
            cx, cy, curvatureSideAngle, curvatureValue, invert, true);

        angleEndPointVertexSide = goog.math.standardAngle(angleStartVertexSector + verticesSectorSweep / 2 - topVerticesSweep);
        this.hatchFillElement.circularArc(cx, cy, pixTopRadius, pixTopRadius, angleEndPointVertexSide, topVerticesSweep * 2);

        this.drawVertexSide(
            /** @type {acgraph.vector.Path} */(this.hatchFillElement),
            angleStartVertexSector,
            verticesSectorSweep,
            topVerticesSweep,
            bottomVerticesSweep,
            pixTopRadius,
            pixBottomRadius,
            cx, cy, curvatureSideAngle, curvatureValue, invert, false);

        angleStartPointVertexSide = goog.math.standardAngle(angleStartVertexSector + verticesSectorSweep - bottomVerticesSweep);
        this.hatchFillElement.circularArc(cx, cy, pixBottomRadius, pixBottomRadius, angleStartPointVertexSide, bottomVerticesSweep);
      }

      this.hatchFillElement.close();
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.core.gauge.pointers.Knob.base(this, 'draw');
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.serialize = function() {
  var json = anychart.core.gauge.pointers.Knob.base(this, 'serialize');

  json['verticesCount'] = this.verticesCount();
  json['verticesCurvature'] = this.verticesCurvature();
  json['topRatio'] = this.topRatio();
  json['bottomRatio'] = this.bottomRatio();
  if (goog.isDef(this.topRadius())) json['topRadius'] = this.topRadius();
  if (goog.isDef(this.bottomRadius())) json['bottomRadius'] = this.bottomRadius();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Knob.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.pointers.Knob.base(this, 'setupByJSON', config, opt_default);

  this.verticesCount(config['verticesCount']);
  this.verticesCurvature(config['verticesCurvature']);
  this.topRatio(config['topRatio']);
  this.bottomRatio(config['bottomRatio']);
  this.topRadius(config['topRadius']);
  this.bottomRadius(config['bottomRadius']);
};


//exports
(function() {
  var proto = anychart.core.gauge.pointers.Knob.prototype;
  proto['verticesCount'] = proto.verticesCount;
  proto['verticesCurvature'] = proto.verticesCurvature;
  proto['topRatio'] = proto.topRatio;
  proto['bottomRatio'] = proto.bottomRatio;
  proto['topRadius'] = proto.topRadius;
  proto['bottomRadius'] = proto.bottomRadius;
})();
