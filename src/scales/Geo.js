goog.provide('anychart.scales.Geo');

goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.scales.GeoTicks');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.Geo = function() {
  anychart.scales.Geo.base(this, 'constructor');
  /**
   * Threshold ticks count.
   * @type {number}
   * @private
   */
  this.maxTicksCount_ = 1000;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinX = Number.MAX_VALUE;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxX = -Number.MAX_VALUE;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinY = Number.MAX_VALUE;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxY = -Number.MAX_VALUE;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinLong = Number.MAX_VALUE;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxLong = -Number.MAX_VALUE;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinLat = Number.MAX_VALUE;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxLat = -Number.MAX_VALUE;

  /**
   * @type {boolean}
   * @protected
   */
  this.minimumLongModeAuto = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.minimumLatModeAuto = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.maximumLongModeAuto = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.maximumLatModeAuto = true;

  /**
   * @type {number}
   * @protected
   */
  this.rangeBasedGap = 0;

  /**
   * @type {number}
   * @protected
   */
  this.minX = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.maxX = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.minY = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.maxY = NaN;

  /**
   * @type {number}
   * @protected
   */
  this.rangeX = 1;

  /**
   * @type {number}
   * @protected
   */
  this.rangeY = 1;

  /**
   * If the scale is consistent. We can't use consistency states management due to the same behaviour for all scales.
   * @type {boolean}
   * @protected
   */
  this.consistent = false;

  /**
   * The number of current calculation sessions. Each chart starts a calculation session in its calculate() method and
   * finishes it in its draw() method beginning.
   * @type {number}
   * @private
   */
  this.autoCalcs_ = 0;

  /**
   * If the X scale is inverted.
   * @type {boolean}
   * @private
   */
  this.isInvertedX_;

  /**
   * Auto invert x.
   * @type {boolean}
   * @private
   */
  this.isInvertedXAuto_ = false;

  /**
   * If the Y scale is inverted.
   * @type {boolean}
   * @private
   */
  this.isInvertedY_;

  /**
   * Auto invert y.
   * @type {boolean}
   * @private
   */
  this.isInvertedYAuto_ = false;

  /**
   * Scale bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.bounds_ = null;
};
goog.inherits(anychart.scales.Geo, anychart.core.Base);


//region --- Class properties
/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.Geo.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * @type {number}
 */
anychart.scales.Geo.LIMIT_MINIMUM_LONG = -180;


/**
 * @type {number}
 */
anychart.scales.Geo.LIMIT_MAXIMUM_LONG = 180;


/**
 * @type {number}
 */
anychart.scales.Geo.LIMIT_MINIMUM_LAT = -90;


/**
 * @type {number}
 */
anychart.scales.Geo.LIMIT_MAXIMUM_LAT = 90;


//endregion
//region --- Internal settings
/**
 * Defines whether is svg type of map data.
 * @param {boolean} value
 */
anychart.scales.Geo.prototype.defWhetherIsSvgDataType = function(value) {
  this.isSvgData = value;
};


/**
 * Sets transformation map
 * @param {Object} value tx map.
 */
anychart.scales.Geo.prototype.setTxMap = function(value) {
  this.tx = value;
  this.consistent = false;
};


/**
 * Sets transformation map
 * @param {number} value tx map.
 */
anychart.scales.Geo.prototype.setMapZoom = function(value) {
  this.zoom = value;
};


/**
 * @param {number} dx tx map.
 * @param {number} dy tx map.
 */
anychart.scales.Geo.prototype.setOffsetFocusPoint = function(dx, dy) {
  this.dx_ = dx;
  this.dy_ = dy;
};


/**
 * Returns scale type.
 * @return {string}
 */
anychart.scales.Geo.prototype.getType = function() {
  return anychart.enums.MapsScaleTypes.GEO;
};


/**
 * Checks if previous data range differs from the current, dispatches a REAPPLICATION signal and returns the result.
 * @param {boolean} silently If set, the signal is not dispatched.
 * @return {boolean} If the scale was changed and it needs to be reapplied.
 * @protected
 */
