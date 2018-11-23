goog.provide('anychart.scales.Logarithmic');

goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.scales.Continuous');
goog.require('anychart.scales.Linear');



/**
 * Define Logarithmic scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.log}.
 * @constructor
 * @extends {anychart.scales.Linear}
 */
anychart.scales.Logarithmic = function() {
  anychart.scales.Logarithmic.base(this, 'constructor');
  this.addThemes('defaultScaleSettings.log');
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
anychart.scales.Logarithmic.prototype.setupTransformer = function() {
  anychart.scales.Logarithmic.base(this, 'setupTransformer');
  var min = this.min;
  var max = this.max;
  var logBase = /** @type {number} */(this.logBase());
  var minLog = anychart.math.specialRound(anychart.math.log(Math.abs(min), logBase), 6);
  var maxLog = anychart.math.specialRound(anychart.math.log(Math.abs(max), logBase), 6);
  var border, helper, domain, range, span;
  var minMaxProd = min * max;
  var borderLog = this.borderLog;
  border = anychart.math.pow(logBase, borderLog);
  if (minMaxProd > 0) {
    // min max interval doesn't touch or contain zero
    helper = anychart.scales.Continuous.Interpolators[anychart.scales.Continuous.PieceType.LINEAR](minLog, maxLog);
    if (max < 0) {
      domain = [min, -border, border, -min];
      range = [0, helper(borderLog), helper(borderLog - 2), helper(borderLog - 2 - minLog)];
    } else { // min cannot be zero here
      domain = [-max, -border, border, max];
      range = [helper(borderLog - 2 - maxLog), helper(borderLog - 2), helper(borderLog), 1];
    }
  } else if (minMaxProd < 0) {
    // min max interval contains zero
    span = maxLog - borderLog + minLog - borderLog + 2;
    domain = [min, -border, border, max];
    range = [0, (minLog - borderLog) / span, (minLog - borderLog + 2) / span, 1];
  } else {
    // min max interval touches zero with either side
    span = maxLog - borderLog + minLog - borderLog + 1;
    if (max) {
      domain = [-max, -border, border, max];
      range = [-(span + 1) / span, -1 / span, 1 / span, 1];
    } else {
      domain = [min, -border, border, -min];
      range = [0, (span - 1) / span, (span + 1) / span, (span + span + 1) / span];
    }
  }

  var tmp = /** @type {Array.<number>} */(this.transformer.range());
  helper = anychart.scales.Continuous.Deinterpolators[anychart.scales.Continuous.PieceType.LINEAR](tmp[0], tmp[1]);
  range = goog.array.map(range, function(x) { return anychart.math.specialRound(x); });

  this.transformer.domain(domain);
  this.transformer.range(goog.array.map(range, helper));
  this.transformer.types([
    anychart.scales.Continuous.PieceType.LOG,
    anychart.scales.Continuous.PieceType.LINEAR,
    anychart.scales.Continuous.PieceType.LOG
  ]);
};


/** @inheritDoc */
anychart.scales.Logarithmic.prototype.applyGaps = function(min, max, canChangeMin, canChangeMax, stickToZero, round) {
  var logBase = /** @type {number} */(this.logBase());
  var minLog = anychart.math.log(Math.abs(min), logBase);
  var maxLog = anychart.math.log(Math.abs(max), logBase);
  var borderLog = Math.min(Math.floor(minLog), Math.floor(maxLog), 0);
  var result;
  if (canChangeMin || canChangeMax) {
    var minMaxProd = min * max;
    if (minMaxProd > 0) {
      if (min > 0) {
        result = anychart.scales.Logarithmic.base(this, 'applyGaps', minLog, maxLog, canChangeMin, canChangeMax, false, false);
      } else {
        result = anychart.scales.Logarithmic.base(this, 'applyGaps', maxLog, minLog, canChangeMax, canChangeMin, false, false);
        var tmp = result.max;
        result.max = result.min;
        result.min = tmp;
      }
    } else if (minMaxProd < 0) {
      // min max interval contains zero
      if (maxLog - borderLog + minLog - borderLog < 2) {
        borderLog--;
      }
      maxLog -= borderLog - 1;
      minLog -= borderLog - 1;
      result = anychart.scales.Logarithmic.base(this, 'applyGaps', -minLog, maxLog, canChangeMin, canChangeMax, false, false);
      result.min = -result.min + borderLog - 1;
      result.max += borderLog - 1;
    } else {
      // min max interval touches zero with either side
      if (max) {
        maxLog -= borderLog - 1;
        result = anychart.scales.Logarithmic.base(this, 'applyGaps', 0, maxLog, false, canChangeMax, false, false);
        result.max += borderLog - 1;
      } else {
        minLog -= borderLog - 1;
        result = anychart.scales.Logarithmic.base(this, 'applyGaps', -minLog, 0, canChangeMin, false, false, false);
        result.min = -result.min + borderLog - 1;
      }
    }
    result = {
      max: anychart.math.pow(logBase, result.max) * goog.math.sign(max),
      min: anychart.math.pow(logBase, result.min) * goog.math.sign(min),
      borderLog: borderLog
    };
    if (round) {
      result.min = anychart.math.specialRound(result.min);
      result.max = anychart.math.specialRound(result.max);
    }
  } else {
    result = {
      min: min,
      max: max,
      borderLog: borderLog
    };
  }
  return result;
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
 * @return {!anychart.scales.Logarithmic} Logarithmic scale.
 */
anychart.scales.log = function() {
  var scale = new anychart.scales.Logarithmic();
  scale.setup(scale.themeSettings);
  //TODO (A.Kudryavtsev): Check whether we need this ticks setup.
  scale.ticks().setup(scale.ticks().themeSettings);
  //TODO (A.Kudryavtsev): This too.
  scale.minorTicks().setup(scale.minorTicks().themeSettings);
  return scale;
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
