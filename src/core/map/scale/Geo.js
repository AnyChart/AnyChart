goog.provide('anychart.core.map.scale.Geo');

goog.require('anychart.core.Base');
goog.require('anychart.enums');



/**
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.map.scale.Geo = function() {
  goog.base(this);
  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinX = 0;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxX = 1;

  /**
   * Scale input domain minimum.
   * @type {number}
   * @protected
   */
  this.dataRangeMinY = 0;

  /**
   * Scale input domain maximum.
   * @type {number}
   * @protected
   */
  this.dataRangeMaxY = 1;

  /**
   * @type {boolean}
   * @protected
   */
  this.minimumModeAuto = true;

  /**
   * @type {boolean}
   * @protected
   */
  this.maximumModeAuto = true;

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
   * @protected
   */
  this.isInvertedX = false;

  /**
   * If the Y scale is inverted.
   * @type {boolean}
   * @protected
   */
  this.isInvertedY = false;

  /**
   * Scale bounds.
   * @type {anychart.math.Rect}
   * @private
   */
  this.bounds_ = null;
};
goog.inherits(anychart.core.map.scale.Geo, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.core.map.scale.Geo.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Returns pixel bounds.
 * @return {anychart.math.Rect} .
 */
anychart.core.map.scale.Geo.prototype.getBounds = function() {
  return this.bounds_ ? this.bounds_.clone() : anychart.math.rect(0, 0, 0, 0);
};


/**
 * @param {anychart.math.Rect} value Bounds.
 * @return {anychart.core.map.scale.Geo} .
 */
anychart.core.map.scale.Geo.prototype.setBounds = function(value) {
  this.bounds_ = value;
  this.consistent = false;
  return this;
};


/**
 * Sets transformation map
 * @param {Object} value tx map.
 */
anychart.core.map.scale.Geo.prototype.setTxMap = function(value) {
  this.tx = value;
  this.consistent = false;
};


/**
 * Sets transformation map
 * @param {number} value tx map.
 */
anychart.core.map.scale.Geo.prototype.setMapZoom = function(value) {
  this.zoom = value;
  this.consistent = false;
};


/**
 * @param {number} dx tx map.
 * @param {number} dy tx map.
 */
anychart.core.map.scale.Geo.prototype.setOffsetFocusPoint = function(dx, dy) {
  this.dx_ = dx;
  this.dy_ = dy;
  this.consistent = false;
};


/**
 * Returns scale type.
 * @return {string}
 */
anychart.core.map.scale.Geo.prototype.getType = function() {
  return anychart.enums.MapsScaleTypes.GEO;
};


/**
 * Getter/setter for gap.
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.core.map.scale.Geo} .
 */
anychart.core.map.scale.Geo.prototype.gap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value || 0;
    if (this.rangeBasedGap != opt_value) {
      this.rangeBasedGap = opt_value;
      if (this.minimumModeAuto) {
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
 * @return {number|anychart.core.map.scale.Geo} Scale minimum.
 */
anychart.core.map.scale.Geo.prototype.minimumX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.minimumModeAuto || (!auto && val != this.minX)) {
      this.minimumModeAuto = auto;
      this.minX = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.minX;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.core.map.scale.Geo} Scale maximum.
 */
anychart.core.map.scale.Geo.prototype.maximumX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.maximumModeAuto || (!auto && val != this.maxX)) {
      this.maximumModeAuto = auto;
      this.maxX = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.maxX;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.core.map.scale.Geo} Scale minimum.
 */
anychart.core.map.scale.Geo.prototype.minimumY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.minimumModeAuto || (!auto && val != this.minY)) {
      this.minimumModeAuto = auto;
      this.minY = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.minY;
};


/**
 * @param {number=} opt_value Value to set.
 * @return {number|anychart.core.map.scale.Geo} Scale maximum.
 */