anychart.scales.Geo.prototype.checkScaleChanged = function(silently) {
  var res = (this.oldDataRangeMinX != this.dataRangeMinX) || (this.oldDataRangeMaxX != this.dataRangeMaxX) ||
      (this.oldDataRangeMinY != this.dataRangeMinY) || (this.oldDataRangeMaxY != this.dataRangeMaxY);
  if (res) {
    this.consistent = false;
    if (!silently)
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return res;
};


//endregion
//region --- Bounds and View space
/**
 * Returns pixel bounds.
 * @return {anychart.math.Rect} .
 */
anychart.scales.Geo.prototype.getBounds = function() {
  return this.bounds_ ? this.bounds_.clone() : anychart.math.rect(0, 0, 0, 0);
};


/**
 * @param {anychart.math.Rect} value Bounds.
 * @return {anychart.scales.Geo} .
 */
anychart.scales.Geo.prototype.setBounds = function(value) {
  this.bounds_ = value;
  this.consistent = false;
  return this;
};


/**
 * View space calculation.
 */
anychart.scales.Geo.prototype.calculateViewSpace = function() {
  if (!this.viewSpace) {
    this.viewSpace = acgraph.path();
  }

  var precision = this.precision();
  var xPrecision = precision[0];
  var yPrecision = precision[1];

  var minLong = /** @type {number} */(this.minimumX());
  var maxLong = /** @type {number} */(this.maximumX());
  var minLat = /** @type {number} */(this.minimumY());
  var maxLat = /** @type {number} */(this.maximumY());

  this.viewSpace.clear();
  var xy;
  if (this.tx && anychart.core.map.projections.isBaseProjection(this.tx['default'].crs)) {
    xy = this.transformWithoutTx(minLong, minLat, null);
    this.viewSpace.moveTo(xy[0], xy[1]);
    xy = this.transformWithoutTx(minLong, maxLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);
    xy = this.transformWithoutTx(maxLong, maxLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);
    xy = this.transformWithoutTx(maxLong, minLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);
    xy = this.transformWithoutTx(minLong, minLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);
    this.viewSpace.close();
  } else {
    xy = this.transformWithoutTx(minLong, minLat, null);

    if (isNaN(xy[0]) || isNaN(xy[1])) return;

    this.viewSpace.moveTo(xy[0], xy[1]);
    var currLat = minLat;
    while (currLat < maxLat) {
      xy = this.transformWithoutTx(minLong, currLat, null);
      this.viewSpace.lineTo(xy[0], xy[1]);
      currLat += yPrecision;
    }
    xy = this.transformWithoutTx(minLong, maxLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);

    var currLong = minLong;
    while (currLong < maxLong) {
      xy = this.transformWithoutTx(currLong, maxLat, null);
      this.viewSpace.lineTo(xy[0], xy[1]);
      currLong += xPrecision;
    }
    xy = this.transformWithoutTx(maxLong, maxLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);

    currLat = maxLat;
    while (currLat > minLat) {
      xy = this.transformWithoutTx(maxLong, currLat, null);
      this.viewSpace.lineTo(xy[0], xy[1]);
      currLat -= yPrecision;
    }
    xy = this.transformWithoutTx(maxLong, minLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);

    currLong = maxLong;
    while (currLong > minLong) {
      xy = this.transformWithoutTx(currLong, minLat, null);
      this.viewSpace.lineTo(xy[0], xy[1]);
      currLong -= xPrecision;
    }
    xy = this.transformWithoutTx(minLong, minLat, null);
    this.viewSpace.lineTo(xy[0], xy[1]);
    this.viewSpace.close();
  }
};


/**
 * Returns space limited scale extremes.
 * @return {acgraph.vector.Path}
 */
anychart.scales.Geo.prototype.getViewSpace = function() {
  if (!this.viewSpace)
    this.calculate();
  return this.viewSpace;
};


//endregion
//region --- Ticks
/**
 * X ticks.
 * @param {Object=} opt_value .
 * @return {anychart.scales.GeoTicks|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.xTicks = function(opt_value) {
  if (!this.xTicks_) {
    this.xTicks_ = this.createTicks();
    this.xTicks_.setOrientation(anychart.enums.Layout.HORIZONTAL);
  }
  if (goog.isDef(opt_value)) {
    this.xTicks_.setup(opt_value);
    return this;
  }
  return this.xTicks_;
};


/**
 * X minor ticks.
 * @param {Object=} opt_value .
 * @return {anychart.scales.GeoTicks|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.xMinorTicks = function(opt_value) {
  if (!this.xMinorTicks_) {
    this.xMinorTicks_ = this.createTicks();
    this.xMinorTicks_.setOrientation(anychart.enums.Layout.HORIZONTAL);
  }
  if (goog.isDef(opt_value)) {
    this.xMinorTicks_.setup(opt_value);
    return this;
  }
  return this.xMinorTicks_;
};


/**
 * Y ticks.
 * @param {Object=} opt_value .
 * @return {anychart.scales.GeoTicks|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.yTicks = function(opt_value) {
  if (!this.yTicks_) {
    this.yTicks_ = this.createTicks();
    this.yTicks_.setOrientation(anychart.enums.Layout.VERTICAL);
  }
  if (goog.isDef(opt_value)) {
    this.yTicks_.setup(opt_value);
    return this;
  }
  return this.yTicks_;
};


/**
 * Y minor ticks.
 * @param {Object=} opt_value .
 * @return {anychart.scales.GeoTicks|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.yMinorTicks = function(opt_value) {
  if (!this.yMinorTicks_) {
    this.yMinorTicks_ = this.createTicks();
    this.yMinorTicks_.setOrientation(anychart.enums.Layout.VERTICAL);
  }
  if (goog.isDef(opt_value)) {
    this.yMinorTicks_.setup(opt_value);
    return this;
  }
  return this.yMinorTicks_;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.Geo.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 * Create scale ticks.
 * @return {!anychart.scales.GeoTicks}
 * @protected
 */
anychart.scales.Geo.prototype.createTicks = function() {
  var ticks = new anychart.scales.GeoTicks(this);
  this.registerDisposable(ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


//endregion
//region --- Scale settings
/**
 * Max ticks count for interval-mode ticks calculation.
 * @param {number=} opt_value
 * @return {number|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.maxTicksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, 1000, false);
    if (this.maxTicksCount_ != val) {
      this.maxTicksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.maxTicksCount_;
};


/**
 * Precision.
 * @param {(number|Array.<number>)=} opt_precisionOrXPrecision .
 * @param {number=} opt_yPrecision .
 * @return {Array.<number>|anychart.scales.Geo}
 */
anychart.scales.Geo.prototype.precision = function(opt_precisionOrXPrecision, opt_yPrecision) {
  if (arguments.length > 0) {
    var signal = 0;
    if (opt_precisionOrXPrecision) {
      if (goog.isArray(opt_precisionOrXPrecision)) {
        if (opt_precisionOrXPrecision.length > 1)
          opt_yPrecision = anychart.utils.toNumber(opt_precisionOrXPrecision[1]);
        opt_precisionOrXPrecision = anychart.utils.toNumber(opt_precisionOrXPrecision[0]);
      } else if (arguments.length == 1) {
        opt_yPrecision = opt_precisionOrXPrecision = anychart.utils.toNumber(opt_precisionOrXPrecision);
      }

      if (opt_precisionOrXPrecision != 0 && !isNaN(opt_precisionOrXPrecision)) {
        if (this.xPrecision_ != opt_precisionOrXPrecision) {
          this.xPrecision_ = opt_precisionOrXPrecision;
          signal = anychart.Signal.NEEDS_REAPPLICATION;
        }
      }
    }
    if (opt_yPrecision) {
      opt_yPrecision = anychart.utils.toNumber(opt_yPrecision);
      if (opt_yPrecision && this.yPrecision_ != opt_yPrecision) {
        this.yPrecision_ = opt_yPrecision;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    }

    this.dispatchSignal(signal);
    return this;
  } else {
    return [this.xPrecision_, this.yPrecision_];
  }
};


/**
 * Getter/setter for gap.
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.Geo} .
 */
anychart.scales.Geo.prototype.gap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.rangeBasedGap != opt_value) {
      this.rangeBasedGap = opt_value;
      if (this.maximumLongModeAuto || this.minimumLongModeAuto || this.maximumLatModeAuto || this.minimumLatModeAuto) {
        this.consistent = false;
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  return this.rangeBasedGap;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.Geo} Scale minimum.
 */
anychart.scales.Geo.prototype.minimumX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.math.clamp(anychart.utils.toNumber(opt_value), anychart.scales.Geo.LIMIT_MINIMUM_LONG, anychart.scales.Geo.LIMIT_MAXIMUM_LONG);
    var auto = isNaN(val);
    if (auto != this.minimumLongModeAuto || (!auto && val != this.minLong)) {
      if (val >= this.maxLong) {
        this.maximumX(val);
      } else {
        this.minimumLongModeAuto = auto;
        this.minLong = val;
        this.consistent = false;
        if (auto)
          this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
        else
          this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  this.calculate();
  return this.minLong;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.Geo} Scale maximum.
 */
anychart.scales.Geo.prototype.maximumX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.math.clamp(anychart.utils.toNumber(opt_value), anychart.scales.Geo.LIMIT_MINIMUM_LONG, anychart.scales.Geo.LIMIT_MAXIMUM_LONG);
    var auto = isNaN(val);
    if (auto != this.maximumLongModeAuto || (!auto && val != this.maxLong)) {
      if (val <= this.minLong) {
        this.minimumX(val);
      } else {
        this.maximumLongModeAuto = auto;
        this.maxLong = val;
        this.consistent = false;
        if (auto)
          this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
        else
          this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  this.calculate();
  return this.maxLong;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.Geo} Scale minimum.
 */
anychart.scales.Geo.prototype.minimumY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.math.clamp(anychart.utils.toNumber(opt_value), anychart.scales.Geo.LIMIT_MINIMUM_LAT, anychart.scales.Geo.LIMIT_MAXIMUM_LAT);
    var auto = isNaN(val);
    if (auto != this.minimumLatModeAuto || (!auto && val != this.minLat)) {
      if (val >= this.maxLat) {
        this.maximumY(val);
      } else {
        this.minimumLatModeAuto = auto;
        this.minLat = val;
        this.consistent = false;
        if (auto)
          this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
        else
          this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  this.calculate();
  return this.minLat;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.scales.Geo} Scale maximum.
 */
anychart.scales.Geo.prototype.maximumY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.math.clamp(anychart.utils.toNumber(opt_value), anychart.scales.Geo.LIMIT_MINIMUM_LAT, anychart.scales.Geo.LIMIT_MAXIMUM_LAT);
    var auto = isNaN(val);
    if (auto != this.maximumLatModeAuto || (!auto && val != this.maxLat)) {
      if (val <= this.minLat) {
        this.minimumY(val);
      } else {
        this.maximumLatModeAuto = auto;
        this.maxLat = val;
        this.consistent = false;
        if (auto)
          this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
        else
          this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
      }
    }
    return this;
  }
  this.calculate();
  return this.maxLat;
};


/**
 * Auto invert.
 * @param {boolean} invertX
 * @param {boolean} invertY
 */
anychart.scales.Geo.prototype.autoInvert = function(invertX, invertY) {
  this.isInvertedXAuto_ = invertX;
  this.isInvertedYAuto_ = invertY;
};


/**
 * Getter and setter for scale inversion.
 * @param {(boolean|Array.<boolean>)=} opt_invertedOrInvertedX Common inverted or x inverted state to set.
 * @param {boolean=} opt_invertedY Inverted Y state to set.
 * @return {(!anychart.scales.Geo|Array.<boolean>)} Inverted state or itself for method chaining.
 */
anychart.scales.Geo.prototype.inverted = function(opt_invertedOrInvertedX, opt_invertedY) {
  if (goog.isDef(opt_invertedOrInvertedX) || goog.isDef(opt_invertedY)) {
    var signal = 0;
    if (goog.isDef(opt_invertedOrInvertedX)) {
      if (goog.isArray(opt_invertedOrInvertedX)) {
        if (opt_invertedOrInvertedX.length > 1)
          opt_invertedY = opt_invertedOrInvertedX[1];
        opt_invertedOrInvertedX = opt_invertedOrInvertedX[0];
      }

      if (this.isInvertedX_ != opt_invertedOrInvertedX) {
        this.isInvertedX_ = !!opt_invertedOrInvertedX;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    }

    if (goog.isDef(opt_invertedY)) {
      opt_invertedY = !!opt_invertedY;
      if (this.isInvertedY_ != opt_invertedY) {
        this.isInvertedY_ = opt_invertedY;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    } else if (arguments.length == 1) {
      opt_invertedOrInvertedX = !!opt_invertedOrInvertedX;
      if (this.isInvertedY_ != opt_invertedOrInvertedX) {
        this.isInvertedY_ = opt_invertedOrInvertedX;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    }

    this.dispatchSignal(signal);
    return this;
  }
  return [this.isInvertedX(), this.isInvertedY()];
};


/**
 * Returns full invert state of X scale direction.
 * @return {boolean}
 */
anychart.scales.Geo.prototype.isInvertedX = function() {
  return goog.isDef(this.isInvertedX_) ? this.isInvertedX_ : this.isInvertedXAuto_;
};


/**
 * Returns full invert state of Y scale direction.
 * @return {boolean}
 */
anychart.scales.Geo.prototype.isInvertedY = function() {
  return goog.isDef(this.isInvertedY_) ? this.isInvertedY_ : this.isInvertedYAuto_;
};


//endregion
//region --- Calculation
/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Geo} {@link anychart.scales.Geo} instance for method chaining.
 */
anychart.scales.Geo.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length - 1; i = i + 2) {
    var lon = parseFloat(+arguments[i]);
    var lat = parseFloat(+arguments[i + 1]);

    if (isNaN(lon) || isNaN(lat))
      continue;

    // if (!this.isSvgData) {
    //   if (lon < anychart.scales.Geo.LIMIT_MINIMUM_LONG || lon > anychart.scales.Geo.LIMIT_MAXIMUM_LONG) {
    //     lon = goog.math.clamp(lon, anychart.scales.Geo.LIMIT_MINIMUM_LONG, anychart.scales.Geo.LIMIT_MAXIMUM_LONG);
    //   }
    //   if (lat < anychart.scales.Geo.LIMIT_MINIMUM_LAT || lat > anychart.scales.Geo.LIMIT_MAXIMUM_LAT) {
    //     lat = goog.math.clamp(lat, anychart.scales.Geo.LIMIT_MINIMUM_LAT, anychart.scales.Geo.LIMIT_MAXIMUM_LAT);
    //   }
    // }

    if (lon < this.dataRangeMinLong) {
      this.dataRangeMinLong = lon;
      this.consistent = false;
    }
    if (lon > this.dataRangeMaxLong) {
      this.dataRangeMaxLong = lon;
      this.consistent = false;
    }

    if (lat < this.dataRangeMinLat) {
      this.dataRangeMinLat = lat;
      this.consistent = false;
    }
    if (lat > this.dataRangeMaxLat) {
      this.dataRangeMaxLat = lat;
      this.consistent = false;
    }
  }

  if (!this.consistent) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }

  return this;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.scales.Geo} {@link anychart.scales.Geo} instance for method chaining.
 */
anychart.scales.Geo.prototype.extendDataRangeInternal = function(var_args) {
  var coords = arguments;

  for (var i = 0; i < coords.length - 1; i = i + 2) {
    var x = +coords[i];
    var y = +coords[i + 1];
    if (isNaN(x)) x = parseFloat(coords[i]);
    if (isNaN(y)) y = parseFloat(coords[i + 1]);

    if (this.isCalcLatLon) {
      var latlon = this.scaleToLatLon(x, y, null);

      // if (!this.isSvgData) {
      //   var lon = latlon[0];
      //   var lat = latlon[1];
      //   var scaledLatLon, needCorrect;
      //   if (lon < anychart.scales.Geo.LIMIT_MINIMUM_LONG || lon > anychart.scales.Geo.LIMIT_MAXIMUM_LONG) {
      //     needCorrect = true;
      //     latlon[0] = goog.math.clamp(lon, anychart.scales.Geo.LIMIT_MINIMUM_LONG, anychart.scales.Geo.LIMIT_MAXIMUM_LONG);
      //   }
      //   if (lat < anychart.scales.Geo.LIMIT_MINIMUM_LAT || lat > anychart.scales.Geo.LIMIT_MAXIMUM_LAT) {
      //     needCorrect = true;
      //     latlon[1] = goog.math.clamp(lat, anychart.scales.Geo.LIMIT_MINIMUM_LAT, anychart.scales.Geo.LIMIT_MAXIMUM_LAT);
      //   }
      //   if (needCorrect) {
      //     scaledLatLon = this.latLonToScale(latlon[0], latlon[1]);
      //     x = scaledLatLon[0];
      //     y = scaledLatLon[1];
      //   }
      // }

      this.extendDataRange.apply(this, latlon);

      // this.extendDataRange(x, y);
    }

    if (x < this.dataRangeMinX) {
      this.dataRangeMinX = x;
      this.consistent = false;
    }
    if (x > this.dataRangeMaxX) {
      this.dataRangeMaxX = x;
      this.consistent = false;
    }

    if (y < this.dataRangeMinY) {
      this.dataRangeMinY = y;
      this.consistent = false;
    }
    if (y > this.dataRangeMaxY) {
      this.dataRangeMaxY = y;
      this.consistent = false;
    }
  }
  return this;
};


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.scales.Geo} Itself for chaining.
 * @protected
 */
anychart.scales.Geo.prototype.resetDataRange = function() {
  if (this.isCalcLatLon) {
    this.oldDataRangeMinLong = this.dataRangeMinLong;
    this.oldDataRangeMaxLong = this.dataRangeMaxLong;
    this.oldDataRangeMinLat = this.dataRangeMinLat;
    this.oldDataRangeMaxLat = this.dataRangeMaxLat;
    this.dataRangeMinLong = Number.MAX_VALUE;
    this.dataRangeMaxLong = -Number.MAX_VALUE;
    this.dataRangeMinLat = Number.MAX_VALUE;
    this.dataRangeMaxLat = -Number.MAX_VALUE;
  }

  this.oldDataRangeMinX = this.dataRangeMinX;
  this.oldDataRangeMaxX = this.dataRangeMaxX;
  this.oldDataRangeMinY = this.dataRangeMinY;
  this.oldDataRangeMaxY = this.dataRangeMaxY;
  this.dataRangeMinX = Number.MAX_VALUE;
  this.dataRangeMaxX = -Number.MAX_VALUE;
  this.dataRangeMinY = Number.MAX_VALUE;
  this.dataRangeMaxY = -Number.MAX_VALUE;

  this.consistent = false;
  return this;
};


/**
 * @return {boolean} Returns true if the scale needs input domain auto calculations.
 */
anychart.scales.Geo.prototype.needsAutoCalc = function() {
  return this.minimumLongModeAuto || this.minimumLatModeAuto || this.maximumLongModeAuto || this.maximumLatModeAuto;
};


/**
 * Informs scale that an auto range calculation started for the chart, so it should reset its data range on the first
 * call of this method if needed.
 * @param {boolean=} opt_calcLatLon Whether calc lat lon extremes.
 * @return {!anychart.scales.Geo} Chaining.
 */
anychart.scales.Geo.prototype.startAutoCalc = function(opt_calcLatLon) {
  this.isCalcLatLon = goog.isDef(opt_calcLatLon) ? opt_calcLatLon : true;
  if (!this.autoCalcs_)
    this.resetDataRange();
  this.autoCalcs_++;
  return this;
};


/**
 * Informs the scale that an auto range calculation started for the chart in past was ended.
 * @param {boolean=} opt_silently If this flag is set, do not dispatch an event if reapplication needed.
 * @return {boolean} If the calculation changed the scale and it needs to be reapplied.
 */
anychart.scales.Geo.prototype.finishAutoCalc = function(opt_silently) {
  this.autoCalcs_ = Math.max(this.autoCalcs_ - 1, 0);
  if (!this.autoCalcs_) {
    return this.checkScaleChanged(!!opt_silently);
  } else
    return true; // todo: additional stuff when calculating shared scales!
};


/**
 * Ensures that ticks are initialized for the scale.
 * NOTE: THIS METHOD IS FOR INTERNAL USE IN THE SCALE AND TICKS ONLY. DO NOT PUBLISH IT.
 */
anychart.scales.Geo.prototype.calculate = function() {
  if (this.consistent || !this.bounds_) return;

  this.consistent = true;
  this.determineScaleMinMax();

  var minPoint = [this.minLong, this.minLat];
  var maxPoint = [this.maxLong, this.maxLat];

  var xSetupResult = this.xTicks().setupAsMajor(minPoint[0], maxPoint[0]);
  var ySetupResult = this.yTicks().setupAsMajor(minPoint[1], maxPoint[1]);

  this.xMinorTicks().setupAsMinor(this.xTicks().getInternal(), xSetupResult[2], xSetupResult[3]);
  this.yMinorTicks().setupAsMinor(this.yTicks().getInternal(), ySetupResult[2], ySetupResult[3]);

  this.rangeX = this.maxX - this.minX;
  this.rangeY = this.maxY - this.minY;

  this.longRange = this.maxLong - this.minLong;
  this.latRange = this.maxLat - this.minLat;

  this.ratio = Math.min(this.bounds_.height / this.rangeY, this.bounds_.width / this.rangeX);
  this.centerOffsetX = (this.bounds_.width - this.rangeX * this.ratio) / 2;
  this.centerOffsetY = (this.bounds_.height - this.rangeY * this.ratio) / 2;

  //apply gap
  var extremesForMinLong = this.getExtremesForDimension(this.minLong, true);
  var extremesForMaxLong = this.getExtremesForDimension(this.maxLong, true);
  var extremesForMinLat = this.getExtremesForDimension(this.minLat, false);
  var extremesForMaxLat = this.getExtremesForDimension(this.maxLat, false);

  this.minX = Math.min(extremesForMinLong.minX, extremesForMaxLong.minX, extremesForMinLat.minX, extremesForMaxLat.minX,
      extremesForMinLong.maxX, extremesForMaxLong.maxX, extremesForMinLat.maxX, extremesForMaxLat.maxX);
  this.maxX = Math.max(extremesForMinLong.minX, extremesForMaxLong.minX, extremesForMinLat.minX, extremesForMaxLat.minX,
      extremesForMinLong.maxX, extremesForMaxLong.maxX, extremesForMinLat.maxX, extremesForMaxLat.maxX);
  this.minY = Math.min(extremesForMinLong.minY, extremesForMaxLong.minY, extremesForMinLat.minY, extremesForMaxLat.minY,
      extremesForMinLong.maxY, extremesForMaxLong.maxY, extremesForMinLat.maxY, extremesForMaxLat.maxY);
  this.maxY = Math.max(extremesForMinLong.minY, extremesForMaxLong.minY, extremesForMinLat.minY, extremesForMaxLat.minY,
      extremesForMinLong.maxY, extremesForMaxLong.maxY, extremesForMinLat.maxY, extremesForMaxLat.maxY);

  this.rangeX = this.maxX - this.minX;
  this.rangeY = this.maxY - this.minY;

  this.longRange = this.maxLong - this.minLong;
  this.latRange = this.maxLat - this.minLat;

  this.ratio = Math.min(this.bounds_.height / this.rangeY, this.bounds_.width / this.rangeX);
  this.centerOffsetX = (this.bounds_.width - this.rangeX * this.ratio) / 2;
  this.centerOffsetY = (this.bounds_.height - this.rangeY * this.ratio) / 2;

  this.calculateViewSpace();
};


/**
 * Returns extremes for passed dimension.
 * @param {number} dimensionValue One of values of dimension.
 * @param {boolean} isHorizontal Dimension orientation.
 * @return {Object.<number>}
 */
anychart.scales.Geo.prototype.getExtremesForDimension = function(dimensionValue, isHorizontal) {
  var xy;
  var minX = Number.MAX_VALUE;
  var minY = Number.MAX_VALUE;
  var maxX = -Number.MAX_VALUE;
  var maxY = -Number.MAX_VALUE;
  var currValue, minLat, maxLat, minLong, maxLong;

  var precision = this.precision();
  var xPrecision = precision[0];
  var yPrecision = precision[1];

  if (isHorizontal) {
    // latLon = this.scaleToLatLon(dimensionValue, this.minLat, null);
    // dimensionValue = latLon[0];
    // minLat = latLon[1];
    // maxLat = this.scaleToLatLon(dimensionValue, this.maxLat, null)[1];

    minLat = this.minLat;
    maxLat = this.maxLat;

    if (this.tx && anychart.core.map.projections.isBaseProjection(this.tx['default'].crs)) {
      xy = this.latLonToScale(dimensionValue, minLat, null);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
      xy = this.latLonToScale(dimensionValue, maxLat, null);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
    } else {
      currValue = minLat;
      while (currValue < maxLat) {
        xy = this.latLonToScale(dimensionValue, currValue, null);
        // xy = this.transformWithoutTx(dimensionValue, currValue, null);
        // xy = this.pxToScale(xy[0], xy[1]);
        if (xy[0] < minX) minX = xy[0];
        if (xy[0] > maxX) maxX = xy[0];
        if (xy[1] < minY) minY = xy[1];
        if (xy[1] > maxY) maxY = xy[1];
        currValue += yPrecision;
      }
      xy = this.latLonToScale(dimensionValue, maxLat, null);
      // xy = this.transformWithoutTx(dimensionValue, this.maxLat, null);
      // xy = this.pxToScale(xy[0], xy[1]);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
    }
  } else {
    // latLon = this.scaleToLatLon(this.minLong, dimensionValue, null);
    // dimensionValue = latLon[1];
    // minLong = latLon[0];
    // maxLong = this.scaleToLatLon(this.maxLong, dimensionValue, null)[0];

    minLong = this.minLong;
    maxLong = this.maxLong;

    if (this.tx && anychart.core.map.projections.isBaseProjection(this.tx['default'].crs)) {
      xy = this.latLonToScale(minLong, dimensionValue, null);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
      xy = this.latLonToScale(maxLong, dimensionValue, null);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
    } else {

      if (minLong > maxLong) {
        currValue = minLong;
        while (currValue < 180) {
          xy = this.latLonToScale(currValue, dimensionValue, null);
          // xy = this.transformWithoutTx(currValue, dimensionValue, null);
          // xy = this.pxToScale(xy[0], xy[1]);
          if (xy[0] < minX) minX = xy[0];
          if (xy[0] > maxX) maxX = xy[0];
          if (xy[1] < minY) minY = xy[1];
          if (xy[1] > maxY) maxY = xy[1];
          currValue += xPrecision;
        }

        currValue = -180;
        while (currValue < minLong) {
          xy = this.latLonToScale(currValue, dimensionValue, null);
          // xy = this.transformWithoutTx(currValue, dimensionValue, null);
          // xy = this.pxToScale(xy[0], xy[1]);
          if (xy[0] < minX) minX = xy[0];
          if (xy[0] > maxX) maxX = xy[0];
          if (xy[1] < minY) minY = xy[1];
          if (xy[1] > maxY) maxY = xy[1];
          currValue += xPrecision;
        }
      } else {
        currValue = minLong;
        while (currValue < maxLong) {
          xy = this.latLonToScale(currValue, dimensionValue, null);
          // xy = this.transformWithoutTx(currValue, dimensionValue, null);
          // xy = this.pxToScale(xy[0], xy[1]);
          if (xy[0] < minX) minX = xy[0];
          if (xy[0] > maxX) maxX = xy[0];
          if (xy[1] < minY) minY = xy[1];
          if (xy[1] > maxY) maxY = xy[1];
          currValue += xPrecision;
        }
      }

      xy = this.latLonToScale(maxLong, dimensionValue, null);
      // xy = this.transformWithoutTx(this.maxLong, dimensionValue, null);
      // xy = this.pxToScale(xy[0], xy[1]);
      if (xy[0] < minX) minX = xy[0];
      if (xy[0] > maxX) maxX = xy[0];
      if (xy[1] < minY) minY = xy[1];
      if (xy[1] > maxY) maxY = xy[1];
    }
  }

  return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
};


/**
 * Determines this.min, this.max and this.range.
 * @protected
 */
anychart.scales.Geo.prototype.determineScaleMinMax = function() {
  var maxLong = this.maximumLongModeAuto ?
      this.dataRangeMaxLong :
      this.maxLong;
  var minLong = this.minimumLongModeAuto ?
      this.dataRangeMinLong :
      this.minLong;

  var maxLat = this.maximumLatModeAuto ?
      this.dataRangeMaxLat :
      this.maxLat;
  var minLat = this.minimumLatModeAuto ?
      this.dataRangeMinLat :
      this.minLat;

  var rangeLong = maxLong - minLong;
  var rangeLat = maxLat - minLat;

  if (this.minimumLongModeAuto)
    this.minLong = this.dataRangeMinLong - rangeLong * this.rangeBasedGap;
  if (this.maximumLongModeAuto)
    this.maxLong = this.dataRangeMaxLong + rangeLong * this.rangeBasedGap;

  if (this.minimumLatModeAuto)
    this.minLat = this.dataRangeMinLat - rangeLat * this.rangeBasedGap;
  if (this.maximumLatModeAuto)
    this.maxLat = this.dataRangeMaxLat + rangeLat * this.rangeBasedGap;

  this.minX = this.dataRangeMinX;
  this.minY = this.dataRangeMinY;
  this.maxX = this.dataRangeMaxX;
  this.maxY = this.dataRangeMaxY;
};


//endregion
//region --- Translation
/**
 * @param {number} x X value to transform in input scope.
 * @param {number} y Y value to transform in input scope.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.scales.Geo.prototype.scaleToPx = function(x, y) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  var transformX = (x - this.minX) * this.ratio;
  var transformY = (-y + this.maxY) * this.ratio;

  var resultX = this.isInvertedX() ?
      this.bounds_.getRight() - this.centerOffsetX - transformX :
      this.bounds_.left + this.centerOffsetX + transformX;

  var resultY = this.isInvertedY() ?
      this.bounds_.getBottom() - this.centerOffsetY - transformY :
      this.bounds_.top + this.centerOffsetY + transformY;

  return [resultX, resultY];
};


/**
 * @param {*} x X value to transform in input scope.
 * @param {*} y Y value to transform in input scope.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.scales.Geo.prototype.pxToScale = function(x, y) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  var transformX = this.isInvertedX() ?
      this.bounds_.getRight() - this.centerOffsetX - x :
      x - this.bounds_.left - this.centerOffsetX;

  var transformY = this.isInvertedY() ?
      this.bounds_.getBottom() - this.centerOffsetY - y :
      y - this.bounds_.top - this.centerOffsetY;

  var resultX = +(/** @type {number} */(transformX)) / this.ratio + this.minX;
  var resultY = -(/** @type {number} */(transformY)) / this.ratio + this.maxY;

  return [resultX, resultY];
};


/**
 * Convert lat and lon to projection with tx.
 * @param {number} lon .
 * @param {number} lat .
 * @param {Object} tx .
 * @return {Array.<number>}
 */
anychart.scales.Geo.prototype.projectLatLon = function(lon, lat, tx) {
  var projected, result;
  var defaultTx = this.tx['default'];
  var proj = tx.curProj || defaultTx.curProj;

  projected = proj.forward(lon, lat);

  projected[0] = projected[0] * (tx.scale || defaultTx.scale);
  projected[1] = projected[1] * (tx.scale || defaultTx.scale);

  projected[0] += tx.xoffset || 0;
  projected[1] += tx.yoffset || 0;

  return [projected[0], projected[1]];
};


/**
 * Test for point in hitZone.
 * @param {number} x .
 * @param {number} y .
 * @param {Array.<Array.<number>>} polygon .
 * @return {boolean}
 */
anychart.scales.Geo.prototype.pointInHitZone = function(x, y, polygon) {
  var i, j, rel1, rel2, c = false;

  for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    rel1 = polygon[i][1] > y;
    rel2 = polygon[j][1] > y;
    if (rel1 !== rel2 && (x < (polygon[j][0] - polygon[i][0]) * (y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
      c = !c;
    }
  }

  return c;
};


/**
 * Returns tx object for passed coords.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @return {Array.<Object|number>}
 */
anychart.scales.Geo.prototype.pickTx = function(lon, lat) {
  if (!this.tx) return null;

  var x_ = NaN, y_ = NaN;
  var txName = goog.object.findKey(this.tx, function(value, key) {
    if (key != 'default' && value.heatZone) {

      var projected = this.projectLatLon(lon, lat, value);
      var x = projected[0];
      var y = projected[1];

      var heatZone = value.heatZone;
      var isHeatZoneContains = goog.isArray(heatZone) ?
          this.pointInHitZone(x, y, heatZone) :
          x >= heatZone.left &&
          x <= heatZone.left + heatZone.width &&
          y <= heatZone.top &&
          y >= heatZone.top - heatZone.height;


      if (isHeatZoneContains) {
        x_ = x;
        y_ = y;
      }

      return isHeatZoneContains;
    }

    return false;
  }, this) || 'default';

  return [this.tx[txName], x_, y_];
};


/**
 * Transform coords in lat/lon to pixel values.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @param {?string=} opt_txName Name of TX.
 * @return {Array.<number>} Transformed value adjust bounds [x, y].
 */
anychart.scales.Geo.prototype.transformWithoutTx = function(lon, lat, opt_txName) {
  if (!this.tx) return [];
  this.calculate();

  // var latlon = this.latLonToScale(lon, lat, opt_txName);
  var tx, x, y;
  if (goog.isDef(opt_txName)) {
    tx = (!goog.isNull(opt_txName) && opt_txName in this.tx) ? this.tx[opt_txName] : this.tx['default'];
  } else {
    var pickResult = this.pickTx(lon, lat);
    tx = pickResult[0];
    x = pickResult[1];
    y = pickResult[2];
  }

  if (isNaN(x)) {
    var projected = this.projectLatLon(lon, lat, tx);

    x = projected[0];
    y = projected[1];
  }

  if (!this.bounds_ || isNaN(x) || isNaN(y))
    return [NaN, NaN];

  var transformX = (+(/** @type {number} */(x)) - this.minX) * this.ratio;
  var transformY = (-(/** @type {number} */(y)) + this.maxY) * this.ratio;

  var resultX = this.isInvertedX() ?
      this.bounds_.getRight() - this.centerOffsetX - transformX :
      this.bounds_.left + this.centerOffsetX + transformX;

  var resultY = this.isInvertedY() ?
      this.bounds_.getBottom() - this.centerOffsetY - transformY :
      this.bounds_.top + this.centerOffsetY + transformY;

  return [resultX, resultY];
};


/**
 * Transform lat/lon coords to pixel values.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @param {?string=} opt_txName Name of TX.
 * @return {Array.<number>} Transformed value adjust bounds [x, y].
 */
anychart.scales.Geo.prototype.transform = function(lon, lat, opt_txName) {
  var coords = this.transformWithoutTx(lon, lat, opt_txName);

  coords[0] = coords[0] * this.zoom + this.dx_;
  coords[1] = coords[1] * this.zoom + this.dy_;

  return coords;
};


/**
 * Transform coords in pixel value to degrees values (lon/lat).
 * @param {number} x X value to transform.
 * @param {number} y Y value to transform.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.scales.Geo.prototype.inverseTransform = function(x, y) {
  this.calculate();

  if (!this.bounds_ || isNaN(x) || isNaN(y))
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  x = (x - this.dx_) / this.zoom;
  y = (y - this.dy_) / this.zoom;

  var transformX = this.isInvertedX() ?
      this.bounds_.getRight() - this.centerOffsetX - x :
      x - this.bounds_.left - this.centerOffsetX;

  var transformY = this.isInvertedY() ?
      this.bounds_.getBottom() - this.centerOffsetY - y :
      y - this.bounds_.top - this.centerOffsetY;


  var resultX = +(/** @type {number} */(transformX)) / this.ratio + this.minX;
  var resultY = -(/** @type {number} */(transformY)) / this.ratio + this.maxY;

  return this.scaleToLatLon(resultX, resultY);
};


