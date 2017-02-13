goog.provide('anychart.scales.LinearColor');

goog.require('anychart.enums');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.scales.ScatterTicks');



/**
 * Linear color scale.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.LinearColor = function() {
  anychart.scales.LinearColor.base(this, 'constructor');

  /**
   * @type {number}
   * @protected
   */
  this.minimumRangeBasedGap = 0;

  /**
   * @type {number}
   * @protected
   */
  this.maximumRangeBasedGap = 0;

  /**
   * Log base value. Used mostly for ticks calculation, because it doesn't affect transformation results.
   * This value is declared here to avoid calculate() method override.
   * @type {number}
   * @protected
   */
  this.logBaseVal = 10;

  this.setupByJSON(/** @type {!Object} */(anychart.getFullTheme('defaultLinearColorScale')));
};
goog.inherits(anychart.scales.LinearColor, anychart.scales.ScatterBase);


/** @inheritDoc */
anychart.scales.LinearColor.prototype.getType = function() {
  return anychart.enums.ScaleTypes.LINEAR_COLOR;
};


/**
 * @param {...(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill|Array.<string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill>)} var_args
 * @return {Array.<Object>}
 * @private
 */
anychart.scales.LinearColor.prototype.extractKeys_ = function(var_args) {
  var i, len, key;

  var keys = [];

  for (i = 0, len = arguments.length; i < len; i++) {
    var arg = arguments[i];

    if (goog.isString(arg)) {
      keys.push(acgraph.vector.parseColor(arg, true));
    } else if (goog.isArray(arg)) {
      keys.push.apply(keys, this.extractKeys_.apply(this, arg));
    } else if (goog.isObject(arg)) {
      var keysAttr = arg['keys'];
      if (goog.isDef(keysAttr) && goog.isArray(keysAttr)) {
        var colorKeys = this.extractKeys_.apply(this, arg['keys']);
        var gOpacity = arg['opacity'];
        if (goog.isDef(gOpacity)) {
          for (var j = 0; j < colorKeys.length; j++) {
            key = colorKeys[j];
            if (!goog.isDef(key['opacity'])) {
              key['opacity'] = gOpacity;
            }
          }
        }

        keys.push.apply(keys, colorKeys);
      } else {
        keys.push(arg);
      }
    }
  }

  return keys;
};


/**
 * @param {...(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill|Array.<string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill>)} var_args .
 * @return {Array.<!Object>}
 * @private
 */
anychart.scales.LinearColor.prototype.normalizeColors_ = function(var_args) {
  var keys = this.extractKeys_.apply(this, arguments);

  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    if (!goog.isDef(key['offset']))
      key['offset'] = !i ? 0 : i == len - 1 ? 1 : i / (len - 1);
    var color = key['color'];
    if (goog.isArray(color)) {
      key['color'] = goog.array.clone(color);
    } else if (goog.isString(color)) {
      key['color'] = goog.color.hexToRgb(anychart.color.parseColor(color).hex);
    }
  }

  goog.array.sortObjectsByKey(keys, 'offset');

  return keys;
};


/**
 * Sets/gets linear gradient for linear color scale. Can be set as single color or gradient as well as array or set
 * of colors or gradients.
 * @param {...(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill|Array.<string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill>)} var_args Colors set.
 * @return {!(Array.<Object>|anychart.scales.LinearColor)}
 */
