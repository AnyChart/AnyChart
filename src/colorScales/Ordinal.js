goog.provide('anychart.colorScalesModule.Ordinal');

goog.require('anychart.colorScalesModule.OrdinalTicks');
goog.require('anychart.scales.Base');



/**
 * Define Ordinal scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.ordinalColor}.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.colorScalesModule.Ordinal = function() {
  anychart.colorScalesModule.Ordinal.base(this, 'constructor');

  this.dropThemes().addThemes('defaultScaleSettings.ordinalColor', 'defaultOrdinalColorScale');

  /**
   * Colors.
   * @type {?Array.<Object>}
   * @private
   */
  this.colors_ = null;

  /**
   * @type {?(Array.<*>|string)}
   * @private
   */
  this.names_ = null;

  /**
   * Ranges.
   * @type {Array.<anychart.colorScalesModule.Ordinal.Range>}
   * @private
   */
  this.ranges_ = [];

  /**
   * Internal ranges.
   * @type {?Array.<Object>}
   * @private
   */
  this.internalRanges_ = null;

  /**
   * Auto colors.
   * @type {Array.<string>}
   * @private
   */
  this.autoColors_ = null;

  /**
   * @type {Array}
   * @private
   */
  this.data_ = [];

  /**
   * @private
   * @type {boolean}
   */
  this.manualAutoColor_ = false;
};
goog.inherits(anychart.colorScalesModule.Ordinal, anychart.scales.Base);


/**
 * Type declaration for a colorscale range.
 * @typedef {{
 *   equal: (?number|boolean|string),
 *   less: (?number),
 *   greater: (?number),
 *   from: (?number),
 *   to: (?number)
 * }}
 */
anychart.colorScalesModule.Ordinal.Range;


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.getType = function() {
  return anychart.enums.ScaleTypes.ORDINAL_COLOR;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.inversionOrZoomChanged = function() {
  this.resetDataRange();
};


/**
 * Sets/gets colors for linear color scale. Can be set as array of colors.
 * @param {Array.<string>=} opt_value Colors set.
 * @return {!(Array.<string>|anychart.colorScalesModule.Ordinal)}
 */
anychart.colorScalesModule.Ordinal.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value))
      this.colors_ = [];
    else {
      if (goog.isArray(opt_value)) {
        this.colors_ = goog.array.clone(opt_value);
      }
    }
    this.resetDataRange();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  if (goog.isArray(this.colors_)) {
    if (!this.resultColors_) {
      /**
       * Resulting names to return.
       * Need to avoid original set of names to be changed.
       */
      this.resultColors_ = goog.array.clone(this.colors_);
    }

    if (this.resultColors_.length < this.ranges_.length) {
      while (this.resultColors_.length != this.ranges_.length) {
        this.resultColors_.push(this.ranges_[this.resultColors_.length]);
      }
    }

    return this.resultColors_;
  } else {
    return this.autoColors_ || [];
  }
};


/**
 * Set auto colors.
 * @param {Array.<string>} value Auto colors.
 */
anychart.colorScalesModule.Ordinal.prototype.setAutoColors = function(value) {
  this.autoColors_ = value;
  this.autoColors_.push('#000');
  this.manualAutoColor_ = !!value;
  this.reset();
};


/**
 * Set names for colorscale ranges.
 * @param {(Array.<*>|string)=} opt_value Array of names or attribute name for data set.
 * @return {(Array.<*>|anychart.colorScalesModule.Ordinal)} Scale names or self for chaining.
 */
