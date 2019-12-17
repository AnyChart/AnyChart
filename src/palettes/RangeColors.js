goog.provide('anychart.palettes.RangeColors');
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('goog.array');
goog.require('goog.color');



/**
 * Gradient palette.
 * @example <t>simple-h100</t>
 * var palette = anychart.palettes.rangeColors()
 *     .colors(['red', 'yellow'])
 *     .count(9);
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *     .fill(palette.itemAt(i))
 *     .stroke('1px #000');
 * }
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.palettes.RangeColors = function() {
  anychart.palettes.RangeColors.base(this, 'constructor');

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill|
   * Array.<acgraph.vector.GradientKey>|Array.<string>}
   * @private
   */
  this.colors_ = null;


  /**
   * Color palette colors count.
   * @type {number}
   * @private
   */
  this.count_ = NaN;

  /**
   * Color palette.
   * @type {Array.<acgraph.vector.SolidFill>}
   * @private
   */
  this.colorPalette_ = [];

  /**
   * AutoCount, used to store how much count chart needs
   * @type {number}
   * @private
   */
  this.autoCount_ = NaN;

  this.restoreDefaults(true);
};
goog.inherits(anychart.palettes.RangeColors, anychart.core.Base);


/**
 * Signal mask.
 * @type {number}
 */
anychart.palettes.RangeColors.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {anychart.ConsistencyState|number}
 */
anychart.palettes.RangeColors.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.ConsistencyState.APPEARANCE;


/**
 * Color palette.
 * @type {Array.<acgraph.vector.SolidFill>}
 * @private
 */
anychart.palettes.RangeColors.prototype.colorPalette_;


/**
 * Checks if palette is consistent and if not - recreates it
 */
anychart.palettes.RangeColors.prototype.ensureProcessed = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.processColorRange_();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


/**
 * @param {number} val Value from chart for autoCount
 */
anychart.palettes.RangeColors.prototype.setAutoCount = function(val) {
  if (this.autoCount_ != val) {
    this.autoCount_ = val;
    if (isNaN(this.count_) || goog.isNull(this.count_))
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
  }
};


/**
 * Getter/setter for the color palette colors list.
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill|
 * Array.<acgraph.vector.GradientKey>|Array.<string>|acgraph.vector.SolidFill|string)=} opt_value .
 * @param {...(acgraph.vector.SolidFill|string)} var_args .
 * @return {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill|
 * Array.<acgraph.vector.GradientKey>|Array.<string>|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.items = function(opt_value, var_args) {
  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && goog.isArray(opt_value.keys)) {
      this.colors_ = acgraph.vector.normalizeFill(opt_value).keys;
    } else {
      if (!goog.isArray(opt_value)) {
        opt_value = goog.array.slice(arguments, 0);
      }
      goog.disposeAll(this.colors_);
      this.colors_ = goog.array.map(/** @type {Array} */ (opt_value), function(element) {
        return acgraph.vector.normalizeFill(element);
      });
    }

    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return /** @type {Array|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill} */ (this.colors_);
  }
};


/**
 * Getter/setter for count.
 * @param {number=} opt_value .
 * @return {number|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.count_ = opt_value;

      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.count_;
  }
};


/**
 * Getter/setter for color palette colors from list by index.
 * @param {number} index .
 * @param {acgraph.vector.SolidFill=} opt_item .
 * @return {acgraph.vector.SolidFill|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.itemAt = function(index, opt_item) {
  this.ensureProcessed();
  var colors = goog.isArray(this.colors_) ? this.colors_ : this.colors_.keys;
  if (colors.length < 1) return null;
  var count = this.count_ || this.autoCount_ || colors.length;
  if (!count) return null;

  if (goog.isDef(opt_item)) {
    this.colorPalette_[index] = opt_item;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    if (index > count - 1) index = count - 1;
    if (index < 0) index = 0;
    var color = /** @type {acgraph.vector.SolidFill} */(this.colorPalette_[index]);
    return color ? color : null;
  }
};


/**
 * Palette processing.
 * @private
 */
