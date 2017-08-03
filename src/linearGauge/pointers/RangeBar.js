goog.provide('anychart.linearGaugeModule.pointers.RangeBar');
goog.require('anychart.linearGaugeModule.pointers.Bar');



/**
 * Range bar pointer class.
 * @param {anychart.linearGaugeModule.Chart} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.linearGaugeModule.pointers.Bar}
 * @constructor
 */
anychart.linearGaugeModule.pointers.RangeBar = function(gauge, dataIndex) {
  anychart.linearGaugeModule.pointers.RangeBar.base(this, 'constructor', gauge, dataIndex);

  this.referenceValueNames = ['high', 'low'];
};
goog.inherits(anychart.linearGaugeModule.pointers.RangeBar, anychart.linearGaugeModule.pointers.Bar);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.linearGaugeModule.pointers.RangeBar.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.RANGE_BAR;
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.RangeBar.prototype.getStartRatio = function() {
  var iterator = this.gauge.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('low');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.RangeBar.prototype.getEndRatio = function() {
  var iterator = this.gauge.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('high');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/** @inheritDoc */
anychart.linearGaugeModule.pointers.RangeBar.prototype.getReferenceValues = function() {
  var rv = anychart.linearGaugeModule.pointers.RangeBar.base(this, 'getReferenceValues');
  // we pop last element cause Bar put 0 in it, and we do not want to extend scale with 0 in case of RangeBar
  rv.pop();
  return rv;
};
//endregion
