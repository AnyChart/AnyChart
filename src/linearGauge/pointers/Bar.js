goog.provide('anychart.linearGaugeModule.pointers.Bar');
goog.require('anychart.linearGaugeModule.pointers.Base');



/**
 * Bar pointer class.
 * @extends {anychart.linearGaugeModule.pointers.Base}
 * @constructor
 */
anychart.linearGaugeModule.pointers.Bar = function() {
  anychart.linearGaugeModule.pointers.Bar.base(this, 'constructor');
};
goog.inherits(anychart.linearGaugeModule.pointers.Bar, anychart.linearGaugeModule.pointers.Base);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Bar.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.BAR;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Bar.prototype.getReferenceValues = function() {
  var rv = anychart.linearGaugeModule.pointers.Bar.base(this, 'getReferenceValues');
  // bar pointer should extend scale with 0 value.
  rv.push(0);
  return rv;
};


//endregion
//region --- DRAWING ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.Bar.prototype.drawVertical = function() {
  var bounds = this.parentBounds();
  var isVertical = this.isVertical();
  var left, top, right, bottom;
  var inverted = this.scale().inverted();
  if (isVertical) {
    left = bounds.left;
    right = /** @type {number} */ (left + bounds.width);
    top = this.applyRatioToBounds(this.getEndRatio());
    bottom = this.applyRatioToBounds(this.getStartRatio());

    this.pointerBounds.left = left;
    this.pointerBounds.top = inverted ? bottom : top;
    this.pointerBounds.width = Math.abs(right - left);
    this.pointerBounds.height = Math.abs(top - bottom);
  } else {
    left = this.applyRatioToBounds(this.getStartRatio());
    right = this.applyRatioToBounds(this.getEndRatio());
    top = bounds.top;
    bottom = top + bounds.height;

    this.pointerBounds.left = inverted ? right : left;
    this.pointerBounds.top = top;
    this.pointerBounds.width = Math.abs(right - left);
    this.pointerBounds.height = Math.abs(top - bottom);
  }

  this.path
      .clear()
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();

  this.hatch.deserialize(this.path.serialize());
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.Bar.prototype.drawHorizontal = anychart.linearGaugeModule.pointers.Bar.prototype.drawVertical;
//endregion
