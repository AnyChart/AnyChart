goog.provide('anychart.core.map.scale.OrdinalColor');

goog.require('anychart.core.map.scale.OrdinalColorTicks');
goog.require('anychart.scales.Base');



/**
 * Define Ordinal scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.ordinalColor}.
 * @constructor
 * @extends {anychart.scales.Base}
 */
anychart.core.map.scale.OrdinalColor = function() {
  goog.base(this);

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
   * @type {Array.<Object>}
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
};
goog.inherits(anychart.core.map.scale.OrdinalColor, anychart.scales.Base);


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.getType = function() {
  return anychart.enums.MapsScaleTypes.ORDINAL_COLOR;
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.inverted = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.isInverted != opt_value) {
      this.isInverted = opt_value;
      this.resetDataRange();
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.isInverted;
};


/**
 * Sets/gets colors for linear color scale. Can be set as array of colors.
 * @param {Array.<string>=} opt_value Colors set.
 * @return {!(Array.<string>|anychart.core.map.scale.OrdinalColor)}
 */
anychart.core.map.scale.OrdinalColor.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value))
      this.colors_ = [];
    else {
      if (goog.isArray(opt_value))
        this.colors_ = goog.array.clone(opt_value);
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
anychart.core.map.scale.OrdinalColor.prototype.setAutoColors = function(value) {
  this.autoColors_ = value;
};


/**
 * @param {(Array.<*>|string)=} opt_value Array of names or attribute name for data set.
 * @return {(Array.<*>|anychart.core.map.scale.OrdinalColor)} Scale names or self for chaining.
 */
anychart.core.map.scale.OrdinalColor.prototype.names = function(opt_value) {
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
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    return this;
  }
  this.calculate();
  if (goog.isArray(this.names_)) {
    if (!this.resultNames_) {
      /**
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
      this.autoNames_ = [];
      for (var i = 0, len = this.internalRanges_.length; i < len; i++) {
        var range = this.internalRanges_[i];
        var name;
        if (isFinite(range.start + range.end)) {
          name = range.start + ' - ' + range.end;
        } else if (isFinite(range.start)) {
          name = 'More ' + range.start;
        } else {
          name = 'Less ' + range.end;
        }

        if (!range.name) range.name = name;
        this.autoNames_.push(name);
      }
    }

    return this.autoNames_;
  }
};


/**
 * @param {Array.<Object>=} opt_value .
 * @return {Array.<Object>|!anychart.core.map.scale.OrdinalColor}
 */
anychart.core.map.scale.OrdinalColor.prototype.ranges = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ranges_ != opt_value) {
      this.ranges_ = opt_value;
      this.autoColors_ = anychart.getFullTheme()['map']['ordinalColor']['autoColors'](this.ranges_.length);
      this.resetDataRange();
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }

  return this.ranges_;
};


/**
 * Returns processed ranges.
 * @return {Array.<Object>} processed ranges.
 */
anychart.core.map.scale.OrdinalColor.prototype.getProcessedRanges = function() {
  this.calculate();
  this.names();

  return this.internalRanges_;
};


/**
 * Returns range for passed value.
 * @param {number} value Value to search its range.
 * @return {Object} Searched range or null.
 */
anychart.core.map.scale.OrdinalColor.prototype.getRangeByValue = function(value) {
  this.calculate();

  var rangeSourceIndex = -1;
  var range = null;

  if (this.internalRanges_) {
    for (var i = this.internalRanges_.length; i--;) {
      var r = this.internalRanges_[i];
      if (value >= r.start && value <= r.end && r.sourceIndex > rangeSourceIndex)
        range = r;
    }
  }

  return range;
};


/**
 * Returns color relative to passed value.
 * @param {number} value .
 * @return {(string|acgraph.vector.Fill|acgraph.vector.Stroke)}
 */
anychart.core.map.scale.OrdinalColor.prototype.valueToColor = function(value) {
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
anychart.core.map.scale.OrdinalColor.prototype.colorToValue = function(value) {
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
 * @param {number} value Value to search index.
 * @return {number} Range index.
 */
anychart.core.map.scale.OrdinalColor.prototype.getIndexByValue = function(value) {
  this.calculate();

  var range = this.getRangeByValue(value);
  return range ? goog.array.indexOf(this.internalRanges_, range) : -1;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.core.map.scale.OrdinalColor|anychart.scales.OrdinalTicks)} Ticks or itself for method chaining.
 */
anychart.core.map.scale.OrdinalColor.prototype.ticks = function(opt_value) {
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
anychart.core.map.scale.OrdinalColor.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 * Create scale ticks.
 * @return {!anychart.scales.OrdinalTicks}
 * @protected
 */
anychart.core.map.scale.OrdinalColor.prototype.createTicks = function() {
  var ticks = new anychart.core.map.scale.OrdinalColorTicks(this);
  this.registerDisposable(ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.transform = function(value, opt_subRangeRatio) {
  this.calculate();

  var range = this.getRangeByValue(/** @type {number} */(value));
  if (range) {
    var index = goog.array.indexOf(this.internalRanges_, range);
    var rangeCount = this.internalRanges_.length;
    var step = 1 / rangeCount;

    return (index + (opt_subRangeRatio || 0)) * step;
  } else {
    return NaN;
  }
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.inverseTransform = function(ratio) {
  this.calculate();

  var index = goog.math.clamp(Math.ceil(ratio * this.internalRanges_.length) - 1, 0, this.internalRanges_.length - 1);
  var range = this.internalRanges_[index];

  return (range.start + range.end) / 2;
};


/**
 * @return {!anychart.core.map.scale.OrdinalColor} Resets auto values.
 */
anychart.core.map.scale.OrdinalColor.prototype.resetDataRange = function() {
  this.internalRanges_ = null;
  this.resultColors_ = null;
  this.autoNames_ = null;
  this.resultNames_ = null;
  return this;
};


/**
 * Calculate ranges.
 */
anychart.core.map.scale.OrdinalColor.prototype.calculate = function() {
  if (!this.internalRanges_) {
    var i, len, range, name, color;
    var tempArr = [];
    for (i = 0, len = this.ranges_.length; i < len; i++) {
      range = this.ranges_[i];
      name = this.names_ ? this.names_[i] : null;
      var colors = this.colors();
      var colorIndex = this.inverted() ? Math.max(0, colors.length - 1 - i) : i;
      color = colors && colors[colorIndex] ? colors[colorIndex] : null;

      var enabled = true;
      var sourceIndex = i;
      var from = anychart.utils.toNumber(range['from']);
      var to = anychart.utils.toNumber(range['to']);
      var less = anychart.utils.toNumber(range['less']);
      var greater = anychart.utils.toNumber(range['greater']);

      var start, end;
      if (!isNaN(from) && !isNaN(to)) {
        start = Math.min(from, to);
        end = Math.max(from, to);
      } else if (!isNaN(greater)) {
        start = greater;
        end = Number.POSITIVE_INFINITY;
      } else if (!isNaN(less)) {
        start = Number.NEGATIVE_INFINITY;
        end = less;
      } else {
        enabled = false;
      }

      if (enabled)
        tempArr.push({
          start: start,
          end: end,
          sourceIndex: sourceIndex,
          enabled: true,
          color: range['color'] || color,
          name: range['name'] || name
        });
    }

    goog.array.sort(tempArr, function(a, b) {
      var result = a.start > b.start ? 1 : a.start < b.start ? -1 : 0;
      var hasIntersection = Math.max(a.start, b.start) <= Math.min(a.end, b.end);

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


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for linear color scale.
 * @param {Array.<Object>=} opt_value Colors set.
 * @return {anychart.core.map.scale.OrdinalColor}
 */
anychart.scales.ordinalColor = function(opt_value) {
  var scale = new anychart.core.map.scale.OrdinalColor();
  scale.ranges(opt_value);
  return scale;
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  json['ranges'] = this.ranges();
  if (this.names_)
    json['names'] = this.names_;
  if (this.colors_)
    json['colors'] = this.colors_;
  return json;
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColor.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.ticks(config['ticks']);
  this.colors(config['colors']);
  this.ranges(config['ranges']);
  this.names(config['names']);
};


//exports
goog.exportSymbol('anychart.scales.ordinalColor', anychart.scales.ordinalColor);
anychart.core.map.scale.OrdinalColor.prototype['colors'] = anychart.core.map.scale.OrdinalColor.prototype.colors;
anychart.core.map.scale.OrdinalColor.prototype['ranges'] = anychart.core.map.scale.OrdinalColor.prototype.ranges;
anychart.core.map.scale.OrdinalColor.prototype['names'] = anychart.core.map.scale.OrdinalColor.prototype.names;
anychart.core.map.scale.OrdinalColor.prototype['ticks'] = anychart.core.map.scale.OrdinalColor.prototype.ticks;
anychart.core.map.scale.OrdinalColor.prototype['inverted'] = anychart.core.map.scale.OrdinalColor.prototype.inverted;
anychart.core.map.scale.OrdinalColor.prototype['getRangeByValue'] = anychart.core.map.scale.OrdinalColor.prototype.getRangeByValue;
anychart.core.map.scale.OrdinalColor.prototype['getProcessedRanges'] = anychart.core.map.scale.OrdinalColor.prototype.getProcessedRanges;
anychart.core.map.scale.OrdinalColor.prototype['valueToColor'] = anychart.core.map.scale.OrdinalColor.prototype.valueToColor;
anychart.core.map.scale.OrdinalColor.prototype['colorToValue'] = anychart.core.map.scale.OrdinalColor.prototype.colorToValue;
anychart.core.map.scale.OrdinalColor.prototype['getIndexByValue'] = anychart.core.map.scale.OrdinalColor.prototype.getIndexByValue;
anychart.core.map.scale.OrdinalColor.prototype['transform'] = anychart.core.map.scale.OrdinalColor.prototype.transform;
anychart.core.map.scale.OrdinalColor.prototype['inverseTransform'] = anychart.core.map.scale.OrdinalColor.prototype.inverseTransform;
