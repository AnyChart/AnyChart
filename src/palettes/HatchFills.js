goog.provide('anychart.palettes.HatchFills');
goog.require('anychart.core.Base');
goog.require('goog.array');



/**
 * HatchFills palette.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.palettes.HatchFills = function() {
  anychart.palettes.HatchFills.base(this, 'constructor');

  /**
   * HatchFills palette.
   * @type {Array.<acgraph.vector.HatchFill|acgraph.vector.PatternFill>}
   * @private
   */
  this.hatchFills_ = [];

  // Initialize default marker palette using all marker types framework supports.
  // for (var key in acgraph.vector.HatchFill.HatchFillType) {
  //   this.hatchFills_.push(acgraph.vector.normalizeHatchFill(acgraph.vector.HatchFill.HatchFillType[key]));
  // }
};
goog.inherits(anychart.palettes.HatchFills, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.palettes.HatchFills.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Setter for the hatchFill at index if the opt_hatchFill set, getter otherwise.
 * @param {number} index Index of hatchFill to get/set.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type or state of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill|anychart.palettes.HatchFills} HatchFill by index or self for chaining.
 */
anychart.palettes.HatchFills.prototype.itemAt = function(index, opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (!this.hatchFills_) this.hatchFills_ = [];

  var count = this.hatchFills_.length;

  if (index >= count && count > 0) index = index % count;

  // work as setter
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    this.hatchFills_[index] = acgraph.vector.normalizeHatchFill.apply(null, goog.array.slice(arguments, 1));
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
    // work as getter
  } else {
    return this.hatchFills_[index] || null;
  }
};


/**
 * Getter/setter for hatchFills list of palette.
 * @param {(Array.<acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill>)=} opt_hatchFills .
 * @param {...(acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill)} var_args .
 * @return {Array.<acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill>|anychart.palettes.HatchFills} HatchFills list or self for method chaining.
 */
anychart.palettes.HatchFills.prototype.items = function(opt_hatchFills, var_args) {
  if (goog.isDef(opt_hatchFills)) {
    if (!goog.isArray(opt_hatchFills)) {
      opt_hatchFills = goog.array.slice(arguments, 0);
    }
    this.hatchFills_ = goog.array.map(opt_hatchFills, function(hatchFill) {
      return acgraph.vector.normalizeHatchFill.call(null, hatchFill);
    });
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return this.hatchFills_;
  }
};


/**
 * @inheritDoc
 */
anychart.palettes.HatchFills.prototype.serialize = function() {
  var json = anychart.palettes.HatchFills.base(this, 'serialize');
  var res = [];
  for (var i = 0; i < this.hatchFills_.length; i++) {
    res.push(anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.hatchFills_[i])));
  }
  json['items'] = res;
  return json;
};


/** @inheritDoc */
anychart.palettes.HatchFills.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isArray(arg0)) {
    this.items(arg0);
    return true;
  }
  if (anychart.utils.instanceOf(arg0, anychart.palettes.HatchFills)) {
    this.items(/** @type {Array.<acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill>} */(arg0.items()));
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/** @inheritDoc */
anychart.palettes.HatchFills.prototype.setupByJSON = function(config, opt_default) {
  anychart.palettes.HatchFills.base(this, 'setupByJSON', config, opt_default);
  this.items(config['items']);
};


/**
 * @inheritDoc
 */
anychart.palettes.HatchFills.prototype.disposeInternal = function() {
  goog.disposeAll(this.hatchFills_);
  this.hatchFills_ = null;

  anychart.palettes.HatchFills.base(this, 'disposeInternal');
};


/**
 * Constructor function.
 * @param {(Array.<acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill>|
 * acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill)=} opt_value Array of hatch fills.
 * @param {...(acgraph.vector.HatchFill|acgraph.vector.HatchFill.HatchFillType|acgraph.vector.PatternFill)} var_args Hatch fills enumeration.
 * @return {!anychart.palettes.HatchFills}
 */
anychart.palettes.hatchFills = function(opt_value, var_args) {
  var palette = new anychart.palettes.HatchFills();
  palette.items.apply(palette, goog.isDef(opt_value) ? arguments : goog.object.getValues(acgraph.vector.HatchFill.HatchFillType));
  return palette;
};


//exports
(function() {
  var proto = anychart.palettes.HatchFills.prototype;
  goog.exportSymbol('anychart.palettes.hatchFills', anychart.palettes.hatchFills);
  proto['itemAt'] = proto.itemAt;
  proto['items'] = proto.items;
})();