anychart.palettes.RangeColors.prototype.processColorRange_ = function() {
  if (this.colors_ && this.count_ != 0) {
    var gradientKeys = [];
    var colors = goog.isArray(this.colors_) ? this.colors_ : this.colors_.keys;
    if (!goog.isArray(colors) || !colors.length) return;

    var count = this.count_ || this.autoCount_ || colors.length;

    var offsetStep = 1 / (colors.length - 1), color;
    for (var i = 0; i < colors.length; i++) {
      var colorItem = colors[i];
      if (goog.isString(colorItem)) {
        color = anychart.color.parseColor(colorItem);
        gradientKeys.push(
            {
              'color': color ? color.hex : '#000000',
              'offset': i * offsetStep
            }
        );
      } else {
        color = anychart.color.parseColor(colorItem.color);
        gradientKeys.push(
            {
              'color': color ? color.hex : '#000000',
              'offset': goog.isDef(colorItem.offset) ? colorItem.offset : i * offsetStep
            }
        );
      }
    }

    goog.array.sortObjectsByKey(gradientKeys, 'offset');

    this.colorPalette_ = [];

    if (gradientKeys.length == 1) {
      for (i = 0; i < count; i++)
        this.colorPalette_[i] = {'color': gradientKeys[0].color};
    } else {
      for (i = 0; i < count; i++) {
        var indexOffset = count == 1 ? 0 : i / (count - 1);

        var leftLimit = null;
        var rightLimit = null;

        for (var j = 0; j < gradientKeys.length; j++) {
          if (indexOffset >= gradientKeys[j].offset) {
            leftLimit = gradientKeys[j];
          }

          if (indexOffset <= gradientKeys[j].offset) {
            if (rightLimit == null) rightLimit = gradientKeys[j];
          }
        }

        if (!leftLimit) leftLimit = gradientKeys[0];
        if (!rightLimit) rightLimit = gradientKeys[gradientKeys.length - 1];

        if (rightLimit.offset == leftLimit.offset) {
          this.colorPalette_[i] = {'color': leftLimit.color};
        } else {
          var pos = 1 - (indexOffset - leftLimit.offset) / (rightLimit.offset - leftLimit.offset);
          this.colorPalette_[i] = {
            'color': goog.color.rgbArrayToHex(goog.color.blend(goog.color.hexToRgb(leftLimit.color), goog.color.hexToRgb(rightLimit.color), pos))
          };
        }
      }
    }
  }
};


/**
 * Restore color palette default settings.
 * @param {boolean=} opt_doNotDispatch Define, should dispatch invalidation event after default settings will be restored.
 */
anychart.palettes.RangeColors.prototype.restoreDefaults = function(opt_doNotDispatch) {
  this.count_ = NaN;
  this.colors_ = [
    '#1D8BD1',
    '#F1683C',
    '#2AD62A',
    '#DBDC25',
    '#8FBC8B',
    '#D2B48C',
    '#FAF0E6',
    '#20B2AA',
    '#B0C4DE',
    '#DDA0DD',
    '#9C9AFF',
    '#9C3063',
    '#FFFFCE',
    '#CEFFFF',
    '#630063',
    '#FF8284',
    '#0065CE',
    '#CECFFF',
    '#000084',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
    '#840084',
    '#840000',
    '#008284',
    '#0000FF',
    '#00CFFF',
    '#CEFFFF',
    '#CEFFCE',
    '#FFFF9C',
    '#9CCFFF',
    '#FF9ACE',
    '#CE9AFF',
    '#FFCF9C',
    '#3165FF',
    '#31CFCE',
    '#9CCF00',
    '#FFCF00',
    '#FF9A00',
    '#FF6500'
  ];
  this.invalidate(anychart.ConsistencyState.APPEARANCE);
  if (opt_doNotDispatch) this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.serialize = function() {
  var json = anychart.palettes.RangeColors.base(this, 'serialize');
  json['type'] = 'range';
  var res = [];
  for (var i = 0; i < this.colors_.length; i++) {
    res.push(anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.colors_[i])));
  }
  json['items'] = res;
  if (!isNaN(this.count_)) json['count'] = this.count_;
  return json;
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.resolveSpecialValue = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isArray(arg0)) {
    return {'items': arg0};
  } else if (anychart.utils.instanceOf(arg0, anychart.palettes.RangeColors)) {
    return {
      'items': arg0.items(),
      'count': arg0.count()
    };
  }
  return null;
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.setupSpecial = function(isDefault, var_args) {
  var resolvedValue = this.resolveSpecialValue(arguments[1]);
  if (resolvedValue) {
    this.items(/** @type {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill|Array.<acgraph.vector.GradientKey>|Array.<string>} */(resolvedValue['items']));

    if ('count' in resolvedValue)
      this.count(/** @type {number} */(resolvedValue['count']));
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.setupByJSON = function(config, opt_default) {
  anychart.palettes.RangeColors.base(this, 'setupByJSON', config, opt_default);
  this.items(config['items']);
  this.count(config['count']);
};


/**
 * Constructor function.
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradientFill|acgraph.vector.RadialGradientFill|
 * Array.<acgraph.vector.GradientKey>|Array.<string>|acgraph.vector.SolidFill|string)=} opt_value Array of colors or gradient.
 * @param {...(acgraph.vector.SolidFill|string)} var_args Colors enumeration.
 * @return {!anychart.palettes.RangeColors}
 */
anychart.palettes.rangeColors = function(opt_value, var_args) {
  var palette = new anychart.palettes.RangeColors();
  if (goog.isDef(opt_value)) {
    palette.setup.apply(palette, arguments);
  }
  return palette;
};


//exports
(function() {
  var proto = anychart.palettes.RangeColors.prototype;
  goog.exportSymbol('anychart.palettes.rangeColors', anychart.palettes.rangeColors);
  proto['itemAt'] = proto.itemAt;
  proto['items'] = proto.items;
  proto['count'] = proto.count;
})();