anychart.core.map.scale.Geo.prototype.maximumY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.toNumber(opt_value);
    var auto = isNaN(val);
    if (auto != this.maximumModeAuto || (!auto && val != this.maxY)) {
      this.maximumModeAuto = auto;
      this.maxY = val;
      this.consistent = false;
      if (auto)
        this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
      else
        this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  this.calculate();
  return this.maxY;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.core.map.scale.Geo} {@link anychart.core.map.scale.Geo} instance for method chaining.
 */
anychart.core.map.scale.Geo.prototype.extendDataRangeX = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = +arguments[i];
    if (isNaN(value)) value = parseFloat(arguments[i]);
    if (value < this.dataRangeMinX) {
      this.dataRangeMinX = value;
      this.consistent = false;
    }
    if (value > this.dataRangeMaxX) {
      this.dataRangeMaxX = value;
      this.consistent = false;
    }
  }
  return this;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.core.map.scale.Geo} {@link anychart.core.map.scale.Geo} instance for method chaining.
 */
anychart.core.map.scale.Geo.prototype.extendDataRangeY = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = +arguments[i];
    if (isNaN(value)) value = parseFloat(arguments[i]);
    if (value < this.dataRangeMinY) {
      this.dataRangeMinY = value;
      this.consistent = false;
    }
    if (value > this.dataRangeMaxY) {
      this.dataRangeMaxY = value;
      this.consistent = false;
    }
  }
  return this;
};


/**
 * Resets scale data range if it needs auto calculation.
 * @return {!anychart.core.map.scale.Geo} Itself for chaining.
 * @protected
 */
anychart.core.map.scale.Geo.prototype.resetDataRange = function() {
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
anychart.core.map.scale.Geo.prototype.needsAutoCalc = function() {
  return this.minimumModeAuto || this.maximumModeAuto;
};


/**
 * Ensures that ticks are initialized for the scale.
 * NOTE: THIS METHOD IS FOR INTERNAL USE IN THE SCALE AND TICKS ONLY. DO NOT PUBLISH IT.
 */
anychart.core.map.scale.Geo.prototype.calculate = function() {
  if (this.consistent || !this.bounds_) return;
  this.consistent = true;
  this.determineScaleMinMax();

  this.rangeX = this.maxX - this.minX;
  this.rangeY = this.maxY - this.minY;

  this.ratio = Math.min(this.bounds_.height / this.rangeY, this.bounds_.width / this.rangeX);
  this.centerOffsetX = (this.bounds_.width - this.rangeX * this.ratio) / 2;
  this.centerOffsetY = (this.bounds_.height - this.rangeY * this.ratio) / 2;
};


/**
 * Determines this.min, this.max and this.range.
 * @protected
 */
anychart.core.map.scale.Geo.prototype.determineScaleMinMax = function() {
  var maxX = this.maximumModeAuto ?
      this.dataRangeMaxX :
      this.maxX;
  var minX = this.minimumModeAuto ?
      this.dataRangeMinX :
      this.minX;

  var maxY = this.maximumModeAuto ?
      this.dataRangeMaxY :
      this.maxY;
  var minY = this.minimumModeAuto ?
      this.dataRangeMinY :
      this.minY;

  var rangeX = maxX - minX;
  var rangeY = maxY - minY;

  if (!isFinite(rangeX)) {
    this.dataRangeMinX = 0;
    this.dataRangeMaxX = 1;
    rangeX = 1;
  } else if (!rangeX) {
    this.dataRangeMinX -= 0.5;
    this.dataRangeMaxX += 0.5;
    rangeX = 1;
  }

  if (!isFinite(rangeY)) {
    this.dataRangeMinY = 0;
    this.dataRangeMaxY = 1;
    rangeY = 1;
  } else if (!rangeY) {
    this.dataRangeMinY -= 0.5;
    this.dataRangeMaxY += 0.5;
    rangeY = 1;
  }

  if (this.minimumModeAuto) {
    this.minX = this.dataRangeMinX - rangeX * this.rangeBasedGap;
    this.minY = this.dataRangeMinY - rangeY * this.rangeBasedGap;
  }

  if (this.maximumModeAuto) {
    this.maxX = this.dataRangeMaxX + rangeX * this.rangeBasedGap;
    this.maxY = this.dataRangeMaxY + rangeY * this.rangeBasedGap;
  }
};


/**
 * @param {number} x X value to transform in input scope.
 * @param {number} y Y value to transform in input scope.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.core.map.scale.Geo.prototype.scaleToPx = function(x, y) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  var transformX = (+(/** @type {number} */(x)) - this.minX) * this.ratio;
  var transformY = (+(/** @type {number} */(y)) - this.minY) * this.ratio;

  var resultX = this.isInvertedX ?
      this.bounds_.getRight() - this.centerOffsetX - transformX :
      this.bounds_.left + this.centerOffsetX + transformX;

  var resultY = this.isInvertedY ?
      this.bounds_.top + this.centerOffsetY + transformY :
      this.bounds_.getBottom() - this.centerOffsetY - transformY;

  return [resultX, resultY];
};


