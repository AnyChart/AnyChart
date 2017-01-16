goog.provide('anychart.core.linearGauge.pointers.Bar');
goog.require('anychart.core.linearGauge.pointers.Base');



/**
 * Bar pointer class.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.linearGauge.pointers.Base}
 * @constructor
 */
anychart.core.linearGauge.pointers.Bar = function(gauge, dataIndex) {
  anychart.core.linearGauge.pointers.Bar.base(this, 'constructor', gauge, dataIndex);
};
goog.inherits(anychart.core.linearGauge.pointers.Bar, anychart.core.linearGauge.pointers.Base);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Bar.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.BAR;
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.Bar.prototype.getReferenceValues = function() {
  var rv = anychart.core.linearGauge.pointers.Bar.base(this, 'getReferenceValues');
  // bar pointer should extend scale with 0 value.
  rv.push(0);
  return rv;
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.Bar.prototype.drawVertical = function() {
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
anychart.core.linearGauge.pointers.Bar.prototype.drawHorizontal = anychart.core.linearGauge.pointers.Bar.prototype.drawVertical;
//endregion
