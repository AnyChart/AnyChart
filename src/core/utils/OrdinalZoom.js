goog.provide('anychart.core.utils.IZoomableChart');
goog.provide('anychart.core.utils.OrdinalZoom');



/**
 * Interface that ordinal zoom works with.
 * @interface
 */
anychart.core.utils.IZoomableChart = function() {};


/**
 * Should make the chart reapply zoom.
 * @param {boolean} forX
 */
anychart.core.utils.IZoomableChart.prototype.invalidateZoom = function(forX) {};


/**
 * Should ensure that scales are ready for zooming.
 */
anychart.core.utils.IZoomableChart.prototype.ensureScalesReadyForZoom = function() {};


/**
 * Should return default scale for given direction.
 * @param {boolean} forX
 * @return {anychart.scales.Base}
 */
anychart.core.utils.IZoomableChart.prototype.getDefaultScale = function(forX) {};



/**
 * Zoom settings aggregate.
 * @param {anychart.core.utils.IZoomableChart} chart
 * @param {boolean} isXZoom
 * @constructor
 */
anychart.core.utils.OrdinalZoom = function(chart, isXZoom) {
  /**
   * Denotes whether it is a X zoom or Y.
   * @type {boolean}
   * @private
   */
  this.isXZoom_ = isXZoom;

  /**
   * Chart reference.
   * @type {anychart.core.utils.IZoomableChart}
   * @private
   */
  this.chart_ = chart;

  /**
   * Start ratio.
   * @type {number}
   * @private
   */
  this.startRatio_ = 0;

  /**
   * End ratio.
   * @type {number}
   * @private
   */
  this.endRatio_ = 1;

  /**
   * If the zoom process is continuous (responds to mousedown + move, not just mouseup).
   * @type {boolean}
   * @private
   */
  this.continuous_ = true;

  /**
   * Zoom setup by values.
   * @type {
   *     {start: *, end: *, scale: (anychart.scales.Base|undefined)}|
   *     {count: number, scale: (anychart.scales.Base|undefined), fromEnd: boolean}|
   *     null}
   * @private
   */
  this.setup_ = null;
};


/**
 * Returns if the zoom needs xScales to be calculated before the setup can be applied.
 * @return {
 *     {start: *, end: *, scale: (anychart.scales.Base|undefined)}|
 *     {count: number, scale: (anychart.scales.Base|undefined), fromEnd: boolean}|
 *     null}
 */
anychart.core.utils.OrdinalZoom.prototype.getSetup = function() {
  return this.setup_;
};


/**
 * Applies zoom setup if it is not applied yet.
 */
anychart.core.utils.OrdinalZoom.prototype.ensureSetupApplied = function() {
  this.chart_.ensureScalesReadyForZoom();
  if (this.setup_) {
    var scale = this.setup_.scale || this.chart_.getDefaultScale(this.isXZoom_);
    if (this.setup_.count && (scale instanceof anychart.scales.Ordinal)) {
      var length = this.setup_.count / (/** @type {anychart.scales.Ordinal} */(scale)).values().length;
      if (this.setup_.fromEnd)
        this.setTo(1 - length, 1);
      else
        this.setTo(0, length);
    } else if (goog.isDef(this.setup_.start) && goog.isDef(this.setup_.end) && scale) {
      var start = scale.reverseZoomAndInverse(scale.transform(this.setup_.start, 0));
      var end = scale.reverseZoomAndInverse(scale.transform(this.setup_.end, 1));
      if (start > end) {
        start = scale.reverseZoomAndInverse(scale.transform(this.setup_.end, 0));
        end = scale.reverseZoomAndInverse(scale.transform(this.setup_.start, 1));
      }
      this.setTo(start, end);
    } else {
      this.setup_ = null;
    }
  }
};


/**
 * Sets current zoom to passed start and end ratios.
 * @param {number} startRatio
 * @param {number} endRatio
 * @return {anychart.core.utils.OrdinalZoom}
 */
anychart.core.utils.OrdinalZoom.prototype.setTo = function(startRatio, endRatio) {
  startRatio = goog.math.clamp(anychart.utils.toNumber(startRatio), 0, 1);
  if (isNaN(startRatio)) startRatio = this.startRatio_;
  endRatio = goog.math.clamp(anychart.utils.toNumber(endRatio), 0, 1);
  if (isNaN(endRatio)) endRatio = this.endRatio_;
  this.setup_ = null;
  if (this.startRatio_ != startRatio || this.endRatio_ != endRatio) {
    this.startRatio_ = startRatio;
    this.endRatio_ = endRatio;
    this.chart_.invalidateZoom(this.isXZoom_);
  }
  return this;
};