/**
 * Returns tick position ratio by its name.<br/>
 * @param {*} value Value to transform in input scope.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.Geo.prototype.transformX = function(value) {
  this.calculate();
  value = anychart.utils.toNumber(value);
  var result = anychart.math.round((value - this.minLong) / this.longRange, 3);

  return this.isInvertedX() ? 1 - result : result;
};


/**
 * Returns tick position ratio by its name.<br/>
 * @param {*} value Value to transform in input scope.
 * @return {number} Value transformed to scope [0, 1].
 */
anychart.scales.Geo.prototype.transformY = function(value) {
  this.calculate();
  value = anychart.utils.toNumber(value);
  var result = anychart.math.round((value - this.minLat) / this.latRange, 3);

  return this.isInvertedY() ? 1 - result : result;
};


/**
 *
 * @param {number} x .
 * @param {number} y .
 * @param {?string=} opt_txName .
 * @return {Array.<number>} .
 */
anychart.scales.Geo.prototype.scaleToLatLon = function(x, y, opt_txName) {
  if (!this.tx) return [];

  var defaultTx = this.tx['default'];

  var txName;
  if (goog.isDef(opt_txName)) {
    txName = opt_txName in this.tx ? opt_txName : 'default';
  } else {
    txName = goog.object.findKey(this.tx, function(value, key) {
      if (key != 'default' && value.heatZone) {
        var heatZone = value.heatZone;

        return goog.isArray(heatZone) ?
            this.pointInHitZone(x, y, heatZone) :
            x >= heatZone.left &&
            x <= heatZone.left + heatZone.width &&
            y <= heatZone.top &&
            y >= heatZone.top - heatZone.height;
      }
      return false;
    }, this) || 'default';
  }

  var tx = this.tx[txName];

  var result;
  var proj = tx.curProj || defaultTx.curProj;

  x -= tx.xoffset || defaultTx.xoffset || 0;
  y -= tx.yoffset || defaultTx.yoffset || 0;

  var scale = tx.scale || defaultTx.scale;
  var crs = tx.crs || defaultTx.crs;

  result = crs ?
      proj.invert(x / scale, y / scale) :
      [x / scale, y / scale];

  return result;
};


