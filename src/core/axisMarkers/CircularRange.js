goog.provide('anychart.core.axisMarkers.CircularRange');
goog.require('acgraph');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Bar pointer class.<br/>
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.axisMarkers.CircularRange = function() {
  anychart.core.axisMarkers.CircularRange.base(this, 'constructor');

  /**
   * @type {number}
   * @private
   */
  this.from_;

  /**
   * @type {number}
   * @private
   */
  this.to_;

  /**
   * @type {?string}
   * @private
   */
  this.startSize_;

  /**
   * @type {?string}
   * @private
   */
  this.endSize_;

  /**
   * Pointer fill.
   * @type {acgraph.vector.Fill|string}
   * @private
   */
  this.fill_;

  /**
   * @type {?string}
   * @private
   */
  this.radius_;

  /**
   * Pointer position.
   * @type {anychart.enums.GaugeSidePosition}
   * @private
   */
  this.position_;

  /**
   * Defines index of axis which will be used to display its data value.
   * @type {number}
   * @private
   */
  this.axisIndex_;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.domElement;
};
goog.inherits(anychart.core.axisMarkers.CircularRange, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.CircularRange.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.GAUGE_HATCH_FILL;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.CircularRange.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Range fill.
 * @param {(acgraph.vector.Fill)=} opt_value .
 * @return {(!anychart.core.axisMarkers.CircularRange|acgraph.vector.Fill)} .
 */
anychart.core.axisMarkers.CircularRange.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = acgraph.vector.normalizeFill(opt_value);
    if (this.fill_ != opt_value) {
      this.fill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else
    return this.fill_;
};


/**
 * Range radius. Sets relative gauge radius in percent.
 * @param {(number|string|null)=} opt_value .
 * @return {(string|anychart.core.axisMarkers.CircularRange)} .
 */
anychart.core.axisMarkers.CircularRange.prototype.radius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.radius_ != opt_value) {
      this.radius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.radius_;
  }
};


/**
 * Circular range ends radius.
 * @param {(null|number|string)=} opt_value .
 * @return {string|anychart.core.axisMarkers.CircularRange} .
 */
anychart.core.axisMarkers.CircularRange.prototype.cornersRounding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToPercent(opt_value);
    if (this.cornersRounding_ != opt_value) {
      this.cornersRounding_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cornersRounding_;
  }
};


/**
 * Axis index.
 * @param {number=} opt_index .
 * @return {number|anychart.core.axisMarkers.CircularRange} .
 */
anychart.core.axisMarkers.CircularRange.prototype.axisIndex = function(opt_index) {
  if (goog.isDef(opt_index)) {
    if (this.axisIndex_ != opt_index) {
      this.axisIndex_ = opt_index;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW |
          anychart.Signal.NEEDS_RECALCULATION
      );
    }
    return this;
  } else {
    return this.axisIndex_;
  }
};


/**
 * Set/get link to gauge.
 * @param {anychart.charts.CircularGauge=} opt_gauge Gauge inst for set.
 * @return {anychart.core.axisMarkers.CircularRange}
 */
anychart.core.axisMarkers.CircularRange.prototype.gauge = function(opt_gauge) {
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
 * Get/set starting range value.
 * @param {number=} opt_value .
 * @return {number|anychart.core.axisMarkers.CircularRange} .
 */
anychart.core.axisMarkers.CircularRange.prototype.from = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.from_ != opt_value) {
      this.from_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.from_;
  }
};


/**
 * Get/set ending range value.
 * @param {number=} opt_value .
 * @return {number|anychart.core.axisMarkers.CircularRange} .
 */
anychart.core.axisMarkers.CircularRange.prototype.to = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.to_ != opt_value) {
      this.to_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.to_;
  }
};


/**
 * Range position relative axis - inside, center, outside.
 * @param {(anychart.enums.SidePosition|string)=} opt_value .
 * @return {(anychart.enums.SidePosition|string|!anychart.core.axisMarkers.CircularRange)} .
 */
anychart.core.axisMarkers.CircularRange.prototype.position = function(opt_value) {
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
 * Range start size.
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.axisMarkers.CircularRange)} .
 */
anychart.core.axisMarkers.CircularRange.prototype.startSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.startSize_ != opt_value) {
      this.startSize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startSize_;
  }
};


/**
 * Range end size.
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.axisMarkers.CircularRange)} .
 */