/**
 * Setups zoom by passed values. If scale is not passed - relies on default chart X scale.
 * The setup is applied only in chart.draw() sequence, so it doesn't matter when you use it before draw.
 * @param {*} startValue
 * @param {*} endValue
 * @param {anychart.scales.Base=} opt_scale
 * @return {anychart.core.utils.OrdinalZoom}
 */
anychart.core.utils.OrdinalZoom.prototype.setToValues = function(startValue, endValue, opt_scale) {
  this.setup_ = {
    start: startValue,
    end: endValue,
    scale: opt_scale
  };
  this.chart_.invalidateZoom(this.isXZoom_);
  return this;
};


/**
 * Setups zoom by passed values. If scale is not passed - relies on default chart X scale.
 * The setup is applied only in chart.draw() sequence, so it doesn't matter when you use it before draw.
 * @param {number} pointsCount
 * @param {boolean=} opt_fromEnd
 * @param {anychart.scales.Base=} opt_scale
 * @return {anychart.core.utils.OrdinalZoom}
 */
anychart.core.utils.OrdinalZoom.prototype.setToPointsCount = function(pointsCount, opt_fromEnd, opt_scale) {
  this.setup_ = {
    count: anychart.utils.normalizeToNaturalNumber(pointsCount),
    scale: opt_scale,
    fromEnd: !!opt_fromEnd
  };
  this.chart_.invalidateZoom(this.isXZoom_);
  return this;
};


/**
 * Returns current zoom start ratio.
 * @return {number}
 */
anychart.core.utils.OrdinalZoom.prototype.getStartRatio = function() {
  this.ensureSetupApplied();
  return this.startRatio_;
};


/**
 * Returns current zoom end ratio.
 * @return {number}
 */
anychart.core.utils.OrdinalZoom.prototype.getEndRatio = function() {
  this.ensureSetupApplied();
  return this.endRatio_;
};


/**
 *
 * @param {boolean=} opt_value
 * @return {anychart.core.utils.OrdinalZoom|boolean}
 */
anychart.core.utils.OrdinalZoom.prototype.continuous = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.continuous_ != opt_value) {
      this.continuous_ = opt_value;
      // do nothing here, because chart reads this property on each scroller change.
    }
    return this;
  }
  return this.continuous_;
};


/**
 * Setups the element using passed configuration value. It can be a JSON object or a special value that setups
 * instances of descendant classes.
 * Note: this method only changes element properties if they are supposed to be changed by the config value -
 * it doesn't reset other properties to their defaults.
 * @param {...(Object|Array|number|string|undefined|boolean|null)} var_args Arguments to setup the instance.
 * @return {anychart.core.utils.OrdinalZoom} Returns itself for chaining.
 */
anychart.core.utils.OrdinalZoom.prototype.setup = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isDef(arg0)) {
    if (!isNaN(+arg0)) { // also accepts null, bool
      this.setTo(0, 1 / Math.abs(+arg0 || 1));
    } else if (goog.isObject(arg0)) {
      var json = /** @type {Object} */(arg0);
      this.continuous(json['continuous']);
      if (goog.isDef(json['startValue']) && goog.isDef(json['endValue'])) {
        this.setToValues(
            json['startValue'],
            json['endValue'],
            json['scale'] instanceof anychart.scales.Base ? json['scale'] : undefined);
      } else if (goog.isDef(json['pointsCount'])) {
        this.setToPointsCount(
            json['pointsCount'],
            json['fromEnd'],
            json['scale'] instanceof anychart.scales.Base ? json['scale'] : undefined);
      } else {
        this.setTo(json['startRatio'], json['endRatio']);
      }
    }
  }
  return this;
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.utils.OrdinalZoom.prototype.serialize = function() {
  return {
    'startRatio': this.getStartRatio(),
    'endRatio': this.getEndRatio(),
    'continuous': this.continuous_
  };
};



//exports
(function() {
  var proto = anychart.core.utils.OrdinalZoom.prototype;
  proto['setTo'] = proto.setTo;
  proto['setToValues'] = proto.setToValues;
  proto['setToPointsCount'] = proto.setToPointsCount;
  proto['getStartRatio'] = proto.getStartRatio;
  proto['getEndRatio'] = proto.getEndRatio;
  proto['continuous'] = proto.continuous;
})();