anychart.colorScalesModule.Ordinal.prototype.names = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value))
      this.names_ = [];
    else if (goog.isArray(opt_value))
      this.names_ = goog.array.clone(opt_value);
    else {
      // if field name does not set by string or set value the same - return self.
      if (!goog.isString(opt_value) || this.names_ == opt_value)
        return this;
      this.names_ = opt_value;
    }
    this.resetDataRange();
    this.ticks().markInvalid();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    return this;
  }
  this.calculate();
  if (goog.isArray(this.names_)) {
    if (!this.resultNames_) {
      /*
       * Resulting names to return.
       * Need to avoid original set of names to be changed.
       */
      this.resultNames_ = goog.array.clone(this.names_);
    }

    if (this.resultNames_.length < this.internalRanges_.length) {
      while (this.resultNames_.length != this.internalRanges_.length) {
        this.resultNames_.push(this.internalRanges_[this.resultNames_.length]);
      }
    }

    return this.resultNames_;
  } else {
    if (!this.autoNames_) {
      /*
       * Set proper names according to the range mathematical conditions.
       * The unnamed range is the default one.
       */
      this.autoNames_ = [];
      for (var i = 0, len = this.internalRanges_.length; i < len; i++) {
        var range = this.internalRanges_[i];
        var name;
        if (goog.isDef(range.equal) && !goog.isBoolean(range.equal)) {
          name = range.equal;
        } else if (isFinite(range.start + range.end)) {
          if (range.start === range.end) {
            name = range.start;
          } else {
            name = range.start + ' - ' + range.end;
          }
        } else if (range.equal === true) {
          if (isFinite(range.start)) {
            name = '>= ' + range.start;
          } else {
            name = '<= ' + range.end;
          }
        } else {
          if (isFinite(range.start)) {
            name = '> ' + range.start;
          } else {
            name = '< ' + range.end;
          }
        }
        if (!name)
          name = 'default';

        if (!range.name) range.name = name;
        this.autoNames_.push(name);
      }
    }

    return this.autoNames_;
  }
};


/**
 * Sets/gets colorscale ranges.
 * In setter mode adds the default range to the defined ones by a user.
 * @param {Array.<anychart.colorScalesModule.Ordinal.Range>=} opt_value .
 * @return {Array.<anychart.colorScalesModule.Ordinal.Range>|!anychart.colorScalesModule.Ordinal}
 */
anychart.colorScalesModule.Ordinal.prototype.ranges = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ranges_ != opt_value) {
      this.ranges_ = opt_value;
      var defaultRange = opt_value[opt_value.length - 1];
      if (!(goog.isNull(defaultRange['equal']) && goog.isNull(defaultRange['from']) && goog.isNull(defaultRange['to']) &&
          goog.isNull(defaultRange['greater']) && goog.isNull(defaultRange['less']))) {
        this.ranges_.push({
          'equal': null,
          'less': null,
          'greater': null,
          'from': null,
          'to': null
        });
      }
      if (!this.manualAutoColor_) {
        this.autoColors_ = (/** @type {Function} */(anychart.getFlatTheme('defaultOrdinalColorScale')['autoColors']))(this.ranges_.length - 1);
        this.autoColors_.push('#000');
      }
      this.resetDataRange();
      this.ticks().markInvalid();
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }

  return this.ranges_;
};


/**
 * Sets/gets data field name for which calculates ranges.
 * @param {string=} opt_value .
 * @return {string} .
 */
anychart.colorScalesModule.Ordinal.prototype.rangesBy = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rangesBy_ != opt_value) {
      this.rangesBy_ = opt_value;
      this.resetDataRange();
      this.ticks().markInvalid();
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.rangesBy_;
};


/**
 * Returns processed ranges.
 * @return {Array.<Object>} processed ranges.
 */
anychart.colorScalesModule.Ordinal.prototype.getProcessedRanges = function() {
  this.calculate();
  this.names();

  return this.internalRanges_;
};


/**
 * Returns range for passed value.
 * @param {string|number} value Value to search its range.
 * @return {Object} Searched range or null.
 */
anychart.colorScalesModule.Ordinal.prototype.getRangeByValue = function(value) {
  this.calculate();

  var rangeSourceIndex = -1;
  var range = this.internalRanges_[this.internalRanges_.length - 1];

  if (this.internalRanges_) {
    for (var i = 0; i < this.internalRanges_.length - 1; i++) {
      var r = this.internalRanges_[i];
      if (((r.equal === true) && (value >= r.start && value <= r.end && r.sourceIndex > rangeSourceIndex)) ||
          ((r.equal === false) && (value > r.start && value < r.end && r.sourceIndex > rangeSourceIndex)) ||
          ((r.equal === false) && (Math.abs(value) == Infinity) && (value == r.start || value == r.end)) ||
          (r.equal === value)) {
        range = r;
        break;
      }
    }
  }

  return range;
};


