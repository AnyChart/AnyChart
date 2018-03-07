goog.provide('anychart.scales.Continuous');

goog.require('anychart.format');
goog.require('anychart.math');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 *
 * @constructor
 */
anychart.scales.Continuous = function() {
  /**
   * @type {Array.<*>}
   * @private
   */
  this.domain_ = [0, 1];

  /**
   * @type {Array.<number>}
   * @private
   */
  this.range_ = [0, 1];

  /**
   * @type {Array.<anychart.scales.Continuous.PieceType>}
   * @private
   */
  this.types_ = [];

  /**
   * @type {anychart.scales.Continuous.PieceType}
   * @private
   */
  this.defaultType_ = anychart.scales.Continuous.PieceType.LINEAR;

  /**
   * @type {?function(*):*}
   * @private
   */
  this.fwd_ = null;

  /**
   * @type {?function(*):*}
   * @private
   */
  this.bwd_ = null;
};


/**
 * Range types.
 * @enum {number}
 */
anychart.scales.Continuous.PieceType = {
  LINEAR: 1,
  LOG: 2,
  UTC_TIME: 3
};


/**
 * A map of forward interpolators (factories for val -> ratio transformators).
 * @type {Object.<anychart.scales.Continuous.PieceType, function(*,*):(function(*):number)>}
 */
anychart.scales.Continuous.Interpolators = (function() {
  var res = {};
  res[anychart.scales.Continuous.PieceType.LINEAR] = function(a, b) {
    a = anychart.utils.toNumber(a);
    b = anychart.utils.toNumber(b) - a;
    return b ?
        function(val) {
          return (anychart.utils.toNumber(val) - a) / b;
        } :
        function(val) {
          return 0;
        };
  };
  res[anychart.scales.Continuous.PieceType.LOG] = function(a, b) {
    a = anychart.math.log(Math.abs(anychart.utils.toNumber(a)));
    b = anychart.math.log(Math.abs(anychart.utils.toNumber(b))) - a;
    return b ?
        function(val) {
          return (anychart.math.log(Math.abs(anychart.utils.toNumber(val))) - a) / b;
        } :
        function(val) {
          return 0;
        };
  };
  res[anychart.scales.Continuous.PieceType.UTC_TIME] = function(a, b) {
    a = anychart.format.toTimestamp(a);
    b = anychart.format.toTimestamp(b) - a;
    return b ?
        function(val) {
          return (anychart.format.toTimestamp(val) - a) / b;
        } :
        function(val) {
          return 0;
        };
  };
  return res;
})();


/**
 * A map of backward interpolators (factories for ratio -> val transformators).
 * @type {Object.<anychart.scales.Continuous.PieceType, function(*,*):(function(number):*)>}
 */
anychart.scales.Continuous.Deinterpolators = (function() {
  var res = {};
  res[anychart.scales.Continuous.PieceType.LINEAR] = function(a, b) {
    a = anychart.utils.toNumber(a);
    b = anychart.utils.toNumber(b) - a;
    return b ?
        function(val) {
          return val * b + a;
        } :
        function(val) {
          return a;
        };
  };
  res[anychart.scales.Continuous.PieceType.LOG] = function(a, b) {
    var origA = anychart.utils.toNumber(a);
    var origB = anychart.utils.toNumber(b);
    var sign = goog.math.sign(origA) || goog.math.sign(origB);
    a = anychart.math.log(Math.abs(origA));
    b = anychart.math.log(Math.abs(origB)) - a;
    return b ?
        function(val) {
          return anychart.math.pow(Math.E, val * b + a) * sign;
        } :
        function(val) {
          return origA;
        };
  };
  res[anychart.scales.Continuous.PieceType.UTC_TIME] = function(a, b) {
    a = anychart.format.toTimestamp(a);
    b = anychart.format.toTimestamp(b) - a;
    return b ?
        function(val) {
          return Math.round(val * b + a);
        } :
        function(val) {
          return a;
        };
  };
  return res;
})();


/**
 * @param {*} value
 * @return {*}
 */