anychart.core.axisMarkers.CircularRange.prototype.endSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.endSize_ != opt_value) {
      this.endSize_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.endSize_;
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
anychart.core.axisMarkers.CircularRange.prototype.drawDynamicArc_ = function(path, startAngle, endAngle, startR, endR, opt_moveTo) {
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
anychart.core.axisMarkers.CircularRange.prototype.getComplexRadius_ = function(radius, axisWidth, size, isStartPoint) {
  if (this.position_ == anychart.enums.GaugeSidePosition.OUTSIDE)
    return radius * (1 + (isStartPoint ? 0 : size)) + axisWidth / 2;
  else if (this.position_ == anychart.enums.GaugeSidePosition.INSIDE)
    return radius * (1 - (isStartPoint ? 0 : size)) - axisWidth / 2;
  else
    return radius * (1 + (isStartPoint ? -.5 : .5) * size);
};


/** @inheritDoc */
anychart.core.axisMarkers.CircularRange.prototype.remove = function() {
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
anychart.core.axisMarkers.CircularRange.prototype.isLinearGradient_ = function(fill) {
  return (goog.isObject(fill) && goog.isDef(fill['keys']) && !goog.isDef(fill['cx']) && !goog.isDef(fill['cy']));
};


/**
 * Calculates x, y.
 * @param {Object} point Coordinates.
 * @param {number} radius Radius.
 * @param {number} angle Angle.
 * @private
 */
anychart.core.axisMarkers.CircularRange.prototype.setPixelPoint_ = function(point, radius, angle) {
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
anychart.core.axisMarkers.CircularRange.prototype.drawGradientBlock_ = function(paths, startAngle, endAngle, startBaseR, endBaseR, startR, endR, color1, opacity1, color2, opacity2, index, cornersRoundingPixStart, startWidth, cornersRoundingPixEnd, endWidth) {
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

  var axis = this.gauge_.getAxis(/** @type {number} */(this.axisIndex()));
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
anychart.core.axisMarkers.CircularRange.prototype.clearPaths_ = function() {
  if (this.paths_ && this.paths_.length) {
    goog.array.forEach(this.paths_, function(path) {
      path.clear();
    });
  }
};


/**
 * Drawing.
 * @return {anychart.core.axisMarkers.CircularRange} .
 */
anychart.core.axisMarkers.CircularRange.prototype.draw = function() {
  var gauge = this.gauge_;
  var axis = gauge.getAxis(/** @type {number} */(this.axisIndex()));

  if (!this.checkDrawingNeeded())
    return this;

  if (!axis || !axis.enabled()) {
    if (this.domElement) this.domElement.clear();
    this.clearPaths_();
    return this;
  }

  var fill = /** @type {acgraph.vector.Fill} */ (this.fill());
  var isLinearGradient = this.isLinearGradient_(fill);
  if (isLinearGradient)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  this.clearPaths_();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var scale = axis.scale();
    var from = parseFloat(this.from_);
    var to = parseFloat(this.to_);

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

      var axisStartAngle = /** @type {number} */(goog.isDef(axis.startAngle()) ? axis.getStartAngle() : gauge.getStartAngle());
      var axisSweepAngle = /** @type {number} */(goog.isDef(axis.sweepAngle()) ? axis.sweepAngle() : gauge.sweepAngle());
      var startAngle = axisStartAngle + fromRatio * axisSweepAngle;
      var endAngle = axisStartAngle + toRatio * axisSweepAngle;

      var sweepAngle = endAngle - startAngle;
      if (!sweepAngle) sweepAngle = fromRatio == toRatio ? 0 : 360;

      var startAngleRad = goog.math.toRadians(startAngle);
      var endAngleRad = goog.math.toRadians(endAngle);

      var startSize = goog.isDefAndNotNull(this.startSize_) ? this.startSize_ : 0;
      var endSize = goog.isDefAndNotNull(this.endSize_) ? this.endSize_ : '10%';

      var startPercentSize = parseFloat(inverse ? endSize : startSize) / 100;
      var endPercentSize = parseFloat(inverse ? startSize : endSize) / 100;

      var radius = goog.isDefAndNotNull(this.radius_) ?
          anychart.utils.normalizeSize(this.radius_, gauge.getPixRadius()) :
          axis.getPixRadius();

      var axisWidth = goog.isDefAndNotNull(this.radius_) ? 0 : axis.getPixWidth();

      var baseStartR = this.getComplexRadius_(radius, axisWidth, startPercentSize, true);
      var baseEndR = this.getComplexRadius_(radius, axisWidth, endPercentSize, true);
      var startR = this.getComplexRadius_(radius, axisWidth, startPercentSize, false);
      var endR = this.getComplexRadius_(radius, axisWidth, endPercentSize, false);

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

      var startWidth = startR - baseStartR;
      var cornersRoundingPixStart = anychart.utils.normalizeSize(/** @type {string} */ (this.cornersRounding()), startWidth);
      var endWidth = endR - baseEndR;
      var cornersRoundingPixEnd = anychart.utils.normalizeSize(/** @type {string} */ (this.cornersRounding()), endWidth);

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
      this.domElement.fill(/** @type {acgraph.vector.Fill} */(this.fill()));
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
anychart.core.axisMarkers.CircularRange.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.CircularRange.base(this, 'serialize');

  json['axisIndex'] = this.axisIndex();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['position'] = this.position();
  if (goog.isDef(this.from())) json['from'] = this.from();
  if (goog.isDef(this.to())) json['to'] = this.to();
  if (goog.isDef(this.startSize())) json['startSize'] = this.startSize();
  if (goog.isDef(this.endSize())) json['endSize'] = this.endSize();
  if (goog.isDef(this.radius())) json['radius'] = this.radius();
  if (goog.isDef(this.cornersRounding())) json['cornersRounding'] = this.cornersRounding();

  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.CircularRange.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.CircularRange.base(this, 'setupByJSON', config, opt_default);

  this.axisIndex(config['axisIndex']);
  this.from(config['from']);
  this.to(config['to']);
  this.fill(config['fill']);
  this.position(config['position']);
  this.startSize(config['startSize']);
  this.endSize(config['endSize']);
  this.radius(config['radius']);
  this.cornersRounding(config['cornersRounding']);
};


/** @inheritDoc */
anychart.core.axisMarkers.CircularRange.prototype.disposeInternal = function() {
  goog.dispose(this.domElement);
  this.domElement = null;

  goog.disposeAll(this.paths_);
  this.paths_ = null;

  anychart.core.axisMarkers.CircularRange.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.axisMarkers.CircularRange.prototype;
  proto['fill'] = proto.fill;
  proto['axisIndex'] = proto.axisIndex;
  proto['position'] = proto.position;
  proto['startSize'] = proto.startSize;
  proto['endSize'] = proto.endSize;
  proto['from'] = proto.from;
  proto['to'] = proto.to;
  proto['radius'] = proto.radius;
  proto['cornersRounding'] = proto.cornersRounding;
})();
