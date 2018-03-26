goog.provide('anychart.linearGaugeModule.pointers.Thermometer');
goog.require('anychart.linearGaugeModule.pointers.Base');



/**
 * Thermometer pointer class.
 * @extends {anychart.linearGaugeModule.pointers.Base}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Thermometer = function() {
  anychart.linearGaugeModule.pointers.Thermometer.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['bulbRadius', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['bulbPadding', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.linearGaugeModule.pointers.Thermometer, anychart.linearGaugeModule.pointers.Base);


//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.drawVertical = function() {
  var bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  var inverted = this.scale().inverted();

  var left = bounds.left;
  var right = bounds.left + bounds.width;
  var top = this.applyRatioToBounds(this.getEndRatio());
  var bottom = inverted ? bounds.top - this.pixPadding_ : bounds.top + bounds.height + this.pixPadding_;
  this.pointerBounds.left = left;
  this.pointerBounds.top = inverted ? bottom : top;
  this.pointerBounds.width = Math.abs(right - left);
  this.pointerBounds.height = Math.abs(bottom - top);

  this.path.clear()
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .arcToByEndPoint(left, bottom, this.pixRadius_, this.pixRadius_, true, !inverted)
      .lineTo(left, top)
      .close();

  this.hatch.deserialize(this.path.serialize());
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.drawHorizontal = function() {
  var bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  var inverted = this.scale().inverted();

  var left = bounds.top;
  var right = bounds.top + bounds.height;
  var top = this.applyRatioToBounds(this.getEndRatio());
  var bottom = inverted ? bounds.left + bounds.width + this.pixPadding_ : bounds.left - this.pixPadding_;
  this.pointerBounds.left = inverted ? top : bottom;
  this.pointerBounds.top = left;
  this.pointerBounds.width = Math.abs(bottom - top);
  this.pointerBounds.height = Math.abs(right - left);

  this.path.clear()
      .moveTo(top, left)
      .lineTo(top, right)
      .lineTo(bottom, right)
      .arcToByEndPoint(bottom, left, this.pixRadius_, this.pixRadius_, true, !inverted)
      .lineTo(top, left)
      .close();

  this.hatch.deserialize(this.path.serialize());
};


//endregion
//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.THERMOMETER;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.getReservedBounds = function(parentWidth, parentHeight) {
  var w = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('width')), parentWidth);
  var r = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('bulbRadius')), w);
  var p = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getOption('bulbPadding')), parentHeight);
  if (r < w / 2)
    r = w / 2;
  this.pixRadius_ = r;
  this.pixPadding_ = p;
  var gap = (r + Math.sqrt(3) * r / 2) + p;
  var left, top, right, bottom;
  left = top = right = bottom = 0;
  var inverted = this.scale().inverted();
  if (this.isVertical()) {
    if (inverted)
      top = gap;
    else
      bottom = gap;
  } else {
    if (inverted)
      right = gap;
    else
      left = gap;
  }
  return [left, top, right, bottom];
};


//endregion
//region --- DESCRIPTORS ---
/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.linearGaugeModule.pointers.Thermometer.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'bulbRadius', anychart.utils.normalizeToPercent],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'bulbPadding', anychart.utils.normalizeToPercent]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.linearGaugeModule.pointers.Thermometer, anychart.linearGaugeModule.pointers.Thermometer.OWN_DESCRIPTORS);


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.pointers.Thermometer.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.linearGaugeModule.pointers.Thermometer.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.pointers.Thermometer.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.linearGaugeModule.pointers.Thermometer.OWN_DESCRIPTORS, json, 'Thermometer');
  return json;
};
//endregion

//exports
//(function() {
//  var proto = anychart.linearGaugeModule.pointers.Thermometer.prototype;
// generated automatically
//proto['bulbRadius'] = proto.bulbRadius;
//proto['bulbPadding'] = proto.bulbPadding;
//})();
