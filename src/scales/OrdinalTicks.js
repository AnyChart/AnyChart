goog.provide('anychart.scales.OrdinalTicks');

goog.require('anychart.core.Base');
goog.require('goog.array');



/**
 * Scale ticks settings.
 * @param {!(anychart.scales.Base)} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.OrdinalTicks = function(scale) {
  anychart.scales.OrdinalTicks.base(this, 'constructor');

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!(anychart.scales.Base)}
   * @protected
   */
  this.scale = scale;
};
goog.inherits(anychart.scales.OrdinalTicks, anychart.core.Base);


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.OrdinalTicks.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Fixed interval setting.
 * @type {number}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.interval_ = NaN;


/**
 * Names for ticks.
 * @type {Array.<string>}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.names_ = null;


/**
 * Explicit ticks array.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.explicit_ = null;


/**
 * Explicit indexes ticks array.
 * @type {Array.<number>}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.explicitIndexes_ = null;


/**
 * Auto calculated ticks cache.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.autoTicks_ = null;


/**
 * Auto calculated tick names cache.
 * @type {Array}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.autoNames_ = null;


/**
 * Max ticks count.
 * @type {number}
 * @private
 */
anychart.scales.OrdinalTicks.prototype.maxCount_ = 100;


/**
 * Getter/setter for interval.
 * Gets or sets ticks interval value.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.OrdinalTicks)} Interval value or itself for chaining.
 */
anychart.scales.OrdinalTicks.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.normalizeToNaturalNumber(opt_value, NaN);
    if (!isNaN(value) && this.interval_ != value) {
      this.interval_ = value;
      this.maxCount_ = NaN;
      this.explicit_ = null;
      this.explicitIndexes_ = null;
      this.autoTicks_ = null;
      this.autoNames_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.interval_;
};


/**
 * Getter/setter for max ticks count.
 * @param {number=} opt_value
 * @return {(number|anychart.scales.OrdinalTicks)}
 */
anychart.scales.OrdinalTicks.prototype.maxCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.utils.normalizeToNaturalNumber(opt_value, NaN);
    if (!isNaN(value) && this.maxCount_ != value) {
      this.maxCount_ = value;
      this.interval_ = NaN;
      this.explicit_ = null;
      this.explicitIndexes_ = null;
      this.autoTicks_ = null;
      this.autoNames_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.maxCount_;
};


/**
 * Setups ticks as an explicit array of fixed ticks.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9],
 *    ['B1', 1.1],
 *    ['B2', 1.4],
 *    ['B3', 1.2],
 *    ['B4', 1.9]
 * ]);
 * chart.xScale().ticks().set([0,2,4,6]);
 * @param {Array} ticks Explicit tick indexes array.
 * @return {!anychart.scales.OrdinalTicks} Returns itself for chaining.
 */
