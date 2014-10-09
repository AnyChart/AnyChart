goog.provide('anychart.scales.OrdinalTicks');

goog.require('anychart.Base');
goog.require('goog.array');



/**
 * Scale ticks settings.
 * @param {!anychart.scales.Ordinal} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.scales.OrdinalTicks = function(scale) {
  goog.base(this);

  /**
   * Scale reference to get setup from in emergency situations.
   * @type {!anychart.scales.Ordinal}
   * @private
   */
  this.scale_ = scale;
};
goog.inherits(anychart.scales.OrdinalTicks, anychart.Base);


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
anychart.scales.OrdinalTicks.prototype.interval_ = 1;


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
 * Getter for ticks interval value.
 * @return {number} Current interval value.
 *//**
 * Setter for ticks interval value. Passed value as rounded and defaults to 1 in case of incorrect settings.
 * @example <t>lineChart</t>
 * chart.line([
 *   ['A1', 1.1],
 *   ['A2', 1.4],
 *   ['A3', 1.2],
 *   ['A4', 1.9]
 * ]);
 * chart.xScale().ticks().interval(2);
 * @param {number=} opt_value Value to set.
 * @return {anychart.scales.OrdinalTicks} An instance of {@link anychart.scales.OrdinalTicks} class for method chaining.
 *//**
 * @ignoreDoc
 * Gets or sets ticks interval value.
 * @param {number=} opt_value Ticks interval value if used as a getter.
 * @return {(number|anychart.scales.OrdinalTicks)} Interval value or itself for chaining.
 */
anychart.scales.OrdinalTicks.prototype.interval = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = Math.round(opt_value) || 1;
    if (this.interval_ != opt_value) {
      this.interval_ = opt_value;
      this.explicit_ = null;
      this.autoTicks_ = null;
      this.autoNames_ = null;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.interval_;
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
 * Getter for tick names.
 * @return {Array} Current ticks names.
 *//**
 * Setter for tick names.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.9]);
 * chart.xScale().ticks().names(['C1', 'C2', 'C3', 'C4']);
 * @param {Array=} opt_values An array of tick aliases.
 * @return {anychart.scales.OrdinalTicks} An instance of {@link anychart.scales.OrdinalTicks} class for method chaining.
 *//**
 * @ignoreDoc
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
  var values = this.get();
  if ((this.names_ && this.names_.length < values.length) || !this.autoNames_) {
    var scaleNames = this.scale_.names();
    this.autoNames_ = [];
    for (var i = 0; i < values.length; i++) {
      var val = goog.isArray(values[i]) ? values[i][0] : values[i];
      var index = this.scale_.getIndexByValue(val);
      if (!isNaN(index)) this.autoNames_.push(scaleNames[index]);
      else this.autoNames_.push(val);
    }
  }
  if (this.names_) {
    while (this.names_.length < values.length) {
      this.names_.push(this.autoNames_[this.names_.length]);
    }
  }
  return /** @type {!Array} */(this.names_ || this.autoNames_);
};


/**
 * Returns an array of ticks. Each tick can be:<br/>
 * <ol>
 *    <li> A value in terms of data, to make a tick on.</li>
 *    <li> An array of two values to make the tick from the first one to the second one.</li>
 * </ol>
 * <b>Note:</b> returns correct values only after {@link anychart.scales.Base#finishAutoCalc} or after <b>chart.draw()</b>.
 * @example
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
  if (this.explicit_)
    return this.explicit_;
  if (this.explicitIndexes_)
    return this.explicit_ = this.makeValues_(this.explicitIndexes_);
  if (!this.autoTicks_) {
    var res = [];
    for (var i = 0, len = this.scale_.values().length; i < len; i += this.interval_) {
      res.push(i);
    }
    this.autoTicks_ = this.makeValues_(res);
  }
  return /** @type {!Array} */(this.autoTicks_);
};


/**
 * Makes an array of scale value indexes to become an array of scale values.
 * @param {!Array.<number>} indexes An array of scale value indexes.
 * @return {!Array} An array of scale values.
 * @private
 */
anychart.scales.OrdinalTicks.prototype.makeValues_ = function(indexes) {
  var len = indexes.length || 0;
  var values = this.scale_.values();
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
  var data = goog.base(this, 'serialize');
  data['explicit'] = this.explicit_;
  data['interval'] = this.interval();
  return data;
};


/** @inheritDoc */
anychart.scales.OrdinalTicks.prototype.deserialize = function(value) {
  this.explicit_ = value['explicit'] || null;
  this.interval_ = goog.isNull(value['interval']) ? NaN : value['interval'];
  return goog.base(this, 'deserialize', value);
};


//exports
anychart.scales.OrdinalTicks.prototype['interval'] = anychart.scales.OrdinalTicks.prototype.interval;//doc|ex
anychart.scales.OrdinalTicks.prototype['set'] = anychart.scales.OrdinalTicks.prototype.set;//doc|ex
anychart.scales.OrdinalTicks.prototype['get'] = anychart.scales.OrdinalTicks.prototype.get;//doc|ex
anychart.scales.OrdinalTicks.prototype['names'] = anychart.scales.OrdinalTicks.prototype.names;//doc|ex
