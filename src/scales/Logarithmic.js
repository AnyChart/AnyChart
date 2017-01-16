goog.provide('anychart.scales.Logarithmic');

goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.scales.Linear');



/**
 * Define Logarithmic scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.log}.
 * @constructor
 * @extends {anychart.scales.Linear}
 */
anychart.scales.Logarithmic = function() {
  anychart.scales.Logarithmic.base(this, 'constructor');
};
goog.inherits(anychart.scales.Logarithmic, anychart.scales.Linear);


/**
 * Log base value. Affects tick values auto calculation.
 * @param {number=} opt_value Log base to set.
 * @return {anychart.scales.Logarithmic|number}
 */
anychart.scales.Logarithmic.prototype.logBase = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = isNaN(+opt_value) ? this.logBaseVal : +opt_value;
    if (opt_value != this.logBaseVal) {
      this.logBaseVal = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.logBaseVal;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.getType = function() {
  return anychart.enums.ScaleTypes.LOG;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();
  value = anychart.utils.toNumber(value);
  var result = (anychart.math.log(value, this.logBaseVal) - this.transformedMin_) / this.range;
  return this.applyZoomAndInverse(result);
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.inverseTransform = function(ratio) {
  this.calculate();
  ratio = this.reverseZoomAndInverse(ratio);
  var x = (ratio * this.range + this.transformedMin_);
  return anychart.math.pow(this.logBaseVal, x);
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.calculate = function() {
  if (this.consistent) return;
  anychart.scales.Logarithmic.base(this, 'calculate');
  this.transformedMin_ = anychart.math.log(this.min, this.logBaseVal);
  this.transformedMax_ = anychart.math.log(this.max, this.logBaseVal);
  this.range = this.transformedMax_ - this.transformedMin_;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.determineScaleMinMax = function() {
  var logMax = anychart.math.log(this.dataRangeMax, this.logBaseVal);
  var logMin = anychart.math.log(this.dataRangeMin, this.logBaseVal);
  var range = logMax - logMin;
  if (!range) {
    this.dataRangeMin -= Math.E / 2;
    this.dataRangeMax += Math.E / 2;
    range = 1;
  }
  if (this.minimumModeAuto) {
    this.transformedMin_ = logMin - range * this.minimumRangeBasedGap;
    if (!isNaN(this.softMin)) {
      var softMin = anychart.math.log(this.softMin, this.logBaseVal);
      if (range > 0)
        this.transformedMin_ = Math.min(this.transformedMin_, softMin);
      else
        this.transformedMin_ = Math.max(this.transformedMin_, softMin);
    }
    this.min = anychart.math.pow(this.logBaseVal, this.transformedMin_);
  }

  if (this.maximumModeAuto) {
    this.transformedMax_ = logMax + range * this.maximumRangeBasedGap;
    if (!isNaN(this.softMax)) {
      var softMax = anychart.math.log(this.softMax, this.logBaseVal);
      if (range > 0)
        this.transformedMax_ = Math.max(this.transformedMax_, softMax);
      else
        this.transformedMax_ = Math.min(this.transformedMax_, softMax);
    }
    this.max = anychart.math.pow(this.logBaseVal, this.transformedMax_);
  }
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.createTicks = function() {
  var ticks = anychart.scales.Logarithmic.base(this, 'createTicks');
  ticks.suspendSignalsDispatching();
  ticks.mode(anychart.enums.ScatterTicksMode.LOGARITHMIC);
  ticks.resumeSignalsDispatching(false);
  return ticks;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Logarithmic.prototype.serialize = function() {
  var json = anychart.scales.Logarithmic.base(this, 'serialize');
  json['logBase'] = this.logBase();
  return json;
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.Logarithmic.base(this, 'setupByJSON', config, opt_default);
  this.logBase(config['logBase']);
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for logarithmic scale.
 * @example <t>lineChart</t>
 * chart.line([2, 16, 4, 64]);
 * chart.yScale(anychart.scales.log());
 * @return {anychart.scales.Logarithmic} Logarithmic scale.
 */
anychart.scales.log = function() {
  return new anychart.scales.Logarithmic();
};


//exports
(function() {
  var proto = anychart.scales.Logarithmic.prototype;
  goog.exportSymbol('anychart.scales.log', anychart.scales.log);//doc|ex
  proto['getType'] = proto.getType;//inherited
  proto['transform'] = proto.transform;//inherited
  proto['inverseTransform'] = proto.inverseTransform;//inherited
  proto['logBase'] = proto.logBase;//doc|ex
})();