anychart.scales.OrdinalTicks.prototype.set = function(ticks) {
  if (!goog.array.equals(this.explicitIndexes_, ticks)) {
    this.explicitIndexes_ = goog.array.clone(ticks);
    this.explicitIndexes_ = goog.array.map(this.explicitIndexes_, function(el) { return anychart.utils.toNumber(el); });
    goog.array.sort(this.explicitIndexes_);
    goog.array.removeDuplicates(this.explicitIndexes_);
    this.explicitIndexes_[0] = 0;
    this.explicit_ = null;
    this.autoTicks_ = null;
    this.autoNames_ = null;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Getter/setter for names.
 * Getter and setter for tick names.
 * @param {Array=} opt_values An array of tick aliases.
 * @return {!(anychart.scales.OrdinalTicks|Array)} Names or this for chaining.
 */
anychart.scales.OrdinalTicks.prototype.names = function(opt_values) {
  if (goog.isDef(opt_values)) {
    if (this.names_ != opt_values) {
      this.names_ = opt_values;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  var values = this.getInternal();
  var i, val;
  if ((this.names_ && this.names_.length < values.length) || !this.autoNames_) {
    var scaleNames = /** @type {anychart.scales.Ordinal} */(this.scale).names();
    this.autoNames_ = [];
    for (i = 0; i < values.length; i++) {
      val = goog.isArray(values[i]) ? values[i][0] : values[i];
      var index = /** @type {anychart.scales.Ordinal} */(this.scale).getIndexByValue(val);
      if (!isNaN(index)) this.autoNames_.push(scaleNames[index]);
      else this.autoNames_.push(val);
    }
  }
  if (this.names_) {
    while (this.names_.length < values.length) {
      this.names_.push(this.autoNames_[this.names_.length]);
    }
  }
  var names = this.names_ || this.autoNames_;
  var len = Math.min(names.length, values.length);
  var res = [];
  for (i = 0; i < len; i++) {
    var left, right;
    var el = values[i];
    if (goog.isArray(el)) {
      left = el[0];
      right = el[1];
    } else {
      left = right = el;
    }
    var val1 = this.scale.transform(left, 0);
    var val2 = this.scale.transform(right, 1);
    if (!(val1 < 0 && val2 < 0 || val1 > 1 && val2 > 1))
      res.push(names[i]);
  }
  return res;
};


/**
 * Returns an array of ticks. Each tick can be:<br/>
 * <ol>
 *    <li> A value in terms of data, to make a tick on.</li>
 *    <li> An array of two values to make the tick from the first one to the second one.</li>
 * </ol>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or after <b>chart.draw()</b>.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.container(stage).draw();
 * var currentTicks = chart.xScale().ticks().get();
 * // Returns ["A1", "A2", "A3", "A4"].
 * @return {!Array} Array of ticks.
 */
anychart.scales.OrdinalTicks.prototype.get = function() {
  return goog.array.filter(this.getInternal(), function(el) {
    var left, right;
    if (goog.isArray(el)) {
      left = el[0];
      right = el[1];
    } else {
      left = right = el;
    }
    var val = this.transform(left, 0);
    var val1 = this.transform(right, 1);
    return !(val < 0 && val1 < 0 || val > 1 && val1 > 1);
  }, this.scale);
};


/**
 * Returns unfiltered ticks.
 * @return {!Array}
 */
anychart.scales.OrdinalTicks.prototype.getInternal = function() {
  if (this.explicit_)
    return this.explicit_;
  if (this.explicitIndexes_)
    return this.explicit_ = this.makeValues(this.explicitIndexes_);
  if (!this.autoTicks_)
    this.autoTicks_ = this.makeValues(this.calcAutoTicks());
  return this.autoTicks_ || [];
};


/**
 * Auto calculating ticks.
 * @protected
 * @return {!Array.<number>}
 */
anychart.scales.OrdinalTicks.prototype.calcAutoTicks = function() {
  var interval;
  var len = this.scale.values().length;
  if (isNaN(this.interval_)) {
    interval = Math.ceil(len / this.maxCount_) || 1;
  } else {
    interval = this.interval_;
  }
  var res = [];
  for (var i = 0; i < len; i += interval) {
    res.push(i);
  }
  return res;
};


/**
 * Makes an array of scale value indexes to become an array of scale values.
 * @param {!Array.<number>} indexes An array of scale value indexes.
 * @return {!Array} An array of scale values.
 * @protected
 */
anychart.scales.OrdinalTicks.prototype.makeValues = function(indexes) {
  var len = indexes.length || 0;
  var values = this.scale.values();
  var valuesLen = values.length;
  if (!len || !valuesLen) return [];
  var result = [], last = false;
  for (var i = 0; i < len && !last; i++) {
    var curr = indexes[i];
    var next = indexes[i + 1];
    if (isNaN(next) || next >= valuesLen) {
      next = valuesLen - 1;
      last = true;
    } else {
      next--;
    }
    result.push(curr == next ? values[curr] : [values[curr], values[next]]);
  }
  return result;
};


/**
 * Invalidation method used by the scale.
 */
anychart.scales.OrdinalTicks.prototype.markInvalid = function() {
  this.explicit_ = null;
  this.autoTicks_ = null;
  this.autoNames_ = null;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.OrdinalTicks.prototype.serialize = function() {
  var json = anychart.scales.OrdinalTicks.base(this, 'serialize');
  if (this.explicitIndexes_)
    json['explicit'] = this.explicitIndexes_;
  else if (!isNaN(this.maxCount_))
    json['maxCount'] = this.maxCount_;
  else if (!isNaN(this.interval_))
    json['interval'] = this.interval_;
  if (this.names_)
    json['names'] = this.names_;
  return json;
};


/** @inheritDoc */
anychart.scales.OrdinalTicks.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isArray(args[0])) {
    this.set(args[0]);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.scales.OrdinalTicks.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.OrdinalTicks.base(this, 'setupByJSON', config, opt_default);
  if ('explicit' in config)
    this.set(config['explicit']);
  else if ('interval' in config)
    this.interval(config['interval']);
  else if ('maxCount' in config)
    this.maxCount(config['maxCount']);
  this.names_ = config['names'] || null;
  this.autoTicks_ = null;
  this.autoNames_ = null;
};


//exports
(function() {
  var proto = anychart.scales.OrdinalTicks.prototype;
  proto['interval'] = proto.interval;//doc|ex
  proto['maxCount'] = proto.maxCount;
  proto['set'] = proto.set;//doc|ex
  proto['get'] = proto.get;//doc|ex
  proto['names'] = proto.names;//doc|ex
})();
