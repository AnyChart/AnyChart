goog.provide('anychart.circularGaugeModule.AxisMarker');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.circularGaugeModule.AxisMarker = function() {
  anychart.circularGaugeModule.AxisMarker.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.domElement;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['axisIndex', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['startSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['endSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['from', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['to', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['radius', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['cornersRounding', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.circularGaugeModule.AxisMarker, anychart.core.VisualBase);


anychart.circularGaugeModule.AxisMarker.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fill', acgraph.vector.normalizeFill],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'axisIndex', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.enums.normalizeGaugeSidePosition],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'startSize', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'endSize', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'from', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'to', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'radius', anychart.core.settings.nullOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'cornersRounding', anychart.utils.normalizeToPercent]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.circularGaugeModule.AxisMarker, anychart.circularGaugeModule.AxisMarker.OWN_DESCRIPTORS);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.circularGaugeModule.AxisMarker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_HATCH_FILL;


/**
 * Supported signals.
 * @type {number}
 */
anychart.circularGaugeModule.AxisMarker.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Set/get link to gauge.
 * @param {anychart.circularGaugeModule.Chart=} opt_gauge Gauge inst for set.
 * @return {anychart.circularGaugeModule.AxisMarker}
 */
anychart.circularGaugeModule.AxisMarker.prototype.gauge = function(opt_gauge) {
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
 * Dynamic arc.
 * @param {acgraph.vector.Path} path Path.
 * @param {number} startAngle Start angle.
 * @param {number} endAngle End angle.
 * @param {number} startR Start radius.
 * @param {number} endR End radius.
 * @param {boolean=} opt_moveTo Move to or not.
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.drawDynamicArc_ = function(path, startAngle, endAngle, startR, endR, opt_moveTo) {
  opt_moveTo = goog.isDef(opt_moveTo) ? opt_moveTo : false;
  var angle, r, x, y, radAngle;
  var dR = (endR - startR) / (endAngle - startAngle);

  var cx = this.gauge_.getCx();
  var cy = this.gauge_.getCy();

  if (endAngle > startAngle) {
    for (angle = startAngle; angle <= endAngle; angle++) {
      r = startR + dR * (angle - startAngle);
      radAngle = angle * Math.PI / 180;
      x = cx + r * Math.cos(radAngle);
      y = cy + r * Math.sin(radAngle);
      if (opt_moveTo && angle == startAngle)
        path.moveTo(x, y);
      else
        path.lineTo(x, y);
    }
  } else {
    for (angle = startAngle; angle >= endAngle; angle--) {
      r = startR + dR * (angle - startAngle);

      radAngle = angle * Math.PI / 180;
      x = cx + r * Math.cos(radAngle);
      y = cy + r * Math.sin(radAngle);

      if (opt_moveTo && angle == startAngle)
        path.moveTo(x, y);
      else
        path.lineTo(x, y);
    }
  }

  radAngle = endAngle * Math.PI / 180;
  x = cx + endR * Math.cos(radAngle);
  y = cy + endR * Math.sin(radAngle);
  path.lineTo(x, y);
};


/**
 * Calculate pixel value for circular range radius.
 * @param {number} radius Circular range radius.
 * @param {number} axisWidth Axis width.
 * @param {number} size Numeric percent value of radius.
 * @param {boolean} isStartPoint This start radius or not.
 * @return {number}
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.getComplexRadius_ = function(radius, axisWidth, size, isStartPoint) {
  var position = /** @type {anychart.enums.SidePosition} */(this.getOption('position'));
  if (position == anychart.enums.GaugeSidePosition.OUTSIDE)
    return radius * (1 + (isStartPoint ? 0 : size)) + axisWidth / 2;
  else if (position == anychart.enums.GaugeSidePosition.INSIDE)
    return radius * (1 - (isStartPoint ? 0 : size)) - axisWidth / 2;
  else
    return radius * (1 + (isStartPoint ? -.5 : .5) * size);
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisMarker.prototype.remove = function() {
  if (this.domElement) this.domElement.parent(null);
  if (this.paths_ && this.paths_.length)
    goog.array.forEach(this.paths_, function(path) {
      path.parent(null);
    });
};


/**
 * Method needed to identify type of gradient.
 * @param {acgraph.vector.Fill} fill Gradient fill.
 * @return {boolean}
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.isLinearGradient_ = function(fill) {
  return (goog.isObject(fill) && goog.isDef(fill['keys']) && !goog.isDef(fill['cx']) && !goog.isDef(fill['cy']));
};


/**
 * Calculates x, y.
 * @param {Object} point Coordinates.
 * @param {number} radius Radius.
 * @param {number} angle Angle.
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.setPixelPoint_ = function(point, radius, angle) {
  var cx = this.gauge_.getCx();
  var cy = this.gauge_.getCy();
  var radAngle = goog.math.toRadians(angle);
  point.x = cx + radius * Math.cos(radAngle);
  point.y = cy + radius * Math.sin(radAngle);
};


/**
 * Draws gradient block of circular range.
 * @param {Array.<acgraph.vector.Path>} paths Path element.
 * @param {number} startAngle Start angle.
 * @param {number} endAngle End angle.
 * @param {number} startBaseR Start base radius.
 * @param {number} endBaseR End base radius.
 * @param {number} startR Start radius.
 * @param {number} endR End radius.
 * @param {string} color1 First color of gradient.
 * @param {number} opacity1 Opacity of firs color.
 * @param {string} color2 Second color.
 * @param {number} opacity2 opacity of second color.
 * @param {number} index Index of the shape.
 * @param {number} cornersRoundingPixStart Start radius for corners rounding.
 * @param {number} startWidth Start size px.
 * @param {number} cornersRoundingPixEnd End radius for corners rounding.
 * @param {number} endWidth End size px.
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.drawGradientBlock_ = function(paths, startAngle, endAngle, startBaseR, endBaseR, startR, endR, color1, opacity1, color2, opacity2, index, cornersRoundingPixStart, startWidth, cornersRoundingPixEnd, endWidth) {
  var centerAngle = (startAngle + endAngle) / 2,
      centerBaseRadius = (startBaseR + endBaseR) / 2,
      centerR = (startR + endR) / 2,
      cx = this.gauge_.getCx(),
      cy = this.gauge_.getCy(),
      path = paths[index];

  var pt1 = {},
      pt2 = {},
      pt3 = {},
      pt4 = {},
      x, y;

  this.setPixelPoint_(pt1, startBaseR, startAngle);
  this.setPixelPoint_(pt2, endBaseR, endAngle);
  this.setPixelPoint_(pt3, endR, endAngle);
  this.setPixelPoint_(pt4, startR, startAngle);

  var bounds = anychart.math.rect(0, 0, 0, 0);
  bounds.left = Math.min(pt1.x, pt2.x, pt3.x, pt4.x);
  bounds.top = Math.min(pt1.y, pt2.y, pt3.y, pt4.y);
  bounds.width = Math.max(pt1.x, pt2.x, pt3.x, pt4.x) - bounds.left;
  bounds.height = Math.max(pt1.y, pt2.y, pt3.y, pt4.y) - bounds.top;

  var keys = [], key1 = {}, key2 = {};
  key1['position'] = '0';
  key1['opacity'] = opacity1;
  key1['color'] = color1;
  keys.push(key1);
  key2['position'] = '1';
  key2['opacity'] = opacity2;
  key2['color'] = color2;
  keys.push(key2);

  var axis = this.gauge_.getAxis(/** @type {number} */(this.getOption('axisIndex')));
  var inv = axis.scale().inverted();
  var sign = inv ? -1 : 1;

  var fill = {};
  fill['angle'] = -(centerAngle + 90 * sign);
  fill['keys'] = keys;

  var specialPath = acgraph.path();

  // save comments below for the better future (AntonKagakin)
  this.drawDynamicArc_(specialPath, startAngle, centerAngle, (startR + startBaseR) / 2, (centerR + centerBaseRadius) / 2, true);
  //this.drawDynamicArc_(specialPath, centerAngle, startAngle, centerR - centerBaseRadius, startR - startBaseR, false);
  this.drawDynamicArc_(specialPath, centerAngle, endAngle, (centerR + centerBaseRadius) / 2, (endR + endBaseR) / 2, false);
  //this.drawDynamicArc_(specialPath, endAngle, centerAngle, endR - endBaseR, centerR - centerBaseRadius, false);
  fill['mode'] = specialPath.getBounds();

  this.drawDynamicArc_(path, startAngle, centerAngle, startBaseR, centerBaseRadius, true);
  this.drawDynamicArc_(path, centerAngle, startAngle, centerR, startR, false);

  if ((!index) && cornersRoundingPixStart) {
    x = cx + goog.math.angleDx(startAngle, startBaseR);
    y = cy + goog.math.angleDy(startAngle, startBaseR);
    if (cornersRoundingPixStart < startWidth / 2)
      path.arcToByEndPoint(x, y, startWidth - cornersRoundingPixStart, startWidth - cornersRoundingPixStart, false, inv);
    else
      path.arcToByEndPoint(x, y, cornersRoundingPixStart, cornersRoundingPixStart, true, inv);
  }

  this.drawDynamicArc_(path, centerAngle, endAngle + sign * 0.1, centerBaseRadius, endBaseR, true);

  if ((index == paths.length - 1) && cornersRoundingPixEnd) {
    x = cx + goog.math.angleDx(endAngle + 0.1, endR);
    y = cy + goog.math.angleDy(endAngle + 0.1, endR);
    if (cornersRoundingPixEnd < endWidth / 2)
      path.arcToByEndPoint(x, y, endWidth - cornersRoundingPixEnd, endWidth - cornersRoundingPixEnd, false, inv);
    else
      path.arcToByEndPoint(x, y, cornersRoundingPixEnd, cornersRoundingPixEnd, true, inv);
  }

  this.drawDynamicArc_(path, endAngle + sign * 0.1, centerAngle, endR, centerR, false);

  path.fill(/** @type {acgraph.vector.Fill} */ (fill));
  goog.dispose(specialPath);
};


/**
 * Clears gradient paths.
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.clearPaths_ = function() {
  if (this.paths_ && this.paths_.length) {
    goog.array.forEach(this.paths_, function(path) {
      path.clear();
    });
  }
};


/**
 * Return radii depends on gauge radius and passed arguments
 * @param {anychart.circularGaugeModule.Chart} gauge
 * @param {number} axisWidth
 * @param {number} radius
 * @param {number} startPercentSize
 * @param {number} endPercentSize
 * @return {Array.<number>}
 * @private
 */
anychart.circularGaugeModule.AxisMarker.prototype.getRadii_ = function(gauge, axisWidth, radius, startPercentSize, endPercentSize) {
  //Calculate radii based on gauge radius
  var gaugeRadius = gauge.getPixRadius();
  var baseStartR = this.getComplexRadius_(gaugeRadius, axisWidth, startPercentSize, true);
  var baseEndR = this.getComplexRadius_(gaugeRadius, axisWidth, endPercentSize, true);
  var startR = this.getComplexRadius_(gaugeRadius, axisWidth, startPercentSize, false);
  var endR = this.getComplexRadius_(gaugeRadius, axisWidth, endPercentSize, false);

  var tmp;
  if (startR < baseStartR) {
    tmp = startR;
    startR = baseStartR;
    baseStartR = tmp;
  }
  if (endR < baseEndR) {
    tmp = endR;
    endR = baseEndR;
    baseEndR = tmp;
  }

  var mainStartWidth = (startR - baseStartR);
  var mainEndWidth = (endR - baseEndR);

  baseStartR = this.getComplexRadius_(radius, axisWidth, startPercentSize, true);
  baseEndR = this.getComplexRadius_(radius, axisWidth, endPercentSize, true);
  startR = this.getComplexRadius_(radius, axisWidth, startPercentSize, false);
  endR = this.getComplexRadius_(radius, axisWidth, endPercentSize, false);

  if (startR < baseStartR) {
    tmp = startR;
    startR = baseStartR;
    baseStartR = tmp;
  }
  if (endR < baseEndR) {
    tmp = endR;
    endR = baseEndR;
    baseEndR = tmp;
  }

  var startWidth = startR - baseStartR;
  var endWidth = endR - baseEndR;
  var startDifference = (mainStartWidth - startWidth) / 2;
  var endDifference = (mainEndWidth - endWidth) / 2;

  startR += startDifference;
  baseStartR -= startDifference;
  endR += endDifference;
  baseEndR -= endDifference;

  return [startR, baseStartR, endR, baseEndR];
};


/**
 * Drawing.
 * @return {anychart.circularGaugeModule.AxisMarker} .
 */
anychart.circularGaugeModule.AxisMarker.prototype.draw = function() {
  var gauge = this.gauge_;
  var axis = gauge.getAxis(/** @type {number} */(this.getOption('axisIndex')));

  if (!this.checkDrawingNeeded())
    return this;

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    this.clearPaths_();
    return this;
  }

  var fill = /** @type {acgraph.vector.Fill} */ (this.getOption('fill'));
  var isLinearGradient = this.isLinearGradient_(fill);
  if (isLinearGradient)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  this.clearPaths_();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var scale = axis.scale();
    var from = this.getOption('from');
    var to = this.getOption('to');

    if (scale.isMissing(from) || scale.isMissing(to)) {
      if (this.domElement) this.domElement.clear();

      this.markConsistent(anychart.ConsistencyState.BOUNDS);
      return this;
    }

    if (!this.domElement) {
      this.domElement = acgraph.path();
    } else
      this.domElement.clear();

    if (!this.paths_)
      this.paths_ = [];

    this.clearPaths_();

    if (from != to) {
      var inverse = to < from;

      var fromRatio = goog.math.clamp(scale.transform(inverse ? to : from), 0, 1);
      var toRatio = goog.math.clamp(scale.transform(inverse ? from : to), 0, 1);

      if (fromRatio == toRatio)
        return this;

      var axisStartAngle = axis.getStartAngle();
      var axisSweepAngle = axis.getSweepAngle();
      var startAngle = axisStartAngle + fromRatio * axisSweepAngle;
      var endAngle = axisStartAngle + toRatio * axisSweepAngle;

      var sweepAngle = endAngle - startAngle;
      if (!sweepAngle) sweepAngle = fromRatio == toRatio ? 0 : 360;

      var startAngleRad = goog.math.toRadians(startAngle);
      var endAngleRad = goog.math.toRadians(endAngle);

      var startSize = this.getOption('startSize');
      var endSize = this.getOption('endSize');
      startSize = goog.isDefAndNotNull(startSize) ? startSize : 0;
      endSize = goog.isDefAndNotNull(endSize) ? endSize : '10%';

      var startPercentSize = parseFloat(inverse ? endSize : startSize) / 100;
      var endPercentSize = parseFloat(inverse ? startSize : endSize) / 100;

      var optionRadius = /** @type {null|string} */(this.getOption('radius'));
      var radius = goog.isDefAndNotNull(optionRadius) ?
          anychart.utils.normalizeSize(optionRadius, gauge.getPixRadius()) :
          axis.getPixRadius();

      var axisWidth = goog.isDefAndNotNull(optionRadius) ? 0 : axis.getPixWidth();

      var radii = this.getRadii_(gauge, axisWidth, radius, startPercentSize, endPercentSize);

      var startR = radii[0];
      var baseStartR = radii[1];
      var endR = radii[2];
      var baseEndR = radii[3];


      var cornersRounding = this.getOption('cornersRounding');
      var startWidth = startR - baseStartR;
      var cornersRoundingPixStart = anychart.utils.normalizeSize(/** @type {string} */ (cornersRounding), startWidth);
      var endWidth = endR - baseEndR;
      var cornersRoundingPixEnd = anychart.utils.normalizeSize(/** @type {string} */ (cornersRounding), endWidth);

      var startX, startY, endX, endY, x, y;

      var cx = gauge.getCx();
      var cy = gauge.getCy();

      if (isLinearGradient) {
        /** @type {acgraph.vector.Path} */
        var path;
        var keys = fill['keys'];
        var keysCount = fill['keys'].length;
        for (var i = 0; i < keysCount - 1; i++) {
          if (!this.paths_[i])
            this.paths_[i] = path = acgraph.path();
          else
            path = this.paths_[i];
          path
              .clear()
              .stroke('none')
              .fill('none')
              .parent(/** @type {acgraph.vector.ILayer} */(this.container()))
              .zIndex(/** @type {number} */(this.zIndex()));
        }
        for (i = 0; i < keysCount - 1; i++) {
          var k1 = keys[i];
          var k2 = keys[i + 1];
          var startRatio = k1['offset'];
          var endRatio = k2['offset'];
          var startColor = k1['color'];
          var endColor = k2['color'];
          var op1 = goog.isDef(k1['opacity']) ? k1['opacity'] : goog.isDef(fill['opacity']) ? fill['opacity'] : 1;
          var op2 = goog.isDef(k2['opacity']) ? k2['opacity'] : goog.isDef(fill['opacity']) ? fill['opacity'] : 1;
          this.drawGradientBlock_(
              this.paths_,
              startAngle + sweepAngle * startRatio,
              startAngle + sweepAngle * endRatio,
              baseStartR + (baseEndR - baseStartR) * startRatio,
              baseStartR + (baseEndR - baseStartR) * endRatio,
              startR + (endR - startR) * startRatio,
              startR + (endR - startR) * endRatio,
              startColor,
              op1,
              endColor,
              op2,
              i,
              cornersRoundingPixStart,
              startWidth,
              cornersRoundingPixEnd,
              endWidth
          );
        }
      }
      if (baseStartR == baseEndR) {
        startX = cx + Math.cos(startAngleRad) * baseStartR;
        startY = cy + Math.sin(startAngleRad) * baseStartR;

        this.domElement.moveTo(startX, startY);
        this.domElement.arcTo(
            baseStartR,
            baseStartR,
            startAngle,
            sweepAngle);

      } else {
        x = cx + Math.cos(startAngleRad) * baseStartR;
        y = cy + Math.sin(startAngleRad) * baseStartR;

        this.domElement.moveTo(x, y);
        this.drawDynamicArc_(/** @type {acgraph.vector.Path} */(this.domElement), startAngle, endAngle, baseStartR, baseEndR);
      }

      var inv = /** @type {boolean} */ (axis.scale().inverted());

      if (cornersRoundingPixEnd) {
        x = cx + goog.math.angleDx(endAngle, endR);
        y = cy + goog.math.angleDy(endAngle, endR);
        if (cornersRoundingPixEnd < endWidth / 2)
          this.domElement.arcToByEndPoint(x, y, endWidth - cornersRoundingPixEnd, endWidth - cornersRoundingPixEnd, false, inv);
        else
          this.domElement.arcToByEndPoint(x, y, cornersRoundingPixEnd, cornersRoundingPixEnd, true, inv);
      }

      if (endR == startR) {
        endX = cx + Math.cos(endAngleRad) * endR;
        endY = cy + Math.sin(endAngleRad) * endR;

        if (!cornersRoundingPixEnd)
          this.domElement.lineTo(endX, endY);
        this.domElement.arcTo(
            endR,
            endR,
            endAngle,
            -sweepAngle);
      } else {
        this.drawDynamicArc_(/** @type {acgraph.vector.Path} */(this.domElement), endAngle, startAngle, endR, startR);
      }

      if (cornersRoundingPixStart) {
        x = cx + goog.math.angleDx(startAngle, baseStartR);
        y = cy + goog.math.angleDy(startAngle, baseStartR);
        if (cornersRoundingPixStart < startWidth / 2)
          this.domElement.arcToByEndPoint(x, y, startWidth - cornersRoundingPixStart, startWidth - cornersRoundingPixStart, false, inv);
        else
          this.domElement.arcToByEndPoint(x, y, cornersRoundingPixStart, cornersRoundingPixStart, true, inv);
      }
      this.domElement.close();
    } else {
      this.domElement.clear();
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (isLinearGradient)
      this.domElement.fill(/** @type {acgraph.vector.Fill} */('none'));
    else
      this.domElement.fill(/** @type {acgraph.vector.Fill} */(this.getOption('fill')));
    this.domElement.stroke(/** @type {acgraph.vector.Stroke} */('none'));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.domElement.zIndex(/** @type {number} */(this.zIndex()));
    if (this.paths_ && this.paths_.length)
      goog.array.forEach(this.paths_, function(path) {
        path.zIndex(/** @type {number} */(this.zIndex()));
      }, this);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.domElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    if (this.paths_ && this.paths_.length)
      goog.array.forEach(this.paths_, function(path) {
        path.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      }, this);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.circularGaugeModule.AxisMarker.prototype.serialize = function() {
  var json = anychart.circularGaugeModule.AxisMarker.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.circularGaugeModule.AxisMarker.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisMarker.prototype.setupByJSON = function(config, opt_default) {
  anychart.circularGaugeModule.AxisMarker.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.circularGaugeModule.AxisMarker.OWN_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.circularGaugeModule.AxisMarker.prototype.disposeInternal = function() {
  goog.disposeAll(this.paths_, this.domElement);
  this.paths_ = null;
  this.domElement = null;

  anychart.circularGaugeModule.AxisMarker.base(this, 'disposeInternal');
};


//exports
// (function() {
//   var proto = anychart.circularGaugeModule.AxisMarker.prototype;
//   auto
//   proto['fill'] = proto.fill;
//   proto['axisIndex'] = proto.axisIndex;
//   proto['position'] = proto.position;
//   proto['startSize'] = proto.startSize;
//   proto['endSize'] = proto.endSize;
//   proto['from'] = proto.from;
//   proto['to'] = proto.to;
//   proto['radius'] = proto.radius;
//   proto['cornersRounding'] = proto.cornersRounding;
// })();
