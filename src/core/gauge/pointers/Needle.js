goog.provide('anychart.core.gauge.pointers.Needle');
goog.require('acgraph');
goog.require('anychart.core.gauge.pointers.Base');
goog.require('anychart.utils');



/**
 * Needle pointer class.<br/>
 * @constructor
 * @extends {anychart.core.gauge.pointers.Base}
 */
anychart.core.gauge.pointers.Needle = function() {
  anychart.core.gauge.pointers.Needle.base(this, 'constructor');
  /**
   * Pointer width.
   * @type {?string}
   * @private
   */
  this.startWidth_;

  /**
   * Pointer radius.
   * @type {?string}
   * @private
   */
  this.startRadius_;

  /**
   * Pointer width.
   * @type {?string}
   * @private
   */
  this.middleWidth_;

  /**
   * Pointer radius.
   * @type {?string}
   * @private
   */
  this.middleRadius_;

  /**
   * Pointer width.
   * @type {?string}
   * @private
   */
  this.endWidth_;

  /**
   * Pointer radius.
   * @type {?string}
   * @private
   */
  this.endRadius_;
};
goog.inherits(anychart.core.gauge.pointers.Needle, anychart.core.gauge.pointers.Base);


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.startWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.startWidth_ != opt_value) {
      this.startWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.startWidth_;
};


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.startRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.startRadius_ != opt_value) {
      this.startRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startRadius_;
  }
};


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.middleWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.middleWidth_ != opt_value) {
      this.middleWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.middleWidth_;
};


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.middleRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.middleRadius_ != opt_value) {
      this.middleRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.middleRadius_;
  }
};


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.endWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.endWidth_ != opt_value) {
      this.endWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.endWidth_;
};


/**
 * .
 * @param {(null|number|string)=} opt_value .
 * @return {(string|anychart.core.gauge.pointers.Needle)} .
 */
anychart.core.gauge.pointers.Needle.prototype.endRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.endRadius_ != opt_value) {
      this.endRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.endRadius_;
  }
};