/**
 * Convert lat/lon coords to scale.
 * @param {number} lon .
 * @param {number} lat .
 * @param {?string=} opt_txName .
 * @return {Array.<number>} .
 */
anychart.scales.Geo.prototype.latLonToScale = function(lon, lat, opt_txName) {
  if (isNaN(lon) || isNaN(lat))
    return [NaN, NaN];

  var tx, x = NaN, y = NaN;
  if (goog.isDef(opt_txName)) {
    tx = (!goog.isNull(opt_txName) && opt_txName in this.tx) ? this.tx[opt_txName] : this.tx['default'];
  } else {
    var pickResult = this.pickTx(lon, lat);
    tx = pickResult[0];
    x = pickResult[1];
    y = pickResult[2];
  }

  var coords;
  if (isNaN(x)) {
    var defaultTx = this.tx['default'];
    var proj = tx.curProj || defaultTx.curProj;

    var projected = proj.forward(lon, lat);

    projected[0] = projected[0] * (tx.scale || defaultTx.scale);
    projected[1] = projected[1] * (tx.scale || defaultTx.scale);

    //todo (blackart) special shit for anychart world map ver 1.2.0
    if (tx.xoffset != -620.8680523857) {
      projected[0] += tx.xoffset || 0;
      projected[1] += tx.yoffset || 0;
    }

    coords = [projected[0], projected[1]];
  } else {
    coords = [x, y];
  }

  return coords;
};