/**
 * Returns color relative to passed value.
 * @param {string|number} value .
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)}
 */
anychart.colorScalesModule.Ordinal.prototype.valueToColor = function(value) {
  this.calculate();

  var color = 'none';
  var range = this.getRangeByValue(value);
  if (range) {
    var index = range.sourceIndex;

    if (index >= 0) {
      var colors = this.colors();
      if (goog.isDef(range['color'])) {
        color = range['color'];
      } else if (colors && colors.length > 0) {
        color = index > colors.length - 1 ?
            colors[colors.length - 1] :
            colors[index];
      }
    }
  }
  return color;
};


/**
 * Returns value for passed color. Value is a middle of its range.
 * @param {string} value Color to search value.
 * @return {number} Middle of searched range.
 */
anychart.colorScalesModule.Ordinal.prototype.colorToValue = function(value) {
  this.calculate();

  var hexValueRepresentation = anychart.color.parseColor(value).hex;
  var result = NaN;
  for (var i = 0, len = this.internalRanges_.length; i < len; i++) {
    var range = this.internalRanges_[i];
    var colors = this.colors();
    var color = range['color'] || colors[range.sourceIndex] || colors[colors.length - 1];

    if (hexValueRepresentation == anychart.color.parseColor(color).hex) {
      result = (range.start + range.end) / 2;
      break;
    }
  }

  return result;
};


/**
 * Returns range index relative passed value.
 * @param {string|number} value Value to search index.
 * @return {number} Range index.
 */
anychart.colorScalesModule.Ordinal.prototype.getIndexByValue = function(value) {
  this.calculate();

  var range = this.getRangeByValue(value);
  return range ? goog.array.indexOf(this.internalRanges_, range) : -1;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.colorScalesModule.Ordinal|anychart.scales.OrdinalTicks)} Ticks or itself for method chaining.
 */
anychart.colorScalesModule.Ordinal.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = this.createTicks();
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.setup(opt_value);
    return this;
  }
  return this.ticksObj;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.colorScalesModule.Ordinal.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 * Create scale ticks.
 * @return {!anychart.scales.OrdinalTicks}
 * @protected
 */
