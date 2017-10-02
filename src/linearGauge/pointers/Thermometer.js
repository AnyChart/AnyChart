goog.provide('anychart.linearGaugeModule.pointers.Thermometer');
goog.require('anychart.linearGaugeModule.pointers.Base');



/**
 * Thermometer pointer class.
 * @param {anychart.linearGaugeModule.Chart} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.linearGaugeModule.pointers.Base}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Thermometer = function(gauge, dataIndex) {
  anychart.linearGaugeModule.pointers.Thermometer.base(this, 'constructor', gauge, dataIndex);
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
  var w = anychart.utils.normalizeSize(/** @type {number|string} */ (this.width()), parentWidth);
  var r = anychart.utils.normalizeSize(/** @type {number|string} */ (this.bulbRadius()), w);
  var p = anychart.utils.normalizeSize(/** @type {number|string} */ (this.bulbPadding()), parentHeight);
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
//region --- OWN/SPECIFIC API ---
/**
 * Getter/setter for bulbRadius.
 * @param {string=} opt_value bulbRadius.
 * @return {string|anychart.linearGaugeModule.pointers.Thermometer} bulbRadius or self for chaining.
 */
anychart.linearGaugeModule.pointers.Thermometer.prototype.bulbRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.bulbRadius_ != opt_value) {
      this.bulbRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.bulbRadius_;
};


/**
 * Getter/setter for bulbPadding.
 * @param {string|number=} opt_value bulbPadding.
 * @return {string|number|anychart.linearGaugeModule.pointers.Thermometer} bulbPadding or self for chaining.
 */
anychart.linearGaugeModule.pointers.Thermometer.prototype.bulbPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = /** @type {string} */ (anychart.utils.normalizeToPercent(opt_value));
    if (this.bulbPadding_ != opt_value) {
      this.bulbPadding_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.bulbPadding_;
};


//endregion
//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.setupByJSON = function(config, opt_default) {
  anychart.linearGaugeModule.pointers.Thermometer.base(this, 'setupByJSON', config, opt_default);

  this.bulbRadius(config['bulbRadius']);
  this.bulbPadding(config['bulbPadding']);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Thermometer.prototype.serialize = function() {
  var json = anychart.linearGaugeModule.pointers.Thermometer.base(this, 'serialize');
  json['bulbRadius'] = this.bulbRadius();
  json['bulbPadding'] = this.bulbPadding();
  return json;
};
//endregion

//exports
(function() {
  var proto = anychart.linearGaugeModule.pointers.Thermometer.prototype;
  proto['bulbRadius'] = proto.bulbRadius;
  proto['bulbPadding'] = proto.bulbPadding;
})();