/**
 * @param {*} x X value to transform in input scope.
 * @param {*} y Y value to transform in input scope.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.core.map.scale.Geo.prototype.pxToScale = function(x, y) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  var transformX = this.isInvertedX ?
      this.bounds_.getRight() - this.centerOffsetX - x :
      x - this.bounds_.left - this.centerOffsetX;

  var transformY = this.isInvertedY ?
      x - this.bounds_.top - this.centerOffsetY :
      this.bounds_.getBottom() - this.centerOffsetY - y;

  var resultX = +(/** @type {number} */(transformX)) / this.ratio + this.minX;
  var resultY = +(/** @type {number} */(transformY)) / this.ratio + this.minY;

  return [resultX, resultY];
};


/**
 * Returns tx object for passed coords.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @return {Object}
 */
anychart.core.map.scale.Geo.prototype.pickTx = function(lon, lat) {
  var defaultTx = this.tx['default'];

  var txName = goog.object.findKey(this.tx, function(value, key) {
    if (key != 'default' && value.heatZone) {
      var projected = window['proj4'](value.crs || defaultTx.crs).forward([lon, lat]);

      var x = projected[0] * (value.scale || defaultTx.scale);
      var y = projected[1] * (value.scale || defaultTx.scale);

      x += value.xoffset || 0;
      y += value.yoffset || 0;

      var heatZone = value.heatZone;

      return x >= heatZone.left &&
          x <= heatZone.left + heatZone.width &&
          y <= heatZone.top &&
          y >= heatZone.top - heatZone.height;
    }

    return false;
  }) || 'default';

  return this.tx[txName];
};


/**
 * Transform coords in lat/lon to pixel values.
 * @param {number} lon Longitude in degrees.
 * @param {number} lat Latitude in degrees.
 * @return {Array.<number>} Transformed value adjust bounds [x, y].
 */
anychart.core.map.scale.Geo.prototype.transform = function(lon, lat) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  lat = anychart.utils.toNumber(lat);
  lon = anychart.utils.toNumber(lon) % 180;

  var tx = this.pickTx(lon, lat);
  var projected = window['proj4'](tx.crs).forward([lon, lat]);
  var scale = tx.scale;

  lon = projected[0] * scale;
  lat = projected[1] * scale;

  lon += tx.xoffset || 0;
  lat += tx.yoffset || 0;

  var transformX = (+(/** @type {number} */(lon)) - this.minX) * this.ratio;
  var transformY = (+(/** @type {number} */(lat)) - this.minY) * this.ratio;

  var resultX = (this.isInvertedX ?
      this.bounds_.getRight() - this.centerOffsetX - transformX :
      this.bounds_.left + this.centerOffsetX + transformX);

  var minPx = this.bounds_.left + this.centerOffsetX;
  var maxPx = minPx + this.rangeX * this.ratio;

  if (resultX < minPx) {
    resultX = maxPx + (resultX - minPx);
  } else if (resultX > maxPx) {
    resultX = minPx + (resultX - maxPx);
  }

  var resultY = this.isInvertedY ?
      this.bounds_.top + this.centerOffsetY + transformY :
      this.bounds_.getBottom() - this.centerOffsetY - transformY;

  return [resultX * this.zoom + this.dx_, resultY * this.zoom + this.dy_];
};


