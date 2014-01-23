goog.provide('anychart.utils.ColorPalette');



/**
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.utils.ColorPalette = function() {
  goog.base(this);

  /**
   * Color palette type settings.
   * @type {anychart.utils.ColorPalette.Type}
   * @private
   */
  this.type_;

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.Fill>}
   * @private
   */
  this.colors_ = null;

  this.restoreDefaults(true);
};
goog.inherits(anychart.utils.ColorPalette, anychart.utils.Invalidatable);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.utils.ColorPalette.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.utils.ConsistencyState.DATA;


/**
 * Color palette types enumeration.
 * @enum {string}
 */
anychart.utils.ColorPalette.Type = {
  DISTINCT: 'distinct',
  COLOR_RANGE: 'colorrange'
};


/**
 * Normalizes user input to ColorPalette.Type enumeration values.
 * @param {anychart.utils.ColorPalette.Type|string} type Color palette type to normalize.
 * @param {anychart.utils.ColorPalette.Type=} opt_default Default color palette type.
 * @return {anychart.utils.ColorPalette.Type} Normalized color palette type value.
 */
anychart.utils.ColorPalette.normalizeType = function(type, opt_default) {
  if (goog.isString(type)) {
    type = type.toLowerCase();
    if (goog.object.contains(anychart.utils.ColorPalette.Type, type))
      return /** @type {anychart.utils.ColorPalette.Type} */(type);
  }
  return opt_default || anychart.utils.ColorPalette.Type.DISTINCT;
};


/**
 * Gets or sets color to color palette colors list by passed index.
 * @param {number} index Index to set or get color.
 * @param {acgraph.vector.Fill=} opt_color Color to set by passed index.
 * @return {acgraph.vector.Fill|anychart.utils.ColorPalette|null} Color palette color from colors list by passed index,
 * null if no colors in colors list or itself for chaining call.
 */
anychart.utils.ColorPalette.prototype.colorAt = function(index, opt_color) {
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
 * @return {Array.<acgraph.vector.Fill>|anychart.utils.ColorPalette} Color palette colors list or itself for chaining call.
 */
anychart.utils.ColorPalette.prototype.colors = function(opt_value) {
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
anychart.utils.ColorPalette.prototype.restoreDefaults = function(opt_doNotDispatch) {
  this.type_ = anychart.utils.ColorPalette.Type.DISTINCT;
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
