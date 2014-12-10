goog.provide('anychart.palettes.DistinctColors');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('goog.array');



/**
 * Color palette class.
 * @example <t>simple-h100</t>
 * var palette = anychart.utils.distinctColorPalette()
 *     .colors(['red', 'yellow', 'brown', 'green']);
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *       .fill(palette.colorAt(i))
 *       .stroke('1px #000');
 * }
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.palettes.DistinctColors = function() {
  goog.base(this);

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.Fill>}
   * @private
   */
  this.colors_ = null;

  this.restoreDefaults(true);
};
goog.inherits(anychart.palettes.DistinctColors, anychart.core.Base);


/**
 * Signals mask.
 * @type {number}
 */
anychart.palettes.DistinctColors.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Getter for color palette colors from list by index.
 * @param {number} index Index to set or get color.
 * @return {acgraph.vector.Fill|anychart.palettes.DistinctColors} Color palette colors by index.
 *//**
 * Setter for color palette colors from list by index.
 * @example <t>simple-h100</t>
 * var palette = anychart.utils.distinctColorPalette()
 *     .colors(['red', 'yellow', 'brown', 'green']);
 * palette.colorAt(2, 'white');
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *       .fill(palette.colorAt(i))
 *       .stroke('1px #000');
 * }
 * @param {number} index Index to set or get color.
 * @param {acgraph.vector.Fill=} opt_color Color to set by passed index.
 * @return {!anychart.palettes.DistinctColors} An instance of the {@link anychart.palettes.DistinctColors} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number} index .
 * @param {acgraph.vector.Fill=} opt_color .
 * @return {acgraph.vector.Fill|!anychart.palettes.DistinctColors} .
 */
anychart.palettes.DistinctColors.prototype.colorAt = function(index, opt_color) {
  if (!this.colors_) this.colors_ = [];
  var count = this.colors_.length;

  if (index >= count && count > 0) index = index % count;

  if (goog.isDef(opt_color)) {
    this.colors_[index] = opt_color;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    var color = this.colors_[index];
    return color ? color : null;
  }
};


/**
 * Getter for color palette colors list.
 * @return {Array.<acgraph.vector.Fill>} Color palette colors list.
 *//**
 * Setter for color palette colors list.
 * @example <t>simple-h100</t>
 * var palette = anychart.utils.distinctColorPalette()
 *      .colors(['#00F', 'red', ['orange', 'red'], '#00C', '#00B', '#00A', '#009', '#008']);
 * var len = palette.colors().length-1;
 * for (var i = 1; i <= len; i++) {
 *   stage.rect((i - 1) * stage.width() / len, 0, stage.width() / len - .5, stage.height())
 *       .fill(palette.colorAt(i-1))
 *       .stroke('1px #000');
 * }
 * @param {Array.<acgraph.vector.Fill>=} opt_value Color palette colors list to set.
 * @return {!anychart.palettes.DistinctColors} An instance of the {@link anychart.palettes.DistinctColors} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {Array.<acgraph.vector.Fill>=} opt_value .
 * @return {Array.<acgraph.vector.Fill>|!anychart.palettes.DistinctColors} .
 */
anychart.palettes.DistinctColors.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.colors_ = goog.array.map(opt_value, function(element) {
      return acgraph.vector.normalizeFill(element);
    });
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return this.colors_;
  }
};


/**
 * Restore color palette default settings.
 * @param {boolean=} opt_doNotDispatch Define, should dispatch invalidation event after default settings will be restored.
 */
anychart.palettes.DistinctColors.prototype.restoreDefaults = function(opt_doNotDispatch) {
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
  if (opt_doNotDispatch) this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/** @inheritDoc */
anychart.palettes.DistinctColors.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['type'] = 'distinct';
  var res = [];
  for (var i = 0; i < this.colors_.length; i++) {
    res.push(anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.colors_[i])));
  }
  json['items'] = res;
  return json;
};


/** @inheritDoc */
anychart.palettes.DistinctColors.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (goog.isArray(args[0])) {
    this.colors(args[0]);
    return true;
  }
  if (args[0] instanceof anychart.palettes.DistinctColors) {
    this.colors(args[0].colors());
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.palettes.DistinctColors.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.colors(config['items']);
};


/**
 * Constructor function.
 * @return {!anychart.palettes.DistinctColors}
 */
anychart.palettes.distinctColors = function() {
  return new anychart.palettes.DistinctColors();
};


//exports
goog.exportSymbol('anychart.palettes.distinctColors', anychart.palettes.distinctColors);
anychart.palettes.DistinctColors.prototype['colorAt'] = anychart.palettes.DistinctColors.prototype.colorAt;//in docs/
anychart.palettes.DistinctColors.prototype['colors'] = anychart.palettes.DistinctColors.prototype.colors;//in docs/
