goog.provide('anychart.core.linearGauge.pointers.RangeBar');
goog.require('anychart.core.linearGauge.pointers.Bar');



/**
 * Range bar pointer class.
 * @param {anychart.charts.LinearGauge} gauge Gauge.
 * @param {number} dataIndex Pointer data index.
 * @extends {anychart.core.linearGauge.pointers.Bar}
 * @constructor
 */
anychart.core.linearGauge.pointers.RangeBar = function(gauge, dataIndex) {
  anychart.core.linearGauge.pointers.RangeBar.base(this, 'constructor', gauge, dataIndex);

  this.referenceValueNames = ['high', 'low'];
};
goog.inherits(anychart.core.linearGauge.pointers.RangeBar, anychart.core.linearGauge.pointers.Bar);


//region --- INHERITED API ---
/** @inheritDoc */
anychart.core.linearGauge.pointers.RangeBar.prototype.getType = function() {
  return anychart.enums.LinearGaugePointerType.RANGE_BAR;
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.RangeBar.prototype.getStartRatio = function() {
  var iterator = this.gauge.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('low');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.RangeBar.prototype.getEndRatio = function() {
  var iterator = this.gauge.getIterator();
  iterator.select(/** @type {number} */ (this.dataIndex()));
  var value = iterator.get('high');
  return goog.math.clamp(this.scale().transform(value), 0, 1);
};


/** @inheritDoc */
anychart.core.linearGauge.pointers.RangeBar.prototype.getReferenceValues = function() {
  var rv = anychart.core.linearGauge.pointers.RangeBar.base(this, 'getReferenceValues');
  // we pop last element cause Bar put 0 in it, and we do not want to extend scale with 0 in case of RangeBar
  rv.pop();
  return rv;
};
//endregion
