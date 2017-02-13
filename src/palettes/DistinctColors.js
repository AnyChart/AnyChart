goog.provide('anychart.palettes.DistinctColors');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('goog.array');



/**
 * Color palette class.
 * @example <t>simple-h100</t>
 * var palette = anychart.palettes.distinctColors()
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
  anychart.palettes.DistinctColors.base(this, 'constructor');

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
 * Getter/setter for color palette colors from list by index.
 * @param {number} index .
 * @param {acgraph.vector.Fill=} opt_color .
 * @return {acgraph.vector.Fill|!anychart.palettes.DistinctColors} .
 * @deprecated Since 7.7.0. Use itemAt() method instead.
 */
anychart.palettes.DistinctColors.prototype.colorAt = function(index, opt_color) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['colorAt()', 'itemAt()'], true);
  return this.itemAt(index, opt_color);
};


/**
 * Getter/setter for color palette colors from list by index.
 * @param {number} index .
 * @param {acgraph.vector.Fill=} opt_item .
 * @return {acgraph.vector.Fill|!anychart.palettes.DistinctColors} .
 */
anychart.palettes.DistinctColors.prototype.itemAt = function(index, opt_item) {
  if (!this.colors_) this.colors_ = [];
  var count = this.colors_.length;

  if (index >= count && count > 0) index = index % count;

  if (goog.isDef(opt_item)) {
    this.colors_[index] = opt_item;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    var color = this.colors_[index];
    return color ? color : null;
  }
};


/**
 * Getter/setter for color palette colors list.
 * @param {(Array.<acgraph.vector.Fill>|acgraph.vector.Fill)=} opt_value .
 * @param {...acgraph.vector.Fill} var_args .
 * @return {Array.<acgraph.vector.Fill>|!anychart.palettes.DistinctColors} .
 * @deprecated Since 7.7.0. Use items() method instead.
 */
anychart.palettes.DistinctColors.prototype.colors = function(opt_value, var_args) {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['colors()', 'items()'], true);
  return this.items.apply(this, arguments);
};


/**
 * Getter/setter for color palette colors list.
 * @param {(Array.<acgraph.vector.Fill>|acgraph.vector.Fill)=} opt_value .
 * @param {...acgraph.vector.Fill} var_args .
 * @return {Array.<acgraph.vector.Fill>|!anychart.palettes.DistinctColors} .
 */
anychart.palettes.DistinctColors.prototype.items = function(opt_value, var_args) {
  if (goog.isDef(opt_value)) {
    if (!goog.isArray(opt_value)) {
      opt_value = goog.array.slice(arguments, 0);
    }
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
  this.colors_ = goog.array.clone(/** @type {Array} */(anychart.getFullTheme('palette.items')));
  if (opt_doNotDispatch) this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/** @inheritDoc */
anychart.palettes.DistinctColors.prototype.serialize = function() {
  var json = anychart.palettes.DistinctColors.base(this, 'serialize');
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
    this.items(args[0]);
    return true;
  }
  if (args[0] instanceof anychart.palettes.DistinctColors) {
    this.items(args[0].items());
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/**
 * @inheritDoc
 * @suppress {deprecated}
 */
anychart.palettes.DistinctColors.prototype.setupByJSON = function(config, opt_default) {
  anychart.palettes.DistinctColors.base(this, 'setupByJSON', config, opt_default);
  if (goog.isDef(config['colors']))
    this.colors(config['colors']);
  this.items(config['items']);
};


/**
 * Constructor function.
 * @param {(Array.<acgraph.vector.Fill>|acgraph.vector.Fill)=} opt_value Array of colors.
 * @param {...acgraph.vector.Fill} var_args Colors enumeration.
 * @return {!anychart.palettes.DistinctColors}
 */
anychart.palettes.distinctColors = function(opt_value, var_args) {
  var palette = new anychart.palettes.DistinctColors();
  if (goog.isDef(opt_value)) {
    palette.items.apply(palette, arguments);
  }
  return palette;
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.palettes.DistinctColors.prototype;
  goog.exportSymbol('anychart.palettes.distinctColors', anychart.palettes.distinctColors);
  proto['colorAt'] = proto.colorAt;
  proto['itemAt'] = proto.itemAt;
  proto['colors'] = proto.colors;
  proto['items'] = proto.items;
})();