//endregion
//region --- Serialization
/** @inheritDoc */
anychart.scales.Geo.prototype.serialize = function() {
  var json = anychart.scales.Geo.base(this, 'serialize');
  json['type'] = this.getType();
  // json['inverted'] = this.inverted();
  if (!this.maximumLongModeAuto) json['maximumX'] = this.maxLong;
  if (!this.maximumLatModeAuto) json['maximumY'] = this.maxLat;
  if (!this.minimumLongModeAuto) json['minimumX'] = this.minLong;
  if (!this.minimumLatModeAuto) json['minimumY'] = this.minLat;
  json['precision'] = this.precision();
  json['gap'] = this.gap();
  // if (this.bounds_) json['bounds'] = this.bounds_;
  json['xTicks'] = this.xTicks().serialize();
  json['xMinorTicks'] = this.xMinorTicks().serialize();
  json['yTicks'] = this.yTicks().serialize();
  json['yMinorTicks'] = this.yMinorTicks().serialize();
  json['maxTicksCount'] = this.maxTicksCount_;
  return json;
};


/** @inheritDoc */
anychart.scales.Geo.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Geo.base(this, 'setupByJSON', config, opt_default);
  // this.inverted(config['inverted']);
  this.minimumX(config['minimumX']);
  this.minimumY(config['minimumY']);
  this.maximumX(config['maximumX']);
  this.maximumY(config['maximumY']);
  this.precision(config['precision']);
  this.gap(config['gap']);
  // if ('bounds' in config) this.setBounds(config['bounds']);
  this.xTicks(config['xTicks']);
  this.xMinorTicks(config['xMinorTicks']);
  this.yTicks(config['yTicks']);
  this.yMinorTicks(config['yMinorTicks']);
  this.maxTicksCount(config['maxTicksCount']);
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.scales.Geo.prototype;
  proto['maxTicksCount'] = proto.maxTicksCount;
  proto['gap'] = proto.gap;
  proto['xTicks'] = proto.xTicks;
  proto['xMinorTicks'] = proto.xMinorTicks;
  proto['yTicks'] = proto.yTicks;
  proto['yMinorTicks'] = proto.yMinorTicks;
  proto['extendDataRange'] = proto.extendDataRange;
  proto['minimumX'] = proto.minimumX;
  proto['maximumX'] = proto.maximumX;
  proto['minimumY'] = proto.minimumY;
  proto['maximumY'] = proto.maximumY;
  proto['precision'] = proto.precision;
})();
//endregion
