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
  goog.base(this);

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
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
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
 * @param {anychart.gauges.Circular=} opt_gauge Gauge inst for set.
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
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
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
    opt_value = goog.isNull(opt_value) ? opt_value : anychart.utils.normalizeToPercent(opt_value);
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
 * @private
 */
anychart.core.axisMarkers.CircularRange.prototype.drawDynamicArc_ = function(path, startAngle, endAngle, startR, endR) {
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

      path.lineTo(x, y);
    }
  } else {
    for (angle = startAngle; angle >= endAngle; angle--) {
      r = startR + dR * (angle - startAngle);

      radAngle = angle * Math.PI / 180;
      x = cx + r * Math.cos(radAngle);
      y = cy + r * Math.sin(radAngle);

      path.lineTo(x, y);
    }
  }

  radAngle = endAngle * Math.PI / 180;
  x = cx + r * Math.cos(radAngle);
  y = cy + r * Math.sin(radAngle);
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
    return this;
  }

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
      this.registerDisposable(this.domElement);
    } else
      this.domElement.clear();

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
      if (sweepAngle == 0) sweepAngle = fromRatio == toRatio ? 0 : 360;

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

      var startX, startY, endX, endY, x, y;

      var cx = gauge.getCx();
      var cy = gauge.getCy();

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

      if (endR == startR) {
        endX = cx + Math.cos(endAngleRad) * endR;
        endY = cy + Math.sin(endAngleRad) * endR;

        this.domElement.lineTo(endX, endY);
        this.domElement.arcTo(
            endR,
            endR,
            endAngle,
            -sweepAngle);
      } else {
        this.drawDynamicArc_(/** @type {acgraph.vector.Path} */(this.domElement), endAngle, startAngle, endR, startR);
      }

      this.domElement.close();
    } else {
      this.domElement.clear();
    }

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.domElement.fill(/** @type {acgraph.vector.Fill} */(this.fill()));
    this.domElement.stroke(/** @type {acgraph.vector.Stroke} */('none'));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.domElement.zIndex(/** @type {number} */(this.zIndex()));

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.domElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.CircularRange.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['axisIndex'] = this.axisIndex();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  json['position'] = this.position();
  if (goog.isDef(this.from())) json['from'] = this.from();
  if (goog.isDef(this.to())) json['to'] = this.to();
  if (goog.isDef(this.startSize())) json['startSize'] = this.startSize();
  if (goog.isDef(this.endSize())) json['endSize'] = this.endSize();
  if (goog.isDef(this.radius())) json['radius'] = this.radius();

  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.CircularRange.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.axisIndex(config['axisIndex']);
  this.from(config['from']);
  this.to(config['to']);
  this.fill(config['fill']);
  this.position(config['position']);
  this.startSize(config['startSize']);
  this.endSize(config['endSize']);
  this.radius(config['radius']);
};


//exports
anychart.core.axisMarkers.CircularRange.prototype['fill'] = anychart.core.axisMarkers.CircularRange.prototype.fill;
anychart.core.axisMarkers.CircularRange.prototype['axisIndex'] = anychart.core.axisMarkers.CircularRange.prototype.axisIndex;
anychart.core.axisMarkers.CircularRange.prototype['position'] = anychart.core.axisMarkers.CircularRange.prototype.position;
anychart.core.axisMarkers.CircularRange.prototype['startSize'] = anychart.core.axisMarkers.CircularRange.prototype.startSize;
anychart.core.axisMarkers.CircularRange.prototype['endSize'] = anychart.core.axisMarkers.CircularRange.prototype.endSize;
anychart.core.axisMarkers.CircularRange.prototype['from'] = anychart.core.axisMarkers.CircularRange.prototype.from;
anychart.core.axisMarkers.CircularRange.prototype['to'] = anychart.core.axisMarkers.CircularRange.prototype.to;
anychart.core.axisMarkers.CircularRange.prototype['radius'] = anychart.core.axisMarkers.CircularRange.prototype.radius;