anychart.colorScalesModule.Ordinal.prototype.createTicks = function() {
  var ticks = new anychart.colorScalesModule.OrdinalTicks(this);
  ticks.setupCreated('ticks', ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();

  var range = this.getRangeByValue(/** @type {number} */(value));
  if (range && range.name !== 'default') {
    var index = goog.array.indexOf(this.internalRanges_, range);
    var rangeCount = this.internalRanges_.length - 1;
    var step = 1 / rangeCount;

    return (index + (opt_subRangeRatio || 0)) * step;
  } else {
    return NaN;
  }
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.inverseTransform = function(ratio) {
  this.calculate();
  //the index of the default range is excluded from calculations
  var preCalculatedIndex = Math.ceil(ratio * (this.internalRanges_.length - 1)) - 1;
  var lastIndex = this.internalRanges_.length - 2;
  //calculate the exact index
  var index = goog.math.clamp(preCalculatedIndex, 0, lastIndex);
  var range = this.internalRanges_[index];

  return (range.start + range.end) / 2;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.needsAutoCalc = function() {
  return !!this.ranges.length;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.checkScaleChanged = function(silently) {
  this.consistent = false;
  if (!silently)
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  return true;
};


/**
 * @return {!anychart.colorScalesModule.Ordinal} Resets auto values.
 */
anychart.colorScalesModule.Ordinal.prototype.reset = function() {
  this.internalRanges_ = null;
  this.resultColors_ = null;
  this.autoNames_ = null;
  this.autoRanges_ = null;
  this.resultNames_ = null;
  return this;
};


/**
 * @return {!anychart.colorScalesModule.Ordinal} Resets auto values.
 */
anychart.colorScalesModule.Ordinal.prototype.resetDataRange = function() {
  this.reset();
  this.data_.length = 0;
  return this;
};


/**
 * Extends the current input domain with the passed values (if such don't exist in the domain).<br/>
 * <b>Note:</b> Attention! {@link anychart.scales.Base#finishAutoCalc} drops all passed values.
 * @param {...*} var_args Values that are supposed to extend the input domain.
 * @return {!anychart.colorScalesModule.Ordinal} {@link anychart.scales.ScatterBase} instance for method chaining.
 */
anychart.colorScalesModule.Ordinal.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var value = arguments[i];
    this.data_.push(value);
  }
  return this;
};


/**
 * Calculate ranges.
 */
anychart.colorScalesModule.Ordinal.prototype.calculate = function() {
  if (!this.internalRanges_) {
    var i, len, range, name, color;
    var tempArr = [];

    if (!this.ranges_.length) {
      this.autoRanges_ = [];
      goog.array.removeDuplicates(this.data_);

      var eqRanges = [];
      var numRanges = [];
      goog.array.forEach(this.data_, function(elem) {
        var elem_ = anychart.utils.toNumber(elem);
        if (!isNaN(elem)) {
          numRanges.push(elem_);
        } else {
          eqRanges.push({'equal': elem});
        }
      });

      goog.array.sort(numRanges);

      //calculating intervals count by Sturges formula
      var k = Math.round(1 + 3.32 * Math.log(numRanges.length) / Math.log(10));
      //min value
      var maxValue = numRanges[numRanges.length - 1];
      //max value
      var minValue = Math.floor(numRanges[0]);
      //intervals width
      var h = (maxValue - minValue) / k;
      //left limit of first interval
      var leftLimit = minValue;
      //right limit of first interval
      var rightLimit = Math.ceil(leftLimit + h);

      //calculating intervals
      for (i = 0; i < k; i++) {
        this.autoRanges_.push({'from': leftLimit, 'to': rightLimit});
        leftLimit = rightLimit;
        rightLimit = Math.ceil(leftLimit + h);
      }

      this.autoRanges_ = this.autoRanges_.concat(eqRanges);
      if (this.autoRanges_.length)
        this.autoRanges_.push({
          'equal': null,
          'less': null,
          'greater': null,
          'from': null,
          'to': null
        });
      if (!this.manualAutoColor_) {
        this.autoColors_ = (/** @type {Function} */(anychart.getFlatTheme('defaultOrdinalColorScale')['autoColors']))(this.autoRanges_.length - 1);
        if (this.autoColors_)
          this.autoColors_.push('#000');
      }
    }

    var ranges = /** @type {Array.<anychart.colorScalesModule.Ordinal.Range>} */ (this.ranges_.length ? this.ranges_ : this.autoRanges_);
    for (i = 0, len = ranges.length; i < len; i++) {
      range = ranges[i];
      name = this.names_ ? this.names_[i] : null;
      var colors = this.colors();
      // exclude the default range color if scale is inverted
      var colorIndex = this.inverted() ? Math.max(0, colors.length - 2 - i) : i;
      color = colors && colors[colorIndex] ? colors[colorIndex] : null;

      var enabled = true;
      var sourceIndex = i;
      var equal = range['equal'];
      var from = anychart.utils.toNumber(range['from']);
      var to = anychart.utils.toNumber(range['to']);
      var less = anychart.utils.toNumber(range['less']);
      var greater = anychart.utils.toNumber(range['greater']);

      var start = NaN, end = NaN, eq = true;
      if (goog.isDef(equal)) {
        if (goog.isBoolean(equal)) {
          eq = equal;
          if (!isNaN(greater)) {
            start = greater;
            end = Infinity;
          } else if (!isNaN(less)) {
            start = -Infinity;
            end = less;
          }
        } else {
          var equal_ = anychart.utils.toNumber(equal);
          if (!isNaN(equal_)) {
            start = equal_;
            end = equal_;
          } else {
            eq = equal;
          }
        }
      } else if (!isNaN(from) && !isNaN(to)) {
        start = Math.min(from, to);
        end = Math.max(from, to);
      } else if (!isNaN(greater)) {
        start = greater;
        end = Infinity;
      } else if (!isNaN(less)) {
        start = -Infinity;
        end = less;
      } else {
        enabled = false;
      }

      if (enabled) {
        tempArr.push({
          equal: eq,
          start: start,
          end: end,
          sourceIndex: sourceIndex,
          enabled: true,
          color: range['color'] || color,
          name: range['name'] || name
        });
      }
    }

    this.sortRanges(tempArr);

    var arr = [];
    for (i = 0, len = tempArr.length; i < len; i++) {
      range = tempArr[i];
      if (range.enabled)
        arr.push(range);

    }
    tempArr.length = 0;
    this.internalRanges_ = arr;
  }
};


/**
 * Sort ranges in numerical order resolving intersections.
 * @param {Array.<Object>} unsortedRangeArr Array of unsorted ranges.
 */
anychart.colorScalesModule.Ordinal.prototype.sortRanges = function(unsortedRangeArr) {
  goog.array.sort(unsortedRangeArr, function(a, b) {
    var result = a.start > b.start ? 1 : a.start < b.start ? -1 : 0;
    if (!result) {
      result = a.end > b.end ? 1 : a.end < b.end ? -1 : 0;
    }
    var hasIntersection;
    if (!a.equal || !b.equal) {
      hasIntersection = Math.max(a.start, b.start) < Math.min(a.end, b.end);
    } else {
      hasIntersection = Math.max(a.start, b.start) <= Math.min(a.end, b.end);
    }

    if (hasIntersection) {
      if (a.start > b.start) {
        if (a.sourceIndex > b.sourceIndex) {
          b.end = a.start;
        } else {
          a.start = b.end;
          if (a.start >= a.end)
            a.enabled = false;
        }
      } else if (a.start < b.start) {
        if (a.sourceIndex > b.sourceIndex) {
          b.start = a.end;
          if (b.start >= b.end)
            b.enabled = false;
        } else {
          a.end = b.start;
        }
      } else {
        if (a.sourceIndex > b.sourceIndex) {
          b.start = a.end;
          if (b.start >= b.end)
            b.enabled = false;
        } else {
          a.end = b.start;
          if (a.start >= a.end)
            a.enabled = false;
        }
      }
    }

    return result;
  });
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for linear color scale.
 * @param {Array.<Object>=} opt_value Colors set.
 * @return {!anychart.colorScalesModule.Ordinal}
 */
anychart.scales.ordinalColor = function(opt_value) {
  var scale = new anychart.colorScalesModule.Ordinal();
  // scale.setupByJSON(/** @type {!Object} */(anychart.getFullTheme('defaultOrdinalColorScale')));
  scale.setup(scale.themeSettings);
  scale.ranges(opt_value);
  return scale;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.serialize = function() {
  var json = anychart.colorScalesModule.Ordinal.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  if (this.ranges_ && this.ranges_.length)
    json['ranges'] = this.ranges_;
  if (this.names_)
    json['names'] = this.names_;
  if (this.colors_)
    json['colors'] = this.colors_;
  return json;
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.setupByJSON = function(config, opt_default) {
  anychart.colorScalesModule.Ordinal.base(this, 'setupByJSON', config, opt_default);
  this.ticks(config['ticks']);
  this.colors(config['colors']);
  this.ranges(config['ranges']);
  this.names(config['names']);
};


/** @inheritDoc */
anychart.colorScalesModule.Ordinal.prototype.disposeInternal = function() {
  goog.dispose(this.ticksObj);
  this.ticksObj = null;
  anychart.colorScalesModule.Ordinal.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.colorScalesModule.Ordinal.prototype;
  goog.exportSymbol('anychart.scales.ordinalColor', anychart.scales.ordinalColor);
  proto['getType'] = proto.getType;
  proto['colors'] = proto.colors;
  proto['ranges'] = proto.ranges;
  proto['names'] = proto.names;
  proto['ticks'] = proto.ticks;
  proto['getRangeByValue'] = proto.getRangeByValue;
  proto['getProcessedRanges'] = proto.getProcessedRanges;
  proto['valueToColor'] = proto.valueToColor;
  proto['colorToValue'] = proto.colorToValue;
  proto['getIndexByValue'] = proto.getIndexByValue;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
})();
