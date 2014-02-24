goog.provide('anychart.utils.DistinctColorPalette');



/**
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.utils.DistinctColorPalette = function() {
  goog.base(this);

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.Fill>}
   * @private
   */
  this.colors_ = null;

  this.restoreDefaults(true);
};
goog.inherits(anychart.utils.DistinctColorPalette, anychart.utils.Invalidatable);


/**
 * Маска состояний рассинхронизации, которые умеет отправлять этот объект.
 * @type {number}
 */
anychart.utils.DistinctColorPalette.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.DATA;


/**
 * Gets or sets color to color palette colors list by passed index.
 * @param {number} index Index to set or get color.
 * @param {acgraph.vector.Fill=} opt_color Color to set by passed index.
 * @return {acgraph.vector.Fill|anychart.utils.DistinctColorPalette|null} Color palette color from colors list by passed index,
 * null if no colors in colors list or itself for chaining call.
 */
anychart.utils.DistinctColorPalette.prototype.colorAt = function(index, opt_color) {
  if (!this.colors_) this.colors_ = [];
  var count = this.colors_.length;

  if (index >= count && count > 0) index = index % count;

  if (goog.isDef(opt_color)) {
    this.colors_[index] = opt_color;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
    return this;
  } else {
    var color = this.colors_[index];
    return color ? color : null;
  }
};


/**
 * Gets or sets color palette colors list.
 * @param {Array.<acgraph.vector.Fill>=} opt_value Color palette colors list to set.
 * @return {Array.<acgraph.vector.Fill>|anychart.utils.DistinctColorPalette} Color palette colors list or itself for chaining call.
 */
anychart.utils.DistinctColorPalette.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.colors_ = opt_value;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
    return this;
  } else {
    return this.colors_;
  }
};


/**
 * Restore color palette default settings.
 * @param {boolean=} opt_doNotDispatch Define, should dispatch invalidation event after default settings will be restored.
 */
anychart.utils.DistinctColorPalette.prototype.restoreDefaults = function(opt_doNotDispatch) {
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
  if (opt_doNotDispatch) this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
};


/**
 * Copies type and colors settings from the passed palette to itself.
 * @param {anychart.utils.DistinctColorPalette} palette Color palette to copy settings from.
 * @return {!anychart.utils.DistinctColorPalette} Returns itself for chaining.
 */
anychart.utils.DistinctColorPalette.prototype.cloneFrom = function(palette) {
  if (goog.isDefAndNotNull(palette)) {
    this.colors_ = palette.colors_;
  } else {
    this.colors_ = [];
  }
  return this;
};