anychart.scales.Continuous.prototype.transform = function(value) {
  if (!this.fwd_) {
    this.fwd_ = anychart.scales.Continuous.map_(
        this.domain_, this.range_,
        this.types_, this.defaultType_,
        [], anychart.scales.Continuous.PieceType.LINEAR,
        anychart.scales.Continuous.Interpolators,
        anychart.scales.Continuous.Deinterpolators);
  }
  return this.fwd_(value);
};


/**
 * @param {*} value
 * @return {*}
 */
anychart.scales.Continuous.prototype.inverseTransform = function(value) {
  if (!this.bwd_) {
    this.bwd_ = anychart.scales.Continuous.map_(
        this.range_, this.domain_,
        [], anychart.scales.Continuous.PieceType.LINEAR,
        this.types_, this.defaultType_,
        anychart.scales.Continuous.Interpolators,
        anychart.scales.Continuous.Deinterpolators);
  }
  return this.bwd_(value);
};


/**
 * Getter/setter for the domain.
 * @param {Array=} opt_value
 * @return {Array|anychart.scales.Continuous}
 */
anychart.scales.Continuous.prototype.domain = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.domain_ = goog.array.slice(opt_value, 0);
    this.fwd_ = this.bwd_ = null;
    return this;
  }
  return goog.array.slice(this.domain_, 0);
};


/**
 * Getter/setter for the range.
 * @param {Array.<number>=} opt_value
 * @return {Array|anychart.scales.Continuous}
 */
anychart.scales.Continuous.prototype.range = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.range_ = goog.array.slice(opt_value, 0);
    this.fwd_ = this.bwd_ = null;
    return this;
  }
  return goog.array.slice(this.range_, 0);
};


/**
 *
 * @param {(Array.<anychart.scales.Continuous.PieceType>|anychart.scales.Continuous.PieceType)=} opt_value
 * @return {Array.<anychart.scales.Continuous.PieceType>|anychart.scales.Continuous}
 */
anychart.scales.Continuous.prototype.types = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      this.types_ = goog.array.slice(opt_value, 0);
      this.defaultType_ = anychart.scales.Continuous.PieceType.LINEAR;
    } else {
      this.types_ = [];
      this.defaultType_ = /** @type {anychart.scales.Continuous.PieceType} */(Number(opt_value) || anychart.scales.Continuous.PieceType);
    }
    this.fwd_ = this.bwd_ = null;
    return this;
  }
  return goog.array.slice(this.types_, 0);
};


/**
 *
 * @param {Array} domain
 * @param {Array} range
 * @param {Array.<anychart.scales.Continuous.PieceType>} types
 * @param {anychart.scales.Continuous.PieceType} defaultType
 * @param {Array.<anychart.scales.Continuous.PieceType>} bwdTypes
 * @param {anychart.scales.Continuous.PieceType} bwdDefaultType
 * @param {Object.<anychart.scales.Continuous.PieceType, function(*,*):Function>} interpolators
 * @param {Object.<anychart.scales.Continuous.PieceType, function(*,*):Function>} deinterpolators
 * @param {(function(*, *):number)=} opt_comparator
 * @return {Function}
 * @private
 */
anychart.scales.Continuous.map_ = function(domain, range, types, defaultType, bwdTypes, bwdDefaultType,
                                           interpolators, deinterpolators, opt_comparator) {
  var piecesCount = Math.min(domain.length, range.length) - 1;
  if (domain[0] > domain[piecesCount]) {
    domain = goog.array.slice(domain, 0).reverse();
    range = goog.array.slice(range, 0).reverse();
  }
  var domainToRatio = [];
  var ratioToRange = [];
  for (var i = 0; i < piecesCount; i++) {
    domainToRatio.push(interpolators[types[i] || defaultType](domain[i], domain[i + 1]));
    ratioToRange.push(deinterpolators[bwdTypes[i] || bwdDefaultType](range[i], range[i + 1]));
  }
  if (piecesCount == 1) {
    return function(val) {
      var ratio = domainToRatio[0](val);
      return ratioToRange[0](ratio);
    };
  } else {
    return function(val) {
      var index = goog.array.binarySearch(domain, val, opt_comparator);
      if (index < 0)
        index = ~index;
      index = goog.math.clamp(index, 1, piecesCount) - 1;
      var ratio = domainToRatio[index](val);
      return ratioToRange[index](ratio);
    };
  }
};
