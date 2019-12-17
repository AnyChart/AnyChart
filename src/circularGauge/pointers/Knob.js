goog.provide('anychart.circularGaugeModule.pointers.Knob');
goog.require('acgraph');
goog.require('anychart.circularGaugeModule.pointers.Base');
goog.require('anychart.utils');



/**
 * Knob pointer class.<br/>
 * @constructor
 * @extends {anychart.circularGaugeModule.pointers.Base}
 */
anychart.circularGaugeModule.pointers.Knob = function() {
  anychart.circularGaugeModule.pointers.Knob.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['verticesCount', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['verticesCurvature', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['topRatio', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['bottomRatio', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['topRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['bottomRadius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.pointers.Knob, anychart.circularGaugeModule.pointers.Base);


//region --- Infrastructure
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Knob.prototype.getType = function() {
  return anychart.enums.CircularGaugePointerType.KNOB;
};


//endregion
//region --- Descriptors
/**
 * Properties that should be defined in anychart.circularGaugeModule.pointers.Knob prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.circularGaugeModule.pointers.Knob.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var verticesCountNormalizer = function(opt_value) {
    opt_value = anychart.utils.toNumber(opt_value);
    return (!opt_value ? this.getOption('verticesCount') : opt_value);
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'verticesCount', verticesCountNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'verticesCurvature', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'topRatio', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'bottomRatio', anychart.core.settings.ratioNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'topRadius', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'bottomRadius', anychart.core.settings.nullOrPercentNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.pointers.Knob, anychart.circularGaugeModule.pointers.Knob.OWN_DESCRIPTORS);


//endregion
//region --- Drawing
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
anychart.circularGaugeModule.pointers.Knob.prototype.drawVertexSide = function(path, asvs, vss, tvs, bvs, ptr, pbr, cx, cy, csa, cv, invert, isFirstSide) {
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
  // 10000 magic number is to avoid rounding with certain angle values
  xb = startVertexSidePointX + Math.cos(tangentAngleRad) * 10000;
  yb = startVertexSidePointY + Math.sin(tangentAngleRad) * 10000;
  xp = endVertexSidePointX;
  yp = endVertexSidePointY;

  //the coordinates of the base perpendicular to the tangent
  xo = (xa * Math.pow(yb - ya, 2) + xp * Math.pow(xb - xa, 2) + (xb - xa) * (yb - ya) * (yp - ya)) / (Math.pow(yb - ya, 2) + Math.pow(xb - xa, 2)) || 0;
  yo = (((xb - xa) * (xp - xo)) / (yb - ya)) + yp || 0;

  //OA length
  loa = anychart.math.vectorLength(xa, ya, xo, yo);
  //OP length
  lop = anychart.math.vectorLength(xp, yp, xo, yo);

  //Tilt angle of vertex side to the tangent in the start vertex point.
  vertexSideTiltAngle = goog.math.toDegrees(Math.atan(lop / loa));
  var topRatio = /** @type {number} */(this.getOption('topRatio'));
  var bottomRatio = /** @type {number} */(this.getOption('bottomRatio'));
  if (topRatio < 1 - bottomRatio) {
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

  var verticesCurvature = /** @type {number} */(this.getOption('verticesCurvature'));
  controlDirection = verticesCurvature < .5 ? 90 : -90;
  //First control point of cubic curve
  control1x = curveBasePointX + Math.cos(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);
  control1y = curveBasePointY + Math.sin(goog.math.toRadians(curvatureBasePointAngle + controlDirection)) * (cv * .5);

  controlDirection = verticesCurvature < .5 ? -90 : 90;
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
anychart.circularGaugeModule.pointers.Knob.prototype.draw = function() {
  var gauge = this.gauge();
  var axis = gauge.getAxis(/** @type {number} */(this.getOption('axisIndex')));
  if (!this.checkDrawingNeeded())
    return this;

  this.ensureCreated();

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    if (this.hatchFillElement) this.hatchFillElement.clear();
    if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
      this.markConsistent(anychart.ConsistencyState.BOUNDS);
    return this;
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.GAUGE_HATCH_FILL)) {
    var fill = /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill} */(this.getOption('hatchFill'));
    if (!this.hatchFillElement && fill && !anychart.utils.isNone(fill)) {
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

    var iterator = this.getResetIterator();
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
    } else
      this.domElement.clear();

    var axisRadius = axis.getPixRadius();
    var axisStartAngle = axis.getStartAngle();
    var axisSweepAngle = axis.getSweepAngle();

    var topRadius = /** @type {string} */(this.getOption('topRadius'));
    var pixTopRadius = goog.isDefAndNotNull(topRadius) ?
        anychart.utils.normalizeSize(topRadius, gauge.getPixRadius()) :
        axisRadius * .7;

    var bottomRadius = /** @type {string} */(this.getOption('bottomRadius'));
    var pixBottomRadius = goog.isDefAndNotNull(bottomRadius) ?
        anychart.utils.normalizeSize(bottomRadius, gauge.getPixRadius()) :
        axisRadius * .6;

    var verticesCount = /** @type {number} */(this.getOption('verticesCount'));
    var topRatio = /** @type {number} */(this.getOption('topRatio'));
    var bottomRatio = /** @type {number} */(this.getOption('bottomRatio'));
    var verticesSectorSweep = 360 / verticesCount;
    var topVerticesSweep = (verticesSectorSweep / 2) * topRatio;
    var bottomVerticesSweep = (verticesSectorSweep / 2) * bottomRatio;

    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);
    var startAngle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);

    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['topRadius'] = pixTopRadius;
    this.contextProvider['bottomRadius'] = pixBottomRadius;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(startAngle - anychart.circularGaugeModule.Chart.DEFAULT_START_ANGLE);

    //difference between knob radius.
    var dr = Math.abs(pixTopRadius - pixBottomRadius);
    //half dr
    var halfDr = dr / 2;
    //if bottom radius more then top radius - this is invert mode.
    var invert = pixTopRadius < pixBottomRadius;
    var verticesCurvature = /** @type {number} */(this.getOption('verticesCurvature'));
    //We need change vector direction relative verticesCurvature value.
    var curvatureSideAngle = verticesCurvature < .5 ? 90 : -90;
    //Pixel value of curvature max deflection.
    var curvatureValue = Math.abs(.5 - verticesCurvature) * halfDr;
    var angleStartVertexSector, angleStartPointVertexSide, angleEndPointVertexSide, i;

    this.domElement.clear();

    for (i = 0; i < verticesCount; i++) {
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

      for (i = 0; i < verticesCount; i++) {
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

  anychart.circularGaugeModule.pointers.Knob.base(this, 'draw');
  return this;
};


//endregion
//region --- Serialize / Deserialize / Dispose
/** @inheritDoc */
anychart.circularGaugeModule.pointers.Knob.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.pointers.Knob.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.circularGaugeModule.pointers.Knob.OWN_DESCRIPTORS, json, 'Knob pointer');

  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.pointers.Knob.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.pointers.Knob.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.pointers.Knob.OWN_DESCRIPTORS, config, opt_default);
};


//endregion



//exports
//(function() {
//  var proto = anychart.circularGaugeModule.pointers.Knob.prototype;
//  auto generated
//  proto['verticesCount'] = proto.verticesCount;
//  proto['verticesCurvature'] = proto.verticesCurvature;
//  proto['topRatio'] = proto.topRatio;
//  proto['bottomRatio'] = proto.bottomRatio;
//  proto['topRadius'] = proto.topRadius;
//  proto['bottomRadius'] = proto.bottomRadius;
//})();