/** @inheritDoc */
anychart.core.gauge.pointers.Needle.prototype.draw = function() {
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

    var pixStartRadius = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(this.startRadius_) ? this.startRadius_ : '-20%', gauge.getPixRadius());
    var pixStartWidth = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(this.startWidth_) ? this.startWidth_ : '3%', gauge.getPixRadius());


    var pixEndRadius = goog.isDefAndNotNull(this.endRadius_) ? anychart.utils.normalizeSize(
        this.endRadius_, gauge.getPixRadius()) : axisRadius;
    var pixEndWidth = goog.isDefAndNotNull(this.endWidth_) ? anychart.utils.normalizeSize(
        this.endWidth_, gauge.getPixRadius()) : 0;


    var pixMiddleRadius = goog.isDefAndNotNull(this.middleRadius_) ? anychart.utils.normalizeSize(
        this.middleRadius_, gauge.getPixRadius()) : pixEndRadius * 0.9;
    var pixMiddleWidth = anychart.utils.normalizeSize(
        goog.isDefAndNotNull(this.middleWidth_) ? this.middleWidth_ : '1%', gauge.getPixRadius());


    var valueRatio = goog.math.clamp(scale.transform(value), 0, 1);

    var angle = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle);
    var angleLeft = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle + 90);
    var angleRight = goog.math.standardAngle(axisStartAngle + valueRatio * axisSweepAngle - 90);

    var angleRad = goog.math.toRadians(angle);
    var angleRadLeft = goog.math.toRadians(angleLeft);
    var angleRadRight = goog.math.toRadians(angleRight);


    var startX = cx + pixStartRadius * Math.cos(angleRad);
    var startY = cy + pixStartRadius * Math.sin(angleRad);

    var startXLeft = startX + pixStartWidth * Math.cos(angleRadLeft);
    var startYLeft = startY + pixStartWidth * Math.sin(angleRadLeft);

    var startXRight = startX + pixStartWidth * Math.cos(angleRadRight);
    var startYRight = startY + pixStartWidth * Math.sin(angleRadRight);


    var middleX = cx + pixMiddleRadius * Math.cos(angleRad);
    var middleY = cy + pixMiddleRadius * Math.sin(angleRad);

    var middleXLeft = middleX + pixMiddleWidth * Math.cos(angleRadLeft);
    var middleYLeft = middleY + pixMiddleWidth * Math.sin(angleRadLeft);

    var middleXRight = middleX + pixMiddleWidth * Math.cos(angleRadRight);
    var middleYRight = middleY + pixMiddleWidth * Math.sin(angleRadRight);


    var endX = cx + pixEndRadius * Math.cos(angleRad);
    var endY = cy + pixEndRadius * Math.sin(angleRad);

    var endXLeft = endX + pixEndWidth * Math.cos(angleRadLeft);
    var endYLeft = endY + pixEndWidth * Math.sin(angleRadLeft);

    var endXRight = endX + pixEndWidth * Math.cos(angleRadRight);
    var endYRight = endY + pixEndWidth * Math.sin(angleRadRight);


    this.contextProvider['cx'] = cx;
    this.contextProvider['cy'] = cy;
    this.contextProvider['startRadius'] = pixStartRadius;
    this.contextProvider['startWidth'] = pixStartWidth;
    this.contextProvider['middleRadius'] = pixMiddleRadius;
    this.contextProvider['middleWidth'] = pixMiddleWidth;
    this.contextProvider['endRadius'] = pixEndRadius;
    this.contextProvider['endWidth'] = pixEndWidth;
    //we shouldn't opening secret for mere mortals
    this.contextProvider['angle'] = goog.math.standardAngle(angle - anychart.charts.CircularGauge.DEFAULT_START_ANGLE);


    this.domElement
        .moveTo(endXLeft, endYLeft)
        .lineTo(middleXLeft, middleYLeft)
        .lineTo(startXLeft, startYLeft)

        .lineTo(startXRight, startYRight)
        .lineTo(middleXRight, middleYRight)
        .lineTo(endXRight, endYRight);


    this.domElement.close();

    this.makeInteractive(/** @type {acgraph.vector.Path} */(this.domElement));

    if (this.hatchFillElement) {
      this.hatchFillElement.clear();
      this.hatchFillElement
          .moveTo(endXLeft, endYLeft)
          .lineTo(middleXLeft, middleYLeft)
          .lineTo(startXLeft, startYLeft)

          .lineTo(startXRight, startYRight)
          .lineTo(middleXRight, middleYRight)
          .lineTo(endXRight, endYRight);
      this.hatchFillElement.close();
    }

    if (goog.isFunction(this.fill()) || goog.isFunction(this.stroke()))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  anychart.core.gauge.pointers.Needle.base(this, 'draw');

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.gauge.pointers.Needle.prototype.serialize = function() {
  var json = anychart.core.gauge.pointers.Needle.base(this, 'serialize');

  if (goog.isDef(this.startRadius())) json['startRadius'] = this.startRadius();
  if (goog.isDef(this.middleRadius())) json['middleRadius'] = this.middleRadius();
  if (goog.isDef(this.endRadius())) json['endRadius'] = this.endRadius();
  if (goog.isDef(this.startWidth())) json['startWidth'] = this.startWidth();
  if (goog.isDef(this.middleWidth())) json['middleWidth'] = this.middleWidth();
  if (goog.isDef(this.endWidth())) json['endWidth'] = this.endWidth();

  return json;
};


/** @inheritDoc */
anychart.core.gauge.pointers.Needle.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.gauge.pointers.Needle.base(this, 'setupByJSON', config, opt_default);

  this.startRadius(config['startRadius']);
  this.middleRadius(config['middleRadius']);
  this.endRadius(config['endRadius']);
  this.startWidth(config['startWidth']);
  this.middleWidth(config['middleWidth']);
  this.endWidth(config['endWidth']);
};


//exports
(function() {
  var proto = anychart.core.gauge.pointers.Needle.prototype;
  proto['startRadius'] = proto.startRadius;
  proto['middleRadius'] = proto.middleRadius;
  proto['endRadius'] = proto.endRadius;
  proto['startWidth'] = proto.startWidth;
  proto['middleWidth'] = proto.middleWidth;
  proto['endWidth'] = proto.endWidth;
})();