/**
 * Transform coords in pixel value to degrees values (lon/lat).
 * @param {number} x X value to transform.
 * @param {number} y Y value to transform.
 * @return {Array.<number>} Transformed value adjust bounds.
 */
anychart.core.map.scale.Geo.prototype.inverseTransform = function(x, y) {
  this.calculate();

  if (!this.bounds_)
    return [NaN, NaN];

  x = anychart.utils.toNumber(x);
  y = anychart.utils.toNumber(y);

  x = (x - this.dx_) / this.zoom;
  y = (y - this.dy_) / this.zoom;

  var transformX = this.isInvertedX ?
      this.bounds_.getRight() - this.centerOffsetX - x :
      x - this.bounds_.left - this.centerOffsetX;

  var transformY = this.isInvertedY ?
      x - this.bounds_.top - this.centerOffsetY :
      this.bounds_.getBottom() - this.centerOffsetY - y;

  var resultX = +(/** @type {number} */(transformX)) / this.ratio + this.minX;
  var resultY = +(/** @type {number} */(transformY)) / this.ratio + this.minY;

  var defaultTx = this.tx['default'];

  var txName = goog.object.findKey(this.tx, function(value, key) {
    if (key != 'default' && value.heatZone) {
      var heatZone = value.heatZone;

      return resultX >= heatZone.left &&
          resultX <= heatZone.left + heatZone.width &&
          resultY <= heatZone.top &&
          resultY >= heatZone.top - heatZone.height;
    }
    return false;
  }) || 'default';

  var tx = this.tx[txName];

  resultX -= tx.xoffset || defaultTx.xoffset || 0;
  resultY -= tx.yoffset || defaultTx.yoffset || 0;

  var scale = tx.scale || defaultTx.scale;
  var crs = tx.crs || defaultTx.crs;

  var projected = window['proj4'](crs).inverse([resultX / scale, resultY / scale]);

  return [projected[0], projected[1]];
};


/**
 * Getter and setter for scale inversion.
 * @param {boolean=} opt_invertedX Inverted X state to set.
 * @param {boolean=} opt_invertedY Inverted Y state to set.
 * @return {(!anychart.core.map.scale.Geo|Array.<boolean>)} Inverted state or itself for method chaining.
 */