anychart.scales.LinearColor.prototype.colors = function(var_args) {
  if (arguments.length > 0) {
    var colors = this.normalizeColors_.apply(this, arguments);
    var equal = this.colors_ && colors.length == this.colors_.length;
    if (equal) {
      for (var i = 0, len = colors.length; i < len; i++) {
        var eq = false;
        goog.array.forEach(this.colors_, function(color) {
          eq = eq || goog.object.equals(color, colors[i]);
        });

        equal = equal && eq;
      }
    }

    if (!equal || !this.colors_) {
      this.colors_ = colors;
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }

  return this.colors_;
};


/**
 * Converts value to color.
 * @param {number} value Value to convert.
 * @return {string} Returns color in hex representation relative passed value.
 */
anychart.scales.LinearColor.prototype.valueToColor = function(value) {
  var ratio = this.transform(value);
  var firstKey, lastKey;
  for (var i = 0, len = this.colors_.length; i < len; i++) {
    var color = this.colors_[i];
    if (lastKey) {
      break;
    } else {
      if (ratio >= color['offset']) {
        firstKey = color;
      } else {
        lastKey = color;
      }
    }
  }
  var resultRGBColor;
  if (!firstKey) {
    resultRGBColor = lastKey['color'];
  } else if (!lastKey) {
    resultRGBColor = firstKey['color'];
  } else {
    var relativeRatio = (ratio - firstKey['offset']) / (lastKey['offset'] - firstKey['offset']);
    resultRGBColor = anychart.color.blend(
        /** @type {!goog.color.Rgb} */(lastKey['color']),
        /** @type {!goog.color.Rgb} */(firstKey['color']),
        relativeRatio);
  }

  return goog.color.rgbArrayToHex(/** @type {!goog.color.Rgb} */(resultRGBColor));
};


/**
 * Converts color to value.
 * @param {string} value Color name or hex color representation.
 * @return {number} Returns value relative passed color.
 */
anychart.scales.LinearColor.prototype.colorToValue = function(value) {
  this.calculate();

  var rgbValue = goog.color.hexToRgb(anychart.color.parseColor(value).hex);
  var result, firstKey, lastKey, firstColor, lastColor, i, len;
  for (i = 0, len = this.colors_.length; i < len; i++) {
    firstKey = this.colors_[i];
    firstColor = firstKey['color'];

    if (i != this.colors_.length - 1) {
      lastKey = this.colors_[i + 1];
      lastColor = lastKey['color'];
    }

    var ratio_r, ratio_g, ratio_b;
    ratio_g = ((rgbValue[1] - firstColor[1]) / (lastColor[1] - firstColor[1]));
    ratio_b = ((rgbValue[2] - firstColor[2]) / (lastColor[2] - firstColor[2]));
    ratio_r = ((rgbValue[0] - firstColor[0]) / (lastColor[0] - firstColor[0]));

    if (isNaN(ratio_r)) ratio_r = ratio_g || ratio_b;
    if (isNaN(ratio_g)) ratio_g = ratio_b || ratio_r;
    if (isNaN(ratio_b)) ratio_b = ratio_r || ratio_g;

    if (anychart.math.roughlyEqual(ratio_r, ratio_g) &&
        anychart.math.roughlyEqual(ratio_r, ratio_b) &&
        anychart.math.roughlyEqual(ratio_g, ratio_b))
    {
      var valid_r = Math.round(lastColor[0] * ratio_r + (1.0 - ratio_r) * firstColor[0]) == rgbValue[0];
      var valid_g = Math.round(lastColor[1] * ratio_g + (1.0 - ratio_g) * firstColor[1]) == rgbValue[1];
      var valid_b = Math.round(lastColor[2] * ratio_b + (1.0 - ratio_b) * firstColor[2]) == rgbValue[2];

      if (valid_r && valid_g && valid_b) {
        result = this.range * (ratio_r / (1 / (lastKey['offset'] - firstKey['offset'])) + firstKey['offset']) + this.min;
        break;
      }
    }
  }

  return goog.isDef(result) ? result : NaN;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.LinearColor|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.LinearColor.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = this.createTicks();
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.setup(opt_value);
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.ticksObj;
};


/**
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {(Object|Array)=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.LinearColor|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.LinearColor.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = this.createTicks();
    this.minorTicksObj.count(5);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicksObj.setup(opt_value);
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  }
  return this.minorTicksObj;
};


/** @inheritDoc */
anychart.scales.LinearColor.prototype.calculate = function() {
  if (this.consistent) return;

  anychart.scales.LinearColor.base(this, 'calculate');

  var setupResult = this.ticks().setupAsMajor(this.min, this.max,
      this.minimumModeAuto && this.min != this.softMin,
      this.maximumModeAuto && this.max != this.softMax,
      this.logBaseVal);

  if (this.minimumModeAuto)
    this.min = setupResult[0]; // new min

  if (this.maximumModeAuto)
    this.max = setupResult[1]; // new max

  this.minorTicks().setupAsMinor(this.ticks().getInternal(), this.logBaseVal, setupResult[2], setupResult[3]);

  this.range = this.max - this.min;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.LinearColor.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 * Create scale ticks.
 * @return {!anychart.scales.ScatterTicks}
 * @protected
 */
anychart.scales.LinearColor.prototype.createTicks = function() {
  var ticks = new anychart.scales.ScatterTicks(this);
  this.registerDisposable(ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for linear color scale.
 * @param {...(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill|Array.<string|acgraph.vector.SolidFill|acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill>)} var_args Colors set.
 * @return {anychart.scales.LinearColor}
 */
anychart.scales.linearColor = function(var_args) {
  var scale = new anychart.scales.LinearColor();
  scale.colors.apply(scale, arguments);
  return scale;
};


/** @inheritDoc */
anychart.scales.LinearColor.prototype.serialize = function() {
  var json = anychart.scales.LinearColor.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['colors'] = goog.array.map(/** @type {Array.<Object>} */(this.colors()), function(elem) {
    return goog.color.rgbArrayToHex(/** @type {!goog.color.Rgb} */(elem.color));
  });

  return json;
};


/** @inheritDoc */
anychart.scales.LinearColor.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.LinearColor.base(this, 'setupByJSON', config, opt_default);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.colors(config['colors']);
};


//exports
(function() {
  var proto = anychart.scales.LinearColor.prototype;
  goog.exportSymbol('anychart.scales.linearColor', anychart.scales.linearColor);
  proto['colors'] = proto.colors;
  proto['valueToColor'] = proto.valueToColor;
  proto['colorToValue'] = proto.colorToValue;
  proto['ticks'] = proto.ticks;
  proto['minorTicks'] = proto.minorTicks;
})();


