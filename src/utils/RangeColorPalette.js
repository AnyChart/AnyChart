goog.provide('anychart.utils.RangeColorPalette');
goog.require('anychart.Base');
goog.require('anychart.utils.color');
goog.require('goog.array');
goog.require('goog.color');



/**
 * Класс определяющий работу градиентной палитры.
 * @example <t>simple-h100</t>
 * var palette = new anychart.utils.RangeColorPalette()
 *     .colors(['red', 'yellow'])
 *     .count(9);
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *     .fill(palette.colorAt(i))
 *     .stroke('1px #000');
 * }
 * @constructor
 * @extends {anychart.Base}
 */
anychart.utils.RangeColorPalette = function() {
  goog.base(this);

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
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

  this.restoreDefaults(true);
};
goog.inherits(anychart.utils.RangeColorPalette, anychart.Base);


/**
 * Маска состояний рассинхронизации, которые умеет отправлять этот объект.
 * @type {number}
 */
anychart.utils.RangeColorPalette.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Color palette.
 * @type {Array.<acgraph.vector.SolidFill>}
 * @private
 */
anychart.utils.RangeColorPalette.prototype.colorPalette_;


/**
 * Getter for color palette colors list.
 * @return {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>} Color palette colors list.
 *//**
 * Setter for color palette colors list.
 * @example <t>listingOnly</t>
 * var palette = new anychart.utils.RangeColorPalette()
 *      .colors(['red', 'yellow'])
 *      .count(10);
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>)=} opt_value Color palette colors list to set.
 * @return {!anychart.utils.RangeColorPalette} An instance of the {@link anychart.utils.RangeColorPalette} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>)=} opt_value .
 * @return {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>|anychart.utils.RangeColorPalette} .
 */
anychart.utils.RangeColorPalette.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.colors_ = opt_value;
    this.processColorRange_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return this.colors_;
  }
};


/**
 * Getter for color palette's colors counts.
 * @return {number} Current color palette's colors count.
 *//**
 * Setter for color palette's colors counts.<br/>
 * <b>Note:</b> Определяет на сколько частей разбить градиент.
 * @param {number=} opt_value [NaN] Color palette colors counts.
 * @return {!anychart.utils.RangeColorPalette} An instance of the {@link anychart.utils.RangeColorPalette} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.utils.RangeColorPalette} .
 */
anychart.utils.RangeColorPalette.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.count_ = opt_value;
      this.processColorRange_();
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.count_;
  }
};


/**
 * Getter for color palette colors from list by index.
 * @param {number} index Index to set or get color.
 * @return {acgraph.vector.SolidFill|anychart.utils.RangeColorPalette} Color palette colors by index.
 *//**
 * Setter for color palette colors from list by index.
 * @example <t>simple-h100</t>
 * var palette = new anychart.utils.RangeColorPalette()
 *     .colors(['red', 'yellow'])
 *     .count(9);
 * palette.colorAt(4, 'blue');
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *     .fill(palette.colorAt(i))
 *     .stroke('1px #000');
 * }
 * @param {number} index Index to set or get color.
 * @param {acgraph.vector.SolidFill=} opt_color Color to set by passed index.
 * @return {!anychart.utils.RangeColorPalette} An instance of the {@link anychart.utils.RangeColorPalette} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number} index .
 * @param {acgraph.vector.SolidFill=} opt_color .
 * @return {acgraph.vector.SolidFill|anychart.utils.RangeColorPalette} .
 */
anychart.utils.RangeColorPalette.prototype.colorAt = function(index, opt_color) {
  if (!this.colors_ || this.colors_.length < 1) return null;
  if (this.count_ == 0) return null;

  if (goog.isDef(opt_color)) {
    this.colorPalette_[index] = opt_color;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    if (index > this.count_ - 1) index = this.count_ - 1;
    if (index < 0) index = 0;
    var color = /**@type {acgraph.vector.SolidFill} */(this.colorPalette_[index]);
    return color ? color : null;
  }
};


/**
 * Palette processing.
 * @private
 */
anychart.utils.RangeColorPalette.prototype.processColorRange_ = function() {
  if (this.colors_ && this.count_ != 0) {
    if (isNaN(this.count_)) this.count_ = this.colors_.length;
    var gradientKeys = [];
    var colors = goog.isArray(this.colors_) ? this.colors_ : this.colors_.keys;

    if (colors.length == 0) return;

    var offsetStep = 1 / (colors.length - 1), color;
    for (var i = 0; i < colors.length; i++) {
      var colorItem = colors[i];
      if (goog.isString(colorItem)) {
        color = anychart.utils.color.parseColor(colorItem);
        gradientKeys.push(
            {
              'color': color ? color.hex : '#000000',
              'offset': i * offsetStep
            }
        );
      } else {
        color = anychart.utils.color.parseColor(colorItem.color);
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
      for (i = 0; i < this.count_; i++)
        this.colorPalette_[i] = {'color': gradientKeys[0].color};
    } else {
      for (i = 0; i < this.count_; i++) {
        var indexOffset = this.count_ == 1 ? 0 : i / (this.count_ - 1);

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
anychart.utils.RangeColorPalette.prototype.restoreDefaults = function(opt_doNotDispatch) {
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
  this.processColorRange_();
  if (opt_doNotDispatch) this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/**
 * Copies settings from the passed palette to itself.
 * @param {anychart.utils.RangeColorPalette} palette Color palette to copy settings from.
 * @return {!anychart.utils.RangeColorPalette} Returns itself for chaining.
 */
anychart.utils.RangeColorPalette.prototype.cloneFrom = function(palette) {
  if (goog.isDefAndNotNull(palette)) {
    this.colors_ = palette.colors_;
    this.count_ = palette.count_;
    this.colorPalette_ = palette.colorPalette_;
  } else {
    this.colors_ = [];
    this.count_ = 0;
    this.colorPalette_ = [];
  }
  return this;
};