anychart.core.map.scale.Geo.prototype.inverted = function(opt_invertedX, opt_invertedY) {
  if (goog.isDef(opt_invertedX) || goog.isDef(opt_invertedX)) {
    var signal = 0;
    if (goog.isDef(opt_invertedX)) {
      opt_invertedX = !!opt_invertedX;
      if (this.isInvertedX != opt_invertedX) {
        this.isInvertedX = opt_invertedX;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    }

    if (goog.isDef(opt_invertedY)) {
      opt_invertedY = !!opt_invertedY;
      if (this.isInvertedY != opt_invertedY) {
        this.isInvertedY = opt_invertedY;
        signal = anychart.Signal.NEEDS_REAPPLICATION;
      }
    }

    this.dispatchSignal(signal);
    return this;
  }
  return [this.isInvertedX, this.isInvertedY];
};


/**
 * Informs scale that an auto range calculation started for the chart, so it should reset its data range on the first
 * call of this method if needed.
 * @return {!anychart.core.map.scale.Geo} Chaining.
 */
anychart.core.map.scale.Geo.prototype.startAutoCalc = function() {
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
anychart.core.map.scale.Geo.prototype.finishAutoCalc = function(opt_silently) {
  this.autoCalcs_ = Math.max(this.autoCalcs_ - 1, 0);
  if (this.autoCalcs_ == 0) {
    return this.checkScaleChanged(!!opt_silently);
  } else
    return true; // todo: additional stuff when calculating shared scales!
};


/**
 * Checks if previous data range differs from the current, dispatches a REAPPLICATION signal and returns the result.
 * @param {boolean} silently If set, the signal is not dispatched.
 * @return {boolean} If the scale was changed and it needs to be reapplied.
 * @protected
 */
anychart.core.map.scale.Geo.prototype.checkScaleChanged = function(silently) {
  var res = (this.oldDataRangeMinX != this.dataRangeMinX) || (this.oldDataRangeMaxX != this.dataRangeMaxX) ||
      (this.oldDataRangeMinY != this.dataRangeMinY) || (this.oldDataRangeMaxY != this.dataRangeMaxY);
  if (res) {
    this.consistent = false;
    if (!silently)
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return res;
};


/** @inheritDoc */
anychart.core.map.scale.Geo.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['type'] = this.getType();
  var inv = this.inverted();
  json['invertedX'] = inv[0];
  json['invertedY'] = inv[1];
  json['maximumX'] = this.maximumModeAuto ? null : this.maxX;
  json['maximumY'] = this.maximumModeAuto ? null : this.maxY;
  json['minimumX'] = this.minimumModeAuto ? null : this.minX;
  json['minimumY'] = this.minimumModeAuto ? null : this.minY;
  json['gap'] = this.gap();
  if (this.bounds_)
    json['bounds'] = this.bounds_;
  return json;
};


/** @inheritDoc */
anychart.core.map.scale.Geo.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.inverted(config['invertedX'], config['invertedY']);
  this.minimumX(config['minimumX']);
  this.minimumY(config['minimumY']);
  this.maximumX(config['maximumX']);
  this.maximumY(config['maximumY']);
  this.gap(config['gap']);
  if ('bounds' in config)
    this.setBounds(config['bounds']);
};


//exports
//todo (blackart) Don't export yet.
//anychart.core.map.scale.Geo.prototype['setBounds'] = anychart.core.map.scale.Geo.prototype.setBounds;
//anychart.core.map.scale.Geo.prototype['transform'] = anychart.core.map.scale.Geo.prototype.transform;
//anychart.core.map.scale.Geo.prototype['inverseTransform'] = anychart.core.map.scale.Geo.prototype.inverseTransform;
//anychart.core.map.scale.Geo.prototype['minimumX'] = anychart.core.map.scale.Geo.prototype.minimumX;
//anychart.core.map.scale.Geo.prototype['minimumY'] = anychart.core.map.scale.Geo.prototype.minimumY;
//anychart.core.map.scale.Geo.prototype['maximumX'] = anychart.core.map.scale.Geo.prototype.maximumX;
//anychart.core.map.scale.Geo.prototype['maximumY'] = anychart.core.map.scale.Geo.prototype.maximumY;
//anychart.core.map.scale.Geo.prototype['extendDataRangeX'] = anychart.core.map.scale.Geo.prototype.extendDataRangeX;
//anychart.core.map.scale.Geo.prototype['extendDataRangeY'] = anychart.core.map.scale.Geo.prototype.extendDataRangeY;
//anychart.core.map.scale.Geo.prototype['inverted'] = anychart.core.map.scale.Geo.prototype.inverted;
//anychart.core.map.scale.Geo.prototype['startAutoCalc'] = anychart.core.map.scale.Geo.prototype.startAutoCalc;
//anychart.core.map.scale.Geo.prototype['finishAutoCalc'] = anychart.core.map.scale.Geo.prototype.finishAutoCalc;
anychart.core.map.scale.Geo.prototype['gap'] = anychart.core.map.scale.Geo.prototype.gap;
